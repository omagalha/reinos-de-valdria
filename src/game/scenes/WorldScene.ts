import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../dimensions';
import { moveWithCollision, normalizedDirection, type Point2D } from '../systems/movement';
import { findGridPath, type GridPoint } from '../systems/pathfinding';
import { nearestInRange } from '../systems/interactions';
import {
  getPlayerCombatData,
  getMonsterCombatData,
  initialCombatData,
  type MonsterCombatData,
  type PlayerCombatData,
} from '../data/combat-data';
import {
  applyDamage,
  canSpendMana,
  isTargetInRange,
  levelAfterExperience,
  restoreMana,
  rollDamage,
  scaleDamage,
  spendMana,
} from '../systems/combat';

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

interface MonsterEntity {
  id: string;
  combat: MonsterCombatData;
  container: Phaser.GameObjects.Container;
  hp: number;
  maxHp: number;
  nextMoveAt: number;
  nextAttackAt: number;
  defeated: boolean;
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
  private monsters: MonsterEntity[] = [];
  private selectedMonster?: MonsterEntity;
  private playerCombatData: PlayerCombatData = initialCombatData.player;
  private playerHp = this.playerCombatData.maxHp;
  private playerMana = this.playerCombatData.maxMp;
  private playerExperience = 0;
  private playerLevel = 1;
  private nextPlayerAttackAt = 0;
  private nextPlayerSkillAt = 0;
  private materials: Record<string, number> = {};

  constructor() {
    super('WorldScene');
  }

  create(): void {
    this.playerCombatData = getPlayerCombatData(this.registry.get('selected-player-class') as string | undefined);
    this.playerHp = this.playerCombatData.maxHp;
    this.playerMana = this.playerCombatData.maxMp;
    this.createMap();
    const spawn = this.requireObject('player_spawn');
    this.player = this.createPlayer(spawn.x ?? TILE_SIZE, spawn.y ?? TILE_SIZE);
    this.createMonsters();
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

  update(time: number, delta: number): void {
    this.playerMana = restoreMana(this.playerMana, this.playerCombatData.maxMp, (5 * delta) / 1000);
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
    this.updateCombat(time);
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
    this.input.keyboard.on('keydown-F', () => this.playerAttack(this.time.now));
    this.input.keyboard.on('keydown-Q', () => this.usePlayerSkill(this.time.now));
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
    const attack = this.add
      .text(GAME_WIDTH - 210, GAME_HEIGHT - 92, 'ATACAR', {
        color: '#f7efd8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        backgroundColor: '#9d3f38',
        padding: { x: 16, y: 16 },
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    attack.on('pointerdown', () => this.playerAttack(this.time.now));
    const skill = this.add
      .text(GAME_WIDTH - 330, GAME_HEIGHT - 92, 'HABILIDADE', {
        color: '#f7efd8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        backgroundColor: '#4f4b9d',
        padding: { x: 13, y: 17 },
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    skill.on('pointerdown', () => this.usePlayerSkill(this.time.now));
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

  private createMonsters(): void {
    for (const [index, object] of (this.map.getObjectLayer('monster_spawns')?.objects ?? []).entries()) {
      const x = object.x ?? 0;
      const y = object.y ?? 0;
      const catalogId = this.objectProperty(object, 'catalogId');
      const combat = getMonsterCombatData(catalogId);
      const shadow = this.add.ellipse(0, 8, 23, 9, 0x000000, 0.3);
      const parts = this.createMonsterParts(combat.monsterId);
      const container = this.add
        .container(x, y, [shadow, ...parts])
        .setSize(32, 32)
        .setDepth(8)
        .setInteractive({ useHandCursor: true });
      const monster: MonsterEntity = {
        id: `${combat.monsterId}-${index + 1}`,
        combat,
        container,
        hp: combat.maxHp,
        maxHp: combat.maxHp,
        nextMoveAt: 0,
        nextAttackAt: 0,
        defeated: false,
      };
      container.on('pointerdown', () => {
        this.selectedMonster = monster;
        this.registry.set('interaction-message', `${combat.name} selecionado.`);
      });
      this.monsters.push(monster);
    }
  }

  private updateCombat(time: number): void {
    for (const monster of this.monsters) {
      if (monster.defeated) continue;
      const distance = Phaser.Math.Distance.Between(
        monster.container.x,
        monster.container.y,
        this.player.x,
        this.player.y,
      );
      if (distance > monster.combat.visionTiles * TILE_SIZE) continue;
      if (distance <= TILE_SIZE * 1.2) {
        if (time >= monster.nextAttackAt) {
          this.playerHp = applyDamage(
            { hp: this.playerHp, maxHp: this.playerCombatData.maxHp },
            rollDamage(monster.combat.damage),
          ).hp;
          monster.nextAttackAt = time + 1200;
          this.registry.set('interaction-message', `${monster.combat.name} atingiu você. HP: ${this.playerHp}.`);
          if (this.playerHp <= 0) {
            this.playerHp = this.playerCombatData.maxHp;
            this.playerMana = this.playerCombatData.maxMp;
            const spawn = this.requireObject('player_spawn');
            this.player.setPosition(spawn.x ?? TILE_SIZE, spawn.y ?? TILE_SIZE);
            this.registry.set('interaction-message', 'Você desmaiou e retornou ao acampamento.');
          }
        }
        continue;
      }
      if (time < monster.nextMoveAt) continue;
      const direction = {
        x: this.player.x - monster.container.x,
        y: this.player.y - monster.container.y,
      };
      const next = moveWithCollision(
        { x: monster.container.x, y: monster.container.y },
        direction,
        TILE_SIZE,
        PLAYER_RADIUS,
        (x, y, radius) => this.isPositionBlocked(x, y, radius),
      );
      monster.container.setPosition(next.x, next.y);
      monster.nextMoveAt = time + monster.combat.moveCooldownMs;
    }
  }

  private playerAttack(time: number): void {
    const target = this.selectedMonster;
    if (!target || target.defeated) {
      this.registry.set('interaction-message', 'Selecione um monstro primeiro.');
      return;
    }
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      target.container.x,
      target.container.y,
    );
    if (!isTargetInRange(distance, this.playerCombatData.rangeTiles, TILE_SIZE)) {
      this.registry.set('interaction-message', 'O alvo está fora do alcance.');
      return;
    }
    if (time < this.nextPlayerAttackAt) return;
    this.nextPlayerAttackAt = time + this.playerCombatData.attackCooldownMs;
    if (this.playerCombatData.projectileColor !== null) {
      this.launchProjectile(target);
      return;
    }
    this.resolvePlayerHit(target);
  }

  private launchProjectile(target: MonsterEntity): void {
    const projectile = this.add
      .circle(this.player.x, this.player.y, this.playerCombatData.classId === 'mago' ? 7 : 4, this.playerCombatData.projectileColor ?? 0xffffff)
      .setDepth(12)
      .setStrokeStyle(2, 0xf7efd8, 0.8);
    this.tweens.add({
      targets: projectile,
      x: target.container.x,
      y: target.container.y,
      duration: 180,
      ease: 'Linear',
      onComplete: () => {
        projectile.destroy();
        if (!target.defeated) this.resolvePlayerHit(target);
      },
    });
  }

  private resolvePlayerHit(target: MonsterEntity): void {
    this.resolvePlayerDamage(target, 1);
  }

  private usePlayerSkill(time: number): void {
    const target = this.selectedMonster;
    const skill = this.playerCombatData.skill;
    if (!target || target.defeated) {
      this.registry.set('interaction-message', `Selecione um Ratino para usar ${skill.name}.`);
      return;
    }
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      target.container.x,
      target.container.y,
    );
    if (!isTargetInRange(distance, skill.rangeTiles, TILE_SIZE)) {
      this.registry.set('interaction-message', `${skill.name}: alvo fora do alcance.`);
      return;
    }
    if (time < this.nextPlayerSkillAt) {
      const seconds = Math.ceil((this.nextPlayerSkillAt - time) / 1000);
      this.registry.set('interaction-message', `${skill.name} recarrega em ${seconds}s.`);
      return;
    }
    if (!canSpendMana(this.playerMana, skill.manaCost)) {
      this.registry.set('interaction-message', `Mana insuficiente para ${skill.name}.`);
      return;
    }
    this.playerMana = spendMana(this.playerMana, skill.manaCost);
    this.nextPlayerSkillAt = time + skill.cooldownMs;

    if (this.playerCombatData.classId === 'cavaleiro') {
      this.cameras.main.shake(90, 0.002);
      this.resolvePlayerDamage(target, skill.damageMultiplier);
      return;
    }
    this.launchSkillProjectile(target);
  }

  private launchSkillProjectile(target: MonsterEntity): void {
    const isMage = this.playerCombatData.classId === 'mago';
    const projectile = this.add
      .circle(
        this.player.x,
        this.player.y,
        isMage ? 9 : 5,
        this.playerCombatData.projectileColor ?? 0xffffff,
      )
      .setDepth(13)
      .setStrokeStyle(2, 0xffffff, 0.9);
    this.tweens.add({
      targets: projectile,
      x: target.container.x,
      y: target.container.y,
      duration: 220,
      ease: 'Linear',
      onComplete: () => {
        const impact = { x: projectile.x, y: projectile.y };
        projectile.destroy();
        if (isMage) {
          const radius = this.playerCombatData.skill.areaRadiusTiles * TILE_SIZE;
          const area = this.add.circle(impact.x, impact.y, radius, 0x79c9ff, 0.25).setDepth(11);
          this.tweens.add({ targets: area, alpha: 0, scale: 1.25, duration: 260, onComplete: () => area.destroy() });
          for (const monster of this.monsters) {
            if (
              !monster.defeated &&
              Phaser.Math.Distance.Between(impact.x, impact.y, monster.container.x, monster.container.y) <= radius
            ) {
              this.resolvePlayerDamage(monster, this.playerCombatData.skill.damageMultiplier);
            }
          }
        } else if (!target.defeated) {
          this.resolvePlayerDamage(target, this.playerCombatData.skill.damageMultiplier);
        }
      },
    });
  }

  private resolvePlayerDamage(target: MonsterEntity, multiplier: number): void {
    target.hp = applyDamage(
      { hp: target.hp, maxHp: target.maxHp },
      scaleDamage(rollDamage(this.playerCombatData.damage), multiplier),
    ).hp;
    target.container.setAlpha(0.55);
    this.time.delayedCall(120, () => !target.defeated && target.container.setAlpha(1));
    if (target.hp > 0) {
      this.registry.set('interaction-message', `${target.combat.name}: ${target.hp}/${target.maxHp} HP.`);
      return;
    }
    target.defeated = true;
    target.container.setVisible(false).disableInteractive();
    this.playerExperience += target.combat.experience;
    this.playerLevel = levelAfterExperience(this.playerLevel, this.playerExperience);
    const drops: string[] = [];
    for (const drop of target.combat.drops) {
      if (Math.random() > drop.chance) continue;
      const amount = rollDamage(drop.amount as [number, number]);
      this.materials[drop.itemId] = (this.materials[drop.itemId] ?? 0) + amount;
      drops.push(`${drop.itemId} x${amount}`);
    }
    this.registry.set(
      'interaction-message',
      `${target.combat.name} derrotado: +${target.combat.experience} XP${drops.length ? ` • ${drops.join(', ')}` : ''}.`,
    );
    this.selectedMonster = undefined;
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
    this.registry.set('combat-state', {
      hp: this.playerHp,
      maxHp: this.playerCombatData.maxHp,
      mana: Math.floor(this.playerMana),
      maxMana: this.playerCombatData.maxMp,
      classId: this.playerCombatData.classId,
      className: this.playerCombatData.name,
      skillName: this.playerCombatData.skill.name,
      skillReady: this.time.now >= this.nextPlayerSkillAt,
      level: this.playerLevel,
      experience: this.playerExperience,
      target: this.selectedMonster
        ? {
            name: this.selectedMonster.combat.name,
            hp: this.selectedMonster.hp,
            maxHp: this.selectedMonster.maxHp,
          }
        : null,
      materials: this.materials,
    });
    this.registry.set(
      'monster-state',
      this.monsters.map(({ combat, defeated }) => ({ id: combat.monsterId, defeated })),
    );
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
    const classColors: Record<string, number> = {
      cavaleiro: 0x385f73,
      arqueiro: 0x4f7c45,
      mago: 0x765a9c,
    };
    const shadow = this.add.ellipse(0, 12, 22, 9, 0x000000, 0.35);
    const body = this.add.rectangle(0, 0, 18, 25, 0xd8b25a).setStrokeStyle(2, 0x3f2d20);
    const cloak = this.add.triangle(
      0,
      4,
      -10,
      13,
      10,
      13,
      0,
      -7,
      classColors[this.playerCombatData.classId],
    );
    const head = this.add.circle(0, -13, 7, 0xe2b38a).setStrokeStyle(2, 0x3f2d20);
    return this.add.container(x, y, [shadow, cloak, body, head]).setDepth(10);
  }

  private objectProperty(
    object: Phaser.Types.Tilemaps.TiledObject,
    propertyName: string,
  ): string | undefined {
    const properties = object.properties as Array<{ name: string; value: unknown }> | undefined;
    const value = properties?.find(({ name }) => name === propertyName)?.value;
    return typeof value === 'string' ? value : undefined;
  }

  private createMonsterParts(monsterId: string): Phaser.GameObjects.GameObject[] {
    if (monsterId === 'javali-musgoso') {
      return [
        this.add.ellipse(0, 0, 31, 23, 0x526d3c).setStrokeStyle(2, 0x26361f),
        this.add.circle(12, 2, 8, 0x6d7745).setStrokeStyle(2, 0x26361f),
        this.add.triangle(16, 7, 0, 0, 7, 3, 0, 6, 0xe4d5a5),
      ];
    }
    if (monsterId === 'esporo-errante') {
      return [
        this.add.rectangle(0, 5, 10, 18, 0xc7d6a0).setStrokeStyle(2, 0x34472d),
        this.add.ellipse(0, -5, 29, 18, 0x9b6ab0).setStrokeStyle(2, 0x493454),
        this.add.circle(-7, -7, 2, 0xe8d7ef),
        this.add.circle(6, -3, 2, 0xe8d7ef),
      ];
    }
    return [
      this.add.ellipse(0, 0, 25, 19, 0x8d6b48).setStrokeStyle(2, 0x3f2d20),
      this.add.triangle(-7, -8, -5, 1, 1, 1, -2, -7, 0x9f7952),
      this.add.triangle(7, -8, -1, 1, 5, 1, 2, -7, 0x9f7952),
    ];
  }
}
