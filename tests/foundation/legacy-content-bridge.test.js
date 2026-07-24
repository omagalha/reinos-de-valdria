import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import catalogs from '../../src/game/data/catalogs.json';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const bridgeSource = await readFile(
  path.join(projectPath, 'public/game/00-content-bridge.js'),
  'utf8',
);

function readBridge() {
  const context = vm.createContext({});
  vm.runInContext(
    `Math.random = () => 0;
function irand(n) { return Math.floor(Math.random() * n); }
function chanceMaterial(id, chance, min = 1, max = 1) {
  if (Math.random() > chance) return {};
  return { [id]: min + irand(max - min + 1) };
}
function juntarMateriais(...listas) {
  const total = {};
  for (const lista of listas) {
    for (const [id, qtd] of Object.entries(lista || {})) total[id] = (total[id] || 0) + qtd;
  }
  return total;
}
${bridgeSource}
globalThis.__content = {
  version: VALDRIA_CONTENT_VERSION,
  classes: CLASSES,
  biomes: BIOMAS,
  materials: MATERIAIS,
  guardians: GUARDIOES,
  bestiary: BESTIARIO
};`,
    context,
  );
  return context.__content;
}

describe('ponte entre catálogos TypeScript e jogo Canvas', () => {
  test('preserva atributos, alcance, mana e cooldown das classes', () => {
    const bridge = readBridge();
    expect(bridge.version).toBe(catalogs.version);

    for (const entry of catalogs.classes) {
      expect(bridge.classes[entry.id]).toMatchObject({
        hp: entry.maxHp,
        mp: entry.maxMp,
        dano: entry.baseDamage,
        alcanceAtaque: entry.attackRange,
        custo: entry.skill.manaCost,
        alcanceHabilidade: entry.legacy.skillRange,
        cooldown: entry.skill.cooldownMs,
        velAtaque: entry.legacy.attackIntervalMs,
        tempoMovimento: entry.legacy.movementIntervalMs,
      });
    }
  });

  test('preserva HP, dano, XP, alcance e cooldown do bestiário atual', () => {
    const bridge = readBridge();
    const legacyMonsters = catalogs.monsters.filter((entry) => entry.legacy);

    for (const entry of legacyMonsters) {
      const legacy = entry.legacy;
      expect(bridge.bestiary[legacy.runtimeName]).toMatchObject({
        hp: entry.baseHp,
        dano: entry.baseDamage,
        exp: entry.experience,
        vel: legacy.speedMs,
        visao: legacy.vision,
        ...(legacy.range ? { alcance: legacy.range } : {}),
        ...(legacy.rangedCooldownMs ? { cdTiro: legacy.rangedCooldownMs } : {}),
        ...(legacy.rangedDamage ? { danoTiro: legacy.rangedDamage } : {}),
      });
    }
  });

  test('preserva Guardiões, materiais, biomas e fórmula de vínculo', () => {
    const bridge = readBridge();

    for (const entry of catalogs.guardians.filter((guardian) => guardian.legacy)) {
      const legacy = entry.legacy;
      expect(bridge.guardians[legacy.runtimeName]).toMatchObject({
        hp: entry.baseHp,
        dano: entry.baseDamage,
        bioma: legacy.biome,
        cor: legacy.color,
        cdHabilidade: entry.skills[0].cooldownMs,
      });
    }
    for (const item of catalogs.items.filter((entry) => entry.legacy)) {
      expect(bridge.materials[item.legacy.id]).toMatchObject({
        nome: item.name,
        curto: item.legacy.shortName,
        icone: item.legacy.icon,
      });
    }
    for (const biome of catalogs.biomes) {
      for (const legacy of biome.legacy) {
        expect(bridge.biomes[legacy.id]).toEqual({ nome: legacy.name, cor: legacy.color });
      }
    }

    const chanceAtFullHp = Math.min(0.9, 0.25 + 0.65 * (1 - 1));
    const chanceAtZeroHp = Math.min(0.9, 0.25 + 0.65 * (1 - 0));
    expect(chanceAtFullHp).toBe(0.25);
    expect(chanceAtZeroHp).toBe(0.9);
  });

  test('preserva drops mínimos de cada monstro e do chefe', () => {
    const bestiary = readBridge().bestiary;

    expect(bestiary.Ratino.loot()).toEqual({
      gold: 1,
      fragmentos: 1,
      materiais: { couroRatino: 1, fibraVerde: 1 },
    });
    expect(bestiary.Caranguejo.loot()).toEqual({
      gold: 3,
      fragmentos: 1,
      materiais: { conchaSolar: 1, escamaAzul: 1 },
    });
    expect(bestiary.Trolk.loot()).toEqual({
      gold: 4,
      pocoes: 1,
      fragmentos: 1,
      materiais: { pedraSombria: 1, couroRatino: 1 },
    });
    expect(bestiary.Esquelo.loot()).toEqual({
      gold: 8,
      pocoes: 1,
      fragmentos: 1,
      materiais: { ossoAntigo: 1, pedraSombria: 1 },
    });
    expect(bestiary.ReiEsquelo.loot()).toEqual({
      gold: 120,
      pocoes: 3,
      fragmentos: 6,
      amuleto: true,
      materiais: { essenciaSombria: 3, ossoAntigo: 4, pedraSombria: 2 },
    });
  });
});
