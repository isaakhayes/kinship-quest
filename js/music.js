// Generative Afrobeat for Kinship Quest. No audio files: everything is synthesized with WebAudio.
// Core idea: the 12/8 "standard bell pattern" used across West African music, with djembe-style
// bass/tone/slap drums, a kalimba-like melody on a pentatonic scale, and a bass line. Each mood
// changes tempo, scale, density and which instruments play.
import { isMuted } from './audio.js';

const BELL = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];            // 12-step bell pattern
const MOODS = {
  calm:   { bpm: 92,  root: 55.0,  scale: [0, 3, 5, 7, 10], bass: .8, kal: .55, bell: .5, shaker: .5, kick: 1, pad: 0 },
  market: { bpm: 104, root: 61.74, scale: [0, 2, 4, 7, 9],  bass: .9, kal: .7,  bell: .8, shaker: .8, kick: 1, pad: 0 },
  night:  { bpm: 88,  root: 49.0,  scale: [0, 3, 5, 7, 10], bass: .9, kal: .5,  bell: .4, shaker: .3, kick: .7, pad: .6 },
  hall:   { bpm: 100, root: 55.0,  scale: [0, 2, 3, 7, 8],  bass: 1,  kal: .6,  bell: .7, shaker: .6, kick: 1, pad: .8 },
  battle: { bpm: 132, root: 58.27, scale: [0, 3, 5, 6, 10], bass: 1,  kal: .8,  bell: 1,  shaker: 1,  kick: 1, pad: 0 },
  win:    { bpm: 116, root: 65.41, scale: [0, 2, 4, 7, 9],  bass: .8, kal: 1,   bell: .9, shaker: .9, kick: 1, pad: .5 }
};
export const MOOD_BY_THEME = { skycity: 'calm', rail: 'night', night: 'night', market: 'market', weave: 'battle', hall: 'hall' };

let musicOffFlag = false;
try { musicOffFlag = localStorage.getItem('kq-nomusic') === '1'; } catch (e) {}
const musicOff = () => musicOffFlag;
let ctx = null, master = null, noiseBuf = null, mood = 'calm', timer = null, step = 0, nextT = 0, on = false, bar = 0;

function ac() {
  if (isMuted()) return null;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    if (!master) {
      master = ctx.createGain(); master.gain.value = 0.55;
      const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
  } catch (e) { return null; }
  return ctx;
}

const mtof = (root, semis, oct = 0) => root * Math.pow(2, (semis + 12 * oct) / 12);

function env(g, t, a, d, peak) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }

function kick(t, v) { // djembe bass
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(48, t + .12);
  env(g, t, .005, .28, .7 * v); o.connect(g); g.connect(master); o.start(t); o.stop(t + .35);
}
function noise(t, dur, freq, q, vol, type = 'bandpass') { // djembe tone / slap / shaker
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
  env(g, t, .003, dur, vol); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
}
function bell(t, freq, vol) { // gankogui-like double bell
  [1, 1.51].forEach((m, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = freq * m; env(g, t, .002, .09, vol * (i ? .5 : 1)); o.connect(g); g.connect(master); o.start(t); o.stop(t + .14); });
}
function pluck(t, freq, vol, dur = .5) { // kalimba
  const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = freq; o2.frequency.value = freq * 4;
  env(g, t, .004, dur, vol); const g2 = ctx.createGain(); g2.gain.value = .25; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
  o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
}
function bass(t, freq, vol, dur) {
  const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = freq; f.type = 'lowpass'; f.frequency.value = 500;
  env(g, t, .01, dur, vol); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
}
function pad(t, root, scale, vol, dur) {
  [0, 2, 4].forEach(i => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = mtof(root, scale[i % scale.length], 2) ; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * .4); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05); });
}

const MEL = [[0, 2, 4, 2, 1, 3, 2, 0], [4, 3, 2, 3, 1, 0, 1, 2], [0, 1, 2, 4, 3, 2, 1, 3], [2, 4, 3, 1, 2, 0, 1, 0]];

function schedule() {
  const m = MOODS[mood], spb = 60 / m.bpm, sixteenth = spb / 3;   // 12 steps per bar: 4 beats x 3
  while (nextT < ctx.currentTime + .25) {
    const s = step % 12, t = nextT, scale = m.scale;
    // drums
    if ((s === 0 || s === 6 || (s === 9 && m.kick > .9)) && Math.random() < m.kick) kick(t, s === 0 ? 1 : .7);
    if ((s === 3 || s === 9) && m.shaker > 0) noise(t, .09, 380, 2.2, .35);                 // djembe tone
    if ((s === 4 || s === 10 || (s === 7 && m.shaker > .8)) && m.shaker > .3) noise(t, .05, 2200, 3, .22); // slap
    if (m.shaker > .6 && s % 2 === 0) noise(t, .03, 7000, 1, .08 * m.shaker, 'highpass');   // shaker
    if (BELL[s] && Math.random() < m.bell + .1) bell(t, mtof(m.root, scale[2], 4), .09 * m.bell);
    // bass
    if (s % 3 === 0 && m.bass) { const deg = [0, 0, 3, 2, 0, 4, 3, 2][(bar * 4 + s / 3) % 8]; bass(t, mtof(m.root, scale[deg % scale.length], 1), .35 * m.bass, spb * .9); }
    // kalimba melody on 8th triplets
    if (s % 3 !== 1 && Math.random() < m.kal) { const mel = MEL[bar % 4], idx = mel[(step >> 1) % 8]; pluck(t, mtof(m.root, scale[idx % scale.length], 3 + (idx > 3 ? 1 : 0)), .12 * m.kal, spb * 1.2); }
    if (s === 0 && m.pad && bar % 2 === 0) pad(t, m.root, scale, .05 * m.pad, spb * 6);
    nextT += sixteenth; step++; if (step % 12 === 0) bar++;
  }
}

export const musicEnabled = () => !musicOffFlag;
export function setMusic(v) { musicOffFlag = !v; try { localStorage.setItem('kq-nomusic', v ? '0' : '1'); } catch (e) {} }
export const music = {
  start() { if (on) return; if (!ac()) return; on = true; nextT = ctx.currentTime + .1; step = 0; bar = 0; timer = setInterval(() => { if (isMuted() || musicOff()) return; if (ac()) { if (nextT < ctx.currentTime - .3) nextT = ctx.currentTime + .05; schedule(); } }, 80); },
  stop() { on = false; clearInterval(timer); timer = null; },
  setMood(name) { if (MOODS[name] && name !== mood) { mood = name; } },
  get mood() { return mood; },
  get running() { return on; }
};

// Offline render for tests: returns the peak amplitude, so a headless test can prove it is not silent.
export async function renderTest(name = 'market', seconds = 4) {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, rate = 22050;
  const saved = { ctx, master, noiseBuf, mood };
  const off = new OAC(1, rate * seconds, rate);
  ctx = off; master = off.createGain(); master.gain.value = .55; master.connect(off.destination);
  noiseBuf = off.createBuffer(1, rate, rate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  mood = name; const m = MOODS[mood], sixteenth = 60 / m.bpm / 3, total = Math.floor(seconds / sixteenth);
  for (let i = 0; i < total; i++) {
    const t = i * sixteenth, s = i % 12, scale = m.scale, spb = 60 / m.bpm;
    if (s === 0 || s === 6) kick(t, 1);
    if (s === 3 || s === 9) noise(t, .09, 380, 2.2, .35);
    if (BELL[s]) bell(t, mtof(m.root, scale[2], 4), .09);
    if (s % 3 === 0) bass(t, mtof(m.root, scale[0], 1), .35, spb * .9);
    if (s % 3 !== 1) pluck(t, mtof(m.root, scale[(s >> 1) % scale.length], 3), .12, spb);
  }
  const buf = await off.startRendering(); const data = buf.getChannelData(0); let peak = 0; for (const v of data) peak = Math.max(peak, Math.abs(v));
  ({ ctx, master, noiseBuf, mood } = saved);
  return peak;
}
