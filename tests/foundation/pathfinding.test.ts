import { describe, expect, test } from 'vitest';
import { findGridPath } from '../../src/game/systems/pathfinding';

describe('pathfinding de exploração', () => {
  test('contorna uma barreira e alcança o destino', () => {
    const blocked = new Set(['2,0', '2,1', '2,2', '2,3']);
    const path = findGridPath(
      { x: 0, y: 1 },
      { x: 4, y: 1 },
      (x, y) => x >= 0 && y >= 0 && x < 5 && y < 5 && !blocked.has(`${x},${y}`),
    );
    expect(path[0]).toEqual({ x: 0, y: 1 });
    expect(path.at(-1)).toEqual({ x: 4, y: 1 });
    expect(path.some(({ x, y }) => blocked.has(`${x},${y}`))).toBe(false);
  });

  test('não corta diagonal entre duas quinas bloqueadas', () => {
    const blocked = new Set(['1,0', '0,1']);
    const path = findGridPath(
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      (x, y) => x >= 0 && y >= 0 && x < 2 && y < 2 && !blocked.has(`${x},${y}`),
    );
    expect(path).toEqual([]);
  });

  test('retorna vazio para destino bloqueado', () => {
    expect(findGridPath({ x: 0, y: 0 }, { x: 1, y: 0 }, (x) => x === 0)).toEqual([]);
  });
});
