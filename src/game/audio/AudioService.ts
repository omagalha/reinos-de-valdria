import { Howl, Howler, type HowlOptions } from 'howler';

export type AudioChannel = 'musica' | 'efeitos';

interface RegisteredSound {
  channel: AudioChannel;
  sound: Howl;
}

export class AudioService {
  private readonly sounds = new Map<string, RegisteredSound>();
  private channelVolumes: Record<AudioChannel, number> = {
    musica: 0.65,
    efeitos: 0.8,
  };

  register(id: string, channel: AudioChannel, options: HowlOptions): void {
    this.sounds.get(id)?.sound.unload();
    this.sounds.set(id, {
      channel,
      sound: new Howl({ ...options, volume: this.channelVolumes[channel] }),
    });
  }

  play(id: string): number | null {
    const entry = this.sounds.get(id);
    return entry ? entry.sound.play() : null;
  }

  stop(id: string): void {
    this.sounds.get(id)?.sound.stop();
  }

  setChannelVolume(channel: AudioChannel, volume: number): void {
    const normalized = Math.min(1, Math.max(0, volume));
    this.channelVolumes[channel] = normalized;
    for (const entry of this.sounds.values()) {
      if (entry.channel === channel) entry.sound.volume(normalized);
    }
  }

  mute(muted: boolean): void {
    Howler.mute(muted);
  }

  dispose(): void {
    for (const entry of this.sounds.values()) entry.sound.unload();
    this.sounds.clear();
  }
}
