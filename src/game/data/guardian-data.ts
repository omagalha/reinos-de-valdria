import catalogs from './catalogs.json';

export interface GuardianCombatData {
  speciesId: string;
  name: string;
  description: string;
  element: string;
  maxHp: number;
  damage: [number, number];
  bondDifficulty: number;
}

export function getGuardianCombatData(speciesId: string | undefined): GuardianCombatData {
  const guardian = catalogs.guardians.find(({ id }) => id === speciesId);
  if (!guardian) throw new Error(`Guardião não encontrado no catálogo: ${speciesId ?? '—'}`);
  return {
    speciesId: guardian.id,
    name: guardian.name,
    description: guardian.description,
    element: guardian.element,
    maxHp: guardian.baseHp,
    damage: guardian.baseDamage as [number, number],
    bondDifficulty: guardian.bondDifficulty,
  };
}
