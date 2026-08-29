/**
 * Pure Web Audio API procedural sound synthesizer (100% client-side, 0 external network requests)
 * OFF by default per §3 specs.
 *
 * Implements 6 vintage mechanical sound effects:
 * - stamp: Heavy wax seal impact with low-end resonance (playStamp, playThud, playShatter)
 * - slam: Multiplier cut / emergency protocol impact with screen shake coupling (playSlam)
 * - stream: Passive balance streaming & coin chimes (playStream, playCoinClink, playRustle)
 * - ember crackle: Atmospheric fireplace & license furnace burns (playCrackle, playFurnaceRoar)
 * - tick: Epoch advance & ratchet wheel ticks (playTick, playRatchet)
 * - chime: Branch acquisition & chapter completion chords (playChime, playCelebration)
 *
 * Features:
 * - Pre-allocated shared PCM noise buffers (pink, white, brownian) in initCtx() to eliminate GC stutter.
 * - MasterGainNode + DynamicsCompressorNode (limiter) preventing clipping on overlapping triggers.
 * - Subtle low-frequency atmospheric drone for the CONTRACTION regime with smooth crossfades.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;

  // Pre-allocated shared PCM noise buffers
  private whiteNoiseBuffer: AudioBuffer | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private brownianNoiseBuffer: AudioBuffer | null = null;

  // Atmospheric contraction drone nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;
  private droneLFO: OscillatorNode | null = null;
  private droneLFOGain: GainNode | null = null;
  private isDroneRunning: boolean = false;
  private currentRegime: string = "EXPANSION";

  constructor() {
    // AudioContext will be initialized on first user interaction if enabled
  }

  private initCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // 1. Setup DynamicsCompressorNode (Master Limiter)
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.setValueAtTime(-6, this.ctx.currentTime);
        this.limiter.knee.setValueAtTime(6, this.ctx.currentTime);
        this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.limiter.release.setValueAtTime(0.15, this.ctx.currentTime);

        // 2. Setup MasterGainNode
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);

        // Route: Voices -> masterGain -> limiter -> destination
        this.masterGain.connect(this.limiter);
        this.limiter.connect(this.ctx.destination);

        // 3. Pre-allocate 2.0s reusable noise buffers (eliminates GC stutter)
        this.initNoiseBuffers(this.ctx);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private initNoiseBuffers(ctx: AudioContext): void {
    const sampleRate = ctx.sampleRate;
    const duration = 2.0; // 2 seconds of high-fidelity noise
    const length = Math.floor(sampleRate * duration);

    // White Noise (uniform random)
    this.whiteNoiseBuffer = ctx.createBuffer(1, length, sampleRate);
    const whiteData = this.whiteNoiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      whiteData[i] = Math.random() * 2 - 1;
    }

    // Pink Noise (1/f noise via Paul Kellet filter algorithm)
    this.pinkNoiseBuffer = ctx.createBuffer(1, length, sampleRate);
    const pinkData = this.pinkNoiseBuffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    // Brownian Noise (1/f^2 integrated random walk with leaky integrator)
    this.brownianNoiseBuffer = ctx.createBuffer(1, length, sampleRate);
    const brownianData = this.brownianNoiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      brownianData[i] = lastOut * 3.5;
    }
  }

  private getNoiseSource(
    ctx: AudioContext,
    type: "white" | "pink" | "brownian" = "white",
    loop: boolean = false
  ): AudioBufferSourceNode | null {
    let buffer: AudioBuffer | null = null;
    if (type === "white") buffer = this.whiteNoiseBuffer;
    else if (type === "pink") buffer = this.pinkNoiseBuffer;
    else if (type === "brownian") buffer = this.brownianNoiseBuffer;

    if (!buffer) return null;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    return source;
  }

  private getDestinationNode(ctx: AudioContext): AudioNode {
    return this.masterGain ?? ctx.destination;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    const ctx = this.initCtx();
    if (ctx && this.masterGain) {
      if (this.isMuted) {
        this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
        this.stopContractionDrone();
      } else {
        this.masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
        this.playTick();
        if (this.currentRegime === "CONTRACTION") {
          this.startContractionDrone();
        }
      }
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 1. TICK: Epoch advance & ratchet wheel ticks
   */
  public playTick(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const dest = this.getDestinationNode(ctx);

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  }

  public playRatchet(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const dest = this.getDestinationNode(ctx);

    osc.type = "square";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }

  /**
   * 2. STAMP: Heavy wax seal impact with low-end resonance
   */
  public playThud(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const dest = this.getDestinationNode(ctx);

    // Deep resonant triangle wave drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);

    // Subtle tactile mechanical press snap via pink noise
    const noise = this.getNoiseSource(ctx, "pink");
    if (noise) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);
      noise.start();
      noise.stop(ctx.currentTime + 0.08);
    }
  }

  public playStamp(): void {
    this.playThud();
  }

  /**
   * 3. SLAM: Multiplier cut / emergency protocol impact
   */
  public playSlam(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const dest = this.getDestinationNode(ctx);

    // Heavy downward pitch drop
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(24, ctx.currentTime + 0.22);

    oscGain.gain.setValueAtTime(0.32, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);

    // Deep brownian impact rumble
    const noise = this.getNoiseSource(ctx, "brownian");
    if (noise) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.24);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);
      noise.start();
      noise.stop(ctx.currentTime + 0.24);
    }
  }

  /**
   * 4. EMBER CRACKLE: Atmospheric fireplace & license furnace burns
   */
  public playCrackle(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const dest = this.getDestinationNode(ctx);
    const noise = this.getNoiseSource(ctx, "pink");
    if (!noise) return;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 3.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.15);
  }

  public playFurnaceRoar(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const dest = this.getDestinationNode(ctx);
    const noise = this.getNoiseSource(ctx, "brownian");
    if (!noise) return;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.26, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.4);
  }

  /**
   * 5. STREAM: Passive balance streaming & coin chimes
   */
  public playCoinClink(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const dest = this.getDestinationNode(ctx);
    const baseFreq = 2400 + Math.random() * 600;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  public playRustle(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const dest = this.getDestinationNode(ctx);
    const noise = this.getNoiseSource(ctx, "pink");
    if (!noise) return;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.2);
  }

  public playStream(): void {
    this.playCoinClink();
  }

  /**
   * 6. CHIME: Branch acquisition & chapter completion chords
   */
  public playChime(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const dest = this.getDestinationNode(ctx);
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);

      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.45);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(ctx.currentTime + idx * 0.04);
      osc.stop(ctx.currentTime + idx * 0.04 + 0.45);
    });
  }

  public playCelebration(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const dest = this.getDestinationNode(ctx);
    const notes = [440, 554.37, 659.25, 880]; // A4 C#5 E5 A5

    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.07);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.65);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.65);
    });
  }

  public playShatter(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const dest = this.getDestinationNode(ctx);

    // High pitched snap followed by noise dispersion
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(2200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);

    const noise = this.getNoiseSource(ctx, "pink");
    if (noise) {
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 3200;
      filter.Q.value = 2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      noise.start();
      noise.stop(ctx.currentTime + 0.25);
    }
  }

  /**
   * Atmospheric Contraction Regime Drone
   * Subtle, low-frequency atmospheric drone for the CONTRACTION regime
   */
  public startContractionDrone(): void {
    if (this.isMuted || this.isDroneRunning) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const dest = this.getDestinationNode(ctx);

      // Twin detuned low-frequency oscillators for slow organic beating (0.8 Hz beat)
      this.droneOsc1 = ctx.createOscillator();
      this.droneOsc1.type = "triangle";
      this.droneOsc1.frequency.setValueAtTime(55.0, ctx.currentTime); // A1

      this.droneOsc2 = ctx.createOscillator();
      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(54.2, ctx.currentTime);

      // Lowpass filter with subtle resonance
      this.droneFilter = ctx.createBiquadFilter();
      this.droneFilter.type = "lowpass";
      this.droneFilter.frequency.setValueAtTime(110, ctx.currentTime);
      this.droneFilter.Q.setValueAtTime(2.0, ctx.currentTime);

      // Subtle LFO modulation of filter cutoff
      this.droneLFO = ctx.createOscillator();
      this.droneLFO.type = "sine";
      this.droneLFO.frequency.setValueAtTime(0.15, ctx.currentTime); // 0.15 Hz slow breath

      this.droneLFOGain = ctx.createGain();
      this.droneLFOGain.gain.setValueAtTime(25.0, ctx.currentTime);
      this.droneLFO.connect(this.droneLFOGain);
      this.droneLFOGain.connect(this.droneFilter.frequency);

      // Drone Gain with smooth fade in
      this.droneGain = ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.065, ctx.currentTime + 1.2);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(dest);

      this.droneOsc1.start();
      this.droneOsc2.start();
      this.droneLFO.start();
      this.isDroneRunning = true;
    } catch {
      this.isDroneRunning = false;
    }
  }

  public stopContractionDrone(): void {
    if (!this.isDroneRunning || !this.ctx || !this.droneGain) {
      this.isDroneRunning = false;
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      const osc1 = this.droneOsc1;
      const osc2 = this.droneOsc2;
      const lfo = this.droneLFO;

      setTimeout(() => {
        try {
          osc1?.stop();
          osc2?.stop();
          lfo?.stop();
          osc1?.disconnect();
          osc2?.disconnect();
          lfo?.disconnect();
        } catch {
          // ignore already stopped nodes
        }
      }, 850);
    } catch {
      // ignore
    } finally {
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.droneLFO = null;
      this.droneLFOGain = null;
      this.droneFilter = null;
      this.droneGain = null;
      this.isDroneRunning = false;
    }
  }

  public setRegimeDrone(regime: "EXPANSION" | "CONTRACTION" | string): void {
    this.currentRegime = regime;
    if (regime === "CONTRACTION") {
      this.startContractionDrone();
    } else {
      this.stopContractionDrone();
    }
  }
}

export const sound = new SoundManager();
