import { describe, expect, test } from 'vitest';
import {
  gatherMaterial,
  isResourceReady,
  prepareVillageDeposit,
} from '../../src/game/systems/gathering';

describe('coleta e depósito', () => {
  test('soma materiais sem alterar o inventário anterior', () => {
    const before = { 'fibra-verde': 2 };
    expect(gatherMaterial(before, 'fibra-verde', 3)).toEqual({ 'fibra-verde': 5 });
    expect(before).toEqual({ 'fibra-verde': 2 });
  });

  test('converte materiais conhecidos em recursos da aldeia', () => {
    expect(
      prepareVillageDeposit({
        'fibra-verde': 4,
        'madeira-jovem': 3,
        'pocao-de-campo': 1,
      }),
    ).toEqual({
      inventory: { 'pocao-de-campo': 1 },
      deposit: { madeira: 3, fibras: 4 },
    });
  });

  test('respeita o tempo de regeneração', () => {
    expect(isResourceReady(9_999, 10_000)).toBe(false);
    expect(isResourceReady(10_000, 10_000)).toBe(true);
  });
});
