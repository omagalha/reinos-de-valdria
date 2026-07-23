import { describe, expect, test } from 'vitest';
import {
  biomes,
  guardians,
  items,
  monsters,
  quests,
  validateGameContent,
  villageStages,
} from '../../src/game/data';

describe('catálogos da fundação', () => {
  test('todos os dados passam pelos schemas Zod', () => {
    const result = validateGameContent();
    expect(result.success, result.errors.join('\n')).toBe(true);
    expect(result.summary).toContain('6 biomas');
    expect(result.summary).toContain('6 Guardiões');
    expect(result.summary).toContain('3 estágios');
  });

  test('referências cruzadas apontam para conteúdo existente', () => {
    const biomeIds = new Set<string>(biomes.map((biome) => biome.id));
    const itemIds = new Set<string>(items.map((item) => item.id));
    const questIds = new Set<string>(quests.map((quest) => quest.id));

    for (const guardian of guardians) {
      expect(biomeIds.has(guardian.nativeBiome)).toBe(true);
    }
    for (const monster of monsters) {
      expect(monster.biomes.every((biomeId) => biomeIds.has(biomeId))).toBe(true);
      expect(monster.drops.every((drop) => itemIds.has(drop.itemId))).toBe(true);
    }
    for (const quest of quests) {
      expect(quest.prerequisites.every((questId) => questIds.has(questId))).toBe(true);
      expect(Object.keys(quest.rewards.items).every((itemId) => itemIds.has(itemId))).toBe(true);
    }
    expect(villageStages.map((stage) => stage.order)).toEqual([0, 1, 2]);
  });
});
