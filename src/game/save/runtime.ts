import { GameSaveSchema, type GameSave } from './schema';

export interface RuntimeGuardianState {
  instanceId: string;
  speciesId: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
}

export interface RuntimeSaveState {
  classId: GameSave['player']['classId'];
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  position: { x: number; y: number; regionId: string };
  cores: number;
  materials: Record<string, number>;
  guardian?: RuntimeGuardianState;
}

export function mergeRuntimeSave(
  base: GameSave,
  runtime: RuntimeSaveState,
  now = new Date().toISOString(),
): GameSave {
  const guardians = runtime.guardian
    ? [
        ...base.guardians.filter(
          ({ instanceId }) => instanceId !== runtime.guardian?.instanceId,
        ),
        { ...runtime.guardian, nickname: null },
      ]
    : base.guardians;
  return GameSaveSchema.parse({
    ...base,
    updatedAt: now,
    player: {
      ...base.player,
      classId: runtime.classId,
      level: runtime.level,
      experience: runtime.experience,
      hp: runtime.hp,
      maxHp: runtime.maxHp,
      mp: runtime.mp,
      maxMp: runtime.maxMp,
      position: runtime.position,
    },
    inventory: {
      ...base.inventory,
      cores: runtime.cores,
      materials: runtime.materials,
    },
    guardians,
    activeGuardianId: runtime.guardian?.instanceId ?? base.activeGuardianId,
  });
}
