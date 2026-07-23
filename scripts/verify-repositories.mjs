import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const matrixPath = path.join(projectPath, 'docs', 'matriz-de-adocao-dos-86-repositorios.md');
const matrix = await readFile(matrixPath, 'utf8');

const rows = [...matrix.matchAll(/^\|\s*(\d+)\s*\|\s*\[[^\]]+\]\((https:\/\/github\.com\/[^)]+)\)/gm)];
const ids = rows.map((match) => Number(match[1]));
const urls = rows.map((match) => match[2]);

if (rows.length !== 86) throw new Error('A matriz deve conter 86 repositórios.');
if (new Set(ids).size !== 86) throw new Error('Há números repetidos na matriz.');
if (new Set(urls).size !== 86) throw new Error('Há links GitHub repetidos na matriz.');
if (ids.some((id, index) => id !== index + 1)) throw new Error('A numeração deve ir de 1 a 86.');

console.log('Matriz verificada: 86 repositórios, links únicos e numeração contínua.');
