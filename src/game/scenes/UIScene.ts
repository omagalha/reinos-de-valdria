import Phaser from 'phaser';
import { GAME_WIDTH } from '../config';
import { villageStageById, type VillageStageId } from '../data';

export class UIScene extends Phaser.Scene {
  private stageText!: Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, 34, GAME_WIDTH, 68, 0x07100c, 0.92).setScrollFactor(0);
    this.add
      .text(18, 13, 'CAMPOS DE VALDRIA', {
        color: '#f0c96a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
      })
      .setScrollFactor(0);
    this.add
      .text(18, 38, 'WASD/setas, toque ou controle virtual • ESC volta', {
        color: '#a6b8aa',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
      })
      .setScrollFactor(0);

    this.stageText = this.add
      .text(GAME_WIDTH - 18, 20, '', {
        align: 'right',
        color: '#e8ddba',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);
  }

  update(): void {
    const id = this.registry.get('village-stage') as VillageStageId | undefined;
    const stage = id ? villageStageById[id] : undefined;
    this.stageText.setText(stage ? 'Aldeia: ' + stage.name + '\n' + stage.summary : 'Aldeia: —');
  }
}
