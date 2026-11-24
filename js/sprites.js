// Procedural pixel art: 32x48 heroes, glitch beasts and scene backdrops. No image files needed.
import { SKINS, OUTFITS } from './data/heroes.js';

const W = 32, H = 48;
const INK = '#0d0a1f', GOLD = '#ffd23f', CYAN = '#2de2e6', CREAM = '#fff7e0';
const cache = new Map();
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0')).join('');
}

// ---- tiny drawing kit on a pixel grid ----
const grid = (w, h) => Array.from({ length: h }, () => Array(w).fill(null));
const px = (g, x, y, c) => { x = Math.round(x); y = Math.round(y); if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = c; };
const rect = (g, x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(g, x + i, y + j, c); };
const ell = (g, cx, cy, rx, ry, c) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) px(g, x, y, c); };
const line = (g, x0, y0, x1, y1, c, t = 1) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; for (let a = 0; a < t; a++) for (let b = 0; b < t; b++) px(g, x + a, y + b, c); }
};
function outline(g) {
  const h = g.length, w = g[0].length, out = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!g[y][x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy]?.[x + dx])) out.push([x, y]);
  out.forEach(([x, y]) => g[y][x] = INK);
}
function toURL(g, scale) {
  const c = mk(g[0].length * scale, g.length * scale), ctx = c.getContext('2d');
  g.forEach((row, y) => row.forEach((col, x) => { if (col) { ctx.fillStyle = col; ctx.fillRect(x * scale, y * scale, scale, scale); } }));
  return c.toDataURL();
}

// ---- hair ----
function hairBack(g, style, h, acc) {
  if (style === 0) ell(g, 16, 8, 10, 9, h);
  if (style === 1) [[9, 8], [11, 10], [20, 10], [22, 8]].forEach(([x, y], i) => { rect(g, x, y, 2, 15 - (i % 2) * 3, h); px(g, x, y + 10, acc); px(g, x + 1, y + 6, acc); });
  if (style === 2) for (let i = 0; i < 5; i++) { rect(g, 9 + i * 3, 9, 1, 13 - (i % 2) * 2, h); px(g, 9 + i * 3, 20 - (i % 2) * 2, acc); }
  if (style === 4) { ell(g, 8, 4, 4, 4, h); ell(g, 24, 4, 4, 4, h); }
}
function hairFront(g, style, h, acc, wrap) {
  if (style === 0) ell(g, 16, 5, 8, 4, h);
  if (style === 1 || style === 2) { ell(g, 16, 6, 7, 5, h); rect(g, 10, 6, 12, 2, h); }
  if (style === 3) { ell(g, 16, 6, 7, 5, wrap); rect(g, 9, 7, 14, 2, wrap); ell(g, 23, 3, 3, 3, wrap); for (let x = 10; x < 22; x += 3) rect(g, x, 5, 1, 4, acc); }
  if (style === 4) ell(g, 16, 6, 7, 4, h);
  if (style === 5) { ell(g, 16, 6, 6, 3, h); for (let x = 11; x < 21; x += 2) px(g, x, 8, CYAN); px(g, 12, 4, acc); px(g, 20, 4, acc); }
}

// ---- weapons and role details ----
const DETAILS = {
  keeper(g, c) {
    line(g, 12, 21, 21, 33, c.acc, 2);
    ell(g, 5, 28, 3, 1, '#e0c9a0'); rect(g, 3, 29, 5, 2, '#8a5a2b'); rect(g, 4, 31, 3, 2, '#6a4220'); rect(g, 3, 33, 5, 2, '#8a5a2b'); ell(g, 5, 36, 3, 1, '#e0c9a0');
    line(g, 3, 29, 7, 35, c.acc); line(g, 7, 29, 3, 35, c.acc);
    [[29, 26], [30, 30], [29, 34]].forEach(([x, y]) => { px(g, x, y, CYAN); px(g, x + 1, y + 1, CYAN); px(g, x, y + 2, CYAN); });
  },
  weaver(g, c) {
    rect(g, 6, 30, 4, 5, CYAN); rect(g, 22, 30, 4, 5, CYAN); rect(g, 7, 31, 2, 3, '#0d2a40'); rect(g, 23, 31, 2, 3, '#0d2a40');
    line(g, 26, 31, 31, 22, '#a9f6ff'); line(g, 26, 32, 31, 28, '#a9f6ff'); line(g, 6, 31, 1, 22, '#a9f6ff'); line(g, 6, 32, 0, 29, '#a9f6ff');
    for (let y = 24; y < 33; y += 3) for (let x = 11; x < 21; x += 2) px(g, x, y + (x % 4 ? 0 : 1), c.acc);
  },
  smith(g, c) {
    rect(g, 11, 24, 10, 12, '#5a3a1e'); rect(g, 11, 24, 10, 1, '#8a5a2b');
    rect(g, 11, 5, 10, 2, '#2a2250'); rect(g, 12, 5, 3, 2, CYAN); rect(g, 17, 5, 3, 2, CYAN);
    line(g, 25, 36, 27, 12, '#8a5a2b', 2); rect(g, 23, 6, 8, 6, '#9aa0b8'); rect(g, 23, 6, 8, 1, CREAM); rect(g, 29, 7, 2, 4, CYAN);
    px(g, 13, 27, GOLD); px(g, 18, 30, GOLD);
  },
  navigator(g) {
    rect(g, 7, 21, 3, 22, '#2a2250'); rect(g, 22, 21, 3, 22, '#2a2250');
    [[8, 25], [9, 33], [23, 28], [24, 38], [12, 26], [19, 29], [14, 33]].forEach(([x, y]) => px(g, x, y, CREAM));
    line(g, 27, 45, 27, 10, '#8a5a2b', 2); rect(g, 26, 3, 3, 9, GOLD); rect(g, 23, 6, 9, 3, GOLD); rect(g, 26, 6, 3, 3, CREAM);
  },
  archer(g, c) {
    rect(g, 21, 17, 3, 10, '#8a5a2b'); [[21, 15], [23, 14]].forEach(([x, y]) => rect(g, x, y, 1, 3, CREAM));
    for (let a = -70; a <= 70; a += 5) { const r = a * Math.PI / 180; px(g, 27 + 4 * Math.cos(r) * 1.1, 28 + 13 * Math.sin(r), a % 10 ? '#ffe27a' : '#ffffff'); }
    line(g, 29, 17, 29, 39, CREAM); line(g, 8, 22, 22, 34, c.acc);
  },
  runner(g, c) {
    rect(g, 20, 20, 10, 2, '#2de2e6'); rect(g, 27, 22, 4, 7, '#1ab5ba'); rect(g, 29, 29, 2, 3, '#2de2e6');
    line(g, 25, 33, 29, 18, '#c9f6ff', 2); line(g, 29, 18, 31, 20, '#c9f6ff'); px(g, 29, 17, '#fff');
    for (let x = 11; x < 21; x++) { px(g, x, 27 + (x % 2 ? 0 : 1), c.acc); px(g, x, 30 + (x % 2 ? 1 : 0), c.acc); }
  },
  healer() {},
  builder(g, c) {
    rect(g, 8, 21, 3, 3, '#9aa0b8'); rect(g, 22, 21, 3, 3, '#9aa0b8');
    rect(g, 0, 24, 9, 13, '#8a5a2b'); rect(g, 0, 24, 9, 1, CREAM); rect(g, 0, 36, 9, 1, '#6a4220');
    line(g, 4, 25, 1, 30, c.acc); line(g, 4, 25, 7, 30, c.acc); line(g, 1, 30, 4, 35, c.acc); line(g, 7, 30, 4, 35, c.acc);
    line(g, 26, 36, 26, 22, '#8a5a2b', 2); rect(g, 23, 19, 7, 5, '#9aa0b8'); rect(g, 23, 19, 7, 1, CREAM);
    for (let y = 24; y < 33; y += 4) for (let x = 11; x < 21; x += 4) rect(g, x, y, 3, 1, shade(c.o, .75));
  }
};
DETAILS.healer = (g) => {
  line(g, 27, 45, 27, 14, '#8a5a2b', 2); ell(g, 27, 11, 3, 3, '#5fe36b'); px(g, 26, 10, '#d9ffd0'); px(g, 24, 8, '#5fe36b'); px(g, 30, 8, '#5fe36b');
  rect(g, 21, 32, 4, 4, '#8a5a2b'); rect(g, 22, 31, 2, 1, '#5fe36b');
  [[12, 25], [18, 27], [14, 31], [19, 24], [16, 29]].forEach(([x, y]) => { px(g, x, y, '#5fe36b'); px(g, x + 1, y, '#a9ffa0'); });
};

// ---- hero builder: chibi "hi-bit" style on a 48x66 grid; weapons drawn on the old 32x48 grid and scaled 1.5x ----
function hairBack2(g, st, h, hl, acc) {
  if (st === 0) { ell(g, 24, 13, 17, 15, h); ell(g, 18, 6, 6, 3, hl); }
  if (st === 1) for (let i = 0; i < 5; i++) { const xl = 10 + i * 2, xr = 37 - i * 2; rect(g, xl - (i % 2), 14, 3, 18 - i * 2, h); rect(g, xr - (i % 2), 14, 3, 18 - i * 2, h); px(g, xl - (i % 2) + 1, 26 - i, acc); px(g, xr - (i % 2) + 1, 26 - i, acc); }
  if (st === 2) for (let i = 0; i < 9; i++) { const x = 11 + i * 3; rect(g, x, 12, 2, 20 - (i % 3) * 3, h); px(g, x, 28 - (i % 3) * 3, acc); px(g, x + 1, 24 - (i % 2) * 3, hl); }
  if (st === 4) { ell(g, 10, 7, 7, 7, h); ell(g, 38, 7, 7, 7, h); ell(g, 8, 5, 2, 2, hl); ell(g, 36, 5, 2, 2, hl); }
}
function hairFront2(g, st, h, hl, acc, wrap) {
  if (st === 0) { ell(g, 24, 10, 14, 6, h); for (let i = 0; i < 6; i++) px(g, 14 + i * 4, 6 + (i % 2), hl); }
  if (st === 1 || st === 2) { ell(g, 24, 10, 13, 6, h); rect(g, 12, 10, 24, 3, h); px(g, 17, 7, hl); px(g, 21, 6, hl); px(g, 27, 6, hl); px(g, 31, 7, hl); }
  if (st === 3) { ell(g, 24, 10, 13, 6, wrap); rect(g, 11, 11, 26, 3, wrap); ell(g, 35, 5, 6, 5, wrap); ell(g, 34, 4, 2, 2, hl); for (let x = 13; x < 36; x += 4) { rect(g, x, 7, 2, 6, acc); } rect(g, 11, 13, 26, 1, shade(wrap, .6)); }
  if (st === 4) { ell(g, 24, 10, 13, 5, h); px(g, 20, 7, hl); px(g, 28, 7, hl); }
  if (st === 5) { ell(g, 24, 10, 12, 5, h); rect(g, 12, 11, 24, 2, h); for (let x = 14; x < 34; x += 2) px(g, x, 12, CYAN); px(g, 19, 8, hl); px(g, 29, 8, hl); rect(g, 12, 15, 2, 3, h); rect(g, 34, 15, 2, 3, h); }
}

export function spriteURL(hero, scale = 3) {
  const key = ['h2', hero.cls, hero.skin, hero.hair || 0, hero.outfit, scale].join('|');
  if (cache.has(key)) return cache.get(key);
  const o = OUTFITS[hero.outfit % OUTFITS.length], skin = SKINS[hero.skin % SKINS.length];
  const sk2 = shade(skin, .74), sk3 = shade(skin, 1.18), hair = '#1a1226', hl = '#4a3a6a';
  const oL = shade(o, 1.25), oD = shade(o, .7), oDD = shade(o, .5), pants = '#2a2250', pantsL = '#3a3270';
  const g = grid(48, 66);
  // hair behind
  hairBack2(g, hero.hair || 0, hair, hl, GOLD);
  // legs and boots
  rect(g, 17, 50, 6, 10, pants); rect(g, 25, 50, 6, 10, pants); rect(g, 17, 50, 2, 10, pantsL); rect(g, 25, 50, 2, 10, pantsL);
  rect(g, 15, 59, 9, 5, '#4a2e1a'); rect(g, 24, 59, 9, 5, '#4a2e1a'); rect(g, 15, 59, 9, 2, '#7a4a28'); rect(g, 24, 59, 9, 2, '#7a4a28'); rect(g, 15, 63, 9, 1, '#2a1a0e'); rect(g, 24, 63, 9, 1, '#2a1a0e'); px(g, 19, 60, GOLD); px(g, 28, 60, GOLD);
  // arms and torso
  rect(g, 11, 33, 5, 14, o); rect(g, 11, 33, 2, 14, oL); rect(g, 32, 33, 5, 14, oD); rect(g, 11, 43, 5, 1, oDD); rect(g, 32, 43, 5, 1, oDD);
  ell(g, 13.5, 48, 2.4, 2.4, skin); ell(g, 34.5, 48, 2.4, 2.4, sk2); px(g, 12, 47, sk3);
  rect(g, 15, 31, 18, 19, o); rect(g, 15, 31, 4, 19, oL); rect(g, 29, 31, 4, 19, oD); rect(g, 15, 43, 18, 1, oD);
  rect(g, 15, 47, 18, 3, oDD); rect(g, 15, 47, 18, 1, shade(o, .6)); rect(g, 22, 46, 4, 4, GOLD); rect(g, 23, 47, 2, 2, '#b8870a');
  for (let x = 17; x < 31; x += 3) { px(g, x, 33, GOLD); px(g, x + 1, 33, GOLD); }
  for (let y = 36; y < 44; y += 3) { px(g, 17, y, CYAN); px(g, 30, y + 1, CYAN); px(g, 18, y, CYAN); }
  px(g, 21, 38, oL); px(g, 26, 40, oL); px(g, 23, 36, oL);
  // neck, ears, head
  rect(g, 21, 28, 6, 5, sk2);
  ell(g, 11.5, 20, 2.2, 3, skin); ell(g, 36.5, 20, 2.2, 3, sk2); px(g, 11, 20, sk2);
  ell(g, 24, 19, 12, 11.5, skin);
  // face shading: right side and chin
  for (let y = 8; y < 31; y++) for (let x = 33; x < 37; x++) if (g[y][x] === skin) g[y][x] = sk2;
  for (let x = 17; x < 31; x++) if (g[29]?.[x] === skin) g[29][x] = sk2;
  px(g, 17, 14, sk3); px(g, 18, 13, sk3);
  // eyes: sclera, iris, pupil, sparkle
  [16, 28].forEach(x => {
    rect(g, x, 17, 5, 6, '#ffffff'); rect(g, x + 1, 18, 3, 5, '#3a1e0a'); rect(g, x + 2, 19, 2, 3, INK);
    px(g, x + 1, 18, '#ffffff'); px(g, x + 2, 18, '#ffffff'); px(g, x + 3, 22, '#ffd9a0'); rect(g, x, 16, 5, 1, INK);
  });
  // brows, nose, mouth, blush
  rect(g, 16, 14, 5, 1, hair); px(g, 15, 15, hair); rect(g, 28, 14, 5, 1, hair); px(g, 33, 15, hair);
  px(g, 23, 24, sk2); px(g, 24, 25, sk2); px(g, 22, 25, sk3);
  rect(g, 20, 27, 8, 1, '#5a1a1a'); px(g, 19, 26, '#5a1a1a'); px(g, 28, 26, '#5a1a1a'); rect(g, 21, 28, 6, 1, '#c24a4a'); rect(g, 22, 27, 4, 1, '#ffffff');
  rect(g, 14, 24, 3, 2, '#ff8a8a'); rect(g, 31, 24, 3, 2, '#e07070');
  hairFront2(g, hero.hair || 0, hair, hl, GOLD, shade(o, 1.1));
  // weapon layer (32x48 → x1.5)
  const wg = grid(32, 48); (DETAILS[hero.cls] || DETAILS.keeper)(wg, { acc: GOLD, o });
  const wl = grid(48, 66);
  for (let y = 0; y < 66; y++) for (let x = 0; x < 48; x++) { const c = wg[Math.floor((y + 4) / 1.5)]?.[Math.floor(x / 1.5)]; if (c) wl[y][x] = c; }
  for (let y = 0; y < 66; y++) for (let x = 0; x < 48; x++) if (wl[y][x]) g[y][x] = wl[y][x];
  outline(g);
  // glow around bright weapon colors
  const glowCols = { [CYAN]: 'rgba(45,226,230,.35)', '#5fe36b': 'rgba(95,227,107,.35)', '#a9f6ff': 'rgba(169,246,255,.3)', '#ffe27a': 'rgba(255,226,122,.35)' };
  const add = [];
  for (let y = 0; y < 66; y++) for (let x = 0; x < 48; x++) if (!g[y][x]) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]) { const n = wl[y + dy]?.[x + dx]; if (n && glowCols[n]) { add.push([x, y, glowCols[n]]); break; } }
  add.forEach(([x, y, c]) => g[y][x] = c);
  // ground shadow
  for (let x = 12; x < 36; x++) for (let y = 64; y < 66; y++) if (!g[y][x]) g[y][x] = 'rgba(0,0,0,.35)';
  const url = toURL(g, scale);
  cache.set(key, url);
  return url;
}

export const spriteHTML = (hero, w = 48, cls = '') =>
  `<img class="spr ${cls}" src="${spriteURL(hero, 3)}" width="${w}" height="${Math.round(w * 66 / 48)}" alt="">`;

// ---- glitch beasts ----
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function beastURL(seed = 1, scale = 4) {
  const key = 'beast|' + seed + '|' + scale;
  if (cache.has(key)) return cache.get(key);
  const R = rng(seed * 131 + 7), g = grid(24, 24), cols = ['#ff2fd2', '#7a2cff', '#2de2e6', '#1a1040'];
  for (let y = 3; y < 22; y++) for (let x = 0; x < 12; x++) {
    const d = Math.hypot((11.5 - x) / 11, (y - 13) / 10);
    if (d < .85 && R() > d * .8) { const c = cols[Math.floor(R() * 3)]; g[y][x] = c; g[y][23 - x] = c; }
  }
  for (let y = 0; y < 24; y++) if (R() < .22) { const s = R() < .5 ? -2 : 2, row = g[y].slice(); g[y] = g[y].map((_, x) => row[x - s] ?? null); }
  rect(g, 8, 10, 2, 2, '#ffe27a'); rect(g, 14, 10, 2, 2, '#ffe27a'); px(g, 9, 11, '#ff3b5c'); px(g, 14, 11, '#ff3b5c');
  for (let x = 9; x < 15; x += 2) px(g, x, 16, '#fff');
  outline(g);
  const url = toURL(g, scale);
  cache.set(key, url);
  return url;
}

// ---- backdrops ----
const THEMES = {
  skycity: { sky: ['#2a1260', '#5a1f7a', '#b02f7a', '#ff6a4a', '#ffb347'], sun: [.7, .52, 8, '#ffe27a'] },
  rail:    { sky: ['#1a1450', '#3a2a8a', '#7a3aa0', '#e0507a', '#ffa347'], sun: [.2, .55, 7, '#fff0a0'] },
  market:  { sky: ['#ff9a3d', '#ffb347', '#ffd27a', '#ffe8a8', '#fff3c8'], sun: [.82, .24, 7, '#fffbe0'] },
  weave:   { sky: ['#04100f', '#06201a', '#08301f', '#0a4026', '#0c5030'] },
  hall:    { sky: ['#14082e', '#1d0c45', '#2b1160', '#3a1a7a', '#4a2296'] }
};

export function backdropURL(theme, seed = 1) {
  const key = 'bd|' + theme + '|' + seed;
  if (cache.has(key)) return cache.get(key);
  const T = THEMES[theme] || THEMES.skycity, BW = 160, BH = 64, R = rng(seed * 7919 + theme.length);
  const c = mk(BW, BH), g = c.getContext('2d');
  const r = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h)); };
  const hz = Math.floor(BH * .66);
  T.sky.forEach((col, i) => {
    const y0 = Math.floor(hz * i / T.sky.length), y1 = Math.floor(hz * (i + 1) / T.sky.length);
    r(col, 0, y0, BW, y1 - y0 + 1);
    if (i < T.sky.length - 1) for (let x = (y1 % 2); x < BW; x += 2) r(T.sky[i + 1], x, y1 - 1, 1, 1);
  });
  if (T.sun) { const [sx, sy, sr, sc] = T.sun; for (let y = -sr; y <= sr; y++) for (let x = -sr; x <= sr; x++) if (x * x + y * y <= sr * sr) r(sc, sx * BW + x, sy * BH + y, 1, 1); }
  const tower = (x, base, w, h, body, glow) => {
    r(body, x, base - h, w, h); r(shade(body, 1.3), x, base - h, w, 1); r(body, x + w / 2 - 2, base - h - 5, 4, 5); r(GOLD, x + w / 2 - 1, base - h - 8, 2, 3);
    for (let y = base - h + 4; y < base - 3; y += 5) for (let k = 2; k < w - 2; k += 4) r(R() < .6 ? glow : shade(body, .7), x + k, y, 2, 2);
  };
  if (theme === 'skycity' || theme === 'rail') {
    for (let i = 0; i < 6; i++) { const x = 8 + i * 28 + R() * 8, w = 8 + Math.floor(R() * 8), h = 14 + Math.floor(R() * 22); tower(x, 54 - (i % 2) * 4, w, h, i % 2 ? '#3a1a6a' : '#2a1250', '#ffe27a'); }
    r('#2a1250', 0, 54, BW, 10); for (let x = 0; x < BW; x += 6) r('#3a1a6a', x, 54, 3, 1);
    if (theme === 'rail') { for (let x = 0; x < BW; x++) r('#c9d1e6', x, 52 + Math.sin(x / 20) * 2, 1, 1); for (let x = 0; x < BW; x += 8) r('#8a8aa8', x, 54, 1, 6); }
    for (let i = 0; i < 4; i++) r('rgba(255,255,255,.2)', R() * BW, 6 + R() * 18, 14 + R() * 12, 2);
  }
  if (theme === 'market') {
    r('#c9843a', 0, 50, BW, 14); for (let x = 0; x < BW; x += 4) r('#b6702e', x, 52, 2, 1);
    const aw = ['#ff3b5c', '#2de2e6', '#ffd23f', '#b266ff', '#5fe36b'];
    for (let i = 0; i < 5; i++) { const x = 4 + i * 31; r(aw[i], x, 30, 26, 6); for (let k = 0; k < 26; k += 4) r(CREAM, x + k, 30, 2, 6); r('#6a4220', x + 1, 36, 2, 16); r('#6a4220', x + 23, 36, 2, 16); r('#8a5a2b', x + 3, 44, 20, 4); r(GOLD, x + 6, 41, 3, 3); r('#ff8a1f', x + 12, 41, 3, 3); r('#5fe36b', x + 17, 41, 3, 3); r(GOLD, x + 12, 26, 2, 3); }
  }
  if (theme === 'weave') {
    for (let x = 0; x < BW; x += 3) { const len = 6 + Math.floor(R() * 30), y0 = Math.floor(R() * 40); for (let y = 0; y < len; y++) r(y === len - 1 ? '#d9ffd0' : `rgba(95,227,107,${0.15 + y / len * .8})`, x, (y0 + y) % BH, 1, 1); }
    r('#052018', 0, 52, BW, 12); for (let x = 0; x < BW; x += 10) r('rgba(95,227,107,.3)', x, 52, 1, 12); for (let y = 52; y < 64; y += 4) r('rgba(95,227,107,.3)', 0, y, BW, 1);
  }
  if (theme === 'hall') {
    for (let i = 0; i < 5; i++) { const x = 8 + i * 36; r('#2a1260', x, 8, 6, 44); r('#4a2296', x, 8, 6, 1); r(GOLD, x + 2, 20, 2, 2); }
    r('#2a1250', 0, 50, BW, 14); for (let a = 0; a < 40; a++) { const t = a / 40 * 6.28; r(a % 2 ? GOLD : CYAN, 80 + Math.cos(t) * 40, 56 + Math.sin(t) * 5, 1, 1); }
    r('#6a4220', 68, 28, 24, 24); r('#8a5a2b', 68, 28, 24, 2); r('#e0c9a0', 70, 22, 20, 8); r(CREAM, 72, 23, 16, 2);
    for (let i = 0; i < 5; i++) r(GOLD, 70 + i * 5, 34, 2, 14);
  }
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}
