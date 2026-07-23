import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(projectPath, 'src/game/data/catalogs.json');
const outputPath = path.join(projectPath, 'public/game/00-content-bridge.js');
const catalogs = JSON.parse(await readFile(catalogPath, 'utf8'));

const randomAmountSource = ([min, max]) =>
  min === max ? String(min) : `${min} + irand(${max - min + 1})`;

const classes = Object.fromEntries(
  catalogs.classes.map((entry) => [
    entry.id,
    {
      nome: entry.name,
      hp: entry.maxHp,
      mp: entry.maxMp,
      dano: entry.baseDamage,
      alcanceAtaque: entry.attackRange,
      habilidade: entry.skill.name.toUpperCase(),
      custo: entry.skill.manaCost,
      alcanceHabilidade: entry.legacy.skillRange,
      cooldown: entry.skill.cooldownMs,
      velAtaque: entry.legacy.attackIntervalMs,
      tempoMovimento: entry.legacy.movementIntervalMs,
      especial: entry.special.toUpperCase(),
      desc: entry.description,
    },
  ]),
);

const biomes = Object.fromEntries(
  catalogs.biomes.flatMap((entry) =>
    entry.legacy.map((legacy) => [legacy.id, { nome: legacy.name, cor: legacy.color }]),
  ),
);

const materials = Object.fromEntries(
  catalogs.items
    .filter((entry) => entry.legacy)
    .map((entry) => [
      entry.legacy.id,
      { nome: entry.name, curto: entry.legacy.shortName, icone: entry.legacy.icon },
    ]),
);

const guardians = Object.fromEntries(
  catalogs.guardians
    .filter((entry) => entry.legacy)
    .map((entry) => [
      entry.legacy.runtimeName,
      {
        hp: entry.baseHp,
        dano: entry.baseDamage,
        bioma: entry.legacy.biome,
        cor: entry.legacy.color,
        desc: entry.legacy.description,
        ...(entry.legacy.rare ? { raro: true } : {}),
        habilidade: entry.legacy.skillName,
        cdHabilidade: entry.skills[0].cooldownMs,
        dificuldadeVinculo: entry.bondDifficulty,
      },
    ]),
);

function lootFunction(entry) {
  const legacy = entry.legacy;
  const materialLines = entry.drops
    .filter((drop) => catalogs.items.some((item) => item.id === drop.itemId && item.legacy))
    .map((drop) => {
      const item = catalogs.items.find((candidate) => candidate.id === drop.itemId);
      return `chanceMaterial(${JSON.stringify(item.legacy.id)}, ${drop.chance}, ${drop.amount[0]}, ${drop.amount[1]})`;
    });
  const lines = [
    `gold: ${randomAmountSource(legacy.gold)}`,
    legacy.potions
      ? `pocoes: Math.random() < ${legacy.potions.chance} ? ${randomAmountSource(legacy.potions.amount)} : 0`
      : null,
    legacy.fragments
      ? `fragmentos: Math.random() < ${legacy.fragments.chance} ? ${randomAmountSource(legacy.fragments.amount)} : 0`
      : null,
    legacy.amulet ? 'amuleto: true' : null,
    materialLines.length ? `materiais: juntarMateriais(${materialLines.join(', ')})` : null,
  ].filter(Boolean);
  return `() => ({ ${lines.join(', ')} })`;
}

const bestiaryEntries = catalogs.monsters
  .filter((entry) => entry.legacy)
  .map((entry) => {
    const legacy = entry.legacy;
    const fields = [
      `hp: ${entry.baseHp}`,
      `dano: ${JSON.stringify(entry.baseDamage)}`,
      `exp: ${entry.experience}`,
      `vel: ${legacy.speedMs}`,
      `visao: ${legacy.vision}`,
      legacy.boss ? 'boss: true' : null,
      legacy.range ? `alcance: ${legacy.range}` : null,
      legacy.rangedCooldownMs ? `cdTiro: ${legacy.rangedCooldownMs}` : null,
      legacy.rangedDamage ? `danoTiro: ${JSON.stringify(legacy.rangedDamage)}` : null,
      legacy.projectile ? `projetil: ${JSON.stringify(legacy.projectile)}` : null,
      `loot: ${lootFunction(entry)}`,
    ].filter(Boolean);
    return `${JSON.stringify(legacy.runtimeName)}: { ${fields.join(', ')} }`;
  });

const source = `/* Arquivo gerado por scripts/generate-legacy-content.mjs.
   Fonte única: src/game/data/catalogs.json. Não edite manualmente. */
const VALDRIA_CONTENT_VERSION = ${JSON.stringify(catalogs.version)};
const CLASSES = ${JSON.stringify(classes, null, 2)};
const BIOMAS = ${JSON.stringify(biomes, null, 2)};
const MATERIAIS = ${JSON.stringify(materials, null, 2)};
const GUARDIOES = ${JSON.stringify(guardians, null, 2)};
const BESTIARIO = {
  ${bestiaryEntries.join(',\n  ')}
};
`;

await writeFile(outputPath, source, 'utf8');
console.log(`Ponte legada ${catalogs.version} gerada em public/game/00-content-bridge.js.`);
