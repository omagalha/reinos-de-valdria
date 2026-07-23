export type GameMode = 'intro' | 'jogando' | 'dialogando' | 'loja' | 'pausado' | 'morto';

const transitions: Record<GameMode, readonly GameMode[]> = {
  intro: ['jogando'],
  jogando: ['dialogando', 'loja', 'pausado', 'morto'],
  dialogando: ['jogando'],
  loja: ['jogando'],
  pausado: ['jogando'],
  morto: ['jogando', 'intro'],
};

export function canTransition(from: GameMode, to: GameMode): boolean {
  return transitions[from].includes(to);
}

export function transition(from: GameMode, to: GameMode): GameMode {
  if (!canTransition(from, to)) {
    throw new Error('Transição inválida: ' + from + ' → ' + to);
  }
  return to;
}
