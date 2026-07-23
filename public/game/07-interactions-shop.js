// ---------- LOJA DO ANCIÃO ----------
function abrirLoja() {
  atualizarLojaOuro();
  document.getElementById('loja').classList.add('aberta');
}
function atualizarLojaOuro() {
  document.getElementById('lojaOuro').textContent = `Ouro: ${jogador.gold}`;
}
function fecharLoja() {
  document.getElementById('loja').classList.remove('aberta');
}
function comprarPocao() {
  if (jogador.gold < 15) return log('Ouro insuficiente para comprar poção.', 'info');
  jogador.gold -= 15;
  jogador.pocoes++;
  atualizarLojaOuro();
  som('moeda');
  log('Você comprou 1 poção.', 'loot');
  salvarJogo();
}
function comprarFragmento() {
  if (jogador.gold < 25) return log('Ouro insuficiente para comprar fragmento.', 'info');
  jogador.gold -= 25;
  jogador.fragmentos++;
  atualizarLojaOuro();
  som('moeda');
  log('Você comprou 1 fragmento de essência.', 'loot');
  salvarJogo();
}
function comprarCura() {
  if (jogador.gold < 40) return log('Ouro insuficiente para receber cura completa.', 'info');
  jogador.gold -= 40;
  jogador.hp = maxHpAtual();
  jogador.mp = maxMpAtual();
  curarEquipeCompleta();
  atualizarLojaOuro();
  som('pocao');
  log('O Ancião restaurou você e seus Guardiões.', 'xp');
  salvarJogo();
}

function interagir() {
  if (distCheb(jogador, NPC) <= 1) {
    falarComNPC();
    return;
  }
  const corpo = corpos.find(c => distCheb(jogador, c) <= 1);
  if (corpo) {
    saquear(corpo);
    return;
  }
  const bau = baus.find(b => !b.aberto && distCheb(jogador, b) <= 1);
  if (bau) {
    abrirBau(bau);
    return;
  }
  const santuario = santuarios.find(s => distCheb(jogador, s) <= 1);
  if (santuario) {
    usarSantuario(santuario);
    return;
  }
  const selvagem = selvagens.find(s => distCheb(jogador, s) <= 1);
  if (selvagem) {
    if (jogador.nucleos > 0) {
      ritualDeVinculo(selvagem);
    } else {
      mirarAlvo(selvagem, 'Guardião próximo. Você precisa de um Núcleo de Essência (◉).', 'info');
    }
    return;
  }
  const monstro = monstros.find(m => distCheb(jogador, m) <= 1);
  if (monstro) {
    mirarAlvo(monstro, `${nomeDe(monstro.tipo)} na mira.`, 'info');
    return;
  }
  log('Nada para interagir por perto.', 'info');
}

function usarEspecial() {
  if (jogador.cdEspecial > 0) return;
  if (!jogador.classe) return;
  if (jogador.classe === 'cavaleiro') {
    if (jogador.mp < 10) return log('Sem mana suficiente.', 'info');
    jogador.mp -= 10;
    jogador.cdEspecial = 8000;
    jogador.escudoAtivo = 5000;
    flutuar(jogador, 'ESCUDO!', '#d8b25a');
    som('ritual');
    log('Escudo erguido: metade do dano por 5 segundos.', 'xp');
  } else if (jogador.classe === 'arqueiro') {
    if (jogador.mp < 8) return log('Sem mana suficiente.', 'info');
    jogador.mp -= 8;
    jogador.cdEspecial = 7000;
    jogador.esquivaAtiva = 3000;
    const passos = tentarDashJogador(2);
    flutuar(jogador, passos ? 'ROLAGEM!' : 'ESQUIVA!', '#d8b25a');
    som('tiro');
    log(
      passos
        ? `Rolagem: você avançou ${passos} casa(s) e anulará o próximo golpe.`
        : 'Você ficou evasivo: o próximo golpe será anulado.',
      'xp'
    );
  } else {
    if (jogador.mp < 25) return log('Sem mana suficiente.', 'info');
    jogador.mp -= 25;
    jogador.cdEspecial = 9000;
    jogador.barreira = 30 + jogador.nivel * 8;
    flutuar(jogador, 'BARREIRA!', '#b07aff');
    som('magia');
    log(`Barreira Arcana absorve ${jogador.barreira} de dano.`, 'xp');
  }
}

function lancarMagia() {
  if (jogador.cdMagia > 0) return;
  const classe = classeAtual();
  const alvo = jogador.alvo;
  if (!alvo || alvo.hp <= 0) {
    return log('Toque num alvo primeiro.', 'info');
  }
  if (distCheb(jogador, alvo) > classe.alcanceHabilidade) {
    const aproximou = aproximarParaAlvo(alvo, classe.alcanceHabilidade, true);
    if (aproximou) {
      jogador.acaoPendente = { tipo: 'habilidade' };
      log(`Aproximando para usar ${classe.habilidade}.`, 'info');
    } else {
      log(`Alvo longe demais para ${classe.habilidade}.`, 'info');
    }
    return;
  }
  if (jogador.mp < classe.custo) {
    return log('Sem mana suficiente.', 'info');
  }
  jogador.acaoPendente = null;
  jogador.mp -= classe.custo;
  jogador.cdMagia = classe.cooldown;
  let dano = 0;
  const bonus = bonusEquip();
  if (jogador.classe === 'cavaleiro') {
    dano = rolarDano([
      16 + jogador.nivel * 2 + bonus.dano,
      28 + jogador.nivel * 3 + bonus.dano,
    ]);
    dano = aplicarCriticoSeRolou(dano, alvo);
    efeitos.push({ x: alvo.x, y: alvo.y, tipo: 'ritual', tempo: 300 });
    som('golpe');
  }
  else if (jogador.classe === 'arqueiro') {
    dano = rolarDano([
      12 + jogador.nivel * 2 + bonus.dano,
      24 + jogador.nivel * 3 + bonus.dano,
    ]);
    dano = aplicarCriticoSeRolou(dano, alvo);
    atirar(jogador, alvo, dano, '#d8b25a');
    som('tiro');
    salvarJogo();
    return;
  }
  else {
    dano = rolarDano([
      14 + jogador.nivel * 3 + bonus.dano,
      30 + jogador.nivel * 4 + bonus.dano,
    ]);
    dano = aplicarCriticoSeRolou(dano, alvo);
    efeitos.push({ x: alvo.x, y: alvo.y, tipo: 'fogo', tempo: 400 });
    som('magia');
  }
  ferirAlvo(alvo, dano);
  salvarJogo();
}

function usarPocao() {
  if (jogador.pocoes <= 0) return log('Você não tem poções.', 'info');
  jogador.pocoes--;
  const bonus = bonusEquip();
  const curaJogador = Math.ceil((40 + irand(21)) * (1 + bonus.curaBonus));
  jogador.hp = Math.min(maxHpAtual(), jogador.hp + curaJogador);
  const curaGuardiao = Math.floor(curaJogador * 0.65);
  const curadoGuardiao = curarGuardiaoAtivo(curaGuardiao);
  som('pocao');
  flutuar(jogador, '+' + curaJogador, '#60e060');
  const c = companheiro();
  if (c && curadoGuardiao > 0) {
    flutuar(c, '+' + curadoGuardiao, '#40c0a0');
  }
  salvarJogo();
}

function saquear(corpo) {
  if (distCheb(jogador, corpo) > 1) return log('Aproxime-se do corpo para saquear.', 'info');
  const partes = [];
  if (corpo.loot.gold)       { jogador.gold += corpo.loot.gold; partes.push(`${corpo.loot.gold} de ouro`); }
  if (corpo.loot.pocoes)     { jogador.pocoes += corpo.loot.pocoes; partes.push(`${corpo.loot.pocoes} poção(ões)`); }
  if (corpo.loot.fragmentos) {
    jogador.fragmentos += corpo.loot.fragmentos;
    partes.push(`⬡${corpo.loot.fragmentos} fragmento(s)`);
  }
  if (corpo.loot.materiais) {
    const texto = receberMateriais(corpo.loot.materiais);
    if (texto) partes.push(texto);
  }
  if (corpo.loot.amuleto) {
    jogador.temAmuleto = true;
    partes.push('☀ O AMULETO DO SOL');
  }
  if (corpo.loot.equipamento) {
    const item = corpo.loot.equipamento;
    partes.push(`⬥ ${item.nome}`);
    tentarEquipar(item);
  }
  som('moeda');
  log(partes.length ? `Saque de ${nomeDe(corpo.tipo)}: ${partes.join(', ')}.` : 'O corpo estava vazio.', 'loot');
  corpos = corpos.filter(c => c !== corpo);
  checarMissao();
  salvarJogo();
}

function abrirBau(b) {
  if (distCheb(jogador, b) > 1) return log('Aproxime-se do baú para abrir.', 'info');
  if (b.aberto) return log('Este baú já está vazio.', 'info');
  b.aberto = true;
  const partes = [];
  if (b.loot.gold)       { jogador.gold += b.loot.gold; partes.push(`${b.loot.gold} de ouro`); }
  if (b.loot.pocoes)     { jogador.pocoes += b.loot.pocoes; partes.push(`${b.loot.pocoes} poção(ões)`); }
  if (b.loot.fragmentos) {
    jogador.fragmentos += b.loot.fragmentos;
    partes.push(`⬡${b.loot.fragmentos} fragmento(s)`);
  }
  if (b.loot.nucleos) {
    jogador.nucleos += b.loot.nucleos;
    partes.push(`◉${b.loot.nucleos} Núcleo de Essência!`);
  }
  if (b.loot.materiais) {
    const texto = receberMateriais(b.loot.materiais);
    if (texto) partes.push(texto);
  }
  som('moeda');
  flutuar(jogador, 'BAÚ!', '#ffd87a');
  log(`Baú aberto: ${partes.join(', ')}.`, 'loot');
  checarMissao();
  salvarJogo();
}

function usarSantuario(s) {
  if (distCheb(jogador, s) > 1) return log('Aproxime-se do santuário para orar.', 'info');
  if (s.usado)
    return log(`O santuário está apagado. Reacende em ${Math.ceil(s.tRecarga / 1000)}s.`, 'info');
  s.usado = true;
  s.tRecarga = RECARGA_SANTUARIO;
  jogador.hp = maxHpAtual();
  jogador.mp = maxMpAtual();
  curarEquipeCompleta();
  som('ritual');
  efeitos.push({ x: s.x, y: s.y, tipo: 'ritual', tempo: 800 });
  flutuar(jogador, 'RESTAURADO!', '#8af0d0');
  log('A luz do santuário restaura você e seus Guardiões.', 'vinculo');
  salvarJogo();
}

function checarMissao() {
  const m = MISSOES[missaoAtual];
  if (m.completa() && m.aoCompletar && !m.avisado) {
    m.avisado = true;
    log('✔ ' + m.aoCompletar, 'xp');
  }
  atualizarMissaoUI();
}

function falarComNPC() {
  const m = MISSOES[missaoAtual];
  const pronto = missaoAtual === 0 || m.completa();
  if (!pronto) {
    if (missaoAtual >= 1) {
      abrirLoja();
    } else {
      abrirDialogo(NPC.nome, ['Ainda não terminou? ' + m.objetivo + '.\n\nVolte quando cumprir a tarefa, herói.'], null);
    }
    return;
  }
  abrirDialogo(NPC.nome, m.dialogo, () => {
    if (m.recompensa) m.recompensa();
    if (missaoAtual < MISSOES.length - 1) missaoAtual++;
    log('Nova missão: ' + MISSOES[missaoAtual].objetivo, 'info');
    atualizarMissaoUI();
    salvarJogo();
  });
}

function atualizarMissaoUI() {
  const m = MISSOES[missaoAtual];
  let txt = m.objetivo;
  if (m.progresso && !m.completa()) txt += ' — ' + m.progresso();
  if (m.completa() && m.aoCompletar) txt = '✔ Volte ao Ancião Baldric';
  document.getElementById('missaoTexto').textContent = txt;

  const contratoEl = document.getElementById('contratoTexto');
  if (contratoEl) {
    contratoEl.innerHTML = `<strong>CONTRATO</strong>${textoContratoAtual()}`;
  }
}

let dialogoFila = [], dialogoAoFechar = null;
function abrirDialogo(nome, paginas, aoFechar) {
  dialogoFila = [...paginas];
  dialogoAoFechar = aoFechar;
  document.getElementById('dialogoNome').textContent = nome;
  proximaPagina();
  document.getElementById('dialogo').classList.add('aberto');
}
function proximaPagina() {
  if (dialogoFila.length === 0) {
    document.getElementById('dialogo').classList.remove('aberto');
    if (dialogoAoFechar) { const f = dialogoAoFechar; dialogoAoFechar = null; f(); }
    return;
  }
  document.getElementById('dialogoTexto').textContent = dialogoFila.shift();
  document.getElementById('dialogoBtn').textContent = dialogoFila.length ? 'Continuar ▸' : 'Fechar';
}
document.getElementById('dialogoBtn').addEventListener('click', proximaPagina);

