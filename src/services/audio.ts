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
  private isBgmDucked = false;

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

      // Play brief silent sample to warm up WebAudio
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
      this.bgmGain.gain.value = muted ? 0 : this.isBgmDucked ? 0.03 : 0.08;
    }
  }

  public isMute(): boolean {
    return this.muted;
  }

  public duckBgm(ducked: boolean): void {
    this.isBgmDucked = ducked;
    if (this.bgmGain && !this.muted) {
      this.bgmGain.gain.setValueAtTime(
        ducked ? 0.03 : 0.08,
        this.ctx ? this.ctx.currentTime : 0
      );
    }
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

      case "siren":
      case "sfx-siren": {
        // Police / Ambulance alternating two-tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.setValueAtTime(900, now + 0.15);
        osc.frequency.setValueAtTime(650, now + 0.3);

        gain.gain.setValueAtTime(baseVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.46);
        osc.onended = onEnd;
        break;
      }

      case "cough":
      case "sfx-cough": {
        // Dual filtered noise burst
        const bufferSize = ctx.sampleRate * 0.12;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 850;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(baseVolume * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.onended = onEnd;
        break;
      }

      case "splash":
      case "sfx-splash": {
        // Water splash noise synth
        const bufferSize = ctx.sampleRate * 0.18;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(250, now + 0.18);
        filter.Q.value = 2.5;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(baseVolume * 0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.onended = onEnd;
        break;
      }

      case "win": {
        // Major chord fanfare: C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(baseVolume * 0.7, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.32);
          if (idx === notes.length - 1) osc.onended = onEnd;
        });
        break;
      }

      case "lose": {
        // Sad minor descending tone
        const notes = [440, 415.3, 392, 349.2];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(baseVolume * 0.5, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.36);
          if (idx === notes.length - 1) osc.onended = onEnd;
        });
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

      this.bgmGain.gain.setValueAtTime(this.isBgmDucked ? 0.03 : 0.08, now);

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
