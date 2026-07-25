import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { validateGameContent } from './game/data';
import './styles/modern.css';

const validation = validateGameContent();
const status = document.querySelector<HTMLElement>('#validation-status');

if (status) {
  status.textContent = validation.summary;
  status.dataset.valid = String(validation.success);
}

if (!validation.success) {
  throw new Error('Os dados da fundação v4.30 são inválidos: ' + validation.errors.join('; '));
}

const game = new Phaser.Game(createGameConfig());

if (import.meta.env.DEV) {
  window.__VALDRIA_TEST__ = {
    snapshot: () => ({
      activeScenes: game.scene.getScenes(true).map((scene) => scene.scene.key),
      playerPosition: game.registry.get('player-position') as { x: number; y: number } | undefined,
      cameraView: game.registry.get('camera-view') as
        | { x: number; y: number; width: number; height: number }
        | undefined,
      minimapReady: Boolean(game.registry.get('minimap-data')),
      interactionPrompt: (game.registry.get('interaction-prompt') as string | undefined) ?? '',
      interactionMessage: (game.registry.get('interaction-message') as string | undefined) ?? '',
      selectedPlayerClass: (game.registry.get('selected-player-class') as string | undefined) ?? '',
      saveStatus: (game.registry.get('save-status') as string | undefined) ?? '',
      guardianTeamOpen: Boolean(game.registry.get('guardian-team-open')),
      guardianTeam:
        (game.registry.get('guardian-team-state') as
          | Array<{
              instanceId: string;
              speciesId: string;
              active: boolean;
              fainted: boolean;
            }>
          | undefined) ?? [],
      combatState: game.registry.get('combat-state') as
        | {
            classId: string;
            hp: number;
            maxHp: number;
            mana: number;
            maxMana: number;
            target: { hp: number } | null;
            guardian: { name: string; hp: number; maxHp: number } | null;
            essenceCores: number;
            guardianTeam: string[];
            activeGuardian: {
              name: string;
              level: number;
              fainted: boolean;
              reviveInMs: number;
            } | null;
          }
        | undefined,
      monsters:
        (game.registry.get('monster-state') as
          | Array<{
              id: string;
              defeated: boolean;
              aiState: string;
              respawnInMs: number;
            }>
          | undefined) ?? [],
      guardian: game.registry.get('guardian-state') as
        | {
            id: string;
            hp: number;
            maxHp: number;
            bonded: boolean;
            level: number;
            experience: number;
            x: number;
            y: number;
            fainted: boolean;
            reviveInMs: number;
          }
        | null
        | undefined,
    }),
  };
}

declare global {
  interface Window {
    __VALDRIA_TEST__?: {
      snapshot: () => {
        activeScenes: string[];
        playerPosition?: { x: number; y: number };
        cameraView?: { x: number; y: number; width: number; height: number };
        minimapReady: boolean;
        interactionPrompt: string;
        interactionMessage: string;
        selectedPlayerClass: string;
        saveStatus: string;
        guardianTeamOpen: boolean;
        guardianTeam: Array<{
          instanceId: string;
          speciesId: string;
          active: boolean;
          fainted: boolean;
        }>;
        combatState?: {
          classId: string;
          hp: number;
          maxHp: number;
          mana: number;
          maxMana: number;
          target: { hp: number } | null;
          guardian: { name: string; hp: number; maxHp: number } | null;
          essenceCores: number;
          guardianTeam: string[];
          activeGuardian: {
            name: string;
            level: number;
            fainted: boolean;
            reviveInMs: number;
          } | null;
        };
        monsters: Array<{
          id: string;
          defeated: boolean;
          aiState: string;
          respawnInMs: number;
        }>;
        guardian?: {
          id: string;
          hp: number;
          maxHp: number;
          bonded: boolean;
          level: number;
          experience: number;
          x: number;
          y: number;
          fainted: boolean;
          reviveInMs: number;
        } | null;
      };
    };
  }
}
