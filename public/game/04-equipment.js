// ---------- EQUIPAMENTOS v4.6 ----------
const RARIDADES = {
  comum:    { nome: 'Comum',    cor: '#c8c0b0', mult: 1.0 },
  raro:     { nome: 'Raro',     cor: '#50a0e0', mult: 1.35 },
  epico:    { nome: 'Épico',    cor: '#b070ff', mult: 1.75 },
  lendario: { nome: 'Lendário', cor: '#ffd87a', mult: 2.35 },
};

const ARMAS_POR_CLASSE = {
  cavaleiro: ['Espada', 'Machado', 'Lança'],
  arqueiro: ['Arco', 'Besta', 'Lâmina Curta'],
  mago: ['Cajado', 'Grimório', 'Orbe'],
};

const PREFIXOS_EQUIP = {
  armadura: ['Armadura', 'Cota', 'Couraça', 'Manto', 'Peitoral'],
  amuleto: ['Amuleto', 'Medalhão', 'Talismã', 'Relíquia', 'Símbolo'],
};

const SUFIXOS_EQUIP = [
  'do Sol',
  'da Caverna',
  'dos Guardiões',
  'da Praga',
  'de Valdria',
  'do Eco Antigo',
  'da Chama Morta',
  'da Praia Solar',
];

function garantirEquipamentos() {
  if (!jogador.equipamentos) {
    jogador.equipamentos = { arma: null, armadura: null, amuleto: null };
  }
  if (!('arma' in jogador.equipamentos)) jogador.equipamentos.arma = null;
  if (!('armadura' in jogador.equipamentos)) jogador.equipamentos.armadura = null;
  if (!('amuleto' in jogador.equipamentos)) jogador.equipamentos.amuleto = null;
}

function escolherRaridade(tipoMonstro) {
  const boss = tipoMonstro === 'ReiEsquelo';
  const r = Math.random();

  if (boss) {
    if (r < 0.18) return 'lendario';
    if (r < 0.55) return 'epico';
    return 'raro';
  }

  if (r < 0.015) return 'lendario';
  if (r < 0.08) return 'epico';
  if (r < 0.28) return 'raro';
  return 'comum';
}

function chanceDropEquip(tipoMonstro) {
  if (tipoMonstro === 'ReiEsquelo') return 1.0;
  if (tipoMonstro === 'Esquelo') return 0.28;
  if (tipoMonstro === 'Trolk') return 0.20;
  if (tipoMonstro === 'Caranguejo') return 0.16;
  if (tipoMonstro === 'Ratino') return 0.10;
  return 0.08;
}

function criarEquipamento(tipoMonstro) {
  if (Math.random() > chanceDropEquip(tipoMonstro)) return null;

  const slots = ['arma', 'armadura', 'amuleto'];
  const slot = slots[irand(slots.length)];
  const raridade = escolherRaridade(tipoMonstro);
  const dadosRaridade = RARIDADES[raridade];

  const nivelBase = Math.max(1, jogador.nivel);
  const poder = Math.max(1, Math.round((nivelBase + irand(3)) * dadosRaridade.mult));

  let prefixo = '';
  if (slot === 'arma') {
    const lista = ARMAS_POR_CLASSE[jogador.classe || 'cavaleiro'];
    prefixo = lista[irand(lista.length)];
  } else {
    prefixo = PREFIXOS_EQUIP[slot][irand(PREFIXOS_EQUIP[slot].length)];
  }

  const sufixo = SUFIXOS_EQUIP[irand(SUFIXOS_EQUIP.length)];

  const item = {
    slot,
    raridade,
    nome: `${prefixo} ${sufixo}`,
    poder,
    dano: 0,
    defesa: 0,
    vida: 0,
    mana: 0,
    xpBonus: 0,
    curaBonus: 0,
  };

  if (slot === 'arma') {
    item.dano = poder;
  }

  if (slot === 'armadura') {
    item.defesa = Math.max(1, Math.floor(poder * 0.75));
    item.vida = poder * 3;
  }

  if (slot === 'amuleto') {
    const tipoBonus = irand(3);
    if (tipoBonus === 0) item.mana = poder * 3;
    if (tipoBonus === 1) item.xpBonus = Math.min(0.25, 0.03 + poder * 0.01);
    if (tipoBonus === 2) item.curaBonus = Math.min(0.35, 0.05 + poder * 0.015);
  }

  return item;
}

function poderEquipamento(item) {
  if (!item) return 0;
  return (
    item.dano * 3 +
    item.defesa * 3 +
    item.vida * 0.5 +
    item.mana * 0.5 +
    item.xpBonus * 100 +
    item.curaBonus * 100 +
    item.poder
  );
}

function descreverEquipamento(item) {
  if (!item) return 'nenhum';

  const partes = [];
  if (item.dano) partes.push(`+${item.dano} dano`);
  if (item.defesa) partes.push(`+${item.defesa} defesa`);
  if (item.vida) partes.push(`+${item.vida} vida`);
  if (item.mana) partes.push(`+${item.mana} mana`);
  if (item.xpBonus) partes.push(`+${Math.round(item.xpBonus * 100)}% XP`);
  if (item.curaBonus) partes.push(`+${Math.round(item.curaBonus * 100)}% cura`);

  return `${item.nome} [${RARIDADES[item.raridade].nome}] — ${partes.join(', ')}`;
}

function nomeEquipCurto(item) {
  if (!item) return '—';
  return `${item.nome} (${RARIDADES[item.raridade].nome})`;
}

function bonusEquip() {
  garantirEquipamentos();

  const itens = [
    jogador.equipamentos.arma,
    jogador.equipamentos.armadura,
    jogador.equipamentos.amuleto,
  ].filter(Boolean);

  return itens.reduce((acc, item) => {
    acc.dano += item.dano || 0;
    acc.defesa += item.defesa || 0;
    acc.vida += item.vida || 0;
    acc.mana += item.mana || 0;
    acc.xpBonus += item.xpBonus || 0;
    acc.curaBonus += item.curaBonus || 0;
    return acc;
  }, {
    dano: 0,
    defesa: 0,
    vida: 0,
    mana: 0,
    xpBonus: 0,
    curaBonus: 0,
  });
}

function maxHpAtual() {
  return jogador.maxHp + bonusEquip().vida;
}

function maxMpAtual() {
  return jogador.maxMp + bonusEquip().mana;
}

function tentarEquipar(item) {
  if (!item) return false;

  garantirEquipamentos();

  const atual = jogador.equipamentos[item.slot];
  const novoPoder = poderEquipamento(item);
  const poderAtual = poderEquipamento(atual);

  if (!atual || novoPoder > poderAtual) {
    const bonusAntes = bonusEquip();

    jogador.equipamentos[item.slot] = item;

    const bonusDepois = bonusEquip();
    const ganhoVida = Math.max(0, bonusDepois.vida - bonusAntes.vida);
    const ganhoMana = Math.max(0, bonusDepois.mana - bonusAntes.mana);

    jogador.hp = Math.min(maxHpAtual(), jogador.hp + ganhoVida);
    jogador.mp = Math.min(maxMpAtual(), jogador.mp + ganhoMana);

    som('moeda');
    flutuar(jogador, 'EQUIPADO!', RARIDADES[item.raridade].cor);
    log(`⬥ Equipado: ${descreverEquipamento(item)}`, 'loot');

    salvarJogo();
    return true;
  }

  const ouroExtra = Math.max(3, Math.floor(item.poder * 2));
  jogador.gold += ouroExtra;

  log(`⬥ Item inferior vendido por ${ouroExtra} ouro: ${item.nome}.`, 'loot');
  salvarJogo();
  return false;
}

