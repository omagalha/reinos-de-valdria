import { describe, expect, test } from 'vitest';
import { createEmptySave, GameSaveSchema } from '../../src/game/save/schema';
import { mergeRuntimeSave } from '../../src/game/save/runtime';

describe('save da sessão Phaser', () => {
  test('persiste jogador, posição, inventário e Folium ativo', () => {
    const base = createEmptySave('2026-07-25T10:00:00.000Z');
    const save = mergeRuntimeSave(
      base,
      {
        classId: 'mago',
        level: 3,
        experience: 140,
        hp: 82,
        maxHp: 110,
        mp: 61,
        maxMp: 95,
        position: { x: 20.5, y: 21.5, regionId: 'campos-de-valdria' },
        cores: 2,
        materials: { 'fibra-verde': 4 },
        guardian: {
          instanceId: 'folium-1',
          speciesId: 'folium',
          level: 2,
          experience: 18,
          hp: 66,
          maxHp: 73,
          fainted: true,
          reviveRemainingMs: 12_000,
        },
      },
      '2026-07-25T10:05:00.000Z',
    );
    expect(GameSaveSchema.parse(save)).toEqual(save);
    expect(save.player).toMatchObject({ classId: 'mago', level: 3, hp: 82 });
    expect(save.player.position).toEqual({
      x: 20.5,
      y: 21.5,
      regionId: 'campos-de-valdria',
    });
    expect(save.inventory).toMatchObject({
      cores: 2,
      materials: { 'fibra-verde': 4 },
    });
    expect(save.guardians[0]).toMatchObject({
      instanceId: 'folium-1',
      speciesId: 'folium',
      level: 2,
      fainted: true,
      reviveRemainingMs: 12_000,
    });
    expect(save.activeGuardianId).toBe('folium-1');
  });
  test('preserva seções ainda não migradas pelo laboratório', () => {
    const base = createEmptySave('2026-07-25T10:00:00.000Z');
    base.world.flags.historia = true;
    const save = mergeRuntimeSave(base, {
      classId: 'cavaleiro',
      level: 1,
      experience: 0,
      hp: 190,
      maxHp: 190,
      mp: 35,
      maxMp: 35,
      position: { x: 20.5, y: 21.5, regionId: 'campos-de-valdria' },
      cores: 0,
      materials: {},
    });
    expect(save.world.flags.historia).toBe(true);
    expect(save.quests).toEqual(base.quests);
    expect(save.village).toEqual(base.village);
  });

  test('persiste a equipe completa e o Guardião ativo', () => {
    const base = createEmptySave('2026-01-01T00:00:00.000Z');
    const save = mergeRuntimeSave(base, {
      classId: 'cavaleiro',
      level: 1,
      experience: 0,
      hp: 190,
      maxHp: 190,
      mp: 35,
      maxMp: 35,
      position: { x: 20, y: 21, regionId: 'campos-de-valdria' },
      cores: 1,
      materials: {},
      guardians: [
        {
          instanceId: 'folium-1',
          speciesId: 'folium',
          level: 2,
          experience: 10,
          hp: 65,
          maxHp: 72,
        },
        {
          instanceId: 'aquari-2',
          speciesId: 'aquari',
          level: 3,
          experience: 20,
          hp: 70,
          maxHp: 80,
        },
      ],
      activeGuardianId: 'aquari-2',
    });

    expect(save.guardians.map(({ speciesId }) => speciesId)).toEqual([
      'folium',
      'aquari',
    ]);
    expect(save.activeGuardianId).toBe('aquari-2');
  });
});
