import catalogs from './catalogs.json';
import { BiomeSchema, type Biome } from './schemas';

export const biomes = BiomeSchema.array().parse(catalogs.biomes);

export type BiomeId =
  | 'campos-de-valdria'
  | 'bosque-sussurrante'
  | 'praia-solar'
  | 'caverna-sombria'
  | 'pantano-luminoso'
  | 'serras-geladas';

export const biomeById = Object.fromEntries(
  biomes.map((biome) => [biome.id, biome]),
) as Record<BiomeId, Biome>;
