export type AppSound = 'tap' | 'invalid' | 'wrong' | 'correct' | 'complete';

const soundSources: Record<AppSound, string> = {
  tap: '/audio/tap.mp3',
  invalid: '/audio/tap.mp3',
  wrong: '/audio/wrong.mp3',
  correct: '/audio/correct.mp3',
  complete: '/audio/complete.mp3'
};

export class SoundPlayer {
  private readonly cache = new Map<AppSound, HTMLAudioElement>();
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  play(sound: AppSound): void {
    if (!this.enabled || typeof Audio === 'undefined') {
      return;
    }

    const audio = this.getAudio(sound);
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browsers can block audio before user interaction. Gameplay still works.
    });
  }

  private getAudio(sound: AppSound): HTMLAudioElement {
    const existing = this.cache.get(sound);
    if (existing) {
      return existing;
    }

    const audio = new Audio(soundSources[sound]);
    audio.preload = 'auto';
    if (sound === 'invalid') {
      audio.playbackRate = 0.85;
      audio.volume = 0.45;
    }
    this.cache.set(sound, audio);
    return audio;
  }
}

export const soundPlayer = new SoundPlayer();