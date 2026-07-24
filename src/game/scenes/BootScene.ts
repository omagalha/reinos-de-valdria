import Phaser from 'phaser';
import { validateGameContent } from '../data';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.tilemapTiledJSON('campos-de-valdria', './assets/maps/campos-de-valdria.tmj');
    this.load.image('campos-tiles', './assets/tilesets/campos-provisorio.svg');
  }

  create(): void {
    const validation = validateGameContent();

    if (!validation.success) {
      this.scene.start('MenuScene', {
        error: validation.errors.join('\n'),
      });
      return;
    }

    this.registry.set('village-stage', 'acampamento');
    this.registry.set('content-summary', validation.summary);
    this.scene.start('MenuScene');
  }
}
