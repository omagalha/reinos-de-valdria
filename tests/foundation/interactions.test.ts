import { describe, expect, test } from 'vitest';
import { nearestInRange } from '../../src/game/systems/interactions';

describe('interações de exploração', () => {
  const objects = [
    { id: 'distante', x: 100, y: 100 },
    { id: 'proximo', x: 12, y: 5 },
    { id: 'medio', x: 25, y: 0 },
  ];

  test('seleciona o objeto mais próximo dentro do alcance', () => {
    expect(nearestInRange({ x: 0, y: 0 }, objects, 32)?.id).toBe('proximo');
  });

  test('não oferece interação fora do alcance', () => {
    expect(nearestInRange({ x: 0, y: 0 }, objects, 5)).toBeUndefined();
  });
});
