import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../dimensions';
import { villageStageById, type VillageStageId } from '../data';

interface GuardianTeamView {
  instanceId: string;
  speciesId: string;
  name: string;
  element: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  fainted: boolean;
  reviveInMs: number;
  active: boolean;
}

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
  private teamPanel!: Phaser.GameObjects.Container;
  private teamContent!: Phaser.GameObjects.Container;
  private teamSignature = '';

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
      .text(18, 38, 'Mover • F: atacar • Q: habilidade • V: vínculo • R: trocar • T: equipe', {
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
    this.createTeamPanel();
    this.game.events.on('guardian-team-toggle', this.toggleTeamPanel, this);
    this.input.keyboard?.on('keydown-T', this.toggleTeamPanel, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('guardian-team-toggle', this.toggleTeamPanel, this);
      this.input.keyboard?.off('keydown-T', this.toggleTeamPanel, this);
      if (this.scene.isPaused('WorldScene')) this.scene.resume('WorldScene');
    });
  }

  update(): void {
    const id = this.registry.get('village-stage') as VillageStageId | undefined;
    const stage = id ? villageStageById[id] : undefined;
    const resources = this.registry.get('village-resources') as
      | { madeira: number; pedra: number; fibras: number; essencia: number; ouro: number }
      | undefined;
    this.stageText.setText(
      stage
        ? 'Aldeia: ' +
            stage.name +
            '\n' +
            stage.summary +
            (resources
              ? `\nM ${resources.madeira} • P ${resources.pedra} • F ${resources.fibras} • E ${resources.essencia}`
              : '')
        : 'Aldeia: —',
    );
    this.promptText.setText((this.registry.get('interaction-prompt') as string | undefined) ?? '');
    this.messageText.setText((this.registry.get('interaction-message') as string | undefined) ?? '');
    const combat = this.registry.get('combat-state') as
      | {
          hp: number;
          maxHp: number;
          mana: number;
          maxMana: number;
          classId: string;
          className: string;
          skillName: string;
          skillReady: boolean;
          level: number;
          experience: number;
          target: { name: string; hp: number; maxHp: number } | null;
          guardian: { name: string; hp: number; maxHp: number } | null;
          essenceCores: number;
          guardianTeam: string[];
          activeGuardian: {
            name: string;
            hp: number;
            maxHp: number;
            level: number;
            experience: number;
            fainted: boolean;
            reviveInMs: number;
          } | null;
        }
      | undefined;
    const saveStatus = (this.registry.get('save-status') as string | undefined) ?? '—';
    this.combatText.setText(
      combat
        ? `${combat.className} • HP ${combat.hp}/${combat.maxHp} • MP ${combat.mana}/${combat.maxMana}` +
            `\nNv. ${combat.level} • XP ${combat.experience} • ${combat.skillName}: ${combat.skillReady ? 'pronta' : 'recarregando'}` +
            (combat.target ? `\nAlvo: ${combat.target.name} ${combat.target.hp}/${combat.target.maxHp}` : '') +
            (combat.guardian
              ? `\nGuardião: ${combat.guardian.name} ${combat.guardian.hp}/${combat.guardian.maxHp}`
              : '') +
            `\nNúcleos: ${combat.essenceCores} • Equipe: ${combat.guardianTeam.length}` +
            (combat.activeGuardian
              ? combat.activeGuardian.fainted
                ? ` • ${combat.activeGuardian.name}: desmaiado (${Math.ceil(combat.activeGuardian.reviveInMs / 1000)}s)`
                : ` • Ativo: ${combat.activeGuardian.name} Nv.${combat.activeGuardian.level}`
              : '') +
            `\nSave v3: ${saveStatus}`
        : '',
    );
    this.updateMinimap();
    if (this.teamPanel.visible) this.renderTeamPanel();
  }

  private createTeamPanel(): void {
    const shade = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x020806, 0.76)
      .setOrigin(0)
      .setInteractive();
    const panel = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 760, 470, 0x12231a, 0.98)
      .setStrokeStyle(3, 0xd4ad54);
    const title = this.add
      .text(GAME_WIDTH / 2 - 340, GAME_HEIGHT / 2 - 205, 'EQUIPE DE GUARDIÕES', {
        color: '#f0c96a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
      });
    const hint = this.add
      .text(GAME_WIDTH / 2 - 340, GAME_HEIGHT / 2 - 170, 'Escolha um membro desperto para torná-lo ativo.', {
        color: '#b8c8bb',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      });
    const close = this.add
      .text(GAME_WIDTH / 2 + 330, GAME_HEIGHT / 2 - 204, 'FECHAR', {
        color: '#f7efd8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        backgroundColor: '#7b3732',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.toggleTeamPanel());
    this.teamContent = this.add.container(0, 0);
    this.teamPanel = this.add
      .container(0, 0, [shade, panel, title, hint, close, this.teamContent])
      .setDepth(500)
      .setScrollFactor(0)
      .setVisible(false);
  }

  private toggleTeamPanel(): void {
    this.setTeamPanelVisible(!this.teamPanel.visible);
  }

  private setTeamPanelVisible(visible: boolean): void {
    this.teamPanel.setVisible(visible);
    this.registry.set('guardian-team-open', visible);
    if (visible) {
      this.scene.pause('WorldScene');
      this.teamSignature = '';
      this.renderTeamPanel();
    } else if (this.scene.isPaused('WorldScene')) {
      this.scene.resume('WorldScene');
    }
  }

  private renderTeamPanel(): void {
    const team =
      (this.registry.get('guardian-team-state') as GuardianTeamView[] | undefined) ?? [];
    const signature = JSON.stringify(team);
    if (signature === this.teamSignature) return;
    this.teamSignature = signature;
    this.teamContent.removeAll(true);

    if (team.length === 0) {
      this.teamContent.add(
        this.add
          .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Nenhum Guardião vinculado.', {
            color: '#d8e0d4',
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
          })
          .setOrigin(0.5),
      );
      return;
    }

    team.slice(0, 6).forEach((member, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = GAME_WIDTH / 2 - 340 + column * 350;
      const y = GAME_HEIGHT / 2 - 125 + row * 104;
      const status = member.fainted
        ? `DESMAIADO • ${Math.ceil(member.reviveInMs / 1000)}s`
        : member.active
          ? 'ATIVO'
          : 'DISPONÍVEL';
      const card = this.add
        .text(
          x,
          y,
          `${member.name} • ${member.element.toUpperCase()}\n` +
            `Nv.${member.level} • XP ${member.experience}\n` +
            `HP ${member.hp}/${member.maxHp} • ${status}`,
          {
            color: member.fainted ? '#988f89' : '#f7efd8',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontStyle: member.active ? 'bold' : 'normal',
            backgroundColor: member.active ? '#315f45' : '#24362b',
            fixedWidth: 325,
            padding: { x: 14, y: 10 },
          },
        )
        .setInteractive({ useHandCursor: !member.fainted });
      card.on('pointerdown', () => {
        this.game.events.emit('guardian-team-select', member.instanceId);
        if (!member.fainted) this.setTeamPanelVisible(false);
      });
      this.teamContent.add(card);
    });
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
