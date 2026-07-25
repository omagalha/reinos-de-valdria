import type { VillageResources } from '../data';

export type MaterialInventory = Record<string, number>;

const villageResourceByMaterial: Record<string, keyof VillageResources> = {
  'madeira-jovem': 'madeira',
  'fibra-verde': 'fibras',
  'pedra-sombria': 'pedra',
  'essencia-sombria': 'essencia',
};

export function gatherMaterial(
  inventory: MaterialInventory,
  itemId: string,
  amount: number,
): MaterialInventory {
  return {
    ...inventory,
    [itemId]: (inventory[itemId] ?? 0) + Math.max(0, Math.floor(amount)),
  };
}

export function prepareVillageDeposit(inventory: MaterialInventory): {
  inventory: MaterialInventory;
  deposit: Partial<VillageResources>;
} {
  const next = { ...inventory };
  const deposit: Partial<VillageResources> = {};
  for (const [itemId, resource] of Object.entries(villageResourceByMaterial)) {
    const amount = Math.max(0, Math.floor(next[itemId] ?? 0));
    if (amount === 0) continue;
    deposit[resource] = (deposit[resource] ?? 0) + amount;
    delete next[itemId];
  }
  return { inventory: next, deposit };
}

export const isResourceReady = (now: number, readyAt: number): boolean =>
  now >= readyAt;
