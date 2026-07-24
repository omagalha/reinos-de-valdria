import catalogs from './catalogs.json';

const knight = catalogs.classes.find(({ id }) => id === 'cavaleiro');
const fieldRat = catalogs.monsters.find(({ id }) => id === 'ratino-do-campo');

if (!knight || !fieldRat?.legacy) throw new Error('Catálogos de combate inicial incompletos.');

export const initialCombatData = {
  player: {
    classId: knight.id,
    maxHp: knight.maxHp,
    damage: knight.baseDamage as [number, number],
    rangeTiles: knight.attackRange,
    attackCooldownMs: knight.legacy.attackIntervalMs,
  },
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
