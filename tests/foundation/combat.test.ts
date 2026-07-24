import { describe, expect, test } from 'vitest';
import {
  getPlayerCombatData,
  initialCombatData,
  playerClasses,
} from '../../src/game/data/combat-data';
import {
  applyDamage,
  canSpendMana,
  experienceForLevel,
  isTargetInRange,
  levelAfterExperience,
  restoreMana,
  rollDamage,
  scaleDamage,
  spendMana,
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

  test('expõe as três classes e usa Cavaleiro como fallback seguro', () => {
    expect(Object.keys(playerClasses)).toEqual(['cavaleiro', 'arqueiro', 'mago']);
    expect(playerClasses.arqueiro.rangeTiles).toBe(3);
    expect(playerClasses.mago.maxHp).toBe(110);
    expect(getPlayerCombatData('classe-inexistente').classId).toBe('cavaleiro');
  });

  test('calcula alcance em tiles para ataques corpo a corpo e à distância', () => {
    expect(isTargetInRange(39, 1, 32)).toBe(true);
    expect(isTargetInRange(41, 1, 32)).toBe(false);
    expect(isTargetInRange(100, 3, 32)).toBe(true);
  });

  test('preserva custo, alcance e cooldown das habilidades do catálogo', () => {
    expect(playerClasses.cavaleiro.skill).toMatchObject({
      name: 'Golpe',
      manaCost: 12,
      cooldownMs: 1800,
      rangeTiles: 1,
    });
    expect(playerClasses.arqueiro.skill.rangeTiles).toBe(5);
    expect(playerClasses.mago.skill.areaRadiusTiles).toBe(1.5);
  });

  test('gasta, recupera e limita mana com segurança', () => {
    expect(canSpendMana(12, 12)).toBe(true);
    expect(canSpendMana(11, 12)).toBe(false);
    expect(spendMana(20, 12)).toBe(8);
    expect(restoreMana(93, 95, 10)).toBe(95);
  });

  test('aplica multiplicador de habilidade com arredondamento', () => {
    expect(scaleDamage(10, 1.65)).toBe(17);
    expect(scaleDamage(7, 1.5)).toBe(11);
  });

  test('mantém a curva de experiência do legado', () => {
    expect(experienceForLevel(2)).toBe(100);
    expect(levelAfterExperience(1, 99)).toBe(1);
    expect(levelAfterExperience(1, 100)).toBe(2);
  });
});
