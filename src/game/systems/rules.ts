export type DamageRange = readonly [number, number];

export function experienceForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round((50 / 3) * (safeLevel ** 3 - 6 * safeLevel ** 2 + 17 * safeLevel - 12));
}

export function rollDamage(range: DamageRange, random = Math.random): number {
  const [minimum, maximum] = range;
  if (minimum > maximum) throw new Error('Faixa de dano inválida.');
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

export function calculateBondChance(
  hp: number,
  maxHp: number,
  difficulty = 0.25,
  bonus = 0,
): number {
  if (maxHp <= 0) return 0;
  const healthRatio = Math.min(1, Math.max(0, hp / maxHp));
  const weakenedBonus = 0.65 * (1 - healthRatio);
  const baseChance = 0.4 - difficulty * 0.6;
  return Math.min(0.9, Math.max(0.05, baseChance + weakenedBonus + bonus));
}
