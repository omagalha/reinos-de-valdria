import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(projectPath, 'public/assets/maps/campos-de-valdria.tmj');
const width = 48;
const height = 32;
const tileSize = 32;

const indexOf = (x, y) => y * width + x;
const makeLayer = (name, id, data, visible = true) => ({
  data,
  height,
  id,
  name,
  opacity: 1,
  type: 'tilelayer',
  visible,
  width,
  x: 0,
  y: 0,
});

const ground = Array(width * height).fill(1);
const roads = Array(width * height).fill(0);
const water = Array(width * height).fill(0);
const obstacles = Array(width * height).fill(0);
const decoration = Array(width * height).fill(0);
const collision = Array(width * height).fill(0);

const setTile = (layer, x, y, gid) => {
  if (x >= 0 && y >= 0 && x < width && y < height) layer[indexOf(x, y)] = gid;
};
const block = (x, y) => setTile(collision, x, y, 6);

for (let x = 0; x < width; x += 1) {
  block(x, 0);
  block(x, height - 1);
  setTile(obstacles, x, 0, 4);
  setTile(obstacles, x, height - 1, 4);
}
for (let y = 1; y < height - 1; y += 1) {
  block(0, y);
  block(width - 1, y);
  setTile(obstacles, 0, y, 4);
  setTile(obstacles, width - 1, y, 4);
}

for (let y = 4; y <= 15; y += 1) {
  for (let x = 34; x <= 43; x += 1) {
    const roundedEdge =
      (y === 4 || y === 15) && (x === 34 || x === 43);
    if (roundedEdge) continue;
    setTile(water, x, y, 3);
    block(x, y);
  }
}

for (let x = 2; x < width - 2; x += 1) {
  if (x < 34 || x > 43) setTile(roads, x, 19, 2);
}
for (let y = 2; y < height - 2; y += 1) {
  setTile(roads, 20, y, 2);
  setTile(roads, 21, y, 2);
}
for (let y = 16; y <= 23; y += 1) {
  for (let x = 16; x <= 26; x += 1) setTile(roads, x, y, 7);
}

const treeCoordinates = [
  [5, 5], [6, 5], [7, 6], [10, 4], [12, 7], [14, 5],
  [28, 5], [29, 6], [30, 8], [31, 11], [4, 24], [6, 25],
  [8, 27], [29, 25], [31, 27], [38, 24], [41, 26], [43, 23],
  [12, 14], [13, 14], [12, 15], [27, 13], [28, 13],
];
for (const [x, y] of treeCoordinates) {
  setTile(obstacles, x, y, 4);
  block(x, y);
}

const rockCoordinates = [[9, 10], [15, 26], [30, 20], [32, 16], [44, 18]];
for (const [x, y] of rockCoordinates) {
  setTile(obstacles, x, y, 8);
  block(x, y);
}

for (let y = 2; y < height - 2; y += 1) {
  for (let x = 2; x < width - 2; x += 1) {
    if ((x * 13 + y * 7) % 37 === 0 && !collision[indexOf(x, y)] && !roads[indexOf(x, y)]) {
      setTile(decoration, x, y, 5);
    }
  }
}

let nextObjectId = 1;
const property = (name, value) => ({
  name,
  type: typeof value === 'boolean' ? 'bool' : typeof value === 'number' ? 'int' : 'string',
  value,
});
const point = (name, x, y, properties = []) => ({
  height: 0,
  id: nextObjectId++,
  name,
  point: true,
  properties,
  rotation: 0,
  type: '',
  visible: true,
  width: 0,
  x: x * tileSize + tileSize / 2,
  y: y * tileSize + tileSize / 2,
});
const zone = (name, x, y, zoneWidth, zoneHeight, properties = []) => ({
  height: zoneHeight * tileSize,
  id: nextObjectId++,
  name,
  properties,
  rotation: 0,
  type: '',
  visible: true,
  width: zoneWidth * tileSize,
  x: x * tileSize,
  y: y * tileSize,
});
const objectLayer = (name, id, objects) => ({
  draworder: 'topdown',
  id,
  name,
  objects,
  opacity: 1,
  type: 'objectgroup',
  visible: true,
  x: 0,
  y: 0,
});

const objectLayers = [
  objectLayer('player_spawn', 7, [
    point('entrada-campos', 20, 21, [property('biomeId', 'campos-de-valdria')]),
  ]),
  objectLayer('npcs', 8, [
    point('anciao-baldric', 19, 17, [property('catalogId', 'anciao-baldric')]),
    point('ferreira-mira', 24, 18, [property('catalogId', 'ferreira-mira')]),
  ]),
  objectLayer('monster_spawns', 9, [
    point('ratino-norte', 8, 8, [property('catalogId', 'ratino-do-campo')]),
    point('ratino-sul', 10, 25, [property('catalogId', 'ratino-do-campo')]),
  ]),
  objectLayer('guardian_spawns', 10, [
    point('folium-bosque', 29, 10, [property('catalogId', 'folium')]),
  ]),
  objectLayer('chests', 11, [
    point('bau-acampamento', 17, 22, [property('itemId', 'pocao-de-campo')]),
  ]),
  objectLayer('shrines', 12, [
    point('santuario-dos-campos', 25, 16, [property('biomeId', 'campos-de-valdria')]),
  ]),
  objectLayer('portals', 13, [
    point('saida-bosque', 3, 19, [property('targetBiomeId', 'bosque-sussurrante')]),
  ]),
  objectLayer('village_slots', 14, [
    zone('nucleo-aldeia', 16, 16, 11, 8, [property('stageId', 'acampamento')]),
  ]),
  objectLayer('biome_zones', 15, [
    zone('campos-de-valdria', 1, 1, 46, 30, [property('biomeId', 'campos-de-valdria')]),
  ]),
];

const map = {
  compressionlevel: -1,
  height,
  infinite: false,
  layers: [
    makeLayer('ground', 1, ground),
    makeLayer('roads', 2, roads),
    makeLayer('water', 3, water),
    makeLayer('obstacles', 4, obstacles),
    makeLayer('decoration', 5, decoration),
    makeLayer('collision', 6, collision, false),
    ...objectLayers,
  ],
  nextlayerid: 16,
  nextobjectid: nextObjectId,
  orientation: 'orthogonal',
  properties: [
    property('biomeId', 'campos-de-valdria'),
    property('formatVersion', 1),
  ],
  renderorder: 'right-down',
  tiledversion: '1.11.2',
  tileheight: tileSize,
  tilesets: [{
    columns: 8,
    firstgid: 1,
    image: '../tilesets/campos-provisorio.svg',
    imageheight: 32,
    imagewidth: 256,
    margin: 0,
    name: 'campos-provisorio',
    spacing: 0,
    tilecount: 8,
    tileheight: 32,
    tilewidth: 32,
  }],
  tilewidth: tileSize,
  type: 'map',
  version: '1.10',
  width,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(map, null, 2) + '\n', 'utf8');
console.log(`Mapa Campos de Valdria gerado: ${width}x${height}, ${map.layers.length} layers.`);
