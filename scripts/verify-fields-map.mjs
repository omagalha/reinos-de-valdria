import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(
  await readFile(path.join(projectPath, 'public/assets/maps/campos-de-valdria.tmj'), 'utf8'),
);
const catalogs = JSON.parse(
  await readFile(path.join(projectPath, 'src/game/data/catalogs.json'), 'utf8'),
);

const tileLayers = ['ground', 'roads', 'water', 'obstacles', 'decoration', 'collision'];
const objectLayers = [
  'player_spawn',
  'npcs',
  'monster_spawns',
  'guardian_spawns',
  'chests',
  'shrines',
  'portals',
  'village_slots',
  'biome_zones',
  'resource_nodes',
  'village_deposits',
];
const layerByName = new Map(map.layers.map((layer) => [layer.name, layer]));
const fail = (message) => {
  throw new Error('Mapa Campos de Valdria inválido: ' + message);
};
const property = (object, name) =>
  object.properties?.find((entry) => entry.name === name)?.value;

if (map.width !== 48 || map.height !== 32 || map.tilewidth !== 32 || map.tileheight !== 32) {
  fail('dimensões ou tile size incorretos');
}
for (const name of tileLayers) {
  const layer = layerByName.get(name);
  if (layer?.type !== 'tilelayer' || layer.data?.length !== map.width * map.height) {
    fail('tile layer ausente ou incompleta: ' + name);
  }
}
for (const name of objectLayers) {
  if (layerByName.get(name)?.type !== 'objectgroup') fail('object layer ausente: ' + name);
}
if (layerByName.get('player_spawn').objects.length !== 1) {
  fail('deve existir exatamente um player_spawn');
}
if (!layerByName.get('collision').data.some((gid) => gid > 0)) {
  fail('collision não possui bloqueios');
}

const validIds = {
  biome: new Set(catalogs.biomes.map(({ id }) => id)),
  guardian: new Set(catalogs.guardians.map(({ id }) => id)),
  item: new Set(catalogs.items.map(({ id }) => id)),
  monster: new Set(catalogs.monsters.map(({ id }) => id)),
  npc: new Set(catalogs.npcs.map(({ id }) => id)),
  village: new Set(['acampamento', 'aldeia', 'fortificada']),
};
const validateLayerIds = (layerName, propertyName, ids) => {
  for (const object of layerByName.get(layerName).objects) {
    if (!ids.has(property(object, propertyName))) {
      fail(`${layerName}.${object.name}: ${propertyName} não existe nos catálogos`);
    }
  }
};
validateLayerIds('npcs', 'catalogId', validIds.npc);
validateLayerIds('monster_spawns', 'catalogId', validIds.monster);
validateLayerIds('guardian_spawns', 'catalogId', validIds.guardian);
validateLayerIds('chests', 'itemId', validIds.item);
validateLayerIds('shrines', 'biomeId', validIds.biome);
validateLayerIds('portals', 'targetBiomeId', validIds.biome);
validateLayerIds('village_slots', 'stageId', validIds.village);
validateLayerIds('biome_zones', 'biomeId', validIds.biome);
validateLayerIds('resource_nodes', 'itemId', validIds.item);
validateLayerIds('village_deposits', 'stageId', validIds.village);
for (const object of layerByName.get('village_slots').objects) {
  if (property(object, 'buildingId') !== 'abrigo-de-madeira') {
    fail(`village_slots.${object.name}: buildingId inválido`);
  }
}
for (const object of layerByName.get('resource_nodes').objects) {
  if (!Number.isInteger(property(object, 'amount')) || property(object, 'amount') <= 0) {
    fail(`resource_nodes.${object.name}: amount inválido`);
  }
  if (!Number.isInteger(property(object, 'respawnMs')) || property(object, 'respawnMs') < 1000) {
    fail(`resource_nodes.${object.name}: respawnMs inválido`);
  }
}

console.log(
  `Mapa verificado: ${map.width}x${map.height}, ${tileLayers.length} tile layers e ${objectLayers.length} object layers.`,
);
