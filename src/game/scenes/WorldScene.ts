import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../config';
import { moveWithCollision, normalizedDirection, type Point2D } from '../systems/movement';
import { findGridPath, type GridPoint } from '../systems/pathfinding';
import { nearestInRange } from '../systems/interactions';

type MovementKeys = Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;

const PLAYER_SPEED = 185;
const TOUCH_SPEED = 150;
const PLAYER_RADIUS = 10;
const JOYSTICK_CENTER = { x: 102, y: GAME_HEIGHT - 96 };
const JOYSTICK_RADIUS = 58;

interface InteractiveMarker {
  id: string;
  layerName: string;
  name: string;
  x: number;
  y: number;
  used: boolean;
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private map!: Phaser.Tilemaps.Tilemap;
  private collisionLayer!: Phaser.Tilemaps.TilemapLayer;
  private target = new Phaser.Math.Vector2();
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: MovementKeys;
  private joystickGraphics!: Phaser.GameObjects.Graphics;
  private joystickDirection: Point2D = { x: 0, y: 0 };
  private joystickPointerId: number | null = null;
  private touchPath: Phaser.Math.Vector2[] = [];
  private interactiveMarkers: InteractiveMarker[] = [];

  constructor() {
    super('WorldScene');
  }

  create(): void {
    this.createMap();
    const spawn = this.requireObject('player_spawn');
    this.player = this.createPlayer(spawn.x ?? TILE_SIZE, spawn.y ?? TILE_SIZE);
    this.target.set(this.player.x, this.player.y);
    this.renderMapMarkers();
    this.configureCamera();
    this.configureKeyboard();
    this.configurePointerControls();
    this.createMobileControl();
    this.publishMinimap();

    this.scene.launch('UIScene');
    this.registry.set('village-stage', 'acampamento');
    this.registry.set('current-biome', 'campos-de-valdria');
  }

  update(_time: number, delta: number): void {
    const keyboardDirection = {
      x:
        Number(Boolean(this.cursors?.right?.isDown || this.wasd?.right.isDown)) -
        Number(Boolean(this.cursors?.left?.isDown || this.wasd?.left.isDown)),
      y:
        Number(Boolean(this.cursors?.down?.isDown || this.wasd?.down.isDown)) -
        Number(Boolean(this.cursors?.up?.isDown || this.wasd?.up.isDown)),
    };
    const hasKeyboardInput = keyboardDirection.x !== 0 || keyboardDirection.y !== 0;
    const hasJoystickInput = this.joystickDirection.x !== 0 || this.joystickDirection.y !== 0;

    if (hasKeyboardInput || hasJoystickInput) {
      this.touchPath = [];
      const direction = hasKeyboardInput ? keyboardDirection : this.joystickDirection;
      this.movePlayer(direction, (PLAYER_SPEED * delta) / 1000);
      this.target.set(this.player.x, this.player.y);
    } else {
      this.followTouchPath(delta);
    }
    this.updateExplorationRegistry();
  }

  private createMap(): void {
    this.map = this.make.tilemap({ key: 'campos-de-valdria' });
    const tileset = this.map.addTilesetImage('campos-provisorio', 'campos-tiles');
    if (!tileset) throw new Error('Tileset provisório de Campos de Valdria não foi carregado.');

    for (const name of ['ground', 'roads', 'water', 'obstacles', 'decoration']) {
      const layer = this.map.createLayer(name, tileset, 0, 0);
      if (!layer) throw new Error(`Layer obrigatória não carregada: ${name}`);
    }
    const collisionLayer = this.map.createLayer('collision', tileset, 0, 0);
    if (!collisionLayer) throw new Error('Layer obrigatória não carregada: collision');
    collisionLayer.setVisible(false);
    this.collisionLayer = collisionLayer;
  }

  private requireObject(layerName: string): Phaser.Types.Tilemaps.TiledObject {
    const object = this.map.getObjectLayer(layerName)?.objects[0];
    if (!object) throw new Error(`Objeto obrigatório ausente: ${layerName}`);
    return object;
  }

  private configureCamera(): void {
    const worldWidth = this.map.widthInPixels;
    const worldHeight = this.map.heightInPixels;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(180, 110);
    this.cameras.main.setZoom(1);
  }

  private configureKeyboard(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as MovementKeys;
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
    this.input.keyboard.on('keydown-E', () => this.interact());
    this.input.keyboard.on('keydown-SPACE', () => this.interact());
  }

  private configurePointerControls(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const inJoystick =
        Phaser.Math.Distance.Between(pointer.x, pointer.y, JOYSTICK_CENTER.x, JOYSTICK_CENTER.y) <=
        JOYSTICK_RADIUS + 28;
      if (inJoystick) {
        this.joystickPointerId = pointer.id;
        this.updateJoystick(pointer);
        return;
      }
      if (pointer.y < 70) return;
      this.createTouchPath(pointer.worldX, pointer.worldY);
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.joystickPointerId && pointer.isDown) this.updateJoystick(pointer);
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.joystickPointerId) return;
      this.joystickPointerId = null;
      this.joystickDirection = { x: 0, y: 0 };
      this.drawJoystick();
    });
  }

  private createMobileControl(): void {
    this.joystickGraphics = this.add.graphics().setDepth(100).setScrollFactor(0);
    this.drawJoystick();
    const action = this.add
      .text(GAME_WIDTH - 92, GAME_HEIGHT - 92, 'AÇÃO', {
        color: '#172017',
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        backgroundColor: '#d4ad54',
        padding: { x: 20, y: 16 },
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    action.on('pointerdown', () => this.interact());
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const rawX = pointer.x - JOYSTICK_CENTER.x;
    const rawY = pointer.y - JOYSTICK_CENTER.y;
    this.joystickDirection = normalizedDirection(rawX, rawY);
    this.drawJoystick(
      Phaser.Math.Clamp(rawX, -JOYSTICK_RADIUS, JOYSTICK_RADIUS),
      Phaser.Math.Clamp(rawY, -JOYSTICK_RADIUS, JOYSTICK_RADIUS),
    );
  }

  private drawJoystick(offsetX = 0, offsetY = 0): void {
    this.joystickGraphics.clear();
    this.joystickGraphics.fillStyle(0x07100c, 0.45);
    this.joystickGraphics.fillCircle(JOYSTICK_CENTER.x, JOYSTICK_CENTER.y, JOYSTICK_RADIUS);
    this.joystickGraphics.lineStyle(2, 0xe8ddba, 0.45);
    this.joystickGraphics.strokeCircle(JOYSTICK_CENTER.x, JOYSTICK_CENTER.y, JOYSTICK_RADIUS);
    this.joystickGraphics.fillStyle(0xf0c96a, 0.65);
    this.joystickGraphics.fillCircle(
      JOYSTICK_CENTER.x + offsetX,
      JOYSTICK_CENTER.y + offsetY,
      23,
    );
  }

  private movePlayer(direction: Point2D, distance: number): void {
    const next = moveWithCollision(
      { x: this.player.x, y: this.player.y },
      direction,
      distance,
      PLAYER_RADIUS,
      (x, y, radius) => this.isPositionBlocked(x, y, radius),
    );
    this.player.setPosition(next.x, next.y);
  }

  private createTouchPath(worldX: number, worldY: number): void {
    const start = this.worldToGrid(this.player.x, this.player.y);
    const goal = this.worldToGrid(worldX, worldY);
    const path = findGridPath(start, goal, (x, y) => this.isTileWalkable(x, y));
    this.touchPath = path.slice(1).map(
      ({ x, y }) => new Phaser.Math.Vector2(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2),
    );
    this.registry.set(
      'interaction-message',
      path.length ? `Caminho calculado: ${Math.max(0, path.length - 1)} passos.` : 'Destino bloqueado.',
    );
  }

  private followTouchPath(delta: number): void {
    const nextTarget = this.touchPath[0];
    if (!nextTarget) return;
    const direction = new Phaser.Math.Vector2(nextTarget.x - this.player.x, nextTarget.y - this.player.y);
    if (direction.lengthSq() <= 16) {
      this.player.setPosition(nextTarget.x, nextTarget.y);
      this.touchPath.shift();
      return;
    }
    const distance = Math.min(direction.length(), (TOUCH_SPEED * delta) / 1000);
    const before = { x: this.player.x, y: this.player.y };
    this.movePlayer(direction, distance);
    if (before.x === this.player.x && before.y === this.player.y) this.touchPath = [];
  }

  private worldToGrid(x: number, y: number): GridPoint {
    return { x: Math.floor(x / TILE_SIZE), y: Math.floor(y / TILE_SIZE) };
  }

  private isTileWalkable(x: number, y: number): boolean {
    return (
      x >= 0 &&
      y >= 0 &&
      x < this.map.width &&
      y < this.map.height &&
      !this.collisionLayer.getTileAt(x, y)
    );
  }

  private isPositionBlocked(x: number, y: number, radius: number): boolean {
    const worldWidth = this.map.widthInPixels;
    const worldHeight = this.map.heightInPixels;
    if (x - radius < 0 || y - radius < 0 || x + radius >= worldWidth || y + radius >= worldHeight) {
      return true;
    }

    const samples: Array<[number, number]> = [
      [x - radius, y - radius],
      [x + radius, y - radius],
      [x - radius, y + radius],
      [x + radius, y + radius],
    ];
    return samples.some(([sampleX, sampleY]) => {
      const tileX = Math.floor(sampleX / TILE_SIZE);
      const tileY = Math.floor(sampleY / TILE_SIZE);
      return Boolean(this.collisionLayer.getTileAt(tileX, tileY));
    });
  }

  private renderMapMarkers(): void {
    const markerStyles = [
      ['npcs', 0xf0c96a, 'NPC'],
      ['monster_spawns', 0xc66b58, 'SPAWN'],
      ['guardian_spawns', 0x61c79b, 'GUARDIÃO'],
      ['chests', 0xb98745, 'BAÚ'],
      ['shrines', 0x86cbd1, 'SANTUÁRIO'],
      ['portals', 0x9e83d5, 'PORTAL'],
    ] as const;

    for (const [layerName, color, label] of markerStyles) {
      for (const object of this.map.getObjectLayer(layerName)?.objects ?? []) {
        const x = object.x ?? 0;
        const y = object.y ?? 0;
        this.add.circle(x, y, 9, color, 0.88).setDepth(4).setStrokeStyle(2, 0x17251d);
        this.add
          .text(x, y - 17, label, {
            color: '#f7efd8',
            fontFamily: 'Arial, sans-serif',
            fontSize: '9px',
            backgroundColor: '#142019cc',
            padding: { x: 3, y: 2 },
          })
          .setOrigin(0.5, 1)
          .setDepth(4);
        if (['npcs', 'chests', 'shrines', 'portals'].includes(layerName)) {
          this.interactiveMarkers.push({
            id: `${layerName}:${object.name}`,
            layerName,
            name: object.name,
            x,
            y,
            used: false,
          });
        }
      }
    }
  }

  private nearestInteraction(): InteractiveMarker | undefined {
    return nearestInRange(this.player, this.interactiveMarkers, TILE_SIZE * 1.4);
  }

  private interact(): void {
    const marker = this.nearestInteraction();
    if (!marker) {
      this.registry.set('interaction-message', 'Nada para interagir por perto.');
      return;
    }
    const messages: Record<string, string> = {
      npcs: `${marker.name}: os caminhos de Valdria estão sendo reconstruídos.`,
      chests: marker.used ? 'Este baú provisório já foi aberto.' : 'Baú aberto: Poção de Campo encontrada.',
      shrines: 'O santuário registra seu retorno aos Campos de Valdria.',
      portals: 'Portal reconhecido. A região de destino ainda não foi migrada.',
    };
    if (marker.layerName === 'chests') marker.used = true;
    this.registry.set('interaction-message', messages[marker.layerName] ?? 'Interação registrada.');
  }

  private updateExplorationRegistry(): void {
    const camera = this.cameras.main.worldView;
    this.registry.set('player-position', { x: this.player.x, y: this.player.y });
    this.registry.set('camera-view', {
      x: camera.x,
      y: camera.y,
      width: camera.width,
      height: camera.height,
    });
    const nearest = this.nearestInteraction();
    this.registry.set('interaction-prompt', nearest ? `E/ESPAÇO ou AÇÃO: ${nearest.name}` : '');
  }

  private publishMinimap(): void {
    const collect = (layerName: string): GridPoint[] => {
      const data = this.map.getLayer(layerName)?.data ?? [];
      const points: GridPoint[] = [];
      data.forEach((row, y) =>
        row.forEach((tile, x) => {
          if (tile.index >= 0) points.push({ x, y });
        }),
      );
      return points;
    };
    this.registry.set('minimap-data', {
      width: this.map.width,
      height: this.map.height,
      roads: collect('roads'),
      water: collect('water'),
      obstacles: collect('obstacles'),
    });
  }

  private createPlayer(x: number, y: number): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(0, 12, 22, 9, 0x000000, 0.35);
    const body = this.add.rectangle(0, 0, 18, 25, 0xd8b25a).setStrokeStyle(2, 0x3f2d20);
    const cloak = this.add.triangle(0, 4, -10, 13, 10, 13, 0, -7, 0x385f73);
    const head = this.add.circle(0, -13, 7, 0xe2b38a).setStrokeStyle(2, 0x3f2d20);
    return this.add.container(x, y, [shadow, cloak, body, head]).setDepth(10);
  }
}
