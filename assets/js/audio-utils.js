/**
 * Audio Utility functions for managing Web Audio API.
 * Provides ambient soundscapes and micro-interaction sound effects.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.sfxGain = null;

    this.isMuted = false;
    this.isInitialized = false;
    this.ambientSource = null;
  }

  init() {
    if (this.isInitialized) return;

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.connect(this.masterGain);
      this.ambientGain.gain.value = 0.5; // Lower volume for background

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = 1.0;

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  toggleMute() {
    if (!this.isInitialized) return;
    this.isMuted = !this.isMuted;

    // Resume context if suspended (common in browsers until interaction)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime, 0.1);
    return this.isMuted;
  }

  playAmbient() {
    if (!this.isInitialized || this.ambientSource) return;

    // Create a subtle wind/drone using noise and a lowpass filter
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.ambientSource = this.ctx.createBufferSource();
    this.ambientSource.buffer = buffer;
    this.ambientSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // slow wind gusts

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 300;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Volume envelope to fade in
    const envGain = this.ctx.createGain();
    envGain.gain.setValueAtTime(0, this.ctx.currentTime);
    envGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 3);

    this.ambientSource.connect(filter);
    filter.connect(envGain);
    envGain.connect(this.ambientGain);

    this.ambientSource.start();
  }

  playInteractionSound(type = 'click') {
    if (!this.isInitialized) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    if (type === 'click') {
      // Gentle, low wooden tap for map markers
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.6, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc.start(t);
      osc.stop(t + 0.1);
    } else if (type === 'close') {
      // Soft sweeping down for panel close
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.start(t);
      osc.stop(t + 0.2);
    } else if (type === 'hover') {
      // Extremely subtle high tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.01);
      gain.gain.linearRampToValueAtTime(0, t + 0.05);

      osc.start(t);
      osc.stop(t + 0.05);
    }
  }
}

export const audioEngine = new AudioEngine();
