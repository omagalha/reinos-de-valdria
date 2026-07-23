// ---------- 2. ENTIDADES ----------
const expParaNivel = L => Math.round((50 / 3) * (L ** 3 - 6 * L ** 2 + 17 * L - 12));
const SPAWN = { x: 22, y: 30 };
const irand = n => Math.floor(Math.random() * n);
const rolarDano = ([min, max]) => min + irand(max - min + 1);
const distCheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

const jogador = {
  x: SPAWN.x, y: SPAWN.y, rx: SPAWN.x * TILE, ry: SPAWN.y * TILE,
  hp: 150, maxHp: 150, mp: 55, maxMp: 55,
  nivel: 1, exp: 0, alvo: null, caminho: null,
  cdMover: 0, cdAtaque: 0, cdMagia: 0,
  gold: 0, pocoes: 2, temAmuleto: false,
  fragmentos: 0, nucleos: 0,
  materiais: {
    couroRatino: 0,
    fibraVerde: 0,
    pedraSombria: 0,
    ossoAntigo: 0,
    escamaAzul: 0,
    essenciaSombria: 0,
    conchaSolar: 0,
  },
  classe: null, alcanceAtaque: 1, danoBase: [2, 8],
  cdEspecial: 0,
  escudoAtivo: 0,
  esquivaAtiva: 0,
  barreira: 0,
  persegueAlvo: false,
  acaoPendente: null,
  dirX: 0,
  dirY: 1,
  equipamentos: {
    arma: null,
    armadura: null,
    amuleto: null,
  },
};

const CLASSES = {
  cavaleiro: {
    nome: 'Cavaleiro',
    hp: 190,
    mp: 35,
    dano: [5, 13],
    alcanceAtaque: 1,
    habilidade: 'GOLPE',
    custo: 12,
    alcanceHabilidade: 1,
    cooldown: 1800,
    velAtaque: 930,
    tempoMovimento: 185,
    especial: 'ESCUDO',
    desc: 'Resistente, forte de perto.'
  },
  arqueiro: {
    nome: 'Arqueiro',
    hp: 135,
    mp: 50,
    dano: [4, 10],
    alcanceAtaque: 3,
    habilidade: 'TIRO',
    custo: 10,
    alcanceHabilidade: 5,
    cooldown: 1600,
    velAtaque: 820,
    tempoMovimento: 175,
    especial: 'ROLAR',
    desc: 'Ataca de longe e depende de posicionamento.'
  },
  mago: {
    nome: 'Mago',
    hp: 110,
    mp: 95,
    dano: [2, 7],
    alcanceAtaque: 2,
    habilidade: 'FLAMA',
    custo: 20,
    alcanceHabilidade: 4,
    cooldown: 2200,
    velAtaque: 1010,
    tempoMovimento: 190,
    especial: 'BARREIRA',
    desc: 'Frágil, mas causa alto dano mágico.'
  },
};

let classeEscolhida = 'cavaleiro';

// ---------- BIOMAS E MATERIAIS v4.9 ----------
// Sistema simples, sem inventário visual complexo.
// Objetivo: dar propósito para exploração, drops e futuros upgrades.
const BIOMAS = {
  campos: {
    nome: 'Campos de Valdria',
    cor: '#7fd36b',
  },
  estrada: {
    nome: 'Estrada Antiga',
    cor: '#d8b25a',
  },
  lago: {
    nome: 'Lago Azul',
    cor: '#70b8ff',
  },
  caverna: {
    nome: 'Caverna Sombria',
    cor: '#a0a0b0',
  },
  trono: {
    nome: 'Trono do Rei Esquelo',
    cor: '#d080ff',
  },
  praia: {
    nome: 'Praia Solar',
    cor: '#ffe090',
  },
};
const MATERIAIS = {
  couroRatino: {
    nome: 'Couro de Ratino',
    curto: 'Couro',
    icone: '▣',
  },
  fibraVerde: {
    nome: 'Fibra Verde',
    curto: 'Fibra',
    icone: '♧',
  },
  pedraSombria: {
    nome: 'Pedra Sombria',
    curto: 'Pedra',
    icone: '◆',
  },
  ossoAntigo: {
    nome: 'Osso Antigo',
    curto: 'Osso',
    icone: '♱',
  },
  escamaAzul: {
    nome: 'Escama Azul',
    curto: 'Escama',
    icone: '≈',
  },
  essenciaSombria: {
    nome: 'Essência Sombria',
    curto: 'Essência',
    icone: '✦',
  },
  conchaSolar: {
    nome: 'Concha Solar',
    curto: 'Concha',
    icone: '◌',
  },
};
function materiaisPadrao() {
  const base = {};
  Object.keys(MATERIAIS).forEach(id => {
    base[id] = 0;
  });
  return base;
}
function garantirMateriaisJogador() {
  if (!jogador.materiais) jogador.materiais = materiaisPadrao();
  for (const id of Object.keys(MATERIAIS)) {
    if (!Number.isFinite(jogador.materiais[id])) {
      jogador.materiais[id] = 0;
    }
  }
}
function textoMaterial(id, qtd) {
  const mat = MATERIAIS[id];
  if (!mat || !qtd) return null;
  return `${mat.nome} x${qtd}`;
}
function textoMateriaisCompacto() {
  garantirMateriaisJogador();
  const partes = Object.entries(MATERIAIS)
    .map(([id, mat]) => {
      const qtd = jogador.materiais[id] || 0;
      if (qtd <= 0) return null;
      return `${mat.icone}${mat.curto} ${qtd}`;
    })
    .filter(Boolean);
  return partes.length ? partes.join(' · ') : 'nenhum';
}
function receberMateriais(lista) {
  garantirMateriaisJogador();
  if (!lista) return '';
  const partes = [];
  for (const [id, qtd] of Object.entries(lista)) {
    if (!MATERIAIS[id] || qtd <= 0) continue;
    jogador.materiais[id] += qtd;
    partes.push(textoMaterial(id, qtd));
  }
  return partes.filter(Boolean).join(', ');
}
function temMateriais(req) {
  garantirMateriaisJogador();
  if (!req) return true;
  return Object.entries(req).every(([id, qtd]) => {
    return (jogador.materiais[id] || 0) >= qtd;
  });
}
function textoFaltandoMateriais(req) {
  garantirMateriaisJogador();
  if (!req) return '';
  const faltando = [];
  for (const [id, qtd] of Object.entries(req)) {
    const atual = jogador.materiais[id] || 0;
    if (atual < qtd) {
      const mat = MATERIAIS[id];
      faltando.push(`${mat ? mat.nome : id} ${atual}/${qtd}`);
    }
  }
  return faltando.join(', ');
}
function gastarMateriais(req) {
  garantirMateriaisJogador();
  if (!req) return;
  for (const [id, qtd] of Object.entries(req)) {
    jogador.materiais[id] = Math.max(0, (jogador.materiais[id] || 0) - qtd);
  }
}
function juntarMateriais(...listas) {
  const total = {};
  for (const lista of listas) {
    if (!lista) continue;
    for (const [id, qtd] of Object.entries(lista)) {
      total[id] = (total[id] || 0) + qtd;
    }
  }
  return total;
}
function chanceMaterial(id, chance, min = 1, max = 1) {
  if (Math.random() > chance) return {};
  return {
    [id]: min + irand(max - min + 1),
  };
}
function biomaNoTile(x, y) {
  const t = mapa[y] && mapa[y][x];
  if (y < 12) {
    if (x <= 15 && y <= 7) return 'trono';
    return 'caverna';
  }
  if (t === 'S') return 'praia';
  if (t === 'A') return 'lago';
  if (x > 30 && y > 24 && t !== 'S') return 'lago';
  if (t === 'D') return 'estrada';
  return 'campos';
}
function biomaJogador() {
  return biomaNoTile(jogador.x, jogador.y);
}
let ultimoBiomaVisitado = null;
function tickBioma() {
  const id = biomaJogador();
  if (id === ultimoBiomaVisitado) return;
  ultimoBiomaVisitado = id;
  const b = BIOMAS[id];
  if (b) {
    log(`Você entrou em: ${b.nome}.`, 'info');
  }
}

const GANHO_NIVEL_CLASSE = {
  cavaleiro: { hp: 18, mp: 7 },
  arqueiro:  { hp: 13, mp: 11 },
  mago:      { hp: 9,  mp: 18 },
};
function aplicarClasse(id) {
  const c = CLASSES[id];
  if (!c) return;
  jogador.classe = id;
  jogador.maxHp = c.hp;
  jogador.hp = c.hp;
  jogador.maxMp = c.mp;
  jogador.mp = c.mp;
  jogador.danoBase = c.dano;
  jogador.alcanceAtaque = c.alcanceAtaque;
  document.querySelector('#btnMagia').childNodes[0].nodeValue = c.habilidade;
  document.querySelector('#btnMagia small').textContent = `${c.custo} mana`;
}

document.querySelectorAll('.btn-classe').forEach(btn => {
  btn.addEventListener('click', () => {
    classeEscolhida = btn.dataset.classe;
    document.querySelectorAll('.btn-classe')
      .forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
  });
});

const BESTIARIO = {
  Ratino: {
    hp: 25,
    dano: [1, 8],
    exp: 5,
    vel: 350,
    visao: 5,
    loot: () => ({
      gold: 1 + irand(3),
      fragmentos: Math.random() < .35 ? 1 : 0,
      materiais: juntarMateriais(
        chanceMaterial('couroRatino', .55, 1, 1),
        chanceMaterial('fibraVerde', .20, 1, 1)
      ),
    }),
  },
  Caranguejo: {
    hp: 42,
    dano: [2, 12],
    exp: 14,
    vel: 430,
    visao: 5,
    loot: () => ({
      gold: 3 + irand(6),
      fragmentos: Math.random() < .25 ? 1 : 0,
      materiais: juntarMateriais(
        chanceMaterial('conchaSolar', .75, 1, 2),
        chanceMaterial('escamaAzul', .25, 1, 1)
      ),
    }),
  },
  Trolk: {
    hp: 60,
    dano: [3, 15],
    exp: 20,
    vel: 500,
    visao: 6,
    loot: () => ({
      gold: 4 + irand(9),
      pocoes: Math.random() < .25 ? 1 : 0,
      fragmentos: Math.random() < .55 ? 1 : 0,
      materiais: juntarMateriais(
        chanceMaterial('pedraSombria', .60, 1, 1),
        chanceMaterial('couroRatino', .25, 1, 1)
      ),
    }),
  },
  Esquelo: {
    hp: 100,
    dano: [6, 22],
    exp: 35,
    vel: 450,
    visao: 7,
    alcance: 4,
    cdTiro: 1700,
    danoTiro: [4, 16],
    projetil: '#e8e4d8',
    loot: () => ({
      gold: 8 + irand(14),
      pocoes: Math.random() < .3 ? 1 : 0,
      fragmentos: Math.random() < .75 ? 1 + irand(2) : 0,
      materiais: juntarMateriais(
        chanceMaterial('ossoAntigo', .70, 1, 2),
        chanceMaterial('pedraSombria', .35, 1, 1)
      ),
    }),
  },
  ReiEsquelo: {
    hp: 350,
    dano: [12, 34],
    exp: 250,
    vel: 550,
    visao: 9,
    boss: true,
    alcance: 5,
    cdTiro: 2200,
    danoTiro: [10, 26],
    projetil: '#ff7020',
    loot: () => ({
      gold: 120,
      pocoes: 3,
      fragmentos: 6,
      amuleto: true,
      materiais: {
        essenciaSombria: 3,
        ossoAntigo: 4,
        pedraSombria: 2,
      },
    }),
  },
};

const PONTOS_SPAWN = [
  { tipo: 'Ratino',  x: 12, y: 22 }, { tipo: 'Ratino',  x: 30, y: 20 },
  { tipo: 'Ratino',  x: 16, y: 32 }, { tipo: 'Ratino',  x: 27, y: 26 },
  { tipo: 'Ratino',  x: 8,  y: 28 }, { tipo: 'Ratino',  x: 33, y: 15 },
  { tipo: 'Caranguejo', x: 40, y: 35 }, { tipo: 'Caranguejo', x: 33, y: 36 },
  { tipo: 'Caranguejo', x: 38, y: 36 }, { tipo: 'Caranguejo', x: 37, y: 37 },
  { tipo: 'Trolk',   x: 10, y: 8  }, { tipo: 'Trolk',   x: 30, y: 6  },
  { tipo: 'Trolk',   x: 21, y: 9  }, { tipo: 'Trolk',   x: 26, y: 8  },
  { tipo: 'Esquelo', x: 17, y: 4  }, { tipo: 'Esquelo', x: 27, y: 4  },
  { tipo: 'Esquelo', x: 22, y: 6  },
  { tipo: 'ReiEsquelo', x: 9, y: 4 },
];

let monstros = [], corpos = [];
function nascerMonstro(ponto) {
  const base = BESTIARIO[ponto.tipo];
  monstros.push({
    tipo: ponto.tipo,
    x: ponto.x,
    y: ponto.y,
    rx: ponto.x * TILE,
    ry: ponto.y * TILE,
    hp: base.hp,
    maxHp: base.hp,
    cdMover: irand(500),
    cdAtaque: 0,
    cdEspecial: ponto.tipo === 'ReiEsquelo' ? 3500 : 0,
    spawn: ponto,
  });
}
PONTOS_SPAWN.forEach(nascerMonstro);

const NPC = { nome: 'Ancião Baldric', x: 20, y: 29, rx: 20 * TILE, ry: 29 * TILE };

let baus = [
  {
    x: 24,
    y: 26,
    aberto: false,
    loot: {
      gold: 25,
      pocoes: 1,
      materiais: {
        couroRatino: 2,
      },
    },
  },
  {
    x: 32,
    y: 29,
    aberto: false,
    loot: {
      fragmentos: 2,
      materiais: {
        escamaAzul: 1,
        fibraVerde: 1,
      },
    },
  },
  {
    x: 13,
    y: 7,
    aberto: false,
    loot: {
      gold: 50,
      nucleos: 1,
      materiais: {
        ossoAntigo: 2,
        pedraSombria: 2,
      },
    },
  },
];
for (const b of baus) if (!podeAndar(b.x, b.y)) mapa[b.y][b.x] = b.y < 12 ? 'P' : 'G';

let santuarios = [
  { x: 27, y: 22, usado: false, tRecarga: 0 },
  { x: 18, y: 9,  usado: false, tRecarga: 0 },
];
const RECARGA_SANTUARIO = 180000;
for (const s of santuarios) if (!podeAndar(s.x, s.y)) mapa[s.y][s.x] = s.y < 12 ? 'P' : 'G';

