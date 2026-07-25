import { describe, expect, test } from 'vitest';
import {
  nextActiveGuardianId,
  resolveActiveGuardianId,
} from '../../src/game/systems/guardian-team';

const team = [
  { instanceId: 'folium-1' },
  { instanceId: 'aquari-2' },
  { instanceId: 'ignix-3', fainted: true },
];

describe('equipe de Guardiões', () => {
  test('preserva o ativo salvo e usa o primeiro quando a referência é inválida', () => {
    expect(resolveActiveGuardianId(team, 'aquari-2')).toBe('aquari-2');
    expect(resolveActiveGuardianId(team, 'ausente')).toBe('folium-1');
    expect(resolveActiveGuardianId([], null)).toBeNull();
  });

  test('alterna em ciclo e evita membros desmaiados', () => {
    expect(nextActiveGuardianId(team, 'folium-1')).toBe('aquari-2');
    expect(nextActiveGuardianId(team, 'aquari-2')).toBe('folium-1');
  });

  test('mantém um membro quando toda a equipe está desmaiada', () => {
    expect(
      nextActiveGuardianId(
        [{ instanceId: 'folium-1', fainted: true }],
        'folium-1',
      ),
    ).toBe('folium-1');
  });
});
