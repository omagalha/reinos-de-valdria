import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../config';
import { biomeById, type BiomeId, villageStages } from '../data';

type MovementKeys = Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private target = new Phaser.Math.Vector2();
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: MovementKeys;
  private villageGraphics!: Phaser.GameObjects.Graphics;
  private villageStageIndex = 0;

  constructor() {
    super('WorldScene');
  }

  create(): void {
    this.drawWorld();
    this.villageGraphics = this.add.graphics().setDepth(2);
    this.drawVillage();
    this.player = this.createPlayer(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 74);
    this.target.set(this.player.x, this.player.y);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      }) as MovementKeys;

      this.input.keyboard.on('keydown-ONE', () => this.setVillageStage(0));
      this.input.keyboard.on('keydown-TWO', () => this.setVillageStage(1));
      this.input.keyboard.on('keydown-THREE', () => this.setVillageStage(2));
      this.input.keyboard.on('keydown-ESC', () => {
        this.scene.stop('UIScene');
        this.scene.start('MenuScene');
      });
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < 72) return;
      this.target.set(
        Phaser.Math.Clamp(pointer.worldX, 16, GAME_WIDTH - 16),
        Phaser.Math.Clamp(pointer.worldY, 84, GAME_HEIGHT - 16),
      );
    });

    this.scene.launch('UIScene');
    this.registry.set('village-stage', villageStages[this.villageStageIndex]?.id);
  }

  update(_time: number, delta: number): void {
    const keyboardDirection = new Phaser.Math.Vector2(
      Number(Boolean(this.cursors?.right?.isDown || this.wasd?.right.isDown)) -
        Number(Boolean(this.cursors?.left?.isDown || this.wasd?.left.isDown)),
      Number(Boolean(this.cursors?.down?.isDown || this.wasd?.down.isDown)) -
        Number(Boolean(this.cursors?.up?.isDown || this.wasd?.up.isDown)),
    );

    if (keyboardDirection.lengthSq() > 0) {
      keyboardDirection.normalize();
      const distance = (185 * delta) / 1000;
      this.player.x = Phaser.Math.Clamp(this.player.x + keyboardDirection.x * distance, 16, GAME_WIDTH - 16);
      this.player.y = Phaser.Math.Clamp(this.player.y + keyboardDirection.y * distance, 84, GAME_HEIGHT - 16);
      this.target.set(this.player.x, this.player.y);
    } else {
      const distanceToTarget = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.target.x,
        this.target.y,
      );

      if (distanceToTarget > 3) {
        const direction = this.target.clone().subtract(new Phaser.Math.Vector2(this.player.x, this.player.y)).normalize();
        const distance = Math.min(distanceToTarget, (150 * delta) / 1000);
        this.player.x += direction.x * distance;
        this.player.y += direction.y * distance;
      }
    }
  }

  private drawWorld(): void {
    const graphics = this.add.graphics();

    for (let row = 0; row < GAME_HEIGHT / TILE_SIZE; row += 1) {
      for (let column = 0; column < GAME_WIDTH / TILE_SIZE; column += 1) {
        const biome = biomeById[this.biomeAt(column, row)];
        graphics.fillStyle(biome.mapColor);
        graphics.fillRect(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        graphics.lineStyle(1, 0x09100b, 0.16);
        graphics.strokeRect(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        if ((column * 7 + row * 11) % 23 === 0) {
          graphics.fillStyle(biome.accentColor, 0.75);
          graphics.fillCircle(column * TILE_SIZE + 9, row * TILE_SIZE + 10, 3);
        }
      }
    }

    graphics.fillStyle(0xbfa36b, 0.78);
    graphics.fillRect(0, 8 * TILE_SIZE + 8, GAME_WIDTH, 46);
    graphics.fillRect(14 * TILE_SIZE + 4, 72, 54, GAME_HEIGHT - 72);
  }

  private biomeAt(column: number, row: number): BiomeId {
    if (row < 4) return 'serras-geladas';
    if (column < 6 && row > 8) return 'pantano-luminoso';
    if (column > 24) return 'praia-solar';
    if (column > 6 && column < 12 && row > 5 && row < 11) return 'caverna-sombria';
    if ((column + row * 2) % 9 < 3) return 'bosque-sussurrante';
    return 'campos-de-valdria';
  }

  private createPlayer(x: number, y: number): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(0, 12, 22, 9, 0x000000, 0.35);
    const body = this.add.rectangle(0, 0, 18, 25, 0xd8b25a).setStrokeStyle(2, 0x3f2d20);
    const cloak = this.add.triangle(0, 4, -10, 13, 10, 13, 0, -7, 0x385f73);
    const head = this.add.circle(0, -13, 7, 0xe2b38a).setStrokeStyle(2, 0x3f2d20);
    return this.add.container(x, y, [shadow, cloak, body, head]).setDepth(5);
  }

  private setVillageStage(index: number): void {
    this.villageStageIndex = Phaser.Math.Clamp(index, 0, villageStages.length - 1);
    this.drawVillage();
    this.registry.set('village-stage', villageStages[this.villageStageIndex]?.id);
  }

  private drawVillage(): void {
    this.villageGraphics.clear();
    const stage = villageStages[this.villageStageIndex];
    if (!stage) return;

    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    if (stage.id === 'fortificada') {
      this.villageGraphics.lineStyle(7, 0x75634b, 1);
      this.villageGraphics.strokeRect(centerX - 150, centerY - 105, 300, 205);
      this.villageGraphics.fillStyle(0x3d3127).fillRect(centerX - 24, centerY + 88, 48, 18);
    }

    this.drawHouse(centerX - 70, centerY - 25, 0x8e5e3b);

    if (stage.id !== 'acampamento') {
      this.drawHouse(centerX + 62, centerY - 38, 0x6e7890);
      this.villageGraphics.fillStyle(0x735f39).fillRect(centerX - 95, centerY + 50, 55, 28);
      this.villageGraphics.fillStyle(0x496c38).fillRect(centerX - 91, centerY + 54, 47, 20);
    } else {
      this.villageGraphics.fillStyle(0x7b5538).fillTriangle(
        centerX + 42,
        centerY + 48,
        centerX + 88,
        centerY + 48,
        centerX + 66,
        centerY + 12,
      );
      this.villageGraphics.fillStyle(0xe47732).fillCircle(centerX + 12, centerY + 58, 8);
    }

    if (stage.id === 'fortificada') {
      this.drawHouse(centerX + 78, centerY + 46, 0x7d4f3a);
      this.villageGraphics.fillStyle(0xc3b184).fillCircle(centerX - 12, centerY - 30, 15);
      this.villageGraphics.fillStyle(0x547e8c).fillCircle(centerX - 12, centerY - 30, 9);
    }
  }

  private drawHouse(x: number, y: number, color: number): void {
    this.villageGraphics.fillStyle(0xb89568).fillRect(x - 25, y - 8, 50, 40);
    this.villageGraphics.fillStyle(color).fillTriangle(x - 34, y - 8, x + 34, y - 8, x, y - 39);
    this.villageGraphics.fillStyle(0x3f3028).fillRect(x - 7, y + 10, 14, 22);
  }
}
