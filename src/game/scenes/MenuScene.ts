import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';
import {
  DEFAULT_PLAYER_CLASS,
  playerClasses,
  type PlayerClassId,
} from '../data/combat-data';
import type { GameSave } from '../save/schema';

interface MenuData {
  error?: string;
}

export class MenuScene extends Phaser.Scene {
  private error?: string;
  private selectedClass: PlayerClassId = DEFAULT_PLAYER_CLASS;

  constructor() {
    super('MenuScene');
  }

  init(data: MenuData): void {
    this.error = data.error;
  }

  create(): void {
    const loadedSave = this.registry.get('loaded-save') as GameSave | undefined;
    this.selectedClass = (loadedSave?.player.classId ?? DEFAULT_PLAYER_CLASS) as PlayerClassId;
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
      .text(GAME_WIDTH / 2, 140, 'COLETA E DEPÓSITO • v4.29', {
        color: '#a9c7ad',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    const description = this.error
      ? 'Há dados inválidos e o laboratório não pode iniciar.\n' + this.error
      : loadedSave
        ? `Save v3 carregado • Nv. ${loadedSave.player.level} • escolha a classe ou continue`
        : 'Escolha sua classe para explorar os Campos de Valdria';

    this.add
      .text(GAME_WIDTH / 2, 205, description, {
        align: 'center',
        color: this.error ? '#ffad9c' : '#d8e0d4',
        fontFamily: 'Arial, sans-serif',
        fontSize: '19px',
        lineSpacing: 10,
        wordWrap: { width: 720 },
      })
      .setOrigin(0.5);

    if (this.error) return;

    const classCards = Object.values(playerClasses).map((playerClass, index) => {
      const x = GAME_WIDTH / 2 + (index - 1) * 210;
      const card = this.add
        .rectangle(x, 292, 190, 104, 0x183025)
        .setStrokeStyle(2, 0x617866)
        .setInteractive({ useHandCursor: true });
      const title = this.add
        .text(x, 266, playerClass.name.toUpperCase(), {
          color: '#f5df9a',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      const details = this.add
        .text(
          x,
          307,
          `HP ${playerClass.maxHp} • dano ${playerClass.damage.join('–')}\nalcance ${playerClass.rangeTiles}`,
          {
            align: 'center',
            color: '#c3d2c5',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            lineSpacing: 5,
          },
        )
        .setOrigin(0.5);
      card.on('pointerup', () => {
        this.selectedClass = playerClass.classId;
        refreshCards();
      });
      return { id: playerClass.classId, card, title, details };
    });
    const refreshCards = (): void => {
      classCards.forEach(({ id, card }) =>
        card.setStrokeStyle(id === this.selectedClass ? 4 : 2, id === this.selectedClass ? 0xffdf78 : 0x617866),
      );
    };
    refreshCards();

    const button = this.add
      .rectangle(GAME_WIDTH / 2, 405, 350, 58, 0xd4ad54)
      .setStrokeStyle(3, 0xffe7a0)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(GAME_WIDTH / 2, 405, 'EXPLORAR CAMPOS DE VALDRIA', {
        color: '#172017',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const start = (): void => {
      this.registry.set('selected-player-class', this.selectedClass);
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
      .text(GAME_WIDTH / 2, 454, 'Escolha uma classe e clique no botão ou pressione ENTER', {
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
