import catalogs from './catalogs.json';
import { ItemSchema } from './schemas';

export const items = ItemSchema.array().parse(catalogs.items);
