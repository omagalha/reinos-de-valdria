import { describe, expect, test } from 'vitest';
import { initialCombatData } from '../../src/game/data/combat-data';
import {
  applyDamage,
  experienceForLevel,
  levelAfterExperience,
  rollDamage,
} from '../../src/game/systems/combat';

describe('combate básico Phaser', () => {
  test('preserva números do Cavaleiro e Ratino do Canvas', () => {
    expect(initialCombatData.player).toMatchObject({
      maxHp: 190,
      damage: [5, 13],
      rangeTiles: 1,
      attackCooldownMs: 930,
    });
    expect(initialCombatData.fieldRat).toMatchObject({
      maxHp: 25,
      damage: [1, 8],
      experience: 5,
      moveCooldownMs: 350,
      visionTiles: 5,
    });
  });

  test('rola limites inclusivos e impede HP negativo', () => {
    expect(rollDamage([5, 13], () => 0)).toBe(5);
    expect(rollDamage([5, 13], () => 0.999999)).toBe(13);
    expect(applyDamage({ hp: 4, maxHp: 25 }, 8).hp).toBe(0);
  });

  test('mantém a curva de experiência do legado', () => {
    expect(experienceForLevel(2)).toBe(100);
    expect(levelAfterExperience(1, 99)).toBe(1);
    expect(levelAfterExperience(1, 100)).toBe(2);
  });
});
