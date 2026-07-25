import Phaser from 'phaser';
import { validateGameContent } from '../data';
import { createEmptySave } from '../save/schema';
import { saveRepository } from '../save/storage';

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
    void this.prepareSave();
  }

  private async prepareSave(): Promise<void> {
    try {
      let save = await saveRepository.read();
      let source = 'indexeddb';
      if (!save) {
        save = await saveRepository.importLegacy();
        source = save ? 'legado-importado' : 'novo';
      }
      if (!save) save = await saveRepository.write(createEmptySave());
      this.registry.set('loaded-save', save);
      this.registry.set('save-status', source);
      this.registry.set('selected-player-class', save.player.classId);
    } catch (error) {
      const save = createEmptySave();
      this.registry.set('loaded-save', save);
      this.registry.set('save-status', 'erro');
      this.registry.set(
        'save-error',
        error instanceof Error ? error.message : 'Falha desconhecida ao abrir o save.',
      );
      this.registry.set('selected-player-class', save.player.classId);
    }
    this.scene.start('MenuScene');
  }
}
