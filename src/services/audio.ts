import type { TimeOfDay, WeatherType } from "@/store/useGameStore";

export interface AudioPlayOptions {
  volume?: number;
  rate?: number;
  detune?: number;
}

export type BgmFilterType = "normal" | "underwater" | "loadshedding" | "muffled";
export type TimeOfDayPhase = TimeOfDay;
export type WeatherEffect = WeatherType;

class AudioService {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;
  private muted = false;
  private activeVoices = 0;
  private maxSimultaneousVoices = 6;

  // BGM Nodes & Sequencer
  private bgmGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private isBgmDucked = false;
  private bgmFilterState: BgmFilterType = "normal";
  private bgmInterval: ReturnType<typeof setInterval> | null = null;
  private nextBgmNoteTime = 0;
  private currentBgmStep = 0;

  // Ambient Engine
  private currentTod: TimeOfDayPhase = "noon";
  private currentWeather: WeatherEffect = "clear";
  private ambientInterval: ReturnType<typeof setInterval> | null = null;
  private rainNoiseNode: AudioNode | null = null;
  private rainGainNode: GainNode | null = null;

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

      this.startAmbientLoop();
    } catch (e) {
      console.warn("WebAudio unlock failed or not permitted:", e);
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.bgmGain) {
      this.bgmGain.gain.value = muted ? 0 : this.isBgmDucked ? 0.025 : 0.07;
    }
    if (this.rainGainNode) {
      this.rainGainNode.gain.value = muted ? 0 : 0.035;
    }
  }

  public isMute(): boolean {
    return this.muted;
  }

  public duckBgm(ducked: boolean): void {
    this.isBgmDucked = ducked;
    if (this.bgmGain && !this.muted && this.ctx) {
      this.bgmGain.gain.setValueAtTime(
        ducked ? 0.025 : 0.07,
        this.ctx.currentTime
      );
    }
  }

  public setBgmFilter(type: BgmFilterType): void {
    this.bgmFilterState = type;
    if (!this.bgmFilter || !this.ctx) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case "underwater":
        // Lowpass muffle at 420 Hz with slight resonant peak for flood
        this.bgmFilter.type = "lowpass";
        this.bgmFilter.frequency.setTargetAtTime(420, now, 0.08);
        this.bgmFilter.Q.setTargetAtTime(2.2, now, 0.08);
        break;

      case "loadshedding":
        // Bandpass transistor radio vibe for blackout
        this.bgmFilter.type = "bandpass";
        this.bgmFilter.frequency.setTargetAtTime(950, now, 0.08);
        this.bgmFilter.Q.setTargetAtTime(1.4, now, 0.08);
        break;

      case "muffled":
        // Lowpass at 550 Hz for pause
        this.bgmFilter.type = "lowpass";
        this.bgmFilter.frequency.setTargetAtTime(550, now, 0.05);
        this.bgmFilter.Q.setTargetAtTime(0.7, now, 0.05);
        break;

      case "normal":
      default:
        // Wide open transparent sound
        this.bgmFilter.type = "lowpass";
        this.bgmFilter.frequency.setTargetAtTime(16000, now, 0.08);
        this.bgmFilter.Q.setTargetAtTime(0.7, now, 0.08);
        break;
    }
  }

  public setTimeOfDay(tod: TimeOfDayPhase): void {
    this.currentTod = tod;
  }

  public setWeather(weather: WeatherEffect): void {
    this.currentWeather = weather;
    if (weather === "flood") {
      this.setBgmFilter("underwater");
    } else if (this.bgmFilterState === "underwater") {
      this.setBgmFilter("normal");
    }
    this.updateRainAmbient(weather === "rain" || weather === "flood");
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

  public playSpatial(
    name: string,
    pan: number,
    options: AudioPlayOptions = {}
  ): void {
    if (this.muted || !this.ctx || this.ctx.state !== "running") return;
    if (this.activeVoices >= this.maxSimultaneousVoices) return;

    this.activeVoices++;
    const done = () => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    };

    try {
      let dest: AudioNode = this.ctx.destination;
      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, pan));
        panner.connect(this.ctx.destination);
        dest = panner;
      }
      this.playSynth(name, options, done, dest);
    } catch {
      done();
    }
  }

  private playSynth(
    name: string,
    options: AudioPlayOptions,
    onEnd: () => void,
    outputDestination?: AudioNode
  ): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const dest = outputDestination || ctx.destination;
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
        gain.connect(dest);
        noise.start(now);
        noise.onended = onEnd;
        break;
      }

      case "chappal-leather": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(110 * (1 + pitchOffset), now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

        gain.gain.setValueAtTime(baseVolume * 1.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.1);
        osc.onended = onEnd;
        break;
      }

      case "chappal-golden": {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(1760 * (1 + pitchOffset), now);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(2640 * (1 + pitchOffset), now);

        gain.gain.setValueAtTime(baseVolume * 1.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(dest);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.29);
        osc2.stop(now + 0.29);
        osc1.onended = onEnd;
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
        gain.connect(dest);
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
        gain.connect(dest);
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
        gain.connect(dest);
        noise.start(now);
        noise.onended = onEnd;
        break;
      }

      case "banana":
      case "sfx-banana": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(420 * (1 + pitchOffset), now);
        osc.frequency.exponentialRampToValueAtTime(1150, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.28);

        gain.gain.setValueAtTime(baseVolume * 1.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.29);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.3);
        osc.onended = onEnd;
        break;
      }

      case "can-kick":
      case "can":
      case "sfx-can": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(840 * (1 + pitchOffset), now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.16);

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1600;
        filter.Q.value = 4.0;

        gain.gain.setValueAtTime(baseVolume * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.19);
        osc.onended = onEnd;
        break;
      }

      case "whistle":
      case "sfx-whistle": {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(2450 * (1 + pitchOffset), now);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(2700 * (1 + pitchOffset), now);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 24;
        lfoGain.gain.value = 80;
        lfo.connect(osc1.frequency);
        lfo.connect(osc2.frequency);

        gain.gain.setValueAtTime(baseVolume * 0.9, now);
        gain.gain.setValueAtTime(baseVolume * 0.9, now + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(dest);

        lfo.start(now);
        osc1.start(now);
        osc2.start(now);
        lfo.stop(now + 0.33);
        osc1.stop(now + 0.33);
        osc2.stop(now + 0.33);
        osc1.onended = onEnd;
        break;
      }

      case "fanfare": {
        const notes = [261.63, 329.63, 392.0, 523.25];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq * (1 + pitchOffset), now + idx * 0.08);

          const filter = this.ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 1800;

          gain.gain.setValueAtTime(baseVolume * 0.65, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.36);
          if (idx === notes.length - 1) osc.onended = onEnd;
        });
        break;
      }

      case "taunt":
      case "sfx-taunt": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(580 * (1 + pitchOffset), now);
        osc.frequency.linearRampToValueAtTime(940, now + 0.1);
        osc.frequency.linearRampToValueAtTime(460, now + 0.22);

        gain.gain.setValueAtTime(baseVolume * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.25);
        osc.onended = onEnd;
        break;
      }

      case "vehicle-rickshaw": {
        [0, 0.12].forEach((offset, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(2093 * (1 + pitchOffset), now + offset);

          gain.gain.setValueAtTime(baseVolume * 0.7, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + offset);
          osc.stop(now + offset + 0.15);
          if (idx === 1) osc.onended = onEnd;
        });
        break;
      }

      case "vehicle-cng": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(78 * (1 + pitchOffset), now);

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 350;

        gain.gain.setValueAtTime(baseVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.42);
        osc.onended = onEnd;
        break;
      }

      case "vehicle-bus": {
        [280, 350].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq * (1 + pitchOffset), now);

          gain.gain.setValueAtTime(baseVolume * 0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.3);
          if (idx === 1) osc.onended = onEnd;
        });
        break;
      }

      case "vehicle-bike": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.28);

        gain.gain.setValueAtTime(baseVolume * 0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.33);
        osc.onended = onEnd;
        break;
      }

      // Archetype Grunts
      case "phoneSnatcher-grunt":
      case "snatcher-grunt": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(540 * (1 + pitchOffset), now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.16);

        gain.gain.setValueAtTime(baseVolume * 1.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.18);
        osc.onended = onEnd;
        break;
      }

      case "chorSardar-grunt":
      case "sardar-grunt": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(125 * (1 + pitchOffset), now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.24);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 450;

        gain.gain.setValueAtTime(baseVolume * 1.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.26);
        osc.onended = onEnd;
        break;
      }

      case "chickenChor-grunt":
      case "chicken-grunt": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(750 * (1 + pitchOffset), now);
        osc.frequency.exponentialRampToValueAtTime(1350, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);

        gain.gain.setValueAtTime(baseVolume * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.2);
        osc.onended = onEnd;
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
        gain.connect(dest);
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
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.51);
        osc.onended = onEnd;
        break;
      }

      case "siren":
      case "sfx-siren": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.setValueAtTime(900, now + 0.15);
        osc.frequency.setValueAtTime(650, now + 0.3);

        gain.gain.setValueAtTime(baseVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.46);
        osc.onended = onEnd;
        break;
      }

      case "cough":
      case "sfx-cough": {
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
        gain.connect(dest);
        noise.start(now);
        noise.onended = onEnd;
        break;
      }

      case "splash":
      case "sfx-splash": {
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
        gain.connect(dest);
        noise.start(now);
        noise.onended = onEnd;
        break;
      }

      case "win": {
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
          gain.connect(dest);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.32);
          if (idx === notes.length - 1) osc.onended = onEnd;
        });
        break;
      }

      case "lose": {
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
          gain.connect(dest);
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
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.62);
        osc.onended = onEnd;
        break;
      }

      case "click": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(baseVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.05);
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
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.05);
        osc.onended = onEnd;
        break;
      }
    }
  }

  // --- Dynamic Procedural Slapstick BGM ---
  public playBgm(): void {
    if (this.muted || !this.ctx || this.bgmInterval) return;
    try {
      this.bgmFilter = this.ctx.createBiquadFilter();
      this.bgmFilter.type = "lowpass";
      this.bgmFilter.frequency.value =
        this.bgmFilterState === "underwater"
          ? 420
          : this.bgmFilterState === "loadshedding"
          ? 950
          : 16000;

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(
        this.isBgmDucked ? 0.025 : 0.07,
        this.ctx.currentTime
      );

      this.bgmFilter.connect(this.bgmGain);
      this.bgmGain.connect(this.ctx.destination);

      this.nextBgmNoteTime = this.ctx.currentTime + 0.05;
      this.currentBgmStep = 0;

      this.bgmInterval = setInterval(() => {
        this.scheduleBgmNotes();
      }, 50);
    } catch (e) {
      console.warn("BGM start failed:", e);
    }
  }

  private scheduleBgmNotes(): void {
    if (!this.ctx || !this.bgmFilter || this.muted) return;
    const stepDuration = 0.22; // ~136 BPM 8th notes
    const lookahead = 0.25;

    // Dhaka Slapstick Bassline Riff (D minor)
    const bassFrequencies = [
      73.42, 0, 73.42, 87.31, 98.0, 103.83, 110.0, 0, 130.81, 110.0, 98.0,
      87.31, 82.41, 87.31, 73.42, 0,
    ];

    while (this.nextBgmNoteTime < this.ctx.currentTime + lookahead) {
      const step = this.currentBgmStep;
      const t = this.nextBgmNoteTime;
      const freq = bassFrequencies[step];

      // 1. Bass pluck
      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.bgmFilter);
        osc.start(t);
        osc.stop(t + 0.2);
      }

      // 2. Playful comic chord stabs on beat 0, 4, 8, 12
      if (step === 0 || step === 4 || step === 8 || step === 12) {
        const chord =
          step === 4
            ? [196.0, 233.08, 293.66] // Gm
            : step === 8
            ? [220.0, 277.18, 329.63] // A7
            : [146.83, 174.61, 220.0]; // Dm

        chord.forEach((note) => {
          if (!this.ctx || !this.bgmFilter) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(note, t);

          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

          osc.connect(gain);
          gain.connect(this.bgmFilter);
          osc.start(t);
          osc.stop(t + 0.18);
        });
      }

      // 3. Upbeat comedic percussion click
      if (step % 2 === 1) {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.03);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        noise.connect(gain);
        gain.connect(this.bgmFilter);
        noise.start(t);
      }

      this.nextBgmNoteTime += stepDuration;
      this.currentBgmStep = (this.currentBgmStep + 1) % 16;
    }
  }

  public stopBgm(): void {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch {}
      this.bgmGain = null;
    }
    if (this.bgmFilter) {
      try {
        this.bgmFilter.disconnect();
      } catch {}
      this.bgmFilter = null;
    }
  }

  // --- Procedural Ambient Layers ---
  private startAmbientLoop(): void {
    if (this.ambientInterval) return;
    this.ambientInterval = setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== "running") return;
      const now = this.ctx.currentTime;

      // Night Crickets: Dhaka nocturnal insect chirp
      if (this.currentTod === "night") {
        for (let i = 0; i < 3; i++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(4700, now + i * 0.08);

          gain.gain.setValueAtTime(0.015, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.04);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.05);
        }
      }

      // Dawn: Sweet morning sparrow chirps
      if (this.currentTod === "dawn" && Math.random() < 0.6) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(2900, now);
        osc.frequency.exponentialRampToValueAtTime(4100, now + 0.1);

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      }
    }, 2400);
  }

  private updateRainAmbient(active: boolean): void {
    if (!this.ctx) return;
    if (active) {
      if (!this.rainNoiseNode) {
        // Continuous soft filtered rain hiss
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1400;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.muted ? 0 : 0.035, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(0);

        this.rainNoiseNode = noise;
        this.rainGainNode = gain;
      }
    } else {
      if (this.rainNoiseNode) {
        try {
          (this.rainNoiseNode as AudioScheduledSourceNode).stop();
          this.rainNoiseNode.disconnect();
        } catch {}
        this.rainNoiseNode = null;
      }
      if (this.rainGainNode) {
        try {
          this.rainGainNode.disconnect();
        } catch {}
        this.rainGainNode = null;
      }
    }
  }

  public stopAmbience(): void {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    this.updateRainAmbient(false);
  }
}

export const audioService = new AudioService();
