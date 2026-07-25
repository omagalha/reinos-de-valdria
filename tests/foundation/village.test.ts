import { describe, expect, test } from 'vitest';
import {
  addVillageResources,
  buildVillageStructure,
  checkVillageUpgrade,
  createVillageState,
  missingBuildingResources,
  upgradeVillage,
} from '../../src/game/systems/village';

describe('progressão da aldeia', () => {
  test('informa exatamente os recursos ausentes', () => {
    const state = addVillageResources(createVillageState(), {
      madeira: 40,
      pedra: 35,
      fibras: 10,
      essencia: 2,
      ouro: 100,
    });
    expect(checkVillageUpgrade(state)).toEqual({
      allowed: false,
      nextStageId: 'aldeia',
      missing: { madeira: 20, fibras: 20, ouro: 20 },
    });
  });

  test('evolui, desconta os custos e libera estruturas sem duplicar', () => {
    const ready = addVillageResources(createVillageState(), {
      madeira: 90,
      pedra: 50,
      fibras: 45,
      essencia: 4,
      ouro: 180,
    });
    const upgraded = upgradeVillage(ready);

    expect(upgraded.stageId).toBe('aldeia');
    expect(upgraded.resources).toEqual({
      madeira: 30,
      pedra: 15,
      fibras: 15,
      essencia: 2,
      ouro: 60,
    });
    expect(upgraded.buildings).toContain('ferreiro');
    expect(new Set(upgraded.buildings).size).toBe(upgraded.buildings.length);
  });

  test('impede evolução antecipada', () => {
    expect(() => upgradeVillage(createVillageState())).toThrow(/faltam recursos/i);
  });

  test('constrói o primeiro abrigo, desconta recursos e aumenta a população', () => {
    const ready = addVillageResources(createVillageState(), {
      madeira: 12,
      fibras: 6,
    });
    expect(missingBuildingResources(ready, 'abrigo-de-madeira')).toEqual({});
    const built = buildVillageStructure(ready, 'abrigo-de-madeira');
    expect(built.resources.madeira).toBe(3);
    expect(built.resources.fibras).toBe(2);
    expect(built.population).toBe(4);
    expect(built.buildings).toContain('abrigo-de-madeira');
    expect(buildVillageStructure(built, 'abrigo-de-madeira')).toBe(built);
  });

  test('informa o custo que ainda falta para a construção', () => {
    expect(
      missingBuildingResources(createVillageState(), 'abrigo-de-madeira'),
    ).toEqual({ madeira: 9, fibras: 4 });
  });
});
