import { z } from 'zod';
import { biomes } from './biomes';
import { characterClasses } from './classes';
import { guardians } from './guardians';
import { items } from './items';
import { monsters } from './monsters';
import { quests } from './quests';
import {
  BiomeSchema,
  CharacterClassSchema,
  GuardianSchema,
  ItemSchema,
  MonsterSchema,
  QuestSchema,
  VillageStageSchema,
} from './schemas';
import { villageStages } from './villages';

export * from './biomes';
export * from './classes';
export * from './guardians';
export * from './items';
export * from './monsters';
export * from './quests';
export * from './schemas';
export * from './villages';

export const gameContent = {
  biomes,
  classes: characterClasses,
  guardians,
  items,
  monsters,
  quests,
  villageStages,
} as const;

const ContentSchema = z.object({
  biomes: z.array(BiomeSchema),
  classes: z.array(CharacterClassSchema),
  guardians: z.array(GuardianSchema),
  items: z.array(ItemSchema),
  monsters: z.array(MonsterSchema),
  quests: z.array(QuestSchema),
  villageStages: z.array(VillageStageSchema),
});

export interface ContentValidation {
  success: boolean;
  summary: string;
  errors: string[];
}

export function validateGameContent(): ContentValidation {
  const result = ContentSchema.safeParse(gameContent);
  const summary =
    String(biomes.length) +
    ' biomas • ' +
    String(guardians.length) +
    ' Guardiões • ' +
    String(quests.length) +
    ' missões • ' +
    String(villageStages.length) +
    ' estágios de aldeia';

  if (result.success) {
    return { success: true, summary, errors: [] };
  }

  return {
    success: false,
    summary: 'dados inválidos',
    errors: result.error.issues.map((issue) => issue.path.join('.') + ': ' + issue.message),
  };
}
