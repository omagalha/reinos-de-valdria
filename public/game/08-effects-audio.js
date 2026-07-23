// ---------- 6. PROJÉTEIS, TEXTOS FLUTUANTES E MOVIMENTO SUAVE ----------
let projeteis = [], telegrafos = [], areasPerigo = [], flutuantes = [], efeitos = [], tremor = 0, relogio = 0;

function atirar(de, alvo, dano, cor) {
  som('tiro');
  projeteis.push({ x0: de.rx + 16, y0: de.ry + 16, alvo, dano, cor, t: 0, dur: 320 });
}

function prepararTiro(de, alvo, dano, cor, atraso = 550) {
  if (!de || !alvo || de.hp <= 0 || alvo.hp <= 0) return;
  telegrafos.push({
    de,
    alvo,
    dano,
    cor,
    tempo: atraso,
    total: atraso,
  });
  efeitos.push({ x: alvo.x, y: alvo.y, tipo: 'ritual', tempo: 260 });
}
function tickTelegrafos(dt) {
  for (const t of telegrafos) {
    t.tempo -= dt;
    if (t.tempo <= 0) {
      t.feito = true;
      const origemViva = t.de && t.de.hp > 0 && monstros.includes(t.de);
      const alvoVivo =
        t.alvo === jogador
          ? jogador.hp > 0
          : t.alvo && t.alvo.hp > 0 && !t.alvo.desmaiado;
      if (origemViva && alvoVivo) {
        atirar(t.de, t.alvo, t.dano, t.cor);
      }
    }
  }
  telegrafos = telegrafos.filter(t => !t.feito);
}

function criarAreaPerigo(x, y, dano, atraso = 900, raio = 0, cor = '#ff7020') {
  if (!podeAndar(x, y)) return;
  areasPerigo.push({
    x,
    y,
    dano,
    tempo: atraso,
    total: atraso,
    raio,
    cor,
  });
}
function chuvaOssea(rei) {
  if (!rei || rei.hp <= 0) return;
  const pontos = [
    { x: jogador.x, y: jogador.y },
    { x: jogador.x + irand(3) - 1, y: jogador.y + irand(3) - 1 },
    { x: jogador.x + irand(5) - 2, y: jogador.y + irand(5) - 2 },
  ];
  for (const p of pontos) {
    criarAreaPerigo(p.x, p.y, 18 + irand(10), 900, 0, '#ff7020');
  }
  som('ritual');
  log('☠ O Rei Esquelo invoca Chuva Óssea!', 'morte');
}
function tickAreasPerigo(dt) {
  for (const a of areasPerigo) {
    a.tempo -= dt;
    if (a.tempo <= 0) {
      a.feito = true;
      const jogadorNaArea = distCheb(jogador, a) <= a.raio;
      if (jogadorNaArea) {
        danoNoJogador(a.dano, 'área');
      }
      const c = companheiro();
      if (c && distCheb(c, a) <= a.raio) {
        c.hp -= Math.ceil(a.dano * 0.75);
        marcarImpacto(c, 160);
        flutuar(c, '-' + Math.ceil(a.dano * 0.75), '#ff9060');
        if (c.hp <= 0 && !c.desmaiado) desmaiarCompanheiro(c);
      }
      efeitos.push({ x: a.x, y: a.y, tipo: 'fogo', tempo: 500 });
      tremor = Math.max(tremor, 5);
    }
  }
  areasPerigo = areasPerigo.filter(a => !a.feito);
}

function tickProjeteis(dt) {
  for (const p of projeteis) {
    p.t += dt;
    if (p.t >= p.dur) {
      p.feito = true;
      const a = p.alvo;
      if (a === jogador) danoNoJogador(p.dano, 'projétil');
      else if (a.desmaiado !== undefined) {
        a.hp -= p.dano;
        marcarImpacto(a, 160);
        flutuar(a, '-' + p.dano, '#ff9060');
        if (a.hp <= 0 && !a.desmaiado) desmaiarCompanheiro(a);
      }
      else if (a.hp > 0) ferirAlvo(a, p.dano);
    }
  }
  projeteis = projeteis.filter(p => !p.feito);
}

function flutuar(e, txt, cor) {
  flutuantes.push({ rx: e.rx + 16 + (irand(9) - 4), ry: e.ry - 4, txt, cor, tempo: 800 });
}

function animar(e, dt, msPorTile) {
  const ax = e.x * TILE, ay = e.y * TILE;
  if (Math.abs(ax - e.rx) > TILE * 2.5 || Math.abs(ay - e.ry) > TILE * 2.5) {
    e.rx = ax; e.ry = ay; return;
  }
  const v = TILE / msPorTile * dt * 1.15;
  e.rx += Math.abs(ax - e.rx) <= v ? (ax - e.rx) : Math.sign(ax - e.rx) * v;
  e.ry += Math.abs(ay - e.ry) <= v ? (ay - e.ry) : Math.sign(ay - e.ry) * v;
}

// ---------- 7. ÁUDIO ----------
let audioCtx = null, mudo = false;
function tocar(freq, dur, tipo = 'square', vol = 0.12, freqFim = null) {
  if (mudo || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  if (freqFim) osc.frequency.exponentialRampToValueAtTime(freqFim, audioCtx.currentTime + dur);
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(g); g.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + dur);
}
function som(nome) {
  switch (nome) {
    case 'golpe':   tocar(160, .07, 'square', .09); break;
    case 'critico': tocar(980, .06, 'square', .10); setTimeout(() => tocar(1380, .08, 'sine', .08), 45); break;
    case 'dor':     tocar(110, .18, 'sawtooth', .12, 70); break;
    case 'tiro':    tocar(700, .12, 'sine', .07, 220); break;
    case 'magia':   tocar(300, .25, 'sawtooth', .1, 900); break;
    case 'pocao':   tocar(400, .15, 'sine', .1, 620); break;
    case 'moeda':   tocar(880, .08, 'sine', .1); setTimeout(() => tocar(1320, .1, 'sine', .1), 70); break;
    case 'morte':   tocar(200, .25, 'square', .1, 60); break;
    case 'gameover':tocar(220, .3, 'sawtooth', .14, 55); setTimeout(() => tocar(110, .5, 'sawtooth', .14, 40), 250); break;
    case 'ritual':  tocar(200, .5, 'sine', .12, 800); break;
    case 'vinculo': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tocar(f, .18, 'sine', .12), i * 110)); break;
    case 'falha':   tocar(300, .3, 'square', .1, 120); break;
    case 'levelup': [523, 659, 784].forEach((f, i) => setTimeout(() => tocar(f, .15, 'square', .1), i * 100)); break;
  }
}
document.getElementById('btnSom').addEventListener('pointerdown', e => {
  e.preventDefault();
  iniciarAudioSePreciso();
  mudo = !mudo;
  e.target.textContent = mudo ? '✕' : '♪';
});

