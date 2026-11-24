// Tiny chiptune blips with WebAudio. No audio files.
let ctx = null, muted = false;
try { muted = localStorage.getItem('kq-mute') === '1'; } catch (e) {}

function ac() {
  if (muted) return null;
  try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { return null; }
  return ctx;
}

function tone(freq, start, dur, type = 'square', vol = 0.05) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, a.currentTime + start);
  g.gain.setValueAtTime(vol, a.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g); g.connect(a.destination);
  o.start(a.currentTime + start); o.stop(a.currentTime + start + dur + 0.02);
}

const seq = (notes, step = 0.09, type = 'square') => notes.forEach((n, i) => n && tone(n, i * step, step * 1.4, type));

export const sfx = {
  blip: () => tone(660, 0, 0.06),
  select: () => seq([523, 784], 0.07),
  back: () => seq([392, 262], 0.07),
  type: () => tone(300 + Math.random() * 120, 0, 0.025, 'square', 0.02),
  join: () => seq([392, 523, 659], 0.08),
  ready: () => seq([523, 659, 784, 1047], 0.07),
  start: () => seq([262, 330, 392, 523, 392, 523, 784], 0.1),
  roll: () => tone(200 + Math.random() * 400, 0, 0.04, 'square', 0.03),
  great: () => seq([523, 659, 784, 1047, 784, 1047, 1319], 0.08),
  ok: () => seq([523, 659, 784], 0.1),
  oops: () => seq([392, 330, 262, 196], 0.13, 'sawtooth'),
  chaos: () => seq([784, 659, 784, 988, 784, 988, 1175], 0.06),
  win: () => seq([523, 523, 523, 659, 784, 0, 659, 784, 1047], 0.11)
};

export const isMuted = () => muted;
export function setMuted(v) { muted = v; try { localStorage.setItem('kq-mute', v ? '1' : '0'); } catch (e) {} }
