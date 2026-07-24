import { describe, expect, test } from 'vitest';
import { decideMonsterAiState, isRespawnReady } from '../../src/game/systems/monster-ai';
import { circlesOverlap } from '../../src/game/systems/movement';

const base = {
  behavior: 'territorial',
  defeated: false,
  engaged: false,
  distanceToPlayer: 100,
  distanceToSpawn: 0,
  visionRange: 160,
  attackRange: 38,
  leashRange: 224,
};

describe('IA e ciclo de vida dos monstros', () => {
  test('territorial persegue, ataca e retorna ao território', () => {
    expect(decideMonsterAiState(base)).toBe('chasing');
    expect(decideMonsterAiState({ ...base, distanceToPlayer: 30 })).toBe('attacking');
    expect(decideMonsterAiState({ ...base, distanceToSpawn: 230 })).toBe('returning');
  });

  test('emboscada espera o jogador chegar mais perto', () => {
    expect(decideMonsterAiState({ ...base, behavior: 'emboscada' })).toBe('idle');
    expect(
      decideMonsterAiState({
        ...base,
        behavior: 'emboscada',
        distanceToPlayer: 70,
      }),
    ).toBe('chasing');
  });

  test('respawn só fica pronto depois do prazo', () => {
    expect(isRespawnReady(true, 5_999, 6_000)).toBe(false);
    expect(isRespawnReady(true, 6_000, 6_000)).toBe(true);
    expect(isRespawnReady(false, 7_000, 6_000)).toBe(false);
  });

  test('detecta sobreposição circular sem bloquear apenas o contato', () => {
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 15, y: 0 }, 10)).toBe(true);
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 20, y: 0 }, 10)).toBe(false);
  });
});
