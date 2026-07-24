import { calculateBondChance } from './rules';

export interface BondAttempt {
  success: boolean;
  chance: number;
}

export function attemptGuardianBond(
  hp: number,
  maxHp: number,
  difficulty: number,
  random: () => number = Math.random,
): BondAttempt {
  const chance = calculateBondChance(hp, maxHp, difficulty);
  return { success: random() < chance, chance };
}

export const weakenGuardianHp = (hp: number, damage: number): number =>
  Math.max(1, hp - Math.max(0, Math.floor(damage)));
