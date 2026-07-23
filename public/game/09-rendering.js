// ---------- 8. RENDERIZAÇÃO ----------
const tela = document.getElementById('tela');
const ctx = tela.getContext('2d');

function sprite(px, py, matriz, paleta, escala = 4) {
  for (let y = 0; y < matriz.length; y++)
    for (let x = 0; x < matriz[y].length; x++) {
      const c = paleta[matriz[y][x]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(px + x * escala, py + y * escala, escala, escala);
    }
}

const SPRITES = {
  jogador: [
    [0,0,1,1,1,1,0,0],[0,1,2,2,2,2,1,0],[0,1,2,3,3,2,1,0],[0,0,2,2,2,2,0,0],
    [0,4,4,4,4,4,4,0],[0,4,5,4,4,5,4,0],[0,0,6,0,0,6,0,0],[0,6,6,0,0,6,6,0],
  ],
  npc: [
    [0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[0,1,2,3,3,2,1,0],[0,0,2,2,2,2,1,0],
    [0,4,4,4,4,4,4,1],[0,4,4,4,4,4,4,0],[0,4,4,4,4,4,4,0],[0,0,4,0,0,4,0,0],
  ],
  Ratino: [
    [0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[1,0,0,1,1,1,0,0],[0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,2],[0,0,1,1,1,1,0,0],[0,0,3,0,0,3,0,0],[0,0,0,0,0,0,0,0],
  ],
  Caranguejo: [
    [0,0,1,0,0,1,0,0],[0,1,0,0,0,0,1,0],[1,0,2,2,2,2,0,1],[0,2,3,2,2,3,2,0],
    [0,2,2,2,2,2,2,0],[1,0,2,2,2,2,0,1],[0,1,0,0,0,0,1,0],[0,0,1,0,0,1,0,0],
  ],
  Trolk: [
    [0,0,1,1,1,1,0,0],[0,1,1,2,2,1,1,0],[0,1,3,1,1,3,1,0],[0,0,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,0],[0,0,4,0,0,4,0,0],[0,4,4,0,0,4,4,0],
  ],
  Esquelo: [
    [0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[0,1,2,1,1,2,1,0],[0,0,1,2,2,1,0,0],
    [0,0,1,1,1,1,0,0],[0,1,0,1,1,0,1,0],[0,0,0,1,1,0,0,0],[0,0,1,0,0,1,0,0],
  ],
  ReiEsquelo: [
    [0,3,0,3,3,0,3,0],[0,3,3,3,3,3,3,0],[0,1,1,1,1,1,1,0],[0,1,4,1,1,4,1,0],
    [0,0,1,2,2,1,0,0],[0,1,1,1,1,1,1,0],[0,1,0,1,1,0,1,0],[0,0,1,0,0,1,0,0],
  ],
  corpo: [
    [0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,1,1,0,0,0,0],[0,1,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],
  ],
  Folium: [
    [0,0,0,2,2,0,0,0],[0,0,2,2,2,2,0,0],[0,2,0,1,1,0,2,0],[0,0,1,1,1,1,0,0],
    [0,1,3,1,1,3,1,0],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,0,2,0,0,2,0,0],
  ],
  Aquari: [
    [0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[2,1,3,1,1,3,1,2],
    [0,1,1,1,1,1,1,0],[0,1,1,2,2,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,2,2,0,0,0],
  ],
  Ignix: [
    [0,2,0,0,0,0,2,0],[0,0,2,0,0,2,0,0],[0,0,1,1,1,1,0,0],[0,1,3,1,1,3,1,0],
    [0,1,1,1,1,1,1,0],[2,1,1,1,1,1,1,2],[0,0,1,0,0,1,0,0],[0,0,2,0,0,2,0,0],
  ],
  Umbrix: [
    [0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,2,1,1,2,1,1],[1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,0],[0,1,0,1,1,0,1,0],[1,0,0,0,0,0,0,1],
  ],
};
const PALETAS = {
  jogador:    { 1: '#3a2a1a', 2: '#e0b090', 3: '#2a2a3a', 4: '#8a2a2a', 5: '#d8b25a', 6: '#4a3a2a' },
  npc:        { 1: '#d0ccc0', 2: '#e0b090', 3: '#2a2a3a', 4: '#5a4a7a' },
  Ratino:     { 1: '#8a7a6a', 2: '#c0a090', 3: '#5a4a3a' },
  Caranguejo:{ 1: '#b85838', 2: '#d87848', 3: '#fff0c0' },
  Trolk:      { 1: '#6a8a4a', 2: '#4a6a2a', 3: '#e0e0d0', 4: '#5a4a3a' },
  Esquelo:    { 1: '#d0ccc0', 2: '#1a1612' },
  ReiEsquelo: { 1: '#e8e4d8', 2: '#1a1612', 3: '#d8b25a', 4: '#ff5020' },
  corpo:      { 1: '#7a2a2a' },
  Folium:     { 1: '#50c050', 2: '#2a8a3a', 3: '#0d2a10' },
  Aquari:     { 1: '#50a0e0', 2: '#2a5aa0', 3: '#0d1a3a' },
  Ignix:      { 1: '#e08030', 2: '#ffc040', 3: '#3a1505' },
  Umbrix:     { 1: '#6a40a0', 2: '#e0d0ff', 3: '#2a1050' },
};

function desenharTile(t, px, py, mx, my) {
  const varia = (Math.sin(mx * 12.9898 + my * 78.233) * 43758.5453) % 1;
  switch (t) {
    case 'G':
      ctx.fillStyle = varia > 0.5 ? '#3a6a2a' : '#356328';
      ctx.fillRect(px, py, TILE, TILE);
      if (varia > 0.8) { ctx.fillStyle = '#4a7a3a'; ctx.fillRect(px + 8, py + 12, 3, 3); ctx.fillRect(px + 20, py + 22, 3, 3); }
      break;
    case 'D':
      ctx.fillStyle = varia > 0.5 ? '#7a5a3a' : '#745536';
      ctx.fillRect(px, py, TILE, TILE);
      break;
    case 'A': {
      const onda = Math.sin(relogio / 400 + mx + my) * 6;
      ctx.fillStyle = '#1a3a6a'; ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = '#2a4a8a';
      ctx.fillRect(px + 4 + onda, py + 10, 12, 2);
      ctx.fillRect(px + 14 - onda, py + 22, 10, 2);
      break;
    }
    case 'S':
      ctx.fillStyle = varia > 0.5 ? '#c9ad72' : '#d7bd82';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = '#f0dc9a';
      if (varia > 0.2) ctx.fillRect(px + 6, py + 8, 4, 2);
      if (varia > 0.55) ctx.fillRect(px + 20, py + 21, 5, 2);
      ctx.fillStyle = '#b89556';
      if (varia > 0.75) ctx.fillRect(px + 13, py + 15, 2, 2);
      break;
    case 'T':
      ctx.fillStyle = '#3a6a2a'; ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = '#4a3a2a'; ctx.fillRect(px + 13, py + 20, 6, 10);
      ctx.fillStyle = '#1a4a1a'; ctx.beginPath(); ctx.arc(px + 16, py + 12, 12, 0, 7); ctx.fill();
      ctx.fillStyle = '#2a5a22'; ctx.beginPath(); ctx.arc(px + 12, py + 10, 7, 0, 7); ctx.fill();
      break;
    case 'P':
      ctx.fillStyle = varia > 0.5 ? '#4a4a52' : '#44444c';
      ctx.fillRect(px, py, TILE, TILE);
      break;
    case 'M':
      ctx.fillStyle = '#2a2a32'; ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = '#3a3a44';
      ctx.fillRect(px + 2, py + 2, 13, 6); ctx.fillRect(px + 17, py + 2, 13, 6);
      ctx.fillRect(px + 2, py + 10, 28, 6);
      ctx.fillRect(px + 2, py + 18, 13, 6); ctx.fillRect(px + 17, py + 18, 13, 6);
      ctx.fillRect(px + 2, py + 26, 28, 4);
      break;
  }
}

function barraVida(px, py, hp, maxHp, cor) {
  const pct = Math.max(0, hp / maxHp);
  ctx.fillStyle = '#000'; ctx.fillRect(px + 2, py - 6, 28, 4);
  ctx.fillStyle = cor || (pct > 0.6 ? '#40c040' : pct > 0.3 ? '#e0a020' : '#e03020');
  ctx.fillRect(px + 3, py - 5, 26 * pct, 2);
}

function desenharFlashImpacto(e, px, py) {
  if (!e || !e.hitFlash) return;
  ctx.globalAlpha = Math.min(0.55, e.hitFlash / 140 * 0.55);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
  ctx.globalAlpha = 1;
}


let camPx = 0, camPy = 0, camPronta = false;
function desenhar() {
  const alvoCamPx = Math.max(0, Math.min((MAPA_W - VISTA_W) * TILE, jogador.rx + TILE / 2 - VISTA_W * TILE / 2));
  const alvoCamPy = Math.max(0, Math.min((MAPA_H - VISTA_H) * TILE, jogador.ry + TILE / 2 - VISTA_H * TILE / 2));
  if (!camPronta || Math.abs(alvoCamPx - camPx) > TILE * 5 || Math.abs(alvoCamPy - camPy) > TILE * 5) {
    camPx = alvoCamPx;
    camPy = alvoCamPy;
    camPronta = true;
  } else {
    camPx += (alvoCamPx - camPx) * 0.22;
    camPy += (alvoCamPy - camPy) * 0.22;
  }
  const sx = (Math.random() - 0.5) * tremor, sy = (Math.random() - 0.5) * tremor;
  tremor *= 0.86;
  const cx0 = camPx + sx, cy0 = camPy + sy;

  const t0x = Math.floor(cx0 / TILE), t0y = Math.floor(cy0 / TILE);
  const offX = cx0 - t0x * TILE, offY = cy0 - t0y * TILE;
  for (let vy = 0; vy <= VISTA_H; vy++)
    for (let vx = 0; vx <= VISTA_W; vx++) {
      const mx = t0x + vx, my = t0y + vy;
      if (mx < 0 || my < 0 || mx >= MAPA_W || my >= MAPA_H) continue;
      desenharTile(mapa[my][mx], vx * TILE - offX, vy * TILE - offY, mx, my);
    }

  const naTela = e => e.rx > cx0 - TILE && e.rx < cx0 + VISTA_W * TILE + TILE
                   && e.ry > cy0 - TILE && e.ry < cy0 + VISTA_H * TILE + TILE;
  const telaX = e => e.rx - cx0, telaY = e => e.ry - cy0;

  for (const a of areasPerigo) {
    const px = a.x * TILE - cx0;
    const py = a.y * TILE - cy0;
    const perigo = 1 - (a.tempo / a.total);
    ctx.globalAlpha = 0.25 + perigo * 0.45;
    ctx.fillStyle = a.cor;
    ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#ffd080';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
    ctx.globalAlpha = 1;
  }

  for (const c of corpos) {
    if (!naTela(c)) continue;

    const px = telaX(c);
    const py = telaY(c);

    if (c.loot && c.loot.equipamento) {
      const item = c.loot.equipamento;
      const raridade = RARIDADES[item.raridade] || RARIDADES.comum;

      ctx.fillStyle = raridade.cor + '44';
      ctx.beginPath();
      ctx.arc(px + TILE / 2, py + TILE / 2, 15 + Math.sin(relogio / 220) * 2, 0, 7);
      ctx.fill();

      ctx.fillStyle = raridade.cor;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⬥', px + TILE / 2, py - 8);
    }

    sprite(px, py, SPRITES.corpo, PALETAS.corpo);
  }

  for (const b of baus) {
    if (!naTela({ rx: b.x * TILE, ry: b.y * TILE })) continue;
    const px = b.x * TILE - cx0, py = b.y * TILE - cy0;
    ctx.fillStyle = b.aberto ? '#3a2a1a' : '#7a5a2a';
    ctx.fillRect(px + 6, py + 10, 20, 16);
    ctx.fillStyle = b.aberto ? '#2a1c10' : '#5a4020';
    ctx.fillRect(px + 6, py + 6, 20, 6);
    if (!b.aberto) {
      ctx.fillStyle = '#ffd87a';
      ctx.fillRect(px + 14, py + 12, 4, 6);
    }
  }

  for (const s of santuarios) {
    if (!naTela({ rx: s.x * TILE, ry: s.y * TILE })) continue;
    const px = s.x * TILE - cx0, py = s.y * TILE - cy0;
    if (!s.usado) {
      ctx.fillStyle = `rgba(138,240,208,${0.12 + Math.sin(relogio / 250) * 0.06})`;
      ctx.beginPath();
      ctx.arc(px + TILE / 2, py + TILE / 2, 15 + Math.sin(relogio / 250) * 2, 0, 7);
      ctx.fill();
    }
    ctx.fillStyle = '#5a5a62'; ctx.fillRect(px + 9, py + 22, 14, 7);
    ctx.fillStyle = '#6a6a72'; ctx.fillRect(px + 12, py + 14, 8, 9);
    ctx.fillStyle = s.usado ? '#4a5a56' : '#8af0d0';
    ctx.beginPath();
    ctx.moveTo(px + 16, py + 3);
    ctx.lineTo(px + 21, py + 9);
    ctx.lineTo(px + 16, py + 15);
    ctx.lineTo(px + 11, py + 9);
    ctx.closePath();
    ctx.fill();
  }

  if (naTela(NPC)) {
    const px = telaX(NPC), py = telaY(NPC);
    sprite(px, py, SPRITES.npc, PALETAS.npc);
    const m = MISSOES[missaoAtual];
    const disponivel = missaoAtual === 0 || m.completa();
    ctx.fillStyle = disponivel ? '#ffd020' : '#909090';
    ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
    ctx.fillText(disponivel ? '!' : '?', px + TILE / 2, py - 8 + Math.sin(relogio / 250) * 2);
  }

  for (const g of selvagens) {
    if (!naTela(g)) continue;
    const px = telaX(g), py = telaY(g);
    ctx.fillStyle = GUARDIOES[g.especie].cor + '30';
    ctx.beginPath();
    ctx.arc(px + TILE / 2, py + TILE / 2, 14 + Math.sin(relogio / 300) * 2, 0, 7);
    ctx.fill();
    if (jogador.alvo === g) {
      ctx.strokeStyle = '#e03020'; ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
    }
    sprite(px, py, SPRITES[g.especie], PALETAS[g.especie]);
    desenharFlashImpacto(g, px, py);
    barraVida(px, py, g.hp, g.maxHp);
    ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = '#6ad0c0';
    ctx.fillText(g.especie, px + TILE / 2, py - 8);
    if (jogador.alvo === g) {
      ctx.fillStyle = '#a0f0e0';
      ctx.fillText(`vínculo ${Math.round(chanceVinculo(g) * 100)}%`, px + TILE / 2, py + TILE + 10);
    }
  }

  for (const m of monstros) {
    if (!naTela(m)) continue;
    const px = telaX(m), py = telaY(m);
    if (jogador.alvo === m) {
      ctx.strokeStyle = '#e03020'; ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
    }
    if (m.lento > 0) {
      ctx.strokeStyle = 'rgba(112,200,255,.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px + TILE / 2, py + TILE / 2, 17 + Math.sin(relogio / 180) * 2, 0, 7);
      ctx.stroke();
    }
    if (m.marcadoSombrio > 0) {
      ctx.strokeStyle = 'rgba(208,144,255,.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px + TILE / 2, py + TILE / 2, 21 + Math.sin(relogio / 160) * 2, 0, 7);
      ctx.stroke();
    }
    sprite(px, py, SPRITES[m.tipo], PALETAS[m.tipo]);
    desenharFlashImpacto(m, px, py);
    barraVida(px, py, m.hp, m.maxHp);
    ctx.fillStyle = BESTIARIO[m.tipo].boss ? '#ff5020' : '#40c040';
    ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillText(nomeDe(m.tipo), px + TILE / 2, py - 8);
  }

  if (jogador.caminho && jogador.caminho.length) {
    const fim = jogador.caminho[jogador.caminho.length - 1];
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
    ctx.strokeRect(fim.x * TILE - cx0 + 6, fim.y * TILE - cy0 + 6, TILE - 12, TILE - 12);
  }

  const comp = companheiro();
  if (comp && naTela(comp)) {
    sprite(telaX(comp), telaY(comp), SPRITES[comp.especie], PALETAS[comp.especie]);
    desenharFlashImpacto(comp, telaX(comp), telaY(comp));
    barraVida(telaX(comp), telaY(comp), comp.hp, comp.maxHp, '#40c0a0');
  }

  sprite(telaX(jogador), telaY(jogador), SPRITES.jogador, PALETAS.jogador);
  desenharFlashImpacto(jogador, telaX(jogador), telaY(jogador));
  barraVida(telaX(jogador), telaY(jogador), jogador.hp, maxHpAtual());
  if (jogador.escudoAtivo > 0 || jogador.barreira > 0 || jogador.esquivaAtiva > 0) {
    ctx.strokeStyle = jogador.barreira > 0 ? 'rgba(176,122,255,.7)'
                    : jogador.escudoAtivo > 0 ? 'rgba(216,178,90,.7)'
                    : 'rgba(255,255,255,.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(telaX(jogador) + TILE / 2, telaY(jogador) + TILE / 2,
            17 + Math.sin(relogio / 150) * 2, 0, 7);
    ctx.stroke();
  }

  for (const tg of telegrafos) {
    if (!tg.de || !tg.alvo) continue;
    const perigo = 1 - (tg.tempo / tg.total);
    ctx.globalAlpha = 0.25 + perigo * 0.45;
    ctx.strokeStyle = tg.cor || '#ff7020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(telaX(tg.de) + TILE / 2, telaY(tg.de) + TILE / 2);
    ctx.lineTo(telaX(tg.alvo) + TILE / 2, telaY(tg.alvo) + TILE / 2);
    ctx.stroke();
    ctx.strokeRect(
      telaX(tg.alvo) + 5,
      telaY(tg.alvo) + 5,
      TILE - 10,
      TILE - 10
    );
    ctx.globalAlpha = 1;
  }

  for (const p of projeteis) {
    const f = p.t / p.dur;
    const px = p.x0 + (p.alvo.rx + 16 - p.x0) * f;
    const py = p.y0 + (p.alvo.ry + 16 - p.y0) * f - Math.sin(f * Math.PI) * 14;
    ctx.save();
    ctx.translate(px - cx0, py - cy0);
    ctx.rotate(relogio / 60);
    ctx.fillStyle = p.cor;
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }

  for (const e of efeitos) {
    const ecx = e.x * TILE + TILE / 2 - cx0, ecy = e.y * TILE + TILE / 2 - cy0;
    if (e.tipo === 'ritual') {
      ctx.strokeStyle = `rgba(106,208,192,${e.tempo / 800})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ecx, ecy, 6 + (800 - e.tempo) / 18, 0, 7);
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(255,${100 + irand(100)},20,${e.tempo / 400})`;
      ctx.beginPath();
      ctx.arc(ecx, ecy, 8 + irand(8), 0, 7);
      ctx.fill();
    }
  }

  ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  for (const f of flutuantes) {
    ctx.globalAlpha = Math.min(1, f.tempo / 500);
    ctx.fillStyle = f.cor;
    ctx.fillText(f.txt, f.rx - cx0, f.ry - cy0 - (800 - f.tempo) * 0.035);
  }
  ctx.globalAlpha = 1;
}

const mini = document.getElementById('minimapa').getContext('2d');
const miniBase = document.createElement('canvas');
miniBase.width = MAPA_W * 2; miniBase.height = MAPA_H * 2;
(() => {
  const g = miniBase.getContext('2d');
  const cores = { G: '#3a6a2a', D: '#7a5a3a', A: '#1a3a6a', S: '#d7bd82', T: '#1a4a1a', P: '#4a4a52', M: '#22222a' };
  for (let y = 0; y < MAPA_H; y++)
    for (let x = 0; x < MAPA_W; x++) {
      g.fillStyle = cores[mapa[y][x]];
      g.fillRect(x * 2, y * 2, 2, 2);
    }
})();
function desenharMinimapa() {
  mini.drawImage(miniBase, 0, 0);
  const ponto = (e, cor, r = 2) => { mini.fillStyle = cor; mini.fillRect(e.x * 2 - r + 2, e.y * 2 - r + 2, r, r); };
  monstros.forEach(m => ponto(m, BESTIARIO[m.tipo].boss ? '#ff5020' : '#e04040'));
  selvagens.forEach(s => ponto(s, '#6ad0c0'));
  baus.forEach(b => { if (!b.aberto) ponto(b, '#ffd87a'); });
  santuarios.forEach(s => ponto(s, s.usado ? '#5a6a66' : '#8af0d0'));
  ponto(NPC, '#ffd020');
  ponto(jogador, '#ffffff', 3);
}

