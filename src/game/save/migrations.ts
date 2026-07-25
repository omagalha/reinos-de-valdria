import { GameSaveSchema, createEmptySave, type GameSave } from './schema';

interface LegacyPlayer {
  x?: unknown;
  y?: unknown;
  hp?: unknown;
  maxHp?: unknown;
  mp?: unknown;
  maxMp?: unknown;
  nivel?: unknown;
  exp?: unknown;
  gold?: unknown;
  pocoes?: unknown;
  fragmentos?: unknown;
  nucleos?: unknown;
  classe?: unknown;
  materiais?: unknown;
  temAmuleto?: unknown;
  bencao?: unknown;
}

interface LegacyGuardian {
  especie?: unknown;
  hp?: unknown;
  maxHp?: unknown;
  nivel?: unknown;
  exp?: unknown;
}

interface LegacySaveV2 {
  v: 2;
  j: LegacyPlayer;
  equipe?: unknown;
  ativo?: unknown;
  missaoAtual?: unknown;
  mortes?: unknown;
  progressoContrato?: unknown;
  baus?: unknown;
  santuarios?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLegacySaveV2(value: unknown): value is LegacySaveV2 {
  return isRecord(value) && value.v === 2 && isRecord(value.j);
}

function numberFrom(value: unknown, fallback: number, minimum = 0): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(minimum, value)
    : fallback;
}

function integerFrom(value: unknown, fallback: number, minimum = 0): number {
  return Math.floor(numberFrom(value, fallback, minimum));
}

function identifierFrom(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) return fallback;
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || fallback;
}

function classFrom(value: unknown): GameSave['player']['classId'] {
  return value === 'arqueiro' || value === 'mago' || value === 'cavaleiro' ? value : 'cavaleiro';
}

function materialRecordFrom(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const legacyMaterialIds: Record<string, string> = {
    couroRatino: 'couro-ratino',
    fibraVerde: 'fibra-verde',
    pedraSombria: 'pedra-sombria',
    ossoAntigo: 'osso-antigo',
    escamaAzul: 'escama-azul',
    essenciaSombria: 'essencia-sombria',
    conchaSolar: 'concha-solar',
  };
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]))
      .map(([key, amount]) => [
        legacyMaterialIds[key] ?? identifierFrom(key, 'material'),
        Math.max(0, Math.floor(amount)),
      ]),
  );
}

export function migrateLegacyV2(
  legacy: LegacySaveV2,
  now = new Date().toISOString(),
): GameSave {
  const save = createEmptySave(now);
  const player = legacy.j;
  const legacyGuardians = Array.isArray(legacy.equipe) ? legacy.equipe : [];
  const activeIndex = integerFrom(legacy.ativo, 0);

  save.player = {
    classId: classFrom(player.classe),
    level: integerFrom(player.nivel, 1, 1),
    experience: integerFrom(player.exp, 0),
    hp: numberFrom(player.hp, save.player.hp),
    maxHp: numberFrom(player.maxHp, save.player.maxHp, 1),
    mp: numberFrom(player.mp, save.player.mp),
    maxMp: numberFrom(player.maxMp, save.player.maxMp),
    position: {
      x: numberFrom(player.x, 22),
      y: numberFrom(player.y, 30),
      regionId: 'campos-de-valdria',
    },
  };

  save.inventory = {
    gold: integerFrom(player.gold, 0),
    potions: integerFrom(player.pocoes, 2),
    fragments: integerFrom(player.fragmentos, 0),
    cores: integerFrom(player.nucleos, 0),
    materials: materialRecordFrom(player.materiais),
  };

  save.guardians = legacyGuardians
    .filter(isRecord)
    .map((guardian: LegacyGuardian, index) => {
      const speciesId = identifierFrom(guardian.especie, 'guardiao-desconhecido');
      return {
        instanceId: speciesId + '-' + String(index + 1),
        speciesId,
        nickname: null,
        level: integerFrom(guardian.nivel, 1, 1),
        experience: integerFrom(guardian.exp, 0),
        hp: numberFrom(guardian.hp, 1),
        maxHp: numberFrom(guardian.maxHp, 1, 1),
        fainted: false,
        reviveRemainingMs: 0,
      };
    });
  save.activeGuardianId = save.guardians[activeIndex]?.instanceId ?? null;

  save.world.defeated = isRecord(legacy.mortes)
    ? Object.fromEntries(
        Object.entries(legacy.mortes).map(([key, value]) => [
          identifierFrom(key, 'monstro'),
          integerFrom(value, 0),
        ]),
      )
    : {};
  save.world.openedChests = Array.isArray(legacy.baus)
    ? legacy.baus.flatMap((opened, index) => (opened ? [index] : []))
    : [];
  save.world.visitedShrines = Array.isArray(legacy.santuarios)
    ? legacy.santuarios.flatMap((shrine, index) => {
        if (typeof shrine === 'boolean') return shrine ? [index] : [];
        return isRecord(shrine) && shrine.usado ? [index] : [];
      })
    : [];
  save.world.flags = {
    amuletoRecuperado: Boolean(player.temAmuleto),
    bencaoDosGuardioes: Boolean(player.bencao),
  };
  save.quests.currentId = 'legado-missao-' + String(integerFrom(legacy.missaoAtual, 0));
  save.quests.counters.contrato = integerFrom(legacy.progressoContrato, 0);
  save.migration = { source: 'localStorage-v2', importedAt: now };

  return GameSaveSchema.parse(save);
}

export function migrateSave(input: unknown, now = new Date().toISOString()): GameSave {
  const current = GameSaveSchema.safeParse(input);
  if (current.success) return current.data;
  if (isLegacySaveV2(input)) return migrateLegacyV2(input, now);
  throw new Error('Save incompatível ou corrompido.');
}

export function parseStoredSave(raw: string, now = new Date().toISOString()): GameSave {
  try {
    return migrateSave(JSON.parse(raw) as unknown, now);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido';
    throw new Error('Não foi possível abrir o save: ' + message);
  }
}
