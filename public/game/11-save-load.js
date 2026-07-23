// ---------- SAVE/LOAD AUTOMÁTICO ----------
const SAVE_KEY = 'valdria_save_v2_equipamentos';
let saveBloqueado = false;
const podeSalvar = (() => {
  try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return true; }
  catch { return false; }
})();

function salvarJogo() {
  if (!podeSalvar || saveBloqueado) return;
  garantirEquipamentos();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 2,
      j: { x: jogador.x, y: jogador.y, hp: jogador.hp, maxHp: jogador.maxHp,
           mp: jogador.mp, maxMp: jogador.maxMp, nivel: jogador.nivel, exp: jogador.exp,
           gold: jogador.gold, pocoes: jogador.pocoes, fragmentos: jogador.fragmentos,
           nucleos: jogador.nucleos, temAmuleto: jogador.temAmuleto,
           bencao: !!jogador.bencao,
           classe: jogador.classe,
           danoBase: jogador.danoBase,
           alcanceAtaque: jogador.alcanceAtaque,
           materiais: jogador.materiais,
           equipamentos: jogador.equipamentos },
      equipe: equipe.map(g => ({
        especie: g.especie,
        hp: g.hp,
        maxHp: g.maxHp,
        nivel: g.nivel,
        exp: g.exp,
        cdHabilidade: Math.max(0, g.cdHabilidade || 0),
      })),
      ativo, missaoAtual, mortes,
      contratoAtual,
      progressoContrato,
      baus: baus.map(b => b.aberto),
      santuarios: santuarios.map(s => ({
        usado: s.usado,
        tRecarga: Math.max(0, s.tRecarga || 0),
      })),
    }));
  } catch { /* sem espaço ou bloqueado: segue sem salvar */ }
}

function carregarJogo() {
  if (!podeSalvar) return false;
  try {
    const bruto = localStorage.getItem(SAVE_KEY) || localStorage.getItem('valdria_save_v1');
    if (!bruto) return false;
    const s = JSON.parse(bruto);
    if (!s || !s.j) return false;

    Object.assign(jogador, s.j);
    garantirEquipamentos();
    garantirMateriaisJogador();

    if (!jogador.classe || !CLASSES[jogador.classe]) {
      jogador.classe = 'cavaleiro';
      jogador.danoBase = CLASSES.cavaleiro.dano;
      jogador.alcanceAtaque = CLASSES.cavaleiro.alcanceAtaque;
    }
    if (jogador.classe && CLASSES[jogador.classe]) {
      const c = CLASSES[jogador.classe];
      jogador.danoBase = jogador.danoBase || c.dano;
      jogador.alcanceAtaque = jogador.alcanceAtaque || c.alcanceAtaque;
    }
    jogador.rx = jogador.x * TILE;
    jogador.ry = jogador.y * TILE;
    jogador.alvo = null;
    jogador.caminho = null;
    jogador.cdMover = 0;
    jogador.cdAtaque = 0;
    jogador.cdMagia = 0;
    jogador.cdEspecial = 0;
    jogador.escudoAtivo = 0;
    jogador.esquivaAtiva = 0;
    jogador.barreira = 0;
    jogador.persegueAlvo = false;
    jogador.acaoPendente = null;
    jogador.hitFlash = 0;
    jogador.hp = Math.min(maxHpAtual(), jogador.hp);
    jogador.mp = Math.min(maxMpAtual(), jogador.mp);

    equipe = Array.isArray(s.equipe)
      ? s.equipe.map(g => ({
          ...g,
          x: jogador.x,
          y: jogador.y,
          rx: jogador.rx,
          ry: jogador.ry,
          cdMover: 0,
          cdAtaque: 0,
          cdHabilidade: Math.max(0, g.cdHabilidade ?? 2500),
          desmaiado: false,
          tRevive: 0,
        }))
      : [];
    ativo = Math.min(s.ativo || 0, Math.max(0, equipe.length - 1));
    missaoAtual = Number.isInteger(s.missaoAtual) ? s.missaoAtual : 0;
    contratoAtual = Number.isInteger(s.contratoAtual) ? s.contratoAtual : 0;
    progressoContrato = Number.isInteger(s.progressoContrato) ? s.progressoContrato : 0;
    if (s.mortes) Object.assign(mortes, s.mortes);
    if (Array.isArray(s.baus)) s.baus.forEach((a, i) => { if (baus[i]) baus[i].aberto = !!a; });
    if (Array.isArray(s.santuarios)) s.santuarios.forEach((dados, i) => {
      if (!santuarios[i]) return;
      if (typeof dados === 'boolean') {
        santuarios[i].usado = dados;
        santuarios[i].tRecarga = dados ? RECARGA_SANTUARIO : 0;
        return;
      }
      santuarios[i].usado = !!dados.usado;
      santuarios[i].tRecarga = Math.max(0, dados.tRecarga || 0);
      if (santuarios[i].tRecarga <= 0) {
        santuarios[i].usado = false;
      }
    });
    if (mortes.ReiEsquelo > 0) {
      monstros = monstros.filter(m => m.tipo !== 'ReiEsquelo');
    }
    return true;
  } catch {
    return false;
  }
}

function apagarSave() {
  saveBloqueado = true;
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem('valdria_save_v1');
  } catch {}
}

const temSave = carregarJogo();
if (temSave) {
  document.getElementById('btnComecar').textContent = '▶ CONTINUAR';
  document.getElementById('btnNovo').style.display = 'inline-block';
  document.getElementById('seletorClasse').style.display = 'none';
  if (jogador.classe && CLASSES[jogador.classe]) {
    const c = CLASSES[jogador.classe];
    document.querySelector('#btnMagia').childNodes[0].nodeValue = c.habilidade;
    document.querySelector('#btnMagia small').textContent = `${c.custo} mana`;
  }
}
document.getElementById('btnNovo').addEventListener('click', () => {
  apagarSave();
  location.reload();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') salvarJogo();
});

