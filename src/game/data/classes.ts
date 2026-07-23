import catalogs from './catalogs.json';
import { CharacterClassSchema } from './schemas';

export const characterClasses = CharacterClassSchema.array().parse(catalogs.classes);
