import { describe, expect, test } from 'vitest';
import {
  addGuardianExperience,
  applyGuardianDamage,
  guardianReviveHp,
  guardianExperienceForNextLevel,
  isGuardianReviveReady,
  shouldFoliumHeal,
} from '../../src/game/systems/companion';

describe('companheiro Guardião', () => {
  test('preserva a curva de experiência do Guardião legado', () => {
    expect(guardianExperienceForNextLevel(1)).toBe(80);
    expect(guardianExperienceForNextLevel(2)).toBe(240);
  });

  test('sobe de nível, aumenta HP e cura ao completar o nível', () => {
    expect(
      addGuardianExperience({ level: 1, experience: 70, hp: 40, maxHp: 60 }, 10),
    ).toEqual({ level: 2, experience: 0, hp: 73, maxHp: 73 });
  });

  test('Folium cura apenas em combate quando alguém está ferido', () => {
    expect(shouldFoliumHeal(100, 190, 60, 60, true)).toBe(true);
    expect(shouldFoliumHeal(100, 190, 60, 60, false)).toBe(false);
    expect(shouldFoliumHeal(180, 190, 55, 60, true)).toBe(false);
  });

  test('dano, desmaio e despertar preservam o ciclo legado', () => {
    expect(applyGuardianDamage(7, 12)).toBe(0);
    expect(isGuardianReviveReady(true, 19_999, 20_000)).toBe(false);
    expect(isGuardianReviveReady(true, 20_000, 20_000)).toBe(true);
    expect(isGuardianReviveReady(false, 25_000, 20_000)).toBe(false);
    expect(guardianReviveHp(73)).toBe(36);
  });
});
