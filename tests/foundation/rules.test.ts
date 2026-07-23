import { describe, expect, test } from 'vitest';
import { calculateBondChance, experienceForLevel, rollDamage } from '../../src/game/systems/rules';
import { canTransition, transition } from '../../src/game/systems/game-state';

describe('regras extraídas do jogo', () => {
  test('dano respeita as duas pontas da faixa', () => {
    expect(rollDamage([4, 10], () => 0)).toBe(4);
    expect(rollDamage([4, 10], () => 0.999999)).toBe(10);
  });

  test('um Guardião enfraquecido oferece chance maior de vínculo', () => {
    const healthy = calculateBondChance(100, 100, 0.3);
    const weakened = calculateBondChance(10, 100, 0.3);
    expect(weakened).toBeGreaterThan(healthy);
    expect(weakened).toBeLessThanOrEqual(0.9);
  });

  test('curva de experiência cresce e estados inválidos são bloqueados', () => {
    expect(experienceForLevel(3)).toBeGreaterThan(experienceForLevel(2));
    expect(canTransition('jogando', 'dialogando')).toBe(true);
    expect(() => transition('intro', 'loja')).toThrow(/transição inválida/i);
  });
});
