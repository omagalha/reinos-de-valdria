// ---------- 4. MISSÕES E HISTÓRIA ----------
const mortes = { Ratino: 0, Caranguejo: 0, Trolk: 0, Esquelo: 0, ReiEsquelo: 0 };

const MISSOES = [
  {
    objetivo: 'Fale com o Ancião Baldric no templo (marcado com !)',
    completa: () => false,
    dialogo: [
      'Ah... você veio. Os deuses ainda ouvem nossas preces.\n\nDesde que o Rei Esquelo roubou o Amuleto do Sol, a escuridão avança. Mas sozinho, você não chegará ao trono dele.',
      'Escute o segredo dos antigos: GUARDIÕES — espíritos da terra — vagam pelos biomas. Os monstros da praga derrubam FRAGMENTOS DE ESSÊNCIA (⬡). Junte 3 e FORJE um Núcleo de Essência (◉).',
      'Depois, encontre um Guardião selvagem, ENFRAQUEÇA-O em combate e, adjacente a ele, toque-o para o RITUAL DE VÍNCULO. Quanto mais ferido, maior a chance de ele aceitar você.\n\nVincule seu primeiro Guardião e volte. Tome estes fragmentos para começar.',
    ],
    recompensa: () => { jogador.gold += 20; jogador.fragmentos += 2; },
  },
  {
    objetivo: 'Realize o Ritual de Vínculo com um Guardião',
    completa: () => equipe.length >= 1,
    progresso: () => `⬡${jogador.fragmentos} · ◉${jogador.nucleos} — Folium vive nos campos`,
    aoCompletar: 'Vínculo realizado! Volte ao Ancião Baldric.',
    dialogo: [
      'Um Guardião ao seu lado... você aprende rápido, herói. Ele lutará com você, atacará seus alvos, tomará golpes em seu lugar — e ficará mais forte a cada caçada.',
      'Agora prove seu valor em combate: a praga trouxe RATINOS aos campos. Elimine 3 deles e volte.\n\nDica: alguns monstros agora carregam equipamentos antigos. Saqueie corpos brilhantes para melhorar seu herói.',
    ],
    recompensa: () => { jogador.gold += 30; },
  },
  {
    objetivo: 'Elimine 3 Ratinos nos campos',
    completa: () => mortes.Ratino >= 3,
    progresso: () => `${Math.min(3, mortes.Ratino)}/3 Ratinos`,
    aoCompletar: 'Missão completa! Volte ao Ancião Baldric.',
    dialogo: [
      'Excelente! Os campos respiram de novo.\n\nMas as notícias são graves: os TROLKS da caverna juraram lealdade ao Rei Esquelo e guardam a entrada norte.',
      'Siga a trilha de terra até a caverna e derrote 2 Trolks. Eles batem forte — leve estas poções, e estes fragmentos que os aldeões recolheram.\n\nE cuidado com os ESQUELOS lá dentro: eles atiram ossos de longe.',
    ],
    recompensa: () => { jogador.gold += 50; jogador.pocoes += 3; jogador.fragmentos += 3; },
  },
  {
    objetivo: 'Derrote 2 Trolks na entrada da caverna',
    completa: () => mortes.Trolk >= 2,
    progresso: () => `${Math.min(2, mortes.Trolk)}/2 Trolks`,
    aoCompletar: 'Missão completa! Volte ao Ancião Baldric.',
    dialogo: [
      'Você voltou vivo da caverna... impressionante.\n\nAgora escute: no fundo, atrás de uma câmara murada a noroeste, o REI ESQUELO aguarda em seu trono com o Amuleto do Sol.',
      'Ele foi o primeiro rei de Valdria, corrompido pela promessa de vida eterna. Ele lança chamas mortas à distância — não fique parado!\n\nLeve seu Guardião. Mate o Rei, recupere o amuleto e traga-o de volta.',
    ],
    recompensa: () => { jogador.gold += 80; jogador.maxHp += 25; jogador.hp = maxHpAtual(); },
  },
  {
    objetivo: 'Derrote o Rei Esquelo e recupere o Amuleto do Sol',
    completa: () => jogador.temAmuleto,
    progresso: () => jogador.temAmuleto ? 'Amuleto recuperado!' : 'O trono fica a noroeste da caverna',
    aoCompletar: 'Você recuperou o Amuleto do Sol! Leve-o ao Ancião Baldric.',
    dialogo: [
      'O... o Amuleto do Sol! Sua luz voltou a brilhar!\n\nVocê fez o que gerações de heróis não conseguiram. O Rei Esquelo finalmente descansa, e Valdria está salva.',
      'A vila jamais esquecerá seu nome, herói.\n\n═══ FIM DO CAPÍTULO I ═══\n\n(Mundo livre: cace, vincule os 4 Guardiões, evolua-os e procure equipamentos melhores.)',
    ],
    recompensa: () => { jogador.gold += 300; ganharExp(500); },
  },
  {
    objetivo: 'Capítulo I completo — vincule todos os Guardiões e melhore seus equipamentos',
    completa: () => false,
    progresso: () => `${equipe.length}/4 espécies na equipe`,
    dialogo: ['Descanse, herói. Valdria está em paz.\n\nOs Guardiões selvagens sempre renascem em seus biomas, se quiser completar sua equipe.'],
  },
];
let missaoAtual = 0;

// ---------- CONTRATOS DE CAÇA v4.10 ----------
// Contratos são objetivos curtos e automáticos.
// Eles criam mais um motivo para caçar, explorar biomas e voltar ao jogo,
// sem criar inventário complexo nem menus extras.
const CONTRATOS_CACA = [
  {
    nome: 'Campos Inquietos',
    alvo: 'Ratino',
    meta: 5,
    recompensa: { gold: 35, fragmentos: 1, exp: 20 },
    dica: 'controle a praga nos campos',
  },
  {
    nome: 'Pedra para a Forja',
    alvo: 'Trolk',
    meta: 3,
    recompensa: { gold: 55, materiais: { pedraSombria: 1, couroRatino: 1 }, exp: 35 },
    dica: 'recupere materiais na caverna',
  },
  {
    nome: 'Maré da Praia Solar',
    alvo: 'Caranguejo',
    meta: 4,
    recompensa: { gold: 70, materiais: { conchaSolar: 2, escamaAzul: 1 }, exp: 45 },
    dica: 'limpe a nova praia ao sudeste',
  },
  {
    nome: 'Ossos do Trono',
    alvo: 'Esquelo',
    meta: 3,
    recompensa: { gold: 85, fragmentos: 2, materiais: { ossoAntigo: 2 }, exp: 55 },
    dica: 'enfraqueça a guarda do Rei',
  },
];

let contratoAtual = 0;
let progressoContrato = 0;

function contratoAtivo() {
  if (!CONTRATOS_CACA.length) return null;
  return CONTRATOS_CACA[contratoAtual % CONTRATOS_CACA.length];
}

function textoRecompensaContrato(recompensa) {
  if (!recompensa) return '';
  const partes = [];
  if (recompensa.gold) partes.push(`${recompensa.gold} ouro`);
  if (recompensa.fragmentos) partes.push(`⬡${recompensa.fragmentos}`);
  if (recompensa.exp) partes.push(`${recompensa.exp} XP`);
  if (recompensa.materiais) {
    for (const [id, qtd] of Object.entries(recompensa.materiais)) {
      const mat = MATERIAIS[id];
      partes.push(`${mat ? mat.icone + mat.curto : id} ${qtd}`);
    }
  }
  return partes.join(' · ');
}

function textoContratoAtual() {
  const c = contratoAtivo();
  if (!c) return 'sem contrato ativo';
  return `${c.nome}: ${Math.min(progressoContrato, c.meta)}/${c.meta} ${nomeDe(c.alvo)} — ${c.dica}<br><span>Recompensa: ${textoRecompensaContrato(c.recompensa)}</span>`;
}

function aplicarRecompensaContrato(recompensa) {
  const partes = [];
  if (!recompensa) return partes;
  if (recompensa.gold) {
    jogador.gold += recompensa.gold;
    partes.push(`${recompensa.gold} ouro`);
  }
  if (recompensa.fragmentos) {
    jogador.fragmentos += recompensa.fragmentos;
    partes.push(`⬡${recompensa.fragmentos} fragmento(s)`);
  }
  if (recompensa.materiais) {
    const txt = receberMateriais(recompensa.materiais);
    if (txt) partes.push(txt);
  }
  if (recompensa.exp) {
    ganharExp(recompensa.exp);
    partes.push(`${recompensa.exp} XP`);
  }
  return partes;
}

function concluirContrato(c) {
  contratoAtual = (contratoAtual + 1) % CONTRATOS_CACA.length;
  progressoContrato = 0;

  const partes = aplicarRecompensaContrato(c.recompensa);
  som('levelup');
  flutuar(jogador, 'CONTRATO!', '#6ad0c0');
  log(`✦ Contrato concluído: ${c.nome}! Recompensa: ${partes.join(', ')}.`, 'xp');
  atualizarMissaoUI();
  salvarJogo();
}

function registrarContrato(tipoMonstro) {
  const c = contratoAtivo();
  if (!c || c.alvo !== tipoMonstro) return;
  progressoContrato++;
  if (progressoContrato >= c.meta) {
    concluirContrato(c);
  } else {
    atualizarMissaoUI();
  }
}

