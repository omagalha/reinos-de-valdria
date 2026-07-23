import catalogs from './catalogs.json';
import { GuardianSchema } from './schemas';

export const guardians = GuardianSchema.array().parse(catalogs.guardians);
