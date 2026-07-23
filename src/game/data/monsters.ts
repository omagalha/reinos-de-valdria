import catalogs from './catalogs.json';
import { MonsterSchema } from './schemas';

export const monsters = MonsterSchema.array().parse(catalogs.monsters);
