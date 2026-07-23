import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, test } from 'vitest';
import { JSDOM, VirtualConsole } from 'jsdom';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = await readFile(path.join(projectPath, 'index.html'), 'utf8');
const manifest = JSON.parse(
  await readFile(path.join(projectPath, 'modularization-manifest.json'), 'utf8'),
);
const scripts = await Promise.all(
  manifest.modules.map(async ({ file }) => ({
    file,
    code: await readFile(path.join(projectPath, file), 'utf8'),
  })),
);

function createCanvasContext() {
  const gradient = { addColorStop() {} };
  const base = {
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    measureText: text => ({ width: String(text).length * 6 }),
  };
  return new Proxy(base, {
    get(target, property) {
      if (property in target) return target[property];
      return () => undefined;
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    },
  });
}

async function bootGame(savedGame = null) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  virtualConsole.on('error', error => errors.push(error));

  const dom = new JSDOM(indexHtml, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'http://localhost:4173/',
    virtualConsole,
  });
  const { window } = dom;
  const frameQueue = [];

  window.HTMLCanvasElement.prototype.getContext = () => createCanvasContext();
  window.HTMLElement.prototype.setPointerCapture = () => undefined;
  window.HTMLElement.prototype.releasePointerCapture = () => undefined;
  window.requestAnimationFrame = callback => {
    frameQueue.push(callback);
    return frameQueue.length;
  };
  window.cancelAnimationFrame = () => undefined;

  if (savedGame) {
    window.localStorage.setItem('valdria_save_v2_equipamentos', savedGame);
  }

  const context = dom.getInternalVMContext();
  for (const script of scripts) {
    vm.runInContext(script.code, context, { filename: script.file });
  }

  let now = 0;
  const runFrames = count => {
    for (let index = 0; index < count; index += 1) {
      const frame = frameQueue.shift();
      if (!frame) throw new Error('O loop principal não solicitou o próximo frame.');
      now += 100;
      frame(now);
    }
  };

  return { dom, window, errors, runFrames };
}

describe('Reinos de Valdria modular', () => {
  beforeEach(() => {
    // O mapa possui pequenas variações de loot; os testes não dependem delas.
  });

  test('inicia uma partida, renderiza frames e cria o save', async () => {
    const game = await bootGame();

    expect(game.window.document.querySelector('#intro').style.display).not.toBe('none');
    game.window.document.querySelector('[data-classe="arqueiro"]').click();
    game.window.document.querySelector('#btnComecar').click();
    game.runFrames(3);

    expect(game.window.document.querySelector('#intro').style.display).toBe('none');
    const save = JSON.parse(
      game.window.localStorage.getItem('valdria_save_v2_equipamentos'),
    );
    expect(save.v).toBe(2);
    expect(save.j.classe).toBe('arqueiro');
    expect(save.j.x).toBe(22);
    expect(save.j.y).toBe(30);
    expect(game.errors).toEqual([]);

    game.dom.window.close();
  });

  test('mantém movimento diagonal e carrega o progresso salvo', async () => {
    const firstGame = await bootGame();
    firstGame.window.document.querySelector('#btnComecar').click();
    firstGame.runFrames(1);

    firstGame.window.dispatchEvent(new firstGame.window.KeyboardEvent('keydown', { key: 'w' }));
    firstGame.window.dispatchEvent(new firstGame.window.KeyboardEvent('keydown', { key: 'd' }));
    firstGame.runFrames(8);
    firstGame.window.dispatchEvent(new firstGame.window.KeyboardEvent('keyup', { key: 'w' }));
    firstGame.window.dispatchEvent(new firstGame.window.KeyboardEvent('keyup', { key: 'd' }));
    firstGame.window.salvarJogo();

    const savedGame = firstGame.window.localStorage.getItem('valdria_save_v2_equipamentos');
    const moved = JSON.parse(savedGame);
    expect(moved.j.x).toBeGreaterThan(22);
    expect(moved.j.y).toBeLessThan(30);
    expect(firstGame.errors).toEqual([]);
    firstGame.dom.window.close();

    const secondGame = await bootGame(savedGame);
    expect(secondGame.window.document.querySelector('#btnComecar').textContent).toContain('CONTINUAR');
    secondGame.window.document.querySelector('#btnComecar').click();
    secondGame.runFrames(2);
    expect(secondGame.errors).toEqual([]);
    secondGame.dom.window.close();
  });
});
