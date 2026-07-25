/* Arquivo gerado por scripts/generate-legacy-content.mjs.
   Fonte única: src/game/data/catalogs.json. Não edite manualmente. */
const VALDRIA_CONTENT_VERSION = "4.27.0";
const CLASSES = {
  "cavaleiro": {
    "nome": "Cavaleiro",
    "hp": 190,
    "mp": 35,
    "dano": [
      5,
      13
    ],
    "alcanceAtaque": 1,
    "habilidade": "GOLPE",
    "custo": 12,
    "alcanceHabilidade": 1,
    "cooldown": 1800,
    "velAtaque": 930,
    "tempoMovimento": 185,
    "especial": "ESCUDO",
    "desc": "Resistente, forte de perto e capaz de proteger aliados."
  },
  "arqueiro": {
    "nome": "Arqueiro",
    "hp": 135,
    "mp": 50,
    "dano": [
      4,
      10
    ],
    "alcanceAtaque": 3,
    "habilidade": "TIRO",
    "custo": 10,
    "alcanceHabilidade": 5,
    "cooldown": 1600,
    "velAtaque": 820,
    "tempoMovimento": 175,
    "especial": "ROLAMENTO",
    "desc": "Ataca de longe e recompensa posicionamento cuidadoso."
  },
  "mago": {
    "nome": "Mago",
    "hp": 110,
    "mp": 95,
    "dano": [
      2,
      7
    ],
    "alcanceAtaque": 2,
    "habilidade": "FLAMA",
    "custo": 20,
    "alcanceHabilidade": 4,
    "cooldown": 2200,
    "velAtaque": 1010,
    "tempoMovimento": 190,
    "especial": "BARREIRA",
    "desc": "Frágil, mas domina áreas e causa alto dano mágico."
  }
};
const BIOMAS = {
  "campos": {
    "nome": "Campos de Valdria",
    "cor": "#7fd36b"
  },
  "estrada": {
    "nome": "Estrada Antiga",
    "cor": "#d8b25a"
  },
  "praia": {
    "nome": "Praia Solar",
    "cor": "#ffe090"
  },
  "lago": {
    "nome": "Lago Azul",
    "cor": "#70b8ff"
  },
  "caverna": {
    "nome": "Caverna Sombria",
    "cor": "#a0a0b0"
  },
  "trono": {
    "nome": "Trono do Rei Esquelo",
    "cor": "#d080ff"
  }
};
const MATERIAIS = {
  "couroRatino": {
    "nome": "Couro de Ratino",
    "curto": "Couro",
    "icone": "▣"
  },
  "fibraVerde": {
    "nome": "Fibra Verde",
    "curto": "Fibra",
    "icone": "♧"
  },
  "pedraSombria": {
    "nome": "Pedra Sombria",
    "curto": "Pedra",
    "icone": "◆"
  },
  "ossoAntigo": {
    "nome": "Osso Antigo",
    "curto": "Osso",
    "icone": "♱"
  },
  "escamaAzul": {
    "nome": "Escama Azul",
    "curto": "Escama",
    "icone": "≈"
  },
  "essenciaSombria": {
    "nome": "Essência Sombria",
    "curto": "Essência",
    "icone": "✦"
  },
  "conchaSolar": {
    "nome": "Concha Solar",
    "curto": "Concha",
    "icone": "◌"
  }
};
const GUARDIOES = {
  "Folium": {
    "hp": 60,
    "dano": [
      4,
      12
    ],
    "bioma": "Campos",
    "cor": "#50c050",
    "desc": "espírito das matas",
    "habilidade": "Raiz Vital",
    "cdHabilidade": 9000,
    "dificuldadeVinculo": 0.25
  },
  "Aquari": {
    "hp": 70,
    "dano": [
      5,
      14
    ],
    "bioma": "Lago",
    "cor": "#50a0e0",
    "desc": "espírito das águas",
    "habilidade": "Água Lenta",
    "cdHabilidade": 8500,
    "dificuldadeVinculo": 0.3
  },
  "Ignix": {
    "hp": 80,
    "dano": [
      6,
      16
    ],
    "bioma": "Caverna",
    "cor": "#e08030",
    "desc": "espírito das chamas",
    "habilidade": "Chama Circular",
    "cdHabilidade": 10000,
    "dificuldadeVinculo": 0.42
  },
  "Umbrix": {
    "hp": 110,
    "dano": [
      8,
      20
    ],
    "bioma": "Trono",
    "cor": "#a060e0",
    "desc": "espírito das sombras (raro)",
    "raro": true,
    "habilidade": "Marca Sombria",
    "cdHabilidade": 11000,
    "dificuldadeVinculo": 0.62
  }
};
const BESTIARIO = {
  "Ratino": { hp: 25, dano: [1,8], exp: 5, vel: 350, visao: 5, loot: () => ({ gold: 1 + irand(3), fragmentos: Math.random() < 0.35 ? 1 : 0, materiais: juntarMateriais(chanceMaterial("couroRatino", 0.55, 1, 1), chanceMaterial("fibraVerde", 0.2, 1, 1)) }) },
  "Caranguejo": { hp: 42, dano: [2,12], exp: 14, vel: 430, visao: 5, loot: () => ({ gold: 3 + irand(6), fragmentos: Math.random() < 0.25 ? 1 : 0, materiais: juntarMateriais(chanceMaterial("conchaSolar", 0.75, 1, 2), chanceMaterial("escamaAzul", 0.25, 1, 1)) }) },
  "Trolk": { hp: 60, dano: [3,15], exp: 20, vel: 500, visao: 6, loot: () => ({ gold: 4 + irand(9), pocoes: Math.random() < 0.25 ? 1 : 0, fragmentos: Math.random() < 0.55 ? 1 : 0, materiais: juntarMateriais(chanceMaterial("pedraSombria", 0.6, 1, 1), chanceMaterial("couroRatino", 0.25, 1, 1)) }) },
  "Esquelo": { hp: 100, dano: [6,22], exp: 35, vel: 450, visao: 7, alcance: 4, cdTiro: 1700, danoTiro: [4,16], projetil: "#e8e4d8", loot: () => ({ gold: 8 + irand(14), pocoes: Math.random() < 0.3 ? 1 : 0, fragmentos: Math.random() < 0.75 ? 1 + irand(2) : 0, materiais: juntarMateriais(chanceMaterial("ossoAntigo", 0.7, 1, 2), chanceMaterial("pedraSombria", 0.35, 1, 1)) }) },
  "ReiEsquelo": { hp: 350, dano: [12,34], exp: 250, vel: 550, visao: 9, boss: true, alcance: 5, cdTiro: 2200, danoTiro: [10,26], projetil: "#ff7020", loot: () => ({ gold: 120, pocoes: Math.random() < 1 ? 3 : 0, fragmentos: Math.random() < 1 ? 6 : 0, amuleto: true, materiais: juntarMateriais(chanceMaterial("essenciaSombria", 1, 3, 3), chanceMaterial("ossoAntigo", 1, 4, 4), chanceMaterial("pedraSombria", 1, 2, 2)) }) }
};
