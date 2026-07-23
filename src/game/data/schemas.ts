import { z } from 'zod';

export const SlugSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use identificadores em kebab-case');

export const ElementSchema = z.enum([
  'natureza',
  'agua',
  'fogo',
  'sombra',
  'luz',
  'gelo',
  'pedra',
]);

export const BiomeSchema = z.object({
  id: SlugSchema,
  name: z.string().min(3),
  description: z.string().min(10),
  mapColor: z.number().int().min(0).max(0xffffff),
  accentColor: z.number().int().min(0).max(0xffffff),
  movementCost: z.number().min(0.5).max(4),
  guardianElements: z.array(ElementSchema).min(1),
  resources: z.array(SlugSchema).min(1),
});

export const CharacterClassSchema = z.object({
  id: SlugSchema,
  name: z.string().min(3),
  description: z.string().min(10),
  maxHp: z.number().int().positive(),
  maxMp: z.number().int().nonnegative(),
  baseDamage: z.tuple([z.number().int().nonnegative(), z.number().int().positive()]),
  attackRange: z.number().positive(),
  skill: z.object({
    name: z.string().min(2),
    manaCost: z.number().int().nonnegative(),
    cooldownMs: z.number().int().positive(),
  }),
  special: z.string().min(2),
});

export const GuardianSkillSchema = z.object({
  id: SlugSchema,
  name: z.string().min(2),
  power: z.number().int().nonnegative(),
  cooldownMs: z.number().int().positive(),
  effect: z.enum(['dano', 'cura', 'controle', 'escudo', 'area']),
});

export const GuardianSchema = z.object({
  id: SlugSchema,
  name: z.string().min(3),
  description: z.string().min(10),
  element: ElementSchema,
  nativeBiome: SlugSchema,
  rarity: z.enum(['comum', 'incomum', 'raro', 'ancestral']),
  baseHp: z.number().int().positive(),
  baseDamage: z.tuple([z.number().int().nonnegative(), z.number().int().positive()]),
  bondDifficulty: z.number().min(0).max(1),
  skills: z.array(GuardianSkillSchema).min(1).max(4),
});

export const MonsterSchema = z.object({
  id: SlugSchema,
  name: z.string().min(2),
  biomes: z.array(SlugSchema).min(1),
  levelRange: z.tuple([z.number().int().positive(), z.number().int().positive()]),
  baseHp: z.number().int().positive(),
  baseDamage: z.tuple([z.number().int().nonnegative(), z.number().int().positive()]),
  experience: z.number().int().nonnegative(),
  behavior: z.enum(['passivo', 'territorial', 'cacador', 'emboscada', 'chefe']),
  drops: z.array(
    z.object({
      itemId: SlugSchema,
      chance: z.number().min(0).max(1),
      amount: z.tuple([z.number().int().positive(), z.number().int().positive()]),
    }),
  ),
});

export const ItemSchema = z.object({
  id: SlugSchema,
  name: z.string().min(2),
  description: z.string().min(5),
  category: z.enum(['material', 'consumivel', 'equipamento', 'missao']),
  rarity: z.enum(['comum', 'incomum', 'raro', 'epico']),
  stackLimit: z.number().int().positive(),
  sellValue: z.number().int().nonnegative(),
});

export const QuestSchema = z.object({
  id: SlugSchema,
  name: z.string().min(3),
  description: z.string().min(10),
  region: SlugSchema,
  prerequisites: z.array(SlugSchema),
  objectives: z.array(
    z.object({
      type: z.enum(['conversar', 'derrotar', 'coletar', 'vincular', 'evoluir-aldeia', 'explorar']),
      targetId: SlugSchema,
      amount: z.number().int().positive(),
    }),
  ).min(1),
  rewards: z.object({
    experience: z.number().int().nonnegative(),
    gold: z.number().int().nonnegative(),
    items: z.record(SlugSchema, z.number().int().positive()),
  }),
});

export const VillageResourcesSchema = z.object({
  madeira: z.number().int().nonnegative(),
  pedra: z.number().int().nonnegative(),
  fibras: z.number().int().nonnegative(),
  essencia: z.number().int().nonnegative(),
  ouro: z.number().int().nonnegative(),
});

export const VillageStageSchema = z.object({
  id: z.enum(['acampamento', 'aldeia', 'fortificada']),
  order: z.number().int().min(0).max(2),
  name: z.string().min(3),
  summary: z.string().min(8),
  requirements: VillageResourcesSchema,
  unlocks: z.array(SlugSchema),
  populationLimit: z.number().int().positive(),
});

export type Biome = z.infer<typeof BiomeSchema>;
export type CharacterClass = z.infer<typeof CharacterClassSchema>;
export type Guardian = z.infer<typeof GuardianSchema>;
export type Monster = z.infer<typeof MonsterSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Quest = z.infer<typeof QuestSchema>;
export type VillageResources = z.infer<typeof VillageResourcesSchema>;
export type VillageStage = z.infer<typeof VillageStageSchema>;
export type VillageStageId = VillageStage['id'];
