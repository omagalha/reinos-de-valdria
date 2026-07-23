// ---------- LOOP PRINCIPAL ----------
let tSave = 0;
let ultimoT = performance.now();
function loop(t) {
  const dt = Math.min(100, t - ultimoT);
  ultimoT = t;
  relogio += dt;
  jogador.cdMagia = Math.max(0, jogador.cdMagia - dt);
  jogador.cdEspecial = Math.max(0, jogador.cdEspecial - dt);
  if (jogador.escudoAtivo > 0) jogador.escudoAtivo = Math.max(0, jogador.escudoAtivo - dt);
  if (jogador.esquivaAtiva > 0) jogador.esquivaAtiva = Math.max(0, jogador.esquivaAtiva - dt);

  const dialogoAberto = document.getElementById('dialogo').classList.contains('aberto')
                     || document.getElementById('loja').classList.contains('aberta');
  if (!dialogoAberto) {
    tickJogador(dt);
    tickMonstros(dt);
    tickSelvagens(dt);
    tickCompanheiro(dt);
    tickHabilidadesGuardiao(dt);
    tickTelegrafos(dt);
    tickAreasPerigo(dt);
    tickProjeteis(dt);
    tickBioma();
  }

  tSave += dt;
  if (tSave > 5000) { tSave = 0; salvarJogo(); }

  for (const s of santuarios) {
    if (s.usado) {
      s.tRecarga = Math.max(0, s.tRecarga - dt);
      if (s.tRecarga <= 0) {
        s.usado = false;
        som('vinculo');
        efeitos.push({ x: s.x, y: s.y, tipo: 'ritual', tempo: 600 });
      }
    }
  }
  efeitos.forEach(e => e.tempo -= dt);
  efeitos = efeitos.filter(e => e.tempo > 0);
  flutuantes.forEach(f => f.tempo -= dt);
  flutuantes = flutuantes.filter(f => f.tempo > 0);
  tickFeedbackImpacto(dt);

  animar(jogador, dt, classeAtual().tempoMovimento || 190);
  monstros.forEach(m => animar(m, dt, BESTIARIO[m.tipo].vel));
  selvagens.forEach(g => animar(g, dt, 500));
  equipe.forEach(c => animar(c, dt, 210));

  desenhar();
  desenharMinimapa();
  atualizarUI();
  atualizarDicaAcao();
  atualizarPainelAlvo();
  requestAnimationFrame(loop);
}
atualizarMissaoUI();
requestAnimationFrame(loop);
