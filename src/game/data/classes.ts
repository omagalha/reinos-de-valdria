import type { CharacterClass } from './schemas';

export const characterClasses = [
  {
    id: 'cavaleiro',
    name: 'Cavaleiro',
    description: 'Resistente, forte de perto e capaz de proteger aliados.',
    maxHp: 190,
    maxMp: 35,
    baseDamage: [5, 13],
    attackRange: 1,
    skill: { name: 'Golpe', manaCost: 12, cooldownMs: 1800 },
    special: 'Escudo',
  },
  {
    id: 'arqueiro',
    name: 'Arqueiro',
    description: 'Ataca de longe e recompensa posicionamento cuidadoso.',
    maxHp: 135,
    maxMp: 50,
    baseDamage: [4, 10],
    attackRange: 3,
    skill: { name: 'Tiro', manaCost: 10, cooldownMs: 1600 },
    special: 'Rolamento',
  },
  {
    id: 'mago',
    name: 'Mago',
    description: 'Frágil, mas domina áreas e causa alto dano mágico.',
    maxHp: 110,
    maxMp: 95,
    baseDamage: [2, 7],
    attackRange: 2,
    skill: { name: 'Flama', manaCost: 20, cooldownMs: 2200 },
    special: 'Barreira',
  },
] as const satisfies readonly CharacterClass[];
