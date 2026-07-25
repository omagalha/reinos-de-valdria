import {
  VillageResourcesSchema,
  villageStageById,
  villageStages,
  type VillageResources,
  type VillageStageId,
} from '../data';

export interface VillageState {
  stageId: VillageStageId;
  resources: VillageResources;
  population: number;
  buildings: readonly string[];
}

export interface UpgradeCheck {
  allowed: boolean;
  nextStageId: VillageStageId | null;
  missing: Partial<VillageResources>;
}

const resourceKeys = ['madeira', 'pedra', 'fibras', 'essencia', 'ouro'] as const;

export const villageBuildingBlueprints = {
  'abrigo-de-madeira': {
    name: 'Abrigo de Madeira',
    cost: { madeira: 9, pedra: 0, fibras: 4, essencia: 0, ouro: 0 },
  },
} as const;

export type VillageBuildingId = keyof typeof villageBuildingBlueprints;

export function createVillageState(): VillageState {
  return {
    stageId: 'acampamento',
    resources: { madeira: 0, pedra: 0, fibras: 0, essencia: 0, ouro: 0 },
    population: 3,
    buildings: [...villageStageById.acampamento.unlocks],
  };
}

export function addVillageResources(
  state: VillageState,
  deposit: Partial<VillageResources>,
): VillageState {
  const resources = VillageResourcesSchema.parse(
    Object.fromEntries(
      resourceKeys.map((key) => [key, state.resources[key] + Math.max(0, Math.floor(deposit[key] ?? 0))]),
    ),
  );
  return { ...state, resources };
}

export function checkVillageUpgrade(state: VillageState): UpgradeCheck {
  const currentIndex = villageStages.findIndex((stage) => stage.id === state.stageId);
  const nextStage = villageStages[currentIndex + 1];
  if (!nextStage) return { allowed: false, nextStageId: null, missing: {} };

  const missing = Object.fromEntries(
    resourceKeys.flatMap((key) => {
      const amount = Math.max(0, nextStage.requirements[key] - state.resources[key]);
      return amount > 0 ? [[key, amount]] : [];
    }),
  ) as Partial<VillageResources>;

  return {
    allowed: Object.keys(missing).length === 0,
    nextStageId: nextStage.id,
    missing,
  };
}

export function upgradeVillage(state: VillageState): VillageState {
  const check = checkVillageUpgrade(state);
  if (!check.nextStageId) throw new Error('A aldeia já alcançou o estágio máximo.');
  if (!check.allowed) throw new Error('Ainda faltam recursos para evoluir a aldeia.');

  const nextStage = villageStageById[check.nextStageId];
  const resources = VillageResourcesSchema.parse(
    Object.fromEntries(
      resourceKeys.map((key) => [key, state.resources[key] - nextStage.requirements[key]]),
    ),
  );

  return {
    stageId: nextStage.id,
    resources,
    population: Math.max(state.population, Math.ceil(nextStage.populationLimit * 0.35)),
    buildings: [...new Set([...state.buildings, ...nextStage.unlocks])],
  };
}

export function missingBuildingResources(
  state: VillageState,
  buildingId: VillageBuildingId,
): Partial<VillageResources> {
  const cost = villageBuildingBlueprints[buildingId].cost;
  return Object.fromEntries(
    resourceKeys.flatMap((key) => {
      const amount = Math.max(0, cost[key] - state.resources[key]);
      return amount > 0 ? [[key, amount]] : [];
    }),
  ) as Partial<VillageResources>;
}

export function buildVillageStructure(
  state: VillageState,
  buildingId: VillageBuildingId,
): VillageState {
  if (state.buildings.includes(buildingId)) return state;
  const missing = missingBuildingResources(state, buildingId);
  if (Object.keys(missing).length > 0) {
    throw new Error('Ainda faltam recursos para construir esta estrutura.');
  }
  const cost = villageBuildingBlueprints[buildingId].cost;
  return {
    ...state,
    resources: VillageResourcesSchema.parse(
      Object.fromEntries(
        resourceKeys.map((key) => [key, state.resources[key] - cost[key]]),
      ),
    ),
    population: state.population + 1,
    buildings: [...state.buildings, buildingId],
  };
}
