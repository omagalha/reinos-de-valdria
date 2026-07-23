// ---------- 3. GUARDIÕES ----------
const GUARDIOES = {
  Folium: {
    hp: 60,
    dano: [4, 12],
    bioma: 'Campos',
    cor: '#50c050',
    desc: 'espírito das matas',
    habilidade: 'Raiz Vital',
    cdHabilidade: 9000,
  },
  Aquari: {
    hp: 70,
    dano: [5, 14],
    bioma: 'Lago',
    cor: '#50a0e0',
    desc: 'espírito das águas',
    habilidade: 'Água Lenta',
    cdHabilidade: 8500,
  },
  Ignix: {
    hp: 80,
    dano: [6, 16],
    bioma: 'Caverna',
    cor: '#e08030',
    desc: 'espírito das chamas',
    habilidade: 'Chama Circular',
    cdHabilidade: 10000,
  },
  Umbrix: {
    hp: 110,
    dano: [8, 20],
    bioma: 'Trono',
    cor: '#a060e0',
    desc: 'espírito das sombras (raro)',
    raro: true,
    habilidade: 'Marca Sombria',
    cdHabilidade: 11000,
  },
};

const SPAWN_GUARDIOES = [
  { especie: 'Folium', x: 10, y: 24 }, { especie: 'Folium', x: 29, y: 23 },
  { especie: 'Aquari', x: 33, y: 26 }, { especie: 'Aquari', x: 39, y: 30 },
  { especie: 'Ignix',  x: 14, y: 9  }, { especie: 'Ignix',  x: 33, y: 7  },
  { especie: 'Umbrix', x: 12, y: 4  },
];

let selvagens = [];
function nascerGuardiao(ponto) {
  const base = GUARDIOES[ponto.especie];
  selvagens.push({ especie: ponto.especie, selvagem: true,
    x: ponto.x, y: ponto.y, rx: ponto.x * TILE, ry: ponto.y * TILE,
    hp: base.hp, maxHp: base.hp, cdMover: irand(700), spawn: ponto });
}
SPAWN_GUARDIOES.forEach(nascerGuardiao);

let equipe = [];
let ativo = 0;

const chanceVinculo = g => Math.min(0.9, 0.25 + 0.65 * (1 - Math.max(0, g.hp) / g.maxHp));

function forjarNucleo() {
  if (jogador.fragmentos < 3)
    return log(`Faltam fragmentos (⬡${jogador.fragmentos}/3). Cace monstros para conseguir mais.`, 'info');
  jogador.fragmentos -= 3;
  jogador.nucleos++;
  som('ritual');
  log('◉ Você forjou um Núcleo de Essência!', 'vinculo');
  checarMissao();
  salvarJogo();
}

function ritualDeVinculo(g) {
  if (equipe.some(e => e.especie === g.especie))
    return log(`Você já tem vínculo com ${g.especie}. Procure outras espécies para completar a coleção.`, 'info');
  if (jogador.nucleos < 1)
    return log('Você precisa de um Núcleo de Essência (◉) para o ritual. Forje com 3 fragmentos.', 'info');
  jogador.nucleos--;
  const chance = chanceVinculo(g);
  efeitos.push({ x: g.x, y: g.y, tipo: 'ritual', tempo: 800 });
  if (Math.random() < chance) {
    som('vinculo');
    selvagens = selvagens.filter(s => s !== g);
    if (jogador.alvo === g) jogador.alvo = null;
    equipe.push({
      especie: g.especie,
      hp: g.maxHp,
      maxHp: g.maxHp,
      x: jogador.x,
      y: jogador.y,
      rx: jogador.rx,
      ry: jogador.ry,
      nivel: 1,
      exp: 0,
      cdMover: 0,
      cdAtaque: 0,
      cdHabilidade: 2500,
      desmaiado: false,
      tRevive: 0,
    });
    if (equipe.length === 1) ativo = 0;
    log(`✦ VÍNCULO REALIZADO! ${g.especie}, ${GUARDIOES[g.especie].desc}, agora luta ao seu lado.`, 'vinculo');
    if (equipe.length === Object.keys(GUARDIOES).length && !jogador.bencao) {
      jogador.bencao = true;
      jogador.maxHp += 30;
      jogador.maxMp += 30;
      jogador.hp = maxHpAtual();
      jogador.mp = maxMpAtual();
      som('vinculo');
      log('✦✦ COLEÇÃO COMPLETA! A Bênção dos Guardiões concede +30 de vida e mana máximas!', 'vinculo');
    }
    setTimeout(() => nascerGuardiao(g.spawn), 45000);
    ganharExp(30);
    checarMissao();
    salvarJogo();
  } else {
    som('falha');
    log(`O ritual falhou (${Math.round(chance * 100)}%). ${g.especie} recuou. Enfraqueça-o mais!`, 'info');
    for (let i = 0; i < 8; i++) {
      const nx = g.x - 2 + irand(5), ny = g.y - 2 + irand(5);
      if (podeAndar(nx, ny) && !ocupado(nx, ny)) { g.x = nx; g.y = ny; break; }
    }
    salvarJogo();
  }
}

function materialDoGuardiao(especie) {
  switch (especie) {
    case 'Folium':
      return {
        fibraVerde: 2,
      };
    case 'Aquari':
      return {
        escamaAzul: 2,
      };
    case 'Ignix':
      return {
        pedraSombria: 2,
      };
    case 'Umbrix':
      return {
        essenciaSombria: 1,
      };
    default:
      return {};
  }
}

const companheiro = () => (equipe[ativo] && !equipe[ativo].desmaiado) ? equipe[ativo] : null;

function curarEquipeCompleta() {
  for (const g of equipe) {
    g.desmaiado = false;
    g.tRevive = 0;
    g.hp = g.maxHp;
  }
}
function curarGuardiaoAtivo(qtd) {
  const c = companheiro();
  if (!c) return 0;
  const antes = c.hp;
  c.hp = Math.min(c.maxHp, c.hp + qtd);
  return c.hp - antes;
}

function trocarGuardiao() {
  if (equipe.length < 2) return;
  ativo = (ativo + 1) % equipe.length;
  const c = equipe[ativo];
  c.x = jogador.x; c.y = jogador.y; c.rx = jogador.rx; c.ry = jogador.ry;
  log(`${c.especie} agora é o Guardião ativo.`, 'vinculo');
}

function expGuardiao(c, qtd) {
  c.exp += qtd;
  const prox = () => 40 * c.nivel * (c.nivel + 1);
  while (c.exp >= prox()) {
    c.exp -= prox();
    c.nivel++;
    const ganhoHp = 10 + Math.floor(c.nivel * 1.5);
    c.maxHp += ganhoHp;
    c.hp = c.maxHp;
    som('levelup');
    flutuar(c, 'LEVEL UP!', '#40c0a0');
    log(`✦ ${c.especie} alcançou o nível ${c.nivel}! +${ganhoHp} HP`, 'vinculo');
  }
}
const danoGuardiao = c => rolarDano(GUARDIOES[c.especie].dano) + (c.nivel - 1) * 2;

