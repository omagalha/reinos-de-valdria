import catalogs from './catalogs.json';

const fieldRat = catalogs.monsters.find(({ id }) => id === 'ratino-do-campo');

if (catalogs.classes.length !== 3 || !fieldRat?.legacy) {
  throw new Error('Catálogos de combate inicial incompletos.');
}

export type PlayerClassId = 'cavaleiro' | 'arqueiro' | 'mago';

export interface PlayerCombatData {
  classId: PlayerClassId;
  name: string;
  maxHp: number;
  maxMp: number;
  damage: [number, number];
  rangeTiles: number;
  attackCooldownMs: number;
  projectileColor: number | null;
  skill: {
    name: string;
    manaCost: number;
    cooldownMs: number;
    rangeTiles: number;
    damageMultiplier: number;
    areaRadiusTiles: number;
  };
}

const projectileColors: Record<PlayerClassId, number | null> = {
  cavaleiro: null,
  arqueiro: 0xe8c46a,
  mago: 0x79c9ff,
};

const skillEffects: Record<PlayerClassId, { damageMultiplier: number; areaRadiusTiles: number }> = {
  cavaleiro: { damageMultiplier: 1.65, areaRadiusTiles: 0 },
  arqueiro: { damageMultiplier: 1.5, areaRadiusTiles: 0 },
  mago: { damageMultiplier: 1.4, areaRadiusTiles: 1.5 },
};

export const playerClasses = Object.fromEntries(
  catalogs.classes.map((playerClass) => [
    playerClass.id,
    {
      classId: playerClass.id as PlayerClassId,
      name: playerClass.name,
      maxHp: playerClass.maxHp,
      maxMp: playerClass.maxMp,
      damage: playerClass.baseDamage as [number, number],
      rangeTiles: playerClass.attackRange,
      attackCooldownMs: playerClass.legacy.attackIntervalMs,
      projectileColor: projectileColors[playerClass.id as PlayerClassId],
      skill: {
        ...playerClass.skill,
        rangeTiles: playerClass.legacy.skillRange,
        ...skillEffects[playerClass.id as PlayerClassId],
      },
    },
  ]),
) as Record<PlayerClassId, PlayerCombatData>;

export const DEFAULT_PLAYER_CLASS: PlayerClassId = 'cavaleiro';

export function getPlayerCombatData(classId: string | undefined): PlayerCombatData {
  return playerClasses[classId as PlayerClassId] ?? playerClasses.cavaleiro;
}

export const initialCombatData = {
  player: playerClasses[DEFAULT_PLAYER_CLASS],
  fieldRat: {
    monsterId: fieldRat.id,
    name: fieldRat.name,
    maxHp: fieldRat.baseHp,
    damage: fieldRat.baseDamage as [number, number],
    experience: fieldRat.experience,
    moveCooldownMs: fieldRat.legacy.speedMs,
    visionTiles: fieldRat.legacy.vision,
    drops: fieldRat.drops,
  },
} as const;
