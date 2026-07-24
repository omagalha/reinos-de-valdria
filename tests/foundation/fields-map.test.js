import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import {
  REQUIRED_OBJECT_LAYERS,
  REQUIRED_TILE_LAYERS,
  validateFieldsMap,
} from '../../src/game/maps/fields-map';
import { gameContent } from '../../src/game/data';
import { moveWithCollision, normalizedDirection } from '../../src/game/systems/movement';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const map = JSON.parse(
  await readFile(path.join(projectPath, 'public/assets/maps/campos-de-valdria.tmj'), 'utf8'),
);
const layer = (name) => map.layers.find((entry) => entry.name === name);
const tileAt = (layerName, x, y) => layer(layerName).data[y * map.width + x];

describe('mapa Tiled de Campos de Valdria', () => {
  test('possui dimensões 48x32 e tiles 32x32', () => {
    expect(map.width).toBe(48);
    expect(map.height).toBe(32);
    expect(map.tilewidth).toBe(32);
    expect(map.tileheight).toBe(32);
  });

  test('possui todas as tile layers e object layers obrigatórias', () => {
    const names = new Set(map.layers.map(({ name }) => name));
    for (const name of [...REQUIRED_TILE_LAYERS, ...REQUIRED_OBJECT_LAYERS]) {
      expect(names.has(name), name).toBe(true);
    }
  });

  test('possui um spawn livre para o jogador', () => {
    const spawns = layer('player_spawn').objects;
    expect(spawns).toHaveLength(1);
    const spawn = spawns[0];
    const tileX = Math.floor(spawn.x / map.tilewidth);
    const tileY = Math.floor(spawn.y / map.tileheight);
    expect(tileAt('collision', tileX, tileY)).toBe(0);
  });

  test('água, obstáculos, quinas e bordas estão bloqueados', () => {
    expect(tileAt('water', 36, 8)).toBeGreaterThan(0);
    expect(tileAt('collision', 36, 8)).toBeGreaterThan(0);
    expect(tileAt('obstacles', 5, 5)).toBeGreaterThan(0);
    expect(tileAt('collision', 5, 5)).toBeGreaterThan(0);
    expect(tileAt('collision', 0, 10)).toBeGreaterThan(0);
    expect(tileAt('collision', 20, 21)).toBe(0);
  });

  test('IDs de NPCs, monstros, Guardiões e objetos apontam para catálogos', () => {
    const result = validateFieldsMap(map, gameContent);
    expect(result.success, result.errors.join('\n')).toBe(true);
  });

  test('movimento diagonal mantém velocidade e bloqueia passagem entre quinas', () => {
    const diagonal = normalizedDirection(1, 1);
    expect(Math.hypot(diagonal.x, diagonal.y)).toBeCloseTo(1);

    const openMove = moveWithCollision(
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      10,
      1,
      () => false,
    );
    expect(Math.hypot(openMove.x, openMove.y)).toBeCloseTo(10);

    const cornerBlocked = moveWithCollision(
      { x: 16, y: 16 },
      { x: 1, y: 1 },
      10,
      1,
      (x, y) => (x > 16 && y === 16) || (x === 16 && y > 16),
    );
    expect(cornerBlocked).toEqual({ x: 16, y: 16 });
  });
});
