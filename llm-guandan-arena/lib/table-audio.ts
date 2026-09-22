import type { TableCue } from "./guandan/highlight";

const STORAGE_KEY = "guandan-mute";

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let muted = false;
let armed = false;

export function readMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function writeMuted(next: boolean) {
  muted = next;
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
}

export function isMuted() {
  return muted;
}

/** Browsers stay silent until a gesture. Call from pointerdown. */
export function armAudio() {
  const audio = context();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  armed = true;
}

export function playTableCue(cue: TableCue) {
  if (muted || !armed) return;
  const audio = context();
  if (!audio || audio.state !== "running") return;
  const now = audio.currentTime;
  const master = audio.createGain();
  master.connect(audio.destination);
  if (cue === "plate") {
    burst(audio, master, now, 0.09, 720, 0.2);
    tone(audio, master, 150, now, 0.16, "sine", 0.16);
  } else if (cue === "bomb") {
    burst(audio, master, now, 0.18, 280, 0.28);
    sweep(audio, master, 240, 70, now, 0.22, 0.12);
  } else if (cue === "flush") {
    tone(audio, master, 523, now, 0.1, "triangle", 0.08);
    tone(audio, master, 659, now + 0.08, 0.1, "triangle", 0.08);
    tone(audio, master, 784, now + 0.16, 0.16, "triangle", 0.09);
  } else if (cue === "pass") {
    tone(audio, master, 880, now, 0.04, "sine", 0.04);
  } else if (cue === "first") {
    tone(audio, master, 440, now, 0.1, "sine", 0.08);
    tone(audio, master, 880, now + 0.09, 0.18, "sine", 0.1);
  } else {
    tone(audio, master, 392, now, 0.12, "triangle", 0.08);
    tone(audio, master, 587, now + 0.11, 0.2, "triangle", 0.1);
  }
}

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

function tone(audio: AudioContext, master: GainNode, freq: number, start: number, dur: number, type: OscillatorType, peak: number) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function sweep(audio: AudioContext, master: GainNode, from: number, to: number, start: number, dur: number, peak: number) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function burst(audio: AudioContext, master: GainNode, start: number, dur: number, freq: number, peak: number) {
  if (!noise || noise.sampleRate !== audio.sampleRate) {
    const length = Math.floor(audio.sampleRate * 0.25);
    noise = audio.createBuffer(1, length, audio.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  src.buffer = noise;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(start);
  src.stop(start + dur);
}
