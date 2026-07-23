import type { Biome } from './schemas';

export const biomes = [
  {
    id: 'campos-de-valdria',
    name: 'Campos de Valdria',
    description: 'Planícies férteis que cercam a aldeia e abrigam os primeiros caminhos.',
    mapColor: 0x5e9c4d,
    accentColor: 0xa5d36c,
    movementCost: 1,
    guardianElements: ['natureza', 'luz'],
    resources: ['fibra-verde', 'madeira-jovem'],
  },
  {
    id: 'bosque-sussurrante',
    name: 'Bosque Sussurrante',
    description: 'Mata antiga de trilhas estreitas, raízes vivas e espíritos protetores.',
    mapColor: 0x2e6b45,
    accentColor: 0x73a657,
    movementCost: 1.2,
    guardianElements: ['natureza', 'sombra'],
    resources: ['madeira-antiga', 'orvalho-lunar'],
  },
  {
    id: 'praia-solar',
    name: 'Praia Solar',
    description: 'Costa luminosa de águas rasas, ruínas salgadas e conchas energizadas.',
    mapColor: 0xd7bd70,
    accentColor: 0x78c6cf,
    movementCost: 1.15,
    guardianElements: ['agua', 'luz'],
    resources: ['concha-solar', 'sal-azul'],
  },
  {
    id: 'caverna-sombria',
    name: 'Caverna Sombria',
    description: 'Galerias minerais tomadas por ossos antigos e ecos de magia esquecida.',
    mapColor: 0x4c485a,
    accentColor: 0x8d6daf,
    movementCost: 1.3,
    guardianElements: ['pedra', 'sombra', 'fogo'],
    resources: ['pedra-sombria', 'ferro-bruto'],
  },
  {
    id: 'pantano-luminoso',
    name: 'Pântano Luminoso',
    description: 'Águas lentas onde fungos brilhantes orientam viajantes entre névoas.',
    mapColor: 0x466448,
    accentColor: 0x8ebf69,
    movementCost: 1.7,
    guardianElements: ['agua', 'natureza'],
    resources: ['lodo-vivo', 'fungo-luz'],
  },
  {
    id: 'serras-geladas',
    name: 'Serras Geladas',
    description: 'Montanhas de vento cortante, cristais de gelo e santuários elevados.',
    mapColor: 0x9cb2bd,
    accentColor: 0xd7edf0,
    movementCost: 1.45,
    guardianElements: ['gelo', 'pedra'],
    resources: ['cristal-geado', 'prata-fria'],
  },
] as const satisfies readonly Biome[];

export const biomeById = Object.fromEntries(biomes.map((biome) => [biome.id, biome])) as Record<
  (typeof biomes)[number]['id'],
  (typeof biomes)[number]
>;

export type BiomeId = (typeof biomes)[number]['id'];
