export interface GuardianProgress {
  level: number;
  experience: number;
  maxHp: number;
  hp: number;
}

export const guardianExperienceForNextLevel = (level: number): number =>
  40 * Math.max(1, Math.floor(level)) * (Math.max(1, Math.floor(level)) + 1);

export function addGuardianExperience(
  progress: GuardianProgress,
  amount: number,
): GuardianProgress {
  let level = progress.level;
  let experience = progress.experience + Math.max(0, Math.floor(amount));
  let maxHp = progress.maxHp;
  let hp = progress.hp;
  while (experience >= guardianExperienceForNextLevel(level)) {
    experience -= guardianExperienceForNextLevel(level);
    level += 1;
    maxHp += 10 + Math.floor(level * 1.5);
    hp = maxHp;
  }
  return { level, experience, maxHp, hp };
}

export const shouldFoliumHeal = (
  playerHp: number,
  playerMaxHp: number,
  guardianHp: number,
  guardianMaxHp: number,
  inCombat: boolean,
): boolean =>
  inCombat &&
  (playerHp < playerMaxHp * 0.75 || guardianHp < guardianMaxHp * 0.75);
