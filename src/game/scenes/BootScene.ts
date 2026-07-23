import Phaser from 'phaser';
import { validateGameContent } from '../data';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
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
