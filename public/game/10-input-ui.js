// ---------- 9. ENTRADA E UI ----------
const joystick = {
  ativo: false,
  id: null,
  dx: 0,
  dy: 0,
};
function atualizarJoystickVisual() {
  const knob = document.getElementById('joyKnob');
  if (!knob) return;
  const max = 40;
  knob.style.transform = `translate(${joystick.dx * max}px, ${joystick.dy * max}px)`;
}
function limparJoystick() {
  joystick.ativo = false;
  joystick.id = null;
  joystick.dx = 0;
  joystick.dy = 0;
  teclas.cima = false;
  teclas.baixo = false;
  teclas.esq = false;
  teclas.dir = false;
  atualizarJoystickVisual();
}
function moverJoystick(e) {
  const base = document.getElementById('joyBase');
  const r = base.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  let dx = e.clientX - cx;
  let dy = e.clientY - cy;
  const dist = Math.hypot(dx, dy);
  const max = r.width * 0.34;
  if (dist > max) {
    dx = dx / dist * max;
    dy = dy / dist * max;
  }
  joystick.dx = dx / max;
  joystick.dy = dy / max;
  // v4.7: zona morta menor facilita acionar diagonal em tela de celular.
  const zonaMorta = 0.22;
  teclas.esq = joystick.dx < -zonaMorta;
  teclas.dir = joystick.dx > zonaMorta;
  teclas.cima = joystick.dy < -zonaMorta;
  teclas.baixo = joystick.dy > zonaMorta;
  atualizarJoystickVisual();
}
const joyEl = document.getElementById('joystick');
joyEl.addEventListener('pointerdown', e => {
  e.preventDefault();
  iniciarAudioSePreciso();
  joystick.ativo = true;
  joystick.id = e.pointerId;
  joyEl.setPointerCapture(e.pointerId);
  jogador.caminho = null;
  cancelarAutomacoesDeCombate();
  moverJoystick(e);
});
joyEl.addEventListener('pointermove', e => {
  if (!joystick.ativo || e.pointerId !== joystick.id) return;
  e.preventDefault();
  moverJoystick(e);
});
joyEl.addEventListener('pointerup', e => {
  if (e.pointerId !== joystick.id) return;
  e.preventDefault();
  limparJoystick();
});
joyEl.addEventListener('pointercancel', e => {
  if (e.pointerId !== joystick.id) return;
  e.preventDefault();
  limparJoystick();
});

function iniciarAudioSePreciso() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

document.getElementById('fecharLoja').addEventListener('click', fecharLoja);
document.getElementById('comprarPocao').addEventListener('click', comprarPocao);
document.getElementById('comprarFragmento').addEventListener('click', comprarFragmento);
document.getElementById('comprarCura').addEventListener('click', comprarCura);

document.getElementById('btnInteragir').addEventListener('pointerdown', e => {
  e.preventDefault();
  iniciarAudioSePreciso();
  interagir();
});
document.getElementById('btnEspecial').addEventListener('pointerdown', e => {
  e.preventDefault();
  iniciarAudioSePreciso();
  usarEspecial();
});
document.getElementById('btnMagia').addEventListener('pointerdown', e => {
  e.preventDefault();
  iniciarAudioSePreciso();
  lancarMagia();
});
document.getElementById('btnPocao').addEventListener('pointerdown', e => {
  e.preventDefault();
  iniciarAudioSePreciso();
  usarPocao();
});
document.getElementById('btnForjar').addEventListener('pointerdown', e => {
  e.preventDefault();
  iniciarAudioSePreciso();
  forjarNucleo();
});
document.getElementById('painelGuardiao').addEventListener('pointerdown', e => { e.preventDefault(); trocarGuardiao(); });

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') teclas.cima = true;
  if (k === 'arrowdown' || k === 's') teclas.baixo = true;
  if (k === 'arrowleft' || k === 'a') teclas.esq = true;
  if (k === 'arrowright' || k === 'd') teclas.dir = true;
  if (k === ' ') { e.preventDefault(); lancarMagia(); }
  if (k === '1') usarPocao();
  if (k === '2') forjarNucleo();
  if (k === '3') trocarGuardiao();
  if (k === 'e') interagir();
  if (k === 'q') usarEspecial();
});
window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') teclas.cima = false;
  if (k === 'arrowdown' || k === 's') teclas.baixo = false;
  if (k === 'arrowleft' || k === 'a') teclas.esq = false;
  if (k === 'arrowright' || k === 'd') teclas.dir = false;
});

tela.addEventListener('pointerdown', e => {
  e.preventDefault();
  iniciarAudioSePreciso();

  const r = tela.getBoundingClientRect();
  const escala = Math.min(r.width / tela.width, r.height / tela.height);
  const padX = (r.width - tela.width * escala) / 2;
  const padY = (r.height - tela.height * escala) / 2;
  const relX = e.clientX - r.left, relY = e.clientY - r.top;
  if (relX < padX || relX > r.width - padX || relY < padY || relY > r.height - padY) return;
  const cx = (relX - padX) / escala + camPx;
  const cy = (relY - padY) / escala + camPy;
  const tx = Math.floor(cx / TILE);
  const ty = Math.floor(cy / TILE);

  const selvagem = selvagens.find(s => s.x === tx && s.y === ty);
  if (selvagem) {
    if (distCheb(jogador, selvagem) <= 1 && jogador.nucleos > 0) {
      ritualDeVinculo(selvagem);
    } else {
      const dica = jogador.nucleos > 0
        ? 'Enfraqueça-o e toque nele adjacente para o ritual.'
        : 'Enfraqueça-o — mas você precisará de um Núcleo (◉).';
      mirarAlvo(selvagem, `${selvagem.especie} na mira. ${dica}`, 'vinculo');
    }
    return;
  }
  const monstro = monstros.find(m => m.x === tx && m.y === ty);
  if (monstro) {
    mirarAlvo(monstro, `${nomeDe(monstro.tipo)} na mira.`, 'info');
    return;
  }
  const corpo = corpos.find(c => c.x === tx && c.y === ty);
  if (corpo) return saquear(corpo);
  const bau = baus.find(b => b.x === tx && b.y === ty);
  if (bau) {
    if (distCheb(jogador, bau) <= 1) abrirBau(bau);
    else {
      const destino = tileAdjacenteLivre(bau);
      if (destino) jogador.caminho = acharCaminho(jogador, destino);
      else log('Não há caminho livre até o baú.', 'info');
    }
    return;
  }
  const santuario = santuarios.find(s => s.x === tx && s.y === ty);
  if (santuario) {
    if (distCheb(jogador, santuario) <= 1) usarSantuario(santuario);
    else {
      const destino = tileAdjacenteLivre(santuario);
      if (destino) jogador.caminho = acharCaminho(jogador, destino);
    }
    return;
  }
  if (NPC.x === tx && NPC.y === ty) {
    if (distCheb(jogador, NPC) <= 1) falarComNPC();
    else {
      const destino = tileAdjacenteLivre(NPC);
      if (destino) {
        jogador.caminho = acharCaminho(jogador, destino);
        log('Aproxime-se do Ancião para conversar.', 'info');
      } else {
        log('Não há caminho livre até o Ancião.', 'info');
      }
    }
    return;
  }
  if (podeAndar(tx, ty)) {
    cancelarAutomacoesDeCombate();
    jogador.caminho = acharCaminho(jogador, { x: tx, y: ty });
    if (!jogador.caminho) log('Não há caminho até lá.', 'info');
  }
});

const elConsole = document.getElementById('console');
function log(texto, tipo = 'info') {
  const div = document.createElement('div');
  div.className = 'msg-' + tipo;
  div.textContent = texto;
  elConsole.appendChild(div);
  while (elConsole.children.length > 5) elConsole.removeChild(elConsole.firstChild);
}

function atualizarDicaAcao() {
  const el = document.getElementById('dicaAcao');
  if (!el) return;
  if (distCheb(jogador, NPC) <= 1) {
    el.style.display = 'block';
    el.textContent = 'Falar';
    return;
  }
  if (corpos.some(c => distCheb(jogador, c) <= 1)) {
    el.style.display = 'block';
    el.textContent = 'Saquear';
    return;
  }
  if (baus.some(b => !b.aberto && distCheb(jogador, b) <= 1)) {
    el.style.display = 'block';
    el.textContent = 'Abrir';
    return;
  }
  if (santuarios.some(s => !s.usado && distCheb(jogador, s) <= 1)) {
    el.style.display = 'block';
    el.textContent = 'Orar';
    return;
  }
  const selvagem = selvagens.find(s => distCheb(jogador, s) <= 1);
  if (selvagem) {
    el.style.display = 'block';
    el.textContent = jogador.nucleos > 0 ? 'Vínculo' : 'Mirar';
    return;
  }
  if (monstros.some(m => distCheb(jogador, m) <= 1)) {
    el.style.display = 'block';
    el.textContent = 'Mirar';
    return;
  }
  el.style.display = 'none';
}

function atualizarPainelAlvo() {
  const el = document.getElementById('painelAlvo');
  const a = jogador.alvo;
  if (!a || a.hp <= 0) {
    jogador.alvo = null;
    jogador.persegueAlvo = false;
    jogador.acaoPendente = null;
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  el.classList.toggle('selvagem', !!a.selvagem);
  document.getElementById('alvoNome').textContent = a.selvagem ? a.especie : nomeDe(a.tipo);
  document.getElementById('alvoTipo').textContent =
    a.selvagem ? 'Guardião Selvagem'
    : (BESTIARIO[a.tipo].boss ? 'Chefe' : 'Monstro');
  document.getElementById('alvoBarra').style.width =
    (100 * Math.max(0, a.hp) / a.maxHp) + '%';
  document.getElementById('alvoHp').textContent = `${Math.max(0, a.hp)}/${a.maxHp}`;
}

function atualizarUI() {
  const set = (barra, txt, atual, max, sufixo) => {
    document.querySelector(`#${barra} > div`).style.width = (100 * Math.max(0, atual) / max) + '%';
    document.getElementById(txt).textContent = sufixo;
  };
  set('barraHP', 'txtHP', jogador.hp, maxHpAtual(), `${Math.max(0, jogador.hp)}/${maxHpAtual()}`);
  set('barraMP', 'txtMP', jogador.mp, maxMpAtual(), `${jogador.mp}/${maxMpAtual()}`);
  const base = expParaNivel(jogador.nivel), prox = expParaNivel(jogador.nivel + 1);
  const pct = Math.max(0, (jogador.exp - base) / (prox - base));
  document.querySelector('#barraXP > div').style.width = (100 * pct) + '%';
  document.getElementById('txtXP').textContent = `nível ${jogador.nivel + 1} em ${prox - jogador.exp} exp`;
  document.getElementById('txtNivel').textContent = jogador.nivel;
  document.getElementById('txtGold').textContent = jogador.gold;
  document.getElementById('txtFrag').textContent = jogador.fragmentos;
  document.getElementById('txtNuc').textContent = jogador.nucleos;
  garantirMateriaisJogador();
  const biomaId = biomaJogador();
  const bioma = BIOMAS[biomaId] || BIOMAS.campos;
  const txtBioma = document.getElementById('txtBioma');
  if (txtBioma) {
    txtBioma.textContent = bioma.nome;
    txtBioma.style.color = bioma.cor;
  }
  const txtMateriais = document.getElementById('txtMateriais');
  if (txtMateriais) {
    txtMateriais.textContent = textoMateriaisCompacto();
  }
  document.getElementById('lblPocao').textContent = 'x' + jogador.pocoes;
  document.getElementById('lblForjar').textContent = `⬡${Math.min(3, jogador.fragmentos)}/3`;
  document.getElementById('lblEspecial').textContent =
    jogador.cdEspecial > 0 ? Math.ceil(jogador.cdEspecial / 1000) + 's'
    : (jogador.classe ? CLASSES[jogador.classe].especial : '--');
  const classeAtual = jogador.classe ? CLASSES[jogador.classe] : null;
  if (classeAtual) {
    const lblMagia = document.querySelector('#btnMagia small');
    lblMagia.textContent = jogador.cdMagia > 0
      ? Math.ceil(jogador.cdMagia / 1000) + 's'
      : `${classeAtual.custo} mana`;
  }

  document.getElementById('btnMagia').classList.toggle('em-recarga', jogador.cdMagia > 0);
  document.getElementById('btnMagia').classList.toggle('pronto', jogador.cdMagia <= 0);
  document.getElementById('btnEspecial').classList.toggle('em-recarga', jogador.cdEspecial > 0);
  document.getElementById('btnEspecial').classList.toggle('pronto', jogador.cdEspecial <= 0);
  document.getElementById('btnPocao').classList.toggle('em-recarga', jogador.pocoes <= 0);

  const painel = document.getElementById('painelGuardiao');
  garantirEquipamentos();

  const eq = jogador.equipamentos;
  const armaTxt = nomeEquipCurto(eq.arma);
  const armaduraTxt = nomeEquipCurto(eq.armadura);
  const amuletoTxt = nomeEquipCurto(eq.amuleto);

  if (equipe.length) {
    const g = equipe[ativo];
    painel.style.display = 'block';

    const hab = GUARDIOES[g.especie].habilidade || '—';
    const cdHab = g.cdHabilidade > 0 ? Math.ceil(g.cdHabilidade / 1000) + 's' : 'pronta';

    painel.innerHTML = `${g.especie} Lv${g.nivel} ${g.desmaiado ? '(desmaiado ' + Math.ceil(g.tRevive / 1000) + 's)' : ''}
      <div class="mini"><div style="width:${100 * Math.max(0, g.hp) / g.maxHp}%"></div></div>
      <small>
        ${hab}: ${cdHab}<br>
        ⚔ ${armaTxt}<br>
        ▣ ${armaduraTxt}<br>
        ◇ ${amuletoTxt}<br>
        Coleção ${equipe.length}/${Object.keys(GUARDIOES).length}${jogador.bencao ? ' ✦' : ''} · ${equipe.length > 1 ? 'toque p/ trocar' : GUARDIOES[g.especie].bioma}
      </small>`;
  } else {
    painel.style.display = 'block';
    painel.innerHTML = `Equipamentos
      <div class="mini"><div style="width:100%"></div></div>
      <small>
        ⚔ ${armaTxt}<br>
        ▣ ${armaduraTxt}<br>
        ◇ ${amuletoTxt}
      </small>`;
  }
}

document.getElementById('btnComecar').addEventListener('click', () => {
  if (!temSave) aplicarClasse(classeEscolhida);
  document.getElementById('intro').style.display = 'none';
  atualizarMissaoUI();
  if (temSave) {
    log('Progresso carregado.', 'info');
  } else {
    log(`Você iniciou como ${CLASSES[jogador.classe].nome}.`, 'info');
    log('Fale com o Ancião Baldric — o velho de manto roxo ao lado do templo.', 'info');
    log('v4.11: toque num inimigo para perseguir e atacar automaticamente; habilidade agora fica em buffer até chegar perto.', 'info');
  }
  salvarJogo();
});

