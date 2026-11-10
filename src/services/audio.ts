export interface AudioPlayOptions {
  volume?: number;
  rate?: number;
  detune?: number;
}

class AudioService {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;
  private muted = false;
  private activeVoices = 0;
  private maxSimultaneousVoices = 4;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on user tap to comply with browser autoplay policies
  }

  public async unlock(): Promise<void> {
    if (this.isUnlocked && this.ctx && this.ctx.state === "running") {
      return;
    }
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioContextClass();
      }
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
      this.isUnlocked = true;

      // Play silent brief buffer to warm up mobile WebAudio
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);
    } catch (e) {
      console.warn("WebAudio unlock failed or not permitted:", e);
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.bgmGain) {
      this.bgmGain.gain.value = muted ? 0 : 0.2;
    }
  }

  public isMute(): boolean {
    return this.muted;
  }

  public play(name: string, options: AudioPlayOptions = {}): void {
    if (this.muted || !this.ctx || this.ctx.state !== "running") return;
    if (this.activeVoices >= this.maxSimultaneousVoices) return;

    this.activeVoices++;
    const done = () => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    };

    try {
      this.playSynth(name, options, done);
    } catch {
      done();
    }
  }

  private playSynth(
    name: string,
    options: AudioPlayOptions,
    onEnd: () => void
  ): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const pitchOffset = (Math.random() - 0.5) * 0.16; // Randomize pitch +/- 8%
    const baseVolume = (options.volume ?? 1.0) * 0.35;

    switch (name) {
      case "sfx-slap":
      case "slap": {
        // High-passed noise burst
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 1400 * (1 + pitchOffset);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(baseVolume * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.onended = onEnd;
        break;
      }

      case "sfx-punch":
      case "punch": {
        // Low thump
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const freq = 160 * (1 + pitchOffset);
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);

        gain.gain.setValueAtTime(baseVolume * 1.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
        osc.onended = onEnd;
        break;
      }

      case "sfx-kick":
      case "kick": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const freq = 120 * (1 + pitchOffset);
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);

        gain.gain.setValueAtTime(baseVolume * 1.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
        osc.onended = onEnd;
        break;
      }

      case "sfx-whoosh":
      case "whoosh": {
        // Filtered sweep noise
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.25);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(baseVolume * 0.8, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.onended = onEnd;
        break;
      }

      case "coin":
      case "sfx-coin": {
        // High dual sine blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(987, now);
        osc.frequency.setValueAtTime(1318, now + 0.08);

        gain.gain.setValueAtTime(baseVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.21);
        osc.onended = onEnd;
        break;
      }

      case "powercut":
      case "sfx-powercut": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.5);

        gain.gain.setValueAtTime(baseVolume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.51);
        osc.onended = onEnd;
        break;
      }

      case "sfx-ultimate":
      case "ultimate": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);

        gain.gain.setValueAtTime(baseVolume * 1.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.62);
        osc.onended = onEnd;
        break;
      }

      default: {
        // Gentle click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(baseVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        osc.onended = onEnd;
        break;
      }
    }
  }

  public playBgm(): void {
    if (this.muted || !this.ctx || this.bgmOscillator) return;
    try {
      const now = this.ctx.currentTime;
      this.bgmOscillator = this.ctx.createOscillator();
      this.bgmGain = this.ctx.createGain();

      this.bgmOscillator.type = "triangle";
      this.bgmOscillator.frequency.setValueAtTime(120, now);

      this.bgmGain.gain.setValueAtTime(0.08, now);

      this.bgmOscillator.connect(this.bgmGain);
      this.bgmGain.connect(this.ctx.destination);
      this.bgmOscillator.start();
    } catch (e) {
      console.warn("BGM start failed:", e);
    }
  }

  public stopBgm(): void {
    if (this.bgmOscillator) {
      try {
        this.bgmOscillator.stop();
        this.bgmOscillator.disconnect();
      } catch {}
      this.bgmOscillator = null;
      this.bgmGain = null;
    }
  }
}

export const audioService = new AudioService();
