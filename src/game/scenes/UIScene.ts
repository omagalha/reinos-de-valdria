import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';
import { villageStageById, type VillageStageId } from '../data';

export class UIScene extends Phaser.Scene {
  private stageText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private combatText!: Phaser.GameObjects.Text;
  private minimapDynamic!: Phaser.GameObjects.Graphics;
  private minimapScaleX = 1;
  private minimapScaleY = 1;
  private readonly minimapX = GAME_WIDTH - 202;
  private readonly minimapY = 82;

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
      .text(18, 38, 'Mover: WASD/toque • Selecione Ratino • F ou ATACAR • ESC volta', {
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

    this.drawMinimap();
    this.promptText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 54, '', {
        color: '#f5df9a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        backgroundColor: '#07100cdd',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.messageText = this.add
      .text(GAME_WIDTH / 2, 78, '', {
        color: '#d8e0d4',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        backgroundColor: '#142019dd',
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.combatText = this.add
      .text(18, 82, '', {
        color: '#f7efd8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        backgroundColor: '#421c1cdd',
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0);
  }

  update(): void {
    const id = this.registry.get('village-stage') as VillageStageId | undefined;
    const stage = id ? villageStageById[id] : undefined;
    this.stageText.setText(stage ? 'Aldeia: ' + stage.name + '\n' + stage.summary : 'Aldeia: —');
    this.promptText.setText((this.registry.get('interaction-prompt') as string | undefined) ?? '');
    this.messageText.setText((this.registry.get('interaction-message') as string | undefined) ?? '');
    const combat = this.registry.get('combat-state') as
      | {
          hp: number;
          maxHp: number;
          level: number;
          experience: number;
          target: { name: string; hp: number; maxHp: number } | null;
        }
      | undefined;
    this.combatText.setText(
      combat
        ? `HP ${combat.hp}/${combat.maxHp} • Nv. ${combat.level} • XP ${combat.experience}` +
            (combat.target ? `\nAlvo: ${combat.target.name} ${combat.target.hp}/${combat.target.maxHp}` : '')
        : '',
    );
    this.updateMinimap();
  }

  private drawMinimap(): void {
    const data = this.registry.get('minimap-data') as {
      width: number;
      height: number;
      roads: Array<{ x: number; y: number }>;
      water: Array<{ x: number; y: number }>;
      obstacles: Array<{ x: number; y: number }>;
    } | undefined;
    if (!data) return;
    const width = 184;
    const height = 120;
    this.minimapScaleX = width / data.width;
    this.minimapScaleY = height / data.height;
    const base = this.add.graphics().setScrollFactor(0);
    base.fillStyle(0x07100c, 0.84).fillRect(this.minimapX - 4, this.minimapY - 4, width + 8, height + 8);
    base.fillStyle(0x568c46, 1).fillRect(this.minimapX, this.minimapY, width, height);
    const drawCells = (cells: Array<{ x: number; y: number }>, color: number) => {
      base.fillStyle(color, 1);
      for (const cell of cells) {
        base.fillRect(
          this.minimapX + cell.x * this.minimapScaleX,
          this.minimapY + cell.y * this.minimapScaleY,
          Math.ceil(this.minimapScaleX),
          Math.ceil(this.minimapScaleY),
        );
      }
    };
    drawCells(data.roads, 0xa98b55);
    drawCells(data.water, 0x397fa1);
    drawCells(data.obstacles, 0x285b39);
    this.minimapDynamic = this.add.graphics().setScrollFactor(0);
  }

  private updateMinimap(): void {
    if (!this.minimapDynamic) return;
    const player = this.registry.get('player-position') as { x: number; y: number } | undefined;
    const camera = this.registry.get('camera-view') as
      | { x: number; y: number; width: number; height: number }
      | undefined;
    this.minimapDynamic.clear();
    if (camera) {
      this.minimapDynamic.lineStyle(1, 0xf7efd8, 0.75);
      this.minimapDynamic.strokeRect(
        this.minimapX + (camera.x / 32) * this.minimapScaleX,
        this.minimapY + (camera.y / 32) * this.minimapScaleY,
        (camera.width / 32) * this.minimapScaleX,
        (camera.height / 32) * this.minimapScaleY,
      );
    }
    if (player) {
      this.minimapDynamic.fillStyle(0xffe06a, 1);
      this.minimapDynamic.fillCircle(
        this.minimapX + (player.x / 32) * this.minimapScaleX,
        this.minimapY + (player.y / 32) * this.minimapScaleY,
        3,
      );
    }
  }
}
