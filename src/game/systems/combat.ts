export interface HealthState {
  hp: number;
  maxHp: number;
}

export const rollDamage = (
  [min, max]: readonly [number, number],
  random: () => number = Math.random,
): number => min + Math.floor(random() * (max - min + 1));

export function applyDamage(target: HealthState, damage: number): HealthState {
  return { ...target, hp: Math.max(0, target.hp - Math.max(0, Math.floor(damage))) };
}

export const isDefeated = ({ hp }: HealthState): boolean => hp <= 0;

export function experienceForLevel(level: number): number {
  return Math.round((50 / 3) * (level ** 3 - 6 * level ** 2 + 17 * level - 12));
}

export function levelAfterExperience(currentLevel: number, experience: number): number {
  let level = currentLevel;
  while (experience >= experienceForLevel(level + 1)) level += 1;
  return level;
}
