import { describe, expect, test } from 'vitest';
import { getGuardianCombatData } from '../../src/game/data/guardian-data';
import { attemptGuardianBond, weakenGuardianHp } from '../../src/game/systems/bonding';

describe('primeiro vínculo Phaser', () => {
  test('carrega Folium do catálogo sem duplicar atributos', () => {
    expect(getGuardianCombatData('folium')).toMatchObject({
      name: 'Folium',
      element: 'natureza',
      maxHp: 60,
      damage: [4, 12],
      bondDifficulty: 0.25,
    });
  });

  test('enfraquecimento nunca derrota o Guardião selvagem', () => {
    expect(weakenGuardianHp(60, 12)).toBe(48);
    expect(weakenGuardianHp(4, 20)).toBe(1);
  });

  test('vínculo usa chance crescente e resultado determinístico nos testes', () => {
    const healthy = attemptGuardianBond(60, 60, 0.25, () => 0);
    const weak = attemptGuardianBond(1, 60, 0.25, () => 0.5);
    expect(weak.chance).toBeGreaterThan(healthy.chance);
    expect(healthy.success).toBe(true);
    expect(weak.success).toBe(true);
  });

  test('rejeita Guardião ausente', () => {
    expect(() => getGuardianCombatData('desconhecido')).toThrow(/não encontrado/);
  });
});
