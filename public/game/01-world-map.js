/* =====================================================================
   REINOS DE VALDRIA v4.11 — PRAIA SOLAR + CONTRATOS DE CAÇA
   Esta versão mantém equipamentos, biomas e diagonal, e adiciona:
   • Praia Solar no sudeste do mapa
   • novo inimigo: Caranguejo
   • material Concha Solar com uso futuro de forja
   • contratos automáticos de caça para reforçar o loop de progressão
   ===================================================================== */

// ---------- 1. CONSTANTES, MAPA E PATHFINDING ----------
const TILE = 32;
const VISTA_W = 20, VISTA_H = 11;
const MAPA_W = 44, MAPA_H = 40;
const BLOQUEIA = { A: true, T: true, M: true };
const DIR8 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

function gerarMapa() {
  const m = [];
  const rnd = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  for (let y = 0; y < MAPA_H; y++) {
    const linha = [];
    for (let x = 0; x < MAPA_W; x++) {
      let t = 'G';
      if (x < 2 || y < 2 || x >= MAPA_W - 2 || y >= MAPA_H - 2) t = 'T';
      else if (y < 12) {
        t = 'P';
        if (y === 11 && !(x >= 20 && x <= 23)) t = 'M';
        if (x === 2 || x === MAPA_W - 3 || y === 2) t = 'M';
        if (y > 3 && y < 10 && rnd(x, y) > 0.92) t = 'M';
        if (y === 6 && x >= 5 && x <= 14 && x !== 9 && x !== 10) t = 'M';
        if ((x === 5 || x === 14) && y < 6) t = 'M';
      }
      else if (x > 30 && x < 41 && y > 28 && y < 37) {
        const dx = x - 35.5, dy = y - 32.5;
        if (dx * dx / 25 + dy * dy / 14 < 1) t = 'A';
      }
      else if (rnd(x, y) > 0.90) t = 'T';
      if (t === 'G' && x >= 20 && x <= 23 && y >= 11 && y <= 30) t = 'D';
      linha.push(t);
    }
    m.push(linha);
  }
  for (let y = 28; y <= 32; y++) for (let x = 19; x <= 25; x++)
    if (m[y][x] === 'T') m[y][x] = 'G';

  // v4.10: Praia Solar. Um mini-bioma costeiro no sudeste do lago.
  // É pequeno de propósito: abre espaço para exploração sem aumentar demais o escopo.
  for (let y = 30; y <= 37; y++) {
    for (let x = 32; x <= 41; x++) {
      if (x >= MAPA_W - 2 || y >= MAPA_H - 2) continue;
      if (m[y][x] !== 'A') m[y][x] = 'S';
    }
  }

  // caminho simples até a praia, contornando a parte sul do lago
  for (let y = 30; y <= 36; y++) if (m[y][25] !== 'A') m[y][25] = 'D';
  for (let x = 25; x <= 33; x++) if (m[36][x] !== 'A') m[36][x] = x >= 32 ? 'S' : 'D';

  return m;
}
const mapa = gerarMapa();
const podeAndar = (x, y) =>
  x >= 0 && y >= 0 && x < MAPA_W && y < MAPA_H && !BLOQUEIA[mapa[y][x]];

// ---------- MOVIMENTO DIAGONAL SEGURO (v4.7) ----------
// Permite andar em diagonal, mas impede "cortar quina" por paredes, árvores,
// água, muros e entidades. Isso deixa o controle mais gostoso sem quebrar o mapa.
function diagonalLivreMapa(x, y, dx, dy) {
  if (!(dx && dy)) return true;
  return podeAndar(x + dx, y) && podeAndar(x, y + dy);
}

function podeMoverComColisao(entidade, nx, ny) {
  const dx = nx - entidade.x;
  const dy = ny - entidade.y;

  if (!podeAndar(nx, ny)) return false;

  if (dx && dy) {
    if (!diagonalLivreMapa(entidade.x, entidade.y, dx, dy)) return false;

    // Evita atravessar espremido entre duas entidades.
    if (ocupado(entidade.x + dx, entidade.y)) return false;
    if (ocupado(entidade.x, entidade.y + dy)) return false;
  }

  return !ocupado(nx, ny);
}

function acharCaminho(ini, fim, maxNos = 500) {
  if (!podeAndar(fim.x, fim.y)) return null;
  const chave = (x, y) => x * MAPA_H + y;
  const abertos = [{ x: ini.x, y: ini.y, g: 0, f: 0, pai: null }];
  const melhorG = new Map([[chave(ini.x, ini.y), 0]]);
  let nos = 0;
  while (abertos.length && nos++ < maxNos) {
    abertos.sort((a, b) => a.f - b.f);
    const n = abertos.shift();
    if (n.x === fim.x && n.y === fim.y) {
      const caminho = [];
      for (let c = n; c.pai; c = c.pai) caminho.unshift({ x: c.x, y: c.y });
      return caminho;
    }
    for (const [dx, dy] of DIR8) {
      const nx = n.x + dx, ny = n.y + dy;
      if (!podeAndar(nx, ny)) continue;
      if (!diagonalLivreMapa(n.x, n.y, dx, dy)) continue;
      const g = n.g + (dx && dy ? 14 : 10);
      const k = chave(nx, ny);
      if (melhorG.has(k) && melhorG.get(k) <= g) continue;
      melhorG.set(k, g);
      const h = Math.max(Math.abs(fim.x - nx), Math.abs(fim.y - ny)) * 10;
      abertos.push({ x: nx, y: ny, g, f: g + h, pai: n });
    }
  }
  return null;
}

function tileAdjacenteLivre(alvo) {
  const opcoes = [
    { x: alvo.x, y: alvo.y + 1 },
    { x: alvo.x + 1, y: alvo.y },
    { x: alvo.x - 1, y: alvo.y },
    { x: alvo.x, y: alvo.y - 1 },
    { x: alvo.x + 1, y: alvo.y + 1 },
    { x: alvo.x - 1, y: alvo.y + 1 },
    { x: alvo.x + 1, y: alvo.y - 1 },
    { x: alvo.x - 1, y: alvo.y - 1 },
  ];
  return opcoes.find(p => podeAndar(p.x, p.y) && !ocupado(p.x, p.y));
}

