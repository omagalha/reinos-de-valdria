import catalogs from './catalogs.json';
import { NpcSchema } from './schemas';

export const npcs = NpcSchema.array().parse(catalogs.npcs);
