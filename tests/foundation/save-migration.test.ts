import { describe, expect, test } from 'vitest';
import { migrateSave, parseStoredSave } from '../../src/game/save/migrations';

const migratedAt = '2026-07-19T12:00:00.000Z';

describe('migração de save', () => {
  test('preserva jogador, materiais, Guardiões e flags da v2', () => {
    const legacy = {
      v: 2,
      j: {
        x: 27.5,
        y: 18,
        hp: 99,
        maxHp: 135,
        mp: 42,
        maxMp: 50,
        nivel: 7,
        exp: 120,
        gold: 345,
        pocoes: 6,
        fragmentos: 4,
        nucleos: 2,
        classe: 'arqueiro',
        materiais: { fibraVerde: 8, pedraSombria: 3 },
        temAmuleto: true,
        bencao: false,
      },
      equipe: [
        { especie: 'Folium', hp: 51, maxHp: 60, nivel: 3, exp: 20 },
        { especie: 'Aquari', hp: 70, maxHp: 70, nivel: 2, exp: 12 },
      ],
      ativo: 1,
      missaoAtual: 4,
      progressoContrato: 2,
      mortes: { Ratino: 12, ReiEsquelo: 1 },
      baus: [true, false, true],
      santuarios: [{ usado: true, tRecarga: 900 }, false],
    };

    const save = migrateSave(legacy, migratedAt);

    expect(save.version).toBe(3);
    expect(save.player.classId).toBe('arqueiro');
    expect(save.player.position).toMatchObject({ x: 27.5, y: 18 });
    expect(save.inventory).toMatchObject({
      gold: 345,
      potions: 6,
      fragments: 4,
      cores: 2,
    });
    expect(save.inventory.materials).toEqual({ 'fibra-verde': 8, 'pedra-sombria': 3 });
    expect(save.guardians.map((guardian) => guardian.speciesId)).toEqual(['folium', 'aquari']);
    expect(save.activeGuardianId).toBe('aquari-2');
    expect(save.world.openedChests).toEqual([0, 2]);
    expect(save.world.visitedShrines).toEqual([0]);
    expect(save.world.flags.amuletoRecuperado).toBe(true);
    expect(save.migration).toEqual({ source: 'localStorage-v2', importedAt: migratedAt });
  });

  test('recusa JSON inválido ou formato desconhecido', () => {
    expect(() => parseStoredSave('{quebrado', migratedAt)).toThrow(/não foi possível abrir/i);
    expect(() => migrateSave({ version: 99 }, migratedAt)).toThrow(/incompatível/i);
  });
});
