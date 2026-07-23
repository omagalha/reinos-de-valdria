import type { VillageStage } from './schemas';

export const villageStages = [
  {
    id: 'acampamento',
    order: 0,
    name: 'Acampamento',
    summary: 'Abrigo inicial e fogueira',
    requirements: { madeira: 0, pedra: 0, fibras: 0, essencia: 0, ouro: 0 },
    unlocks: ['fogueira', 'bau-comunitario', 'bancada-simples'],
    populationLimit: 6,
  },
  {
    id: 'aldeia',
    order: 1,
    name: 'Aldeia Viva',
    summary: 'Casas, cultivo e comércio',
    requirements: { madeira: 60, pedra: 35, fibras: 30, essencia: 2, ouro: 120 },
    unlocks: ['ferreiro', 'horta', 'estalagem', 'quadro-de-contratos'],
    populationLimit: 18,
  },
  {
    id: 'fortificada',
    order: 2,
    name: 'Aldeia Fortificada',
    summary: 'Muralhas, santuário e expedições',
    requirements: { madeira: 150, pedra: 180, fibras: 80, essencia: 8, ouro: 500 },
    unlocks: ['muralha', 'santuario-de-guardioes', 'torre-de-vigia', 'expedicoes'],
    populationLimit: 40,
  },
] as const satisfies readonly VillageStage[];

export const villageStageById = Object.fromEntries(
  villageStages.map((stage) => [stage.id, stage]),
) as Record<(typeof villageStages)[number]['id'], (typeof villageStages)[number]>;
