// ---------- 5. LÓGICA ----------
const ocupado = (x, y) =>
  (jogador.x === x && jogador.y === y) ||
  (NPC.x === x && NPC.y === y) ||
  monstros.some(m => m.x === x && m.y === y) ||
  selvagens.some(s => s.x === x && s.y === y) ||
  baus.some(b => !b.aberto && b.x === x && b.y === y) ||
  santuarios.some(s => s.x === x && s.y === y) ||
  (companheiro() && companheiro().x === x && companheiro().y === y);

const teclas = {};
function tickJogador(dt) {
  jogador.regen = (jogador.regen || 0) + dt;
  if (jogador.regen > 2000) {
    jogador.regen = 0;
    jogador.hp = Math.min(maxHpAtual(), jogador.hp + 2);
    jogador.mp = Math.min(maxMpAtual(), jogador.mp + 4);
  }

  jogador.cdMover -= dt;
  if (jogador.cdMover <= 0) {
    const entrada = direcaoEntradaAtual();
    let passoReal = null;

    if (entrada.dx || entrada.dy) {
      jogador.caminho = null;
      cancelarAutomacoesDeCombate();
      passoReal = tentarPassoJogador(entrada.dx, entrada.dy, true);
    } else if (jogador.caminho && jogador.caminho.length) {
      const passo = jogador.caminho[0];
      const dx = passo.x - jogador.x;
      const dy = passo.y - jogador.y;

      passoReal = tentarPassoJogador(dx, dy, false);
      if (passoReal) {
        jogador.caminho.shift();
      } else {
        const fim = jogador.caminho[jogador.caminho.length - 1];
        jogador.caminho = acharCaminho(jogador, fim);
        if (!jogador.caminho) log('Caminho bloqueado.', 'info');
      }
    }

    if (passoReal) {
      jogador.cdMover = tempoMovimentoJogador(passoReal.dx, passoReal.dy);
    }
  }

  tickAcoesPendentes();

  jogador.cdAtaque -= dt;
  if (jogador.alvo && jogador.alvo.hp > 0 && jogador.cdAtaque <= 0
      && distCheb(jogador, jogador.alvo) <= (jogador.alcanceAtaque || 1)) {
    const base = jogador.danoBase || [2, 8];
    const bonus = bonusEquip();
    let dano = rolarDano([
      base[0] + jogador.nivel + bonus.dano,
      base[1] + jogador.nivel * 2 + bonus.dano
    ]);
    dano = aplicarCriticoSeRolou(dano, jogador.alvo);
    som('golpe');
    ferirAlvo(jogador.alvo, dano);
    jogador.cdAtaque = tempoAtaqueJogador();
  }
}

function ferirAlvo(a, dano) { a.selvagem ? ferirSelvagem(a, dano) : ferirMonstro(a, dano); }

function ferirMonstro(m, dano) {
  marcarImpacto(m);
  if (m.marcadoSombrio > 0) {
    dano = Math.ceil(dano * 1.25);
  }
  m.hp -= dano;
  flutuar(m, '-' + dano, m.marcadoSombrio > 0 ? '#d090ff' : '#ffdf60');
  if (m.hp <= 0) morrerMonstro(m);
}

function ferirSelvagem(g, dano) {
  marcarImpacto(g);
  g.hp -= dano;
  flutuar(g, '-' + dano, '#6ad0c0');
  if (g.hp <= 0) {
    log(`${g.especie} se dissipou em essência...`, 'info');
    corpos.push({
      x: g.x,
      y: g.y,
      rx: g.x * TILE,
      ry: g.y * TILE,
      tipo: g.especie,
      loot: {
        fragmentos: 1,
        materiais: materialDoGuardiao(g.especie),
      },
      tempo: 60000,
    });
    selvagens = selvagens.filter(s => s !== g);
    if (jogador.alvo === g) jogador.alvo = null;
    setTimeout(() => nascerGuardiao(g.spawn), 30000);
  }
}

const nomeDe = t => t === 'ReiEsquelo' ? 'Rei Esquelo' : t;

function morrerMonstro(m) {
  const base = BESTIARIO[m.tipo];
  mortes[m.tipo]++;
  registrarContrato(m.tipo);
  som(base.boss ? 'levelup' : 'morte');
  if (base.boss) log('⚔ O REI ESQUELO CAIU! Saqueie o trono!', 'xp');
  ganharExp(base.exp);
  const c = companheiro();
  if (c) expGuardiao(c, Math.floor(base.exp / 2));

  const loot = base.loot();
  const equipamento = criarEquipamento(m.tipo);
  if (equipamento) loot.equipamento = equipamento;

  corpos.push({
    x: m.x,
    y: m.y,
    rx: m.x * TILE,
    ry: m.y * TILE,
    tipo: m.tipo,
    loot,
    tempo: 120000,
  });

  monstros = monstros.filter(o => o !== m);
  if (jogador.alvo === m) jogador.alvo = null;
  if (!base.boss) setTimeout(() => nascerMonstro(m.spawn), 15000);
  checarMissao();
  salvarJogo();
}

function ganhosDoNivel() {
  const classe = jogador.classe || 'cavaleiro';
  return GANHO_NIVEL_CLASSE[classe] || GANHO_NIVEL_CLASSE.cavaleiro;
}

// ---------- FEEL DE CONTROLE v4.11 ----------
// Pequenas melhorias que deixam o jogo menos "duro":
// 1) diagonal real com deslize nas paredes;
// 2) perseguição automática do alvo tocado;
// 3) habilidade em buffer: se estiver longe, o herói anda e solta ao chegar;
// 4) tempos de ataque/movimento levemente diferentes por classe.
function classeAtual() {
  return CLASSES[jogador.classe || 'cavaleiro'] || CLASSES.cavaleiro;
}

function tempoMovimentoJogador(dx, dy) {
  const base = classeAtual().tempoMovimento || 185;
  // diagonal continua um pouco mais lenta, mas menos "pesada" que antes.
  return (dx && dy) ? Math.round(base * 1.32) : base;
}

function tempoAtaqueJogador() {
  const c = classeAtual();
  const bonus = bonusEquip ? bonusEquip() : { dano: 0 };
  // Equipamento melhor dá uma sensação levemente mais ágil, sem quebrar balanceamento.
  return Math.max(560, (c.velAtaque || 930) - Math.min(180, (bonus.dano || 0) * 12));
}

function tentarPassoJogador(dx, dy, permitirDeslize = true) {
  if (!dx && !dy) return null;

  const tentativas = [];
  if (dx && dy && permitirDeslize) {
    tentativas.push([dx, dy]);

    // No joystick, o eixo mais inclinado vira a primeira tentativa de deslize.
    const priorizaX = Math.abs(joystick.dx || 0) >= Math.abs(joystick.dy || 0);
    if (priorizaX) tentativas.push([dx, 0], [0, dy]);
    else tentativas.push([0, dy], [dx, 0]);
  } else {
    tentativas.push([dx, dy]);
  }

  for (const [mx, my] of tentativas) {
    if (!mx && !my) continue;
    const nx = jogador.x + mx;
    const ny = jogador.y + my;
    if (podeMoverComColisao(jogador, nx, ny)) {
      jogador.x = nx;
      jogador.y = ny;
      jogador.dirX = mx;
      jogador.dirY = my;
      return { dx: mx, dy: my };
    }
  }
  return null;
}

function aproximarParaAlvo(alvo, alcance, manterPerseguindo = true) {
  if (!alvo || alvo.hp <= 0) return false;
  if (distCheb(jogador, alvo) <= alcance) return true;

  const destino = tileParaAtacar(alvo, alcance);
  if (!destino) return false;

  const caminho = acharCaminho(jogador, destino);
  if (!caminho) return false;

  jogador.caminho = caminho;
  if (manterPerseguindo) jogador.persegueAlvo = true;
  return true;
}

function cancelarAutomacoesDeCombate() {
  jogador.persegueAlvo = false;
  jogador.acaoPendente = null;
}

function mirarAlvo(alvo, mensagem, tipo = 'info') {
  const mesmo = jogador.alvo === alvo;
  jogador.alvo = mesmo ? null : alvo;
  jogador.acaoPendente = null;

  if (!jogador.alvo) {
    jogador.persegueAlvo = false;
    log('Alvo cancelado.', 'info');
    return;
  }

  jogador.persegueAlvo = true;
  log(mensagem, tipo);
  aproximarParaAlvo(jogador.alvo, jogador.alcanceAtaque || 1, true);
}

function tickAcoesPendentes() {
  const alvo = jogador.alvo;
  if (!alvo || alvo.hp <= 0) {
    jogador.persegueAlvo = false;
    jogador.acaoPendente = null;
    return;
  }

  const entrada = direcaoEntradaAtual();
  if (entrada.dx || entrada.dy) return;

  if (jogador.acaoPendente && jogador.acaoPendente.tipo === 'habilidade') {
    const classe = classeAtual();
    if (distCheb(jogador, alvo) <= classe.alcanceHabilidade) {
      if (jogador.cdMagia <= 0 && jogador.mp >= classe.custo) {
        jogador.acaoPendente = null;
        lancarMagia();
      }
      return;
    }
    if (!jogador.caminho || !jogador.caminho.length) {
      aproximarParaAlvo(alvo, classe.alcanceHabilidade, true);
    }
    return;
  }

  if (jogador.persegueAlvo && distCheb(jogador, alvo) > (jogador.alcanceAtaque || 1)
      && (!jogador.caminho || !jogador.caminho.length)) {
    aproximarParaAlvo(alvo, jogador.alcanceAtaque || 1, true);
  }
}

function chanceCriticoJogador() {
  // Pequena chance de pico de dano. Arqueiro ganha um pouco mais de identidade.
  return jogador.classe === 'arqueiro' ? 0.12 : 0.08;
}

function aplicarCriticoSeRolou(dano, alvo) {
  if (Math.random() >= chanceCriticoJogador()) return dano;
  const crit = Math.ceil(dano * 1.65);
  som('critico');
  flutuar(alvo, 'CRÍTICO!', '#ffd87a');
  tremor = Math.max(tremor, 3);
  return crit;
}

function marcarImpacto(e, tempo = 140) {
  if (!e) return;
  e.hitFlash = Math.max(e.hitFlash || 0, tempo);
}

function tickFeedbackImpacto(dt) {
  jogador.hitFlash = Math.max(0, (jogador.hitFlash || 0) - dt);
  monstros.forEach(m => { m.hitFlash = Math.max(0, (m.hitFlash || 0) - dt); });
  selvagens.forEach(g => { g.hitFlash = Math.max(0, (g.hitFlash || 0) - dt); });
  equipe.forEach(g => { g.hitFlash = Math.max(0, (g.hitFlash || 0) - dt); });
}


function direcaoEntradaAtual() {
  let dx = 0, dy = 0;
  if (teclas.esq) dx -= 1;
  if (teclas.dir) dx += 1;
  if (teclas.cima) dy -= 1;
  if (teclas.baixo) dy += 1;
  return { dx, dy };
}
function tentarDashJogador(distancia = 2) {
  const { dx, dy } = direcaoEntradaAtual();
  if (!dx && !dy) return 0;
  let passos = 0;
  for (let i = 0; i < distancia; i++) {
    const nx = jogador.x + dx;
    const ny = jogador.y + dy;
    if (!podeMoverComColisao(jogador, nx, ny)) break;
    efeitos.push({ x: jogador.x, y: jogador.y, tipo: 'ritual', tempo: 240 });
    jogador.x = nx;
    jogador.y = ny;
    passos++;
  }
  if (passos > 0) {
    jogador.caminho = null;
    jogador.cdMover = 120;
    tremor = Math.max(tremor, 2.5);
  }
  return passos;
}
function tileParaAtacar(alvo, alcance) {
  const candidatos = [];
  for (let dy = -alcance; dy <= alcance; dy++) {
    for (let dx = -alcance; dx <= alcance; dx++) {
      if (dx === 0 && dy === 0) continue;
      const x = alvo.x + dx;
      const y = alvo.y + dy;
      const distAlvo = Math.max(Math.abs(dx), Math.abs(dy));
      if (distAlvo > alcance) continue;
      if (!podeAndar(x, y)) continue;
      if (ocupado(x, y)) continue;
      candidatos.push({
        x,
        y,
        distJogador: distCheb(jogador, { x, y }),
      });
    }
  }
  candidatos.sort((a, b) => a.distJogador - b.distJogador);
  return candidatos[0] || null;
}

function ganharExp(qtd) {
  const bonus = bonusEquip();
  qtd = Math.ceil(qtd * (1 + bonus.xpBonus));

  jogador.exp += qtd;
  flutuar(jogador, '+' + qtd + ' exp', '#d0a0ff');

  while (jogador.exp >= expParaNivel(jogador.nivel + 1)) {
    jogador.nivel++;

    const ganho = ganhosDoNivel();
    jogador.maxHp += ganho.hp;
    jogador.maxMp += ganho.mp;

    jogador.hp = maxHpAtual();
    jogador.mp = maxMpAtual();

    som('levelup');
    log(`✦ Nível ${jogador.nivel}! +${ganho.hp} HP, +${ganho.mp} MP`, 'xp');
  }

  salvarJogo();
}

function danoNoJogador(dano, origem) {
  if (jogador.esquivaAtiva > 0) {
    jogador.esquivaAtiva = 0;
    flutuar(jogador, 'ESQUIVA!', '#d8b25a');
    log('Você rolou e esquivou do golpe!', 'info');
    return;
  }
  if (jogador.barreira > 0) {
    const absorvido = Math.min(jogador.barreira, dano);
    jogador.barreira -= absorvido;
    dano -= absorvido;
    flutuar(jogador, '-' + absorvido + ' barreira', '#b07aff');
    if (jogador.barreira <= 0) log('A Barreira Arcana se desfez.', 'info');
    if (dano <= 0) return;
  }
  if (jogador.escudoAtivo > 0) {
    dano = Math.ceil(dano / 2);
  }

  const bonus = bonusEquip();
  if (bonus.defesa > 0) {
    dano = Math.max(1, dano - bonus.defesa);
  }

  jogador.hp -= dano;
  marcarImpacto(jogador, 170);
  flutuar(jogador, '-' + dano, '#ff6060');
  som('dor');
  tremor = Math.min(10, 4 + dano / 4);
  if (jogador.hp <= 0) morrerJogador();
}

function tickMonstros(dt) {
  const comp = companheiro();
  for (const m of monstros) {
    const base = BESTIARIO[m.tipo];
    if (m.lento > 0) m.lento = Math.max(0, m.lento - dt);
    if (m.marcadoSombrio > 0) m.marcadoSombrio = Math.max(0, m.marcadoSombrio - dt);

    const longeDeCasa = distCheb(m, m.spawn) > 10;
    let presa = jogador;
    if (comp && distCheb(m, comp) < distCheb(m, jogador)) presa = comp;
    const dist = distCheb(m, presa);

    m.cdAtaque -= dt;
    if (m.tipo === 'ReiEsquelo') {
      m.cdEspecial = Math.max(0, (m.cdEspecial || 0) - dt);
      if (!longeDeCasa && m.cdEspecial <= 0 && distCheb(m, jogador) <= base.visao) {
        chuvaOssea(m);
        m.cdEspecial = 6500;
      }
    }
    if (!longeDeCasa) {
      if (dist <= 1 && m.cdAtaque <= 0) {
        const dano = rolarDano(base.dano);
        m.cdAtaque = 1200;
        if (presa === jogador) { danoNoJogador(dano, m.tipo); if (jogador.hp <= 0) return; }
        else {
          presa.hp -= dano;
          marcarImpacto(presa, 160);
          flutuar(presa, '-' + dano, '#ff9060');
          if (presa.hp <= 0) desmaiarCompanheiro(presa);
        }
        continue;
      }
      if (base.alcance && dist > 1 && dist <= base.alcance && m.cdAtaque <= 0) {
        m.cdAtaque = base.cdTiro;
        prepararTiro(m, presa, rolarDano(base.danoTiro), base.projetil);
        continue;
      }
    }

    m.cdMover -= dt;
    if (m.cdMover <= 0) {
      m.cdMover = m.lento > 0 ? base.vel * 1.8 : base.vel;
      const meta = longeDeCasa ? m.spawn
                 : (dist > 1 && dist <= base.visao) ? presa : null;
      if (meta) {
        const dx = Math.sign(meta.x - m.x), dy = Math.sign(meta.y - m.y);
        for (const [ox, oy] of [[dx, dy], [dx, 0], [0, dy]]) {
          const nx = m.x + ox, ny = m.y + oy;
          if ((ox || oy) && podeMoverComColisao(m, nx, ny)) {
            m.x = nx;
            m.y = ny;
            break;
          }
        }
      } else if (!meta && dist > base.visao && Math.random() < 0.4 && !base.boss) {
        const [ox, oy] = [[0,1],[0,-1],[1,0],[-1,0]][irand(4)];
        if (podeMoverComColisao(m, m.x + ox, m.y + oy)) {
          m.x += ox;
          m.y += oy;
        }
      }
    }
  }
  corpos.forEach(c => c.tempo -= dt);
  corpos = corpos.filter(c => c.tempo > 0);
}

function tickSelvagens(dt) {
  for (const g of selvagens) {
    g.cdMover -= dt;
    if (g.cdMover <= 0) {
      g.cdMover = 700;
      if (Math.random() < 0.3) {
        const [ox, oy] = [[0,1],[0,-1],[1,0],[-1,0]][irand(4)];
        const nx = g.x + ox, ny = g.y + oy;
        if (
          podeMoverComColisao(g, nx, ny) &&
          Math.abs(nx - g.spawn.x) <= 3 &&
          Math.abs(ny - g.spawn.y) <= 3
        ) {
          g.x = nx;
          g.y = ny;
        }
      }
    }
  }
}

function tickCompanheiro(dt) {
  for (const g of equipe) {
    if (g.desmaiado) {
      g.tRevive -= dt;
      if (g.tRevive <= 0) {
        g.desmaiado = false;
        g.hp = Math.floor(g.maxHp / 2);
        g.x = jogador.x;
        g.y = jogador.y;
        g.rx = jogador.rx;
        g.ry = jogador.ry;
        log(`${g.especie} despertou e voltou à luta!`, 'vinculo');
      }
    }
  }
  const c = companheiro();
  if (!c) return;
  c.cdMover -= dt;
  if (c.cdMover <= 0) {
    const alvoAtual =
      jogador.alvo && jogador.alvo.hp > 0
        ? jogador.alvo
        : null;
    const meta =
      alvoAtual && distCheb(c, alvoAtual) > 1
        ? alvoAtual
        : distCheb(c, jogador) > 1
          ? jogador
          : null;
    if (meta) {
      const dx = Math.sign(meta.x - c.x);
      const dy = Math.sign(meta.y - c.y);
      for (const [ox, oy] of [[dx, dy], [dx, 0], [0, dy]]) {
        const nx = c.x + ox;
        const ny = c.y + oy;
        if ((ox || oy) && podeMoverComColisao(c, nx, ny)) {
          c.x = nx;
          c.y = ny;
          break;
        }
      }
    }
    c.cdMover = 210;
  }
  c.cdAtaque -= dt;
  const alvo =
    jogador.alvo && jogador.alvo.hp > 0
      ? jogador.alvo
      : null;
  if (!alvo || c.cdAtaque > 0 || distCheb(c, alvo) > 1) return;
  const alvoEhSelvagem = !!alvo.selvagem;
  const limiteSeguranca = alvoEhSelvagem
    ? Math.ceil(alvo.maxHp * 0.20)
    : 0;
  if (alvoEhSelvagem && alvo.hp <= limiteSeguranca) {
    c.cdAtaque = 500;
    return;
  }
  let dano = danoGuardiao(c);
  if (alvoEhSelvagem) {
    dano = Math.max(1, Math.floor(dano * 0.5));
    dano = Math.min(dano, Math.max(0, alvo.hp - limiteSeguranca));
  }
  if (dano <= 0) {
    c.cdAtaque = 500;
    return;
  }
  som('golpe');
  flutuar(alvo, '-' + dano, '#40c0a0');
  alvo.hp -= dano;
  if (alvo.hp <= 0) {
    if (alvoEhSelvagem) {
      ferirSelvagem(alvo, 0);
    } else {
      morrerMonstro(alvo);
    }
  } else if (alvoEhSelvagem && alvo.hp <= limiteSeguranca) {
    log(`${c.especie} parou o ataque. ${alvo.especie} está pronto para o Ritual de Vínculo!`, 'vinculo');
  }
  c.cdAtaque = alvoEhSelvagem ? 1200 : 900;
}

function tickHabilidadesGuardiao(dt) {
  const c = companheiro();
  if (!c) return;
  c.cdHabilidade = Math.max(0, (c.cdHabilidade || 0) - dt);
  if (c.cdHabilidade > 0) return;
  const alvo = jogador.alvo && jogador.alvo.hp > 0 ? jogador.alvo : null;
  const dados = GUARDIOES[c.especie];
  if (!dados) return;
  if (c.especie === 'Folium') {
    const jogadorMaxHp = maxHpAtual();
    const jogadorFerido = jogador.hp < jogadorMaxHp * 0.75;
    const guardiaoFerido = c.hp < c.maxHp * 0.75;
    const emergencia = jogador.hp < jogadorMaxHp * 0.45 || c.hp < c.maxHp * 0.45;
    const emCombate = alvo && alvo.hp > 0;
    if (!emCombate && !emergencia) return;
    if (!jogadorFerido && !guardiaoFerido) return;
    const curaJogador = 10 + c.nivel * 3;
    const curaGuardiao = 8 + c.nivel * 3;
    const antesJogador = jogador.hp;
    const antesGuardiao = c.hp;
    jogador.hp = Math.min(jogadorMaxHp, jogador.hp + curaJogador);
    c.hp = Math.min(c.maxHp, c.hp + curaGuardiao);
    const curadoJ = jogador.hp - antesJogador;
    const curadoG = c.hp - antesGuardiao;
    if (curadoJ > 0) flutuar(jogador, '+' + curadoJ, '#60e060');
    if (curadoG > 0) flutuar(c, '+' + curadoG, '#40c0a0');
    efeitos.push({ x: jogador.x, y: jogador.y, tipo: 'ritual', tempo: 700 });
    som('pocao');
    log(`✦ ${c.especie} usou ${dados.habilidade}.`, 'vinculo');
    c.cdHabilidade = dados.cdHabilidade;
    return;
  }
  if (!alvo) return;
  if (c.especie === 'Aquari') {
    if (alvo.selvagem) return;
    alvo.lento = 5000;
    efeitos.push({ x: alvo.x, y: alvo.y, tipo: 'ritual', tempo: 700 });
    flutuar(alvo, 'LENTO!', '#70c8ff');
    som('ritual');
    log(`✦ ${c.especie} usou ${dados.habilidade}.`, 'vinculo');
    c.cdHabilidade = dados.cdHabilidade;
    return;
  }
  if (c.especie === 'Ignix') {
    if (alvo.selvagem) return;
    const dano = 8 + c.nivel * 4;
    const atingidos = monstros
      .filter(m => m.hp > 0 && distCheb(m, alvo) <= 1)
      .slice(0, 5);
    if (!atingidos.length) return;
    for (const m of atingidos) {
      if (!monstros.includes(m) || m.hp <= 0) continue;
      efeitos.push({ x: m.x, y: m.y, tipo: 'fogo', tempo: 450 });
      ferirMonstro(m, dano);
    }
    som('magia');
    log(`✦ ${c.especie} usou ${dados.habilidade}.`, 'vinculo');
    c.cdHabilidade = dados.cdHabilidade;
    return;
  }
  if (c.especie === 'Umbrix') {
    if (alvo.selvagem) return;
    alvo.marcadoSombrio = 6000;
    efeitos.push({ x: alvo.x, y: alvo.y, tipo: 'ritual', tempo: 700 });
    flutuar(alvo, 'MARCADO!', '#d090ff');
    som('ritual');
    log(`✦ ${c.especie} usou ${dados.habilidade}.`, 'vinculo');
    c.cdHabilidade = dados.cdHabilidade;
  }
}

function desmaiarCompanheiro(c) {
  c.desmaiado = true;
  c.tRevive = 20000;
  som('falha');
  log(`${c.especie} desmaiou! Ele despertará em 20 segundos.`, 'morte');
}

function morrerJogador() {
  som('gameover');
  log('☠ Você morreu! Renascendo no templo... (−10% de exp)', 'morte');
  jogador.exp = Math.floor(jogador.exp * 0.9);
  while (jogador.nivel > 1 && jogador.exp < expParaNivel(jogador.nivel)) jogador.nivel--;
  jogador.hp = maxHpAtual();
  jogador.mp = maxMpAtual();
  curarEquipeCompleta();
  jogador.x = SPAWN.x; jogador.y = SPAWN.y;
  jogador.rx = SPAWN.x * TILE; jogador.ry = SPAWN.y * TILE;
  jogador.alvo = null; jogador.caminho = null;
  const c = companheiro();
  if (c) { c.x = jogador.x; c.y = jogador.y; c.rx = jogador.rx; c.ry = jogador.ry; }
  santuarios.forEach(s => { s.usado = false; s.tRecarga = 0; });
  salvarJogo();
}

