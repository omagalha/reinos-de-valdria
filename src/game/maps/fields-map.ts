import type { Biome, Guardian, Item, Monster, Npc, VillageStage } from '../data';

export const FIELDS_MAP_WIDTH = 48;
export const FIELDS_MAP_HEIGHT = 32;
export const FIELDS_TILE_SIZE = 32;

export const REQUIRED_TILE_LAYERS = [
  'ground',
  'roads',
  'water',
  'obstacles',
  'decoration',
  'collision',
] as const;

export const REQUIRED_OBJECT_LAYERS = [
  'player_spawn',
  'npcs',
  'monster_spawns',
  'guardian_spawns',
  'chests',
  'shrines',
  'portals',
  'village_slots',
  'biome_zones',
] as const;

interface TiledProperty {
  name: string;
  value: unknown;
}

interface TiledObject {
  name: string;
  x: number;
  y: number;
  properties?: TiledProperty[];
}

interface TiledLayer {
  name: string;
  type: 'tilelayer' | 'objectgroup';
  data?: number[];
  objects?: TiledObject[];
}

export interface FieldsTiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  properties?: TiledProperty[];
}

export interface MapCatalogs {
  biomes: readonly Biome[];
  guardians: readonly Guardian[];
  items: readonly Item[];
  monsters: readonly Monster[];
  npcs: readonly Npc[];
  villageStages: readonly VillageStage[];
}

export interface MapValidation {
  success: boolean;
  errors: string[];
}

export function tiledProperty(object: TiledObject, name: string): unknown {
  return object.properties?.find((entry) => entry.name === name)?.value;
}

export function validateFieldsMap(map: FieldsTiledMap, catalogs: MapCatalogs): MapValidation {
  const errors: string[] = [];
  if (map.width !== FIELDS_MAP_WIDTH || map.height !== FIELDS_MAP_HEIGHT) {
    errors.push(`dimensões esperadas: ${FIELDS_MAP_WIDTH}x${FIELDS_MAP_HEIGHT}`);
  }
  if (map.tilewidth !== FIELDS_TILE_SIZE || map.tileheight !== FIELDS_TILE_SIZE) {
    errors.push('tiles devem medir 32x32');
  }

  const layerByName = new Map(map.layers.map((layer) => [layer.name, layer]));
  for (const name of REQUIRED_TILE_LAYERS) {
    const layer = layerByName.get(name);
    if (!layer || layer.type !== 'tilelayer') errors.push(`tile layer ausente: ${name}`);
    if (layer?.data?.length !== map.width * map.height) errors.push(`tile layer inválida: ${name}`);
  }
  for (const name of REQUIRED_OBJECT_LAYERS) {
    if (layerByName.get(name)?.type !== 'objectgroup') errors.push(`object layer ausente: ${name}`);
  }

  const playerSpawns = layerByName.get('player_spawn')?.objects ?? [];
  if (playerSpawns.length !== 1) errors.push('player_spawn deve possuir exatamente um ponto');
  const collision = layerByName.get('collision')?.data ?? [];
  if (!collision.some((tile) => tile > 0)) errors.push('collision não possui tiles bloqueados');

  const ids = {
    biome: new Set(catalogs.biomes.map((entry) => entry.id)),
    guardian: new Set(catalogs.guardians.map((entry) => entry.id)),
    item: new Set(catalogs.items.map((entry) => entry.id)),
    monster: new Set(catalogs.monsters.map((entry) => entry.id)),
    npc: new Set(catalogs.npcs.map((entry) => entry.id)),
    village: new Set(catalogs.villageStages.map((entry) => entry.id)),
  };
  const validateObjects = (layerName: string, propertyName: string, validIds: Set<string>) => {
    for (const object of layerByName.get(layerName)?.objects ?? []) {
      const value = tiledProperty(object, propertyName);
      if (typeof value !== 'string' || !validIds.has(value)) {
        errors.push(`${layerName}.${object.name}: ${propertyName} inválido`);
      }
    }
  };

  validateObjects('npcs', 'catalogId', ids.npc);
  validateObjects('monster_spawns', 'catalogId', ids.monster);
  validateObjects('guardian_spawns', 'catalogId', ids.guardian);
  validateObjects('chests', 'itemId', ids.item);
  validateObjects('shrines', 'biomeId', ids.biome);
  validateObjects('portals', 'targetBiomeId', ids.biome);
  validateObjects('village_slots', 'stageId', ids.village);
  validateObjects('biome_zones', 'biomeId', ids.biome);

  return { success: errors.length === 0, errors };
}
