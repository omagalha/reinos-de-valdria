import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

interface MenuData {
  error?: string;
}

export class MenuScene extends Phaser.Scene {
  private error?: string;

  constructor() {
    super('MenuScene');
  }

  init(data: MenuData): void {
    this.error = data.error;
  }

  create(): void {
    this.drawBackdrop();

    this.add
      .text(GAME_WIDTH / 2, 92, 'REINOS DE VALDRIA', {
        color: '#f5df9a',
        fontFamily: 'Georgia, serif',
        fontSize: '42px',
        fontStyle: 'bold',
        stroke: '#172017',
        strokeThickness: 7,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 140, 'LABORATÓRIO DA FUNDAÇÃO v4.13', {
        color: '#a9c7ad',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    const description = this.error
      ? 'Há dados inválidos e o laboratório não pode iniciar.\n' + this.error
      : 'Arquitetura paralela em Phaser + TypeScript\nDados externos • aldeias • save versionado • assets rastreáveis';

    this.add
      .text(GAME_WIDTH / 2, 235, description, {
        align: 'center',
        color: this.error ? '#ffad9c' : '#d8e0d4',
        fontFamily: 'Arial, sans-serif',
        fontSize: '19px',
        lineSpacing: 10,
        wordWrap: { width: 720 },
      })
      .setOrigin(0.5);

    if (this.error) return;

    const button = this.add
      .rectangle(GAME_WIDTH / 2, 355, 350, 64, 0xd4ad54)
      .setStrokeStyle(3, 0xffe7a0)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(GAME_WIDTH / 2, 355, 'EXPLORAR A FUNDAÇÃO', {
        color: '#172017',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const start = (): void => {
      button.disableInteractive();
      this.tweens.add({
        targets: [button, label],
        alpha: 0,
        duration: 150,
        onComplete: () => this.scene.start('WorldScene'),
      });
    };

    button.on('pointerover', () => button.setFillStyle(0xf0c96a));
    button.on('pointerout', () => button.setFillStyle(0xd4ad54));
    button.on('pointerup', start);
    this.input.keyboard?.once('keydown-ENTER', start);

    this.add
      .text(GAME_WIDTH / 2, 423, 'Clique no botão ou pressione ENTER', {
        color: '#7f9683',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
      })
      .setOrigin(0.5);
  }

  private drawBackdrop(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0a100d).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let row = 0; row < 18; row += 1) {
      for (let column = 0; column < 30; column += 1) {
        const color = (row + column) % 3 === 0 ? 0x193121 : 0x162a1e;
        graphics.fillStyle(color, 0.7);
        graphics.fillRect(column * 32, row * 32, 31, 31);
      }
    }

    graphics.fillStyle(0xc69c45, 0.24);
    graphics.fillCircle(GAME_WIDTH / 2, 250, 230);
    graphics.lineStyle(2, 0xe8ca78, 0.22);
    graphics.strokeCircle(GAME_WIDTH / 2, 250, 190);
  }
}
