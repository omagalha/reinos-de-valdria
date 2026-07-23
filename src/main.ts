import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { validateGameContent } from './game/data';
import './styles/modern.css';

const validation = validateGameContent();
const status = document.querySelector<HTMLElement>('#validation-status');

if (status) {
  status.textContent = validation.summary;
  status.dataset.valid = String(validation.success);
}

if (!validation.success) {
  throw new Error('Os dados da fundação v4.14 são inválidos: ' + validation.errors.join('; '));
}

new Phaser.Game(createGameConfig());
