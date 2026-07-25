export interface GuardianTeamMember {
  instanceId: string;
  fainted?: boolean;
}

export function resolveActiveGuardianId(
  team: GuardianTeamMember[],
  requestedId: string | null,
): string | null {
  if (requestedId && team.some(({ instanceId }) => instanceId === requestedId)) {
    return requestedId;
  }
  return team[0]?.instanceId ?? null;
}

export function nextActiveGuardianId(
  team: GuardianTeamMember[],
  activeId: string | null,
): string | null {
  if (team.length === 0) return null;
  const currentIndex = team.findIndex(({ instanceId }) => instanceId === activeId);
  for (let offset = 1; offset <= team.length; offset += 1) {
    const candidate = team[(Math.max(0, currentIndex) + offset) % team.length];
    if (candidate && !candidate.fainted) return candidate.instanceId;
  }
  return team[currentIndex >= 0 ? currentIndex : 0]?.instanceId ?? null;
}
