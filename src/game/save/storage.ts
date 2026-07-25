import Dexie, { type EntityTable } from 'dexie';
import { GameSaveSchema, type GameSave } from './schema';
import { parseStoredSave } from './migrations';

export const LEGACY_SAVE_KEYS = ['valdria_save_v2_equipamentos', 'valdria_save_v1'] as const;

interface SaveRecord {
  slot: string;
  updatedAt: string;
  payload: GameSave;
}

class ValdriaDatabase extends Dexie {
  saves!: EntityTable<SaveRecord, 'slot'>;

  constructor(databaseName: string) {
    super(databaseName);
    this.version(1).stores({
      saves: 'slot, updatedAt',
    });
  }
}

export class SaveRepository {
  private readonly database: ValdriaDatabase;

  constructor(databaseName = 'reinos-de-valdria') {
    this.database = new ValdriaDatabase(databaseName);
  }

  async write(save: GameSave): Promise<GameSave> {
    const updated = GameSaveSchema.parse({
      ...save,
      updatedAt: new Date().toISOString(),
    });
    await this.database.saves.put({
      slot: updated.slot,
      updatedAt: updated.updatedAt,
      payload: updated,
    });
    return updated;
  }

  async read(slot = 'principal'): Promise<GameSave | null> {
    const record = await this.database.saves.get(slot);
    return record ? GameSaveSchema.parse(record.payload) : null;
  }

  async list(): Promise<readonly GameSave[]> {
    const records = await this.database.saves.orderBy('updatedAt').reverse().toArray();
    return records.map((record) => GameSaveSchema.parse(record.payload));
  }

  async importLegacy(storage: Pick<Storage, 'getItem'> = window.localStorage): Promise<GameSave | null> {
    for (const key of LEGACY_SAVE_KEYS) {
      const raw = storage.getItem(key);
      if (!raw) continue;
      const migrated = parseStoredSave(raw);
      await this.write(migrated);
      return migrated;
    }
    return null;
  }

  async close(): Promise<void> {
    this.database.close();
  }
}

export const saveRepository = new SaveRepository();
