import { z } from 'zod';
import { VillageResourcesSchema } from '../data';

const PositionSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  regionId: z.string().min(2),
});

const GuardianSaveSchema = z.object({
  instanceId: z.string().min(2),
  speciesId: z.string().min(2),
  nickname: z.string().min(1).nullable(),
  level: z.number().int().positive(),
  experience: z.number().int().nonnegative(),
  hp: z.number().nonnegative(),
  maxHp: z.number().positive(),
});

export const GameSaveSchema = z.object({
  version: z.literal(3),
  slot: z.string().min(1).max(32),
  createdAt: z.string().min(10),
  updatedAt: z.string().min(10),
  player: z.object({
    classId: z.enum(['cavaleiro', 'arqueiro', 'mago']),
    level: z.number().int().positive(),
    experience: z.number().int().nonnegative(),
    hp: z.number().nonnegative(),
    maxHp: z.number().positive(),
    mp: z.number().nonnegative(),
    maxMp: z.number().nonnegative(),
    position: PositionSchema,
  }),
  inventory: z.object({
    gold: z.number().int().nonnegative(),
    potions: z.number().int().nonnegative(),
    fragments: z.number().int().nonnegative(),
    cores: z.number().int().nonnegative(),
    materials: z.record(z.string(), z.number().int().nonnegative()),
  }),
  guardians: z.array(GuardianSaveSchema),
  activeGuardianId: z.string().nullable(),
  world: z.object({
    defeated: z.record(z.string(), z.number().int().nonnegative()),
    openedChests: z.array(z.number().int().nonnegative()),
    visitedShrines: z.array(z.number().int().nonnegative()),
    flags: z.record(z.string(), z.boolean()),
  }),
  quests: z.object({
    currentId: z.string().nullable(),
    completedIds: z.array(z.string()),
    counters: z.record(z.string(), z.number().int().nonnegative()),
  }),
  village: z.object({
    stageId: z.enum(['acampamento', 'aldeia', 'fortificada']),
    resources: VillageResourcesSchema,
    population: z.number().int().nonnegative(),
    buildings: z.array(z.string()),
  }),
  settings: z.object({
    musicVolume: z.number().min(0).max(1),
    effectsVolume: z.number().min(0).max(1),
    reducedMotion: z.boolean(),
  }),
  migration: z.object({
    source: z.string(),
    importedAt: z.string(),
  }).optional(),
});

export type GameSave = z.infer<typeof GameSaveSchema>;

export function createEmptySave(now = new Date().toISOString()): GameSave {
  return {
    version: 3,
    slot: 'principal',
    createdAt: now,
    updatedAt: now,
    player: {
      classId: 'cavaleiro',
      level: 1,
      experience: 0,
      hp: 190,
      maxHp: 190,
      mp: 35,
      maxMp: 35,
      position: { x: 22, y: 30, regionId: 'campos-de-valdria' },
    },
    inventory: {
      gold: 0,
      potions: 2,
      fragments: 0,
      cores: 0,
      materials: {},
    },
    guardians: [],
    activeGuardianId: null,
    world: {
      defeated: {},
      openedChests: [],
      visitedShrines: [],
      flags: {},
    },
    quests: {
      currentId: 'o-amuleto-roubado',
      completedIds: [],
      counters: {},
    },
    village: {
      stageId: 'acampamento',
      resources: { madeira: 0, pedra: 0, fibras: 0, essencia: 0, ouro: 0 },
      population: 3,
      buildings: ['fogueira'],
    },
    settings: {
      musicVolume: 0.65,
      effectsVolume: 0.8,
      reducedMotion: false,
    },
  };
}
