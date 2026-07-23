import type { Quest } from './schemas';

export const quests = [
  {
    id: 'o-amuleto-roubado',
    name: 'O Amuleto Roubado',
    description: 'Converse com o Ancião e siga os rastros deixados ao norte de Valdria.',
    region: 'campos-de-valdria',
    prerequisites: [],
    objectives: [
      { type: 'conversar', targetId: 'anciao-baldric', amount: 1 },
      { type: 'explorar', targetId: 'entrada-da-caverna', amount: 1 },
    ],
    rewards: { experience: 80, gold: 35, items: { 'pocao-de-campo': 2 } },
  },
  {
    id: 'primeiro-vinculo',
    name: 'Primeiro Vínculo',
    description: 'Forje um núcleo e conquiste a confiança de um Guardião selvagem.',
    region: 'campos-de-valdria',
    prerequisites: ['o-amuleto-roubado'],
    objectives: [{ type: 'vincular', targetId: 'qualquer-guardiao', amount: 1 }],
    rewards: { experience: 120, gold: 50, items: { 'nucleo-de-essencia': 1 } },
  },
  {
    id: 'alicerces-de-valdria',
    name: 'Alicerces de Valdria',
    description: 'Reúna recursos e transforme o acampamento em uma aldeia permanente.',
    region: 'campos-de-valdria',
    prerequisites: ['primeiro-vinculo'],
    objectives: [{ type: 'evoluir-aldeia', targetId: 'aldeia', amount: 1 }],
    rewards: { experience: 250, gold: 120, items: { 'pocao-de-campo': 3 } },
  },
  {
    id: 'luzes-no-pantano',
    name: 'Luzes no Pântano',
    description: 'Investigue as luzes que desapareceram entre as névoas do novo bioma.',
    region: 'pantano-luminoso',
    prerequisites: ['alicerces-de-valdria'],
    objectives: [
      { type: 'explorar', targetId: 'santuario-do-lodo', amount: 1 },
      { type: 'derrotar', targetId: 'vulto-do-lodo', amount: 4 },
    ],
    rewards: { experience: 420, gold: 190, items: { 'pedra-sombria': 4 } },
  },
] as const satisfies readonly Quest[];
