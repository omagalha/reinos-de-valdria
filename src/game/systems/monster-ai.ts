export type MonsterAiState = 'idle' | 'chasing' | 'attacking' | 'returning' | 'defeated';

export interface MonsterAiInput {
  behavior: string;
  defeated: boolean;
  engaged: boolean;
  distanceToPlayer: number;
  distanceToSpawn: number;
  visionRange: number;
  attackRange: number;
  leashRange: number;
}

export function decideMonsterAiState(input: MonsterAiInput): MonsterAiState {
  if (input.defeated) return 'defeated';
  if (input.distanceToSpawn > input.leashRange) return 'returning';
  if (input.distanceToPlayer <= input.attackRange) return 'attacking';
  const detectionRange =
    input.behavior === 'emboscada' && !input.engaged
      ? Math.min(input.visionRange, input.attackRange * 2)
      : input.visionRange;
  if (input.distanceToPlayer <= detectionRange) return 'chasing';
  if (input.engaged && input.distanceToSpawn > 4) return 'returning';
  return 'idle';
}

export const isRespawnReady = (defeated: boolean, now: number, respawnAt: number): boolean =>
  defeated && respawnAt > 0 && now >= respawnAt;
