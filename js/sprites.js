// Procedural pixel art: 32x48 heroes, glitch beasts and scene backdrops. No image files needed.
import { SKINS, OUTFITS, GLOWS } from './data/heroes.js';

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
  const key = ['h3', hero.cls, hero.skin, hero.hair || 0, hero.outfit, hero.trim ?? 2, hero.pattern || 0, hero.acc || 0, hero.glow ?? -1, scale].join('|');
  if (cache.has(key)) return cache.get(key);
  const o = OUTFITS[hero.outfit % OUTFITS.length], skin = SKINS[hero.skin % SKINS.length];
  const sk2 = shade(skin, .74), sk3 = shade(skin, 1.18), hair = '#1a1226', hl = '#4a3a6a';
  const oL = shade(o, 1.25), oD = shade(o, .7), oDD = shade(o, .5), pants = '#2a2250', pantsL = '#3a3270';
  const g = grid(48, 66);
  const tr = OUTFITS[(hero.trim ?? 2) % OUTFITS.length], pat = hero.pattern || 0, acc = hero.acc || 0, glowC = hero.glow != null ? GLOWS[hero.glow % GLOWS.length][0] : null;
  if (acc === 7) { rect(g, 10, 32, 28, 26, shade(tr, .6)); rect(g, 10, 32, 28, 2, tr); rect(g, 12, 50, 24, 1, shade(tr, .45)); }
  // hair behind
  hairBack2(g, hero.hair || 0, hair, hl, tr);
  // legs and boots
  rect(g, 17, 50, 6, 10, pants); rect(g, 25, 50, 6, 10, pants); rect(g, 17, 50, 2, 10, pantsL); rect(g, 25, 50, 2, 10, pantsL);
  rect(g, 15, 59, 9, 5, '#4a2e1a'); rect(g, 24, 59, 9, 5, '#4a2e1a'); rect(g, 15, 59, 9, 2, '#7a4a28'); rect(g, 24, 59, 9, 2, '#7a4a28'); rect(g, 15, 63, 9, 1, '#2a1a0e'); rect(g, 24, 63, 9, 1, '#2a1a0e'); px(g, 19, 60, GOLD); px(g, 28, 60, GOLD);
  // arms and torso
  rect(g, 11, 33, 5, 14, o); rect(g, 11, 33, 2, 14, oL); rect(g, 32, 33, 5, 14, oD); rect(g, 11, 43, 5, 1, oDD); rect(g, 32, 43, 5, 1, oDD);
  ell(g, 13.5, 48, 2.4, 2.4, skin); ell(g, 34.5, 48, 2.4, 2.4, sk2); px(g, 12, 47, sk3);
  rect(g, 15, 31, 18, 19, o); rect(g, 15, 31, 4, 19, oL); rect(g, 29, 31, 4, 19, oD); rect(g, 15, 43, 18, 1, oD);
  rect(g, 15, 47, 18, 3, oDD); rect(g, 15, 47, 18, 1, shade(o, .6)); rect(g, 22, 46, 4, 4, tr); rect(g, 23, 47, 2, 2, shade(tr, .7));
  for (let x = 17; x < 31; x += 3) { px(g, x, 33, tr); px(g, x + 1, 33, tr); }
  if (pat) for (let y = 34; y < 47; y++) for (let x = 15; x < 33; x++) { const c0 = g[y][x]; if (c0 !== o && c0 !== oL && c0 !== oD) continue; const on = pat === 1 ? y % 4 === 1 : pat === 2 ? (x + Math.abs((y % 6) - 3)) % 6 === 0 : pat === 3 ? ((x + y) % 8 === 0 || (x - y + 64) % 8 === 0) : (x % 4 === 1 && y % 4 === 1); if (on) g[y][x] = tr; }
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
  hairFront2(g, hero.hair || 0, hair, hl, tr, shade(o, 1.1));
  const lens = glowC || CYAN;
  if (acc === 1) { rect(g, 13, 10, 22, 4, '#2a2250'); rect(g, 14, 11, 8, 2, lens); rect(g, 26, 11, 8, 2, lens); px(g, 15, 11, '#fff'); px(g, 27, 11, '#fff'); }
  if (acc === 2) { rect(g, 12, 9, 24, 3, tr); for (let x = 14; x < 34; x += 4) px(g, x, 10, shade(tr, .6)); }
  if (acc === 3) { rect(g, 15, 3, 18, 6, GOLD); for (let x = 15; x < 33; x += 6) rect(g, x, 0, 3, 4, GOLD); px(g, 24, 5, '#ff3b5c'); px(g, 18, 5, CYAN); px(g, 30, 5, CYAN); }
  if (acc === 4) { rect(g, 10, 23, 2, 4, tr); rect(g, 36, 23, 2, 4, tr); px(g, 10, 27, GOLD); px(g, 37, 27, GOLD); }
  if (acc === 5) { rect(g, 14, 22, 5, 1, tr); rect(g, 29, 22, 5, 1, tr); rect(g, 14, 24, 4, 1, tr); rect(g, 30, 24, 4, 1, tr); px(g, 24, 11, tr); px(g, 23, 12, tr); px(g, 24, 12, tr); }
  if (acc === 6) { rect(g, 17, 29, 14, 4, tr); rect(g, 17, 29, 14, 1, shade(tr, 1.2)); rect(g, 29, 32, 4, 11, tr); rect(g, 29, 41, 4, 2, shade(tr, .7)); }
  if (acc === 8) { rect(g, 10, 31, 7, 4, shade(tr, 1.1)); rect(g, 31, 31, 7, 4, shade(tr, .85)); rect(g, 10, 31, 7, 1, shade(tr, 1.4)); px(g, 13, 33, shade(tr, .6)); px(g, 34, 33, shade(tr, .5)); }
  // weapon layer (32x48 → x1.5)
  const wg = grid(32, 48); (DETAILS[hero.cls] || DETAILS.keeper)(wg, { acc: tr, o });
  const wl = grid(48, 66);
  for (let y = 0; y < 66; y++) for (let x = 0; x < 48; x++) { let c = wg[Math.floor((y + 4) / 1.5)]?.[Math.floor(x / 1.5)]; if (c && glowC) { if (c === CYAN || c === '#5fe36b' || c === '#1ab5ba') c = glowC; else if (c === '#a9f6ff' || c === '#c9f6ff' || c === '#d9ffd0' || c === '#a9ffa0') c = shade(glowC, 1.4); } if (c) wl[y][x] = c; }
  for (let y = 0; y < 66; y++) for (let x = 0; x < 48; x++) if (wl[y][x]) g[y][x] = wl[y][x];
  outline(g);
  // glow around bright weapon colors
  const rg = h => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},.35)`; };
  const glowCols = { [CYAN]: rg(CYAN), '#5fe36b': rg('#5fe36b'), '#a9f6ff': rg('#a9f6ff'), '#ffe27a': rg('#ffe27a') };
  if (glowC) { glowCols[glowC] = rg(glowC); glowCols[shade(glowC, 1.4)] = rg(glowC); }
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
  skycity: { sky: ['#14206a', '#2a2f8a', '#a8322a', '#e8782a', '#f6c453'], sun: [.7, .52, 8, '#fff0a8'] },
  rail:    { sky: ['#0e1650', '#24378a', '#7a3a7a', '#d8502a', '#f0a030'], sun: [.2, .55, 7, '#fff0a0'] },
  market:  { sky: ['#ff9a3d', '#ffb347', '#ffd27a', '#ffe8a8', '#fff3c8'], sun: [.82, .24, 7, '#fffbe0'] },
  weave:   { sky: ['#04100f', '#06201a', '#08301f', '#0a4026', '#0c5030'] },
  night:   { sky: ['#06041c', '#0c0838', '#1a0f5a', '#3a1a8a', '#7a2aa0'], sun: [.8, .3, 6, '#fff7e0'] },
  hall:    { sky: ['#1a0a2a', '#3a1230', '#5a1a28', '#8a2a20', '#c05a1c'] }
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
    for (let y = base - h + 6; y < base - 4; y += 7) { r(shade(body, 1.25), x - 1, y, 1, 1); r(shade(body, 1.25), x + w, y, 1, 1); }   // toron beams, like Djenne
    const by = base - h + Math.floor(h * .45); for (let k = 0; k < w; k += 2) { r(k % 4 ? '#1fb5ad' : GOLD, x + k, by, 2, 1); r(k % 4 ? GOLD : '#e0392f', x + k + (k % 4 ? 0 : 1), by + 1, 1, 1); }   // Ndebele-style band
    for (let y = base - h + 4; y < base - 3; y += 5) for (let k = 2; k < w - 2; k += 4) r(R() < .6 ? glow : shade(body, .7), x + k, y, 2, 2);
  };
  if (theme === 'night') {
    for (let i = 0; i < 40; i++) r(i % 5 ? '#fff7e0' : '#2de2e6', R() * BW, R() * 38, 1, 1);
    for (let i = 0; i < 7; i++) { const x = i * 24 + R() * 8, h = 12 + R() * 24; r('#1a0f4a', x, 54 - h, 14, h + 10); for (let y = 54 - h + 3; y < 56; y += 5) for (let k = 2; k < 12; k += 4) if (R() < .5) r('#ffe27a', x + k, y, 2, 2); }
    r('#0c0838', 0, 56, BW, 8); for (let x = 0; x < BW; x += 2) r(x % 4 ? '#2de2e6' : '#a9f6ff', x, 30 + Math.sin(x / 24) * 3, 2, 1);
  }
  if (theme === 'skycity' || theme === 'rail') {
    for (let i = 0; i < 6; i++) { const x = 8 + i * 28 + R() * 8, w = 8 + Math.floor(R() * 8), h = 14 + Math.floor(R() * 22); tower(x, 54 - (i % 2) * 4, w, h, i % 2 ? '#7a2e1c' : '#1d2a74', '#ffe27a'); }
    r('#3a1410', 0, 54, BW, 10); for (let x = 0; x < BW; x += 6) r('#7a2e1c', x, 54, 3, 1);
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
  vgaize(c, 6, 26);
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

// ---- v5: named creatures, characters and the 1990s graphics-card look ----
function glitchify(g, seed, amt = .2) {
  const R = rng(seed * 977 + 5), h = g.length, w = g[0].length, cols = ['#ff2fd2', '#2de2e6', '#7a2cff', '#ffe27a'];
  for (let y = 0; y < h; y++) if (R() < amt * .5) { const s = R() < .5 ? -2 : 2, row = g[y].slice(); g[y] = g[y].map((_, x) => row[x - s] ?? null); }
  for (let i = 0; i < w * h * .02; i++) { const x = Math.floor(R() * w), y = Math.floor(R() * h); if (g[y][x]) g[y][x] = cols[Math.floor(R() * cols.length)]; }
}
function drawHound(g) {
  const B = '#4a3a9a', B2 = '#7a62d8', B3 = '#2a1c64', E = '#ffe27a';
  ell(g, 15, 15, 11, 6, B); ell(g, 15, 13, 10, 3, B2); ell(g, 15, 19, 9, 2, B3);
  ell(g, 28, 11, 5, 5, B); ell(g, 28, 9, 4, 2, B2); rect(g, 31, 12, 5, 4, B); rect(g, 31, 12, 5, 1, B2); rect(g, 35, 12, 2, 2, INK);
  rect(g, 24, 8, 3, 7, B3); rect(g, 24, 8, 3, 1, '#ff2fd2');
  rect(g, 29, 9, 3, 3, '#fff'); rect(g, 30, 10, 2, 2, INK); px(g, 29, 9, E); px(g, 28, 7, B3); px(g, 29, 7, B3); px(g, 30, 7, B3);
  rect(g, 32, 16, 1, 1, '#fff'); rect(g, 34, 16, 1, 1, '#fff'); rect(g, 31, 15, 5, 1, '#ff3b5c');
  [[6, 19, 3, 6], [11, 20, 3, 5], [19, 20, 3, 5], [25, 19, 3, 6]].forEach(([x, y, w, h]) => { rect(g, x, y, w, h, B); rect(g, x, y + h - 1, w + 1, 1, B2); });
  line(g, 5, 12, 1, 7, B, 2); px(g, 1, 6, CYAN);
  for (let x = 10; x < 24; x += 3) { px(g, x, 9 + (x % 2), CYAN); px(g, x + 1, 9, '#ff2fd2'); }
}
function drawPup(g) {
  const Y = '#ffd23f', Y2 = '#fff0a0', Y3 = '#c98a1a';
  for (let a = 0; a < 40; a++) { const t = a / 40 * 6.28; if (a % 2) px(g, 12 + Math.cos(t) * 11, 11 + Math.sin(t) * 9, 'rgba(45,226,230,.8)'); }
  ell(g, 12, 14, 7, 5, Y); ell(g, 12, 15, 5, 3, Y2); ell(g, 12, 8, 6, 5, Y); ell(g, 12, 9, 4, 3, Y2);
  rect(g, 6, 3, 3, 5, Y3); rect(g, 15, 3, 3, 5, Y3); rect(g, 7, 3, 1, 3, '#ff6fb5'); rect(g, 16, 3, 1, 3, '#ff6fb5');
  rect(g, 8, 7, 3, 3, '#fff'); rect(g, 13, 7, 3, 3, '#fff'); rect(g, 9, 8, 2, 2, INK); rect(g, 14, 8, 2, 2, INK); px(g, 9, 8, '#fff'); px(g, 14, 8, '#fff');
  rect(g, 11, 11, 2, 1, INK); px(g, 12, 12, '#ff6fb5');
  [[7, 18], [10, 19], [14, 19], [17, 18]].forEach(([x, y]) => rect(g, x, y, 2, 3, Y3));
  line(g, 19, 14, 22, 9, Y, 2); px(g, 22, 8, CYAN); px(g, 21, 8, CYAN);
}
function drawSerpent(g) {
  // thick in the middle, tapering to a thin tail on the left; head on the right
  const pts = []; for (let i = 0; i < 36; i++) { const r = i < 14 ? 1 + i * .26 : Math.max(3, 4.6 - (i - 14) / 12); pts.push([3 + i * 1.02, 17 + Math.sin(i / 3.4 + .6) * 6.5 * Math.min(1, .4 + i / 14), r]); }
  pts.forEach(([x, y, r], i) => { ell(g, x, y, r, r, i % 4 < 2 ? '#2a8f5a' : '#1f6f48'); if (r > 2) ell(g, x, y - r * .35, r * .6, r * .3, '#5fe36b'); if (i % 3 === 0 && r > 2.5) px(g, x, y + r * .45, '#ffd23f'); });
  const [tx, ty] = pts[0]; px(g, tx - 1, ty - 1, CYAN); px(g, tx - 2, ty - 2, '#ff2fd2'); px(g, tx - 1, ty + 1, CYAN);
  const [hx, hy] = pts[pts.length - 1]; ell(g, hx + 2, hy, 5, 4, '#2a8f5a'); ell(g, hx + 2, hy - 1, 4, 2, '#5fe36b');
  rect(g, hx + 3, hy - 2, 2, 2, '#ffe27a'); px(g, hx + 4, hy - 2, '#ff3b5c'); rect(g, hx + 6, hy + 1, 3, 1, '#ff3b5c'); px(g, hx + 5, hy + 2, '#fff'); px(g, hx + 7, hy + 2, '#fff');
  for (let i = 0; i < 5; i++) px(g, hx - 5 + i * 2, hy - 6 + (i % 2), i % 2 ? CYAN : '#ff2fd2');
}
function drawCollector(g) {
  const C = '#3a1f6a', C2 = '#5a2f9a', C3 = '#1a0f3a';
  for (let y = 10; y < 28; y++) { const w = 4 + (y - 10) * .32; rect(g, 12 - w, y, w * 2, 1, y % 5 === 0 ? C2 : C); }
  rect(g, 4, 27, 16, 1, C3); ell(g, 12, 7, 5, 5, C); ell(g, 12, 8, 3, 3, C3); px(g, 10, 8, '#ff2fd2'); px(g, 14, 8, '#ff2fd2'); px(g, 10, 9, '#fff'); px(g, 14, 9, '#fff');
  rect(g, 4, 10, 3, 9, C2); line(g, 4, 18, 1, 22, '#c9d1e6', 1); line(g, 1, 22, 3, 24, '#c9d1e6', 1); px(g, 4, 17, GOLD);
  rect(g, 17, 17, 4, 4, '#8a5a2b'); rect(g, 18, 18, 2, 2, GOLD);
  rect(g, 7, 28, 4, 3, '#8a8aa8'); rect(g, 13, 28, 4, 3, '#8a8aa8'); for (let x = 6; x < 18; x += 2) px(g, x, 32, x % 4 ? CYAN : '#a9f6ff');
}
function drawMo(g) {
  const SK = '#8a5733', SK2 = '#a8703f', SK3 = '#5e3920', COAT = '#2f5fe0', COAT2 = '#6f96ff', COAT3 = '#1d3a96', KG = '#2fb25a', KR = '#e0392f';
  // coat with kente trim
  rect(g, 6, 20, 22, 18, COAT); rect(g, 6, 20, 22, 2, COAT2); rect(g, 6, 36, 22, 2, COAT3);
  for (let y = 22; y < 38; y += 3) { px(g, 16, y, GOLD); px(g, 17, y, KR); px(g, 18, y, KG); }
  rect(g, 15, 20, 4, 18, '#1d1450'); rect(g, 15, 20, 1, 18, GOLD); rect(g, 18, 20, 1, 18, GOLD);
  rect(g, 3, 21, 5, 13, COAT); rect(g, 26, 21, 5, 13, COAT); rect(g, 3, 21, 5, 1, COAT2); rect(g, 26, 21, 5, 1, COAT2);
  rect(g, 3, 34, 5, 3, SK); rect(g, 26, 34, 5, 3, SK); rect(g, 3, 34, 5, 1, SK2);
  rect(g, 4, 28, 3, 1, GOLD); rect(g, 27, 28, 3, 1, GOLD);
  // chains
  for (let x = 11; x < 23; x++) px(g, x, 19 + Math.abs(x - 17) * .5, GOLD); px(g, 17, 24, GOLD); rect(g, 16, 25, 3, 3, GOLD); px(g, 17, 26, '#fff');
  // head
  rect(g, 11, 5, 12, 14, SK); rect(g, 10, 7, 14, 9, SK); rect(g, 12, 5, 6, 2, SK2); rect(g, 22, 8, 2, 8, SK3); rect(g, 11, 17, 12, 2, SK3);
  rect(g, 9, 9, 2, 4, SK); rect(g, 23, 9, 2, 4, SK); rect(g, 9, 10, 2, 1, SK3);
  // kufi cap with kente band
  rect(g, 11, 1, 12, 5, '#c8341c'); rect(g, 12, 0, 10, 2, '#c8341c'); rect(g, 11, 4, 12, 2, GOLD); for (let x = 11; x < 23; x += 2) px(g, x, 5, KG);
  // shades with glint
  rect(g, 10, 9, 14, 4, INK); rect(g, 11, 10, 5, 2, '#1a2a6a'); rect(g, 18, 10, 5, 2, '#1a2a6a'); rect(g, 11, 10, 2, 1, CYAN); rect(g, 18, 10, 2, 1, CYAN); px(g, 12, 9, '#fff'); px(g, 19, 9, '#fff');
  // nose, grin, gold tooth, goatee
  rect(g, 16, 13, 3, 2, SK3); px(g, 15, 14, SK3); px(g, 19, 14, SK3);
  rect(g, 13, 16, 9, 2, INK); rect(g, 14, 16, 7, 1, '#fff'); px(g, 16, 16, GOLD); px(g, 17, 16, GOLD);
  rect(g, 15, 18, 5, 3, '#2a1a10'); px(g, 17, 20, '#2a1a10');
  // legs and boots
  rect(g, 9, 38, 7, 6, '#1a1450'); rect(g, 18, 38, 7, 6, '#1a1450'); rect(g, 8, 43, 9, 3, GOLD); rect(g, 17, 43, 9, 3, GOLD); rect(g, 8, 43, 9, 1, '#fff0a0');
  // glowing sword
  line(g, 31, 30, 41, 4, '#a9f6ff', 2); line(g, 32, 31, 42, 5, CYAN, 1); rect(g, 29, 29, 5, 3, GOLD); px(g, 41, 3, '#fff'); px(g, 42, 2, '#fff');
}
function drawMaglev(g) {
  const B = '#dfe6ff', B2 = '#9aa6d8', B3 = '#5a6aa8';
  rect(g, 0, 8, 44, 9, B); rect(g, 0, 8, 44, 1, '#fff'); rect(g, 0, 16, 44, 1, B2); ell(g, 44, 12, 12, 5, B); ell(g, 46, 11, 8, 3, '#fff');
  for (let x = 3; x < 40; x += 7) { rect(g, x, 10, 5, 3, '#2a1260'); rect(g, x, 10, 5, 1, CYAN); }
  rect(g, 50, 9, 6, 3, '#2a1260'); rect(g, 50, 9, 6, 1, CYAN);
  rect(g, 0, 17, 56, 1, B3); for (let x = 0; x < 56; x++) px(g, x, 19 + (x % 2), x % 3 ? CYAN : '#a9f6ff'); for (let x = 2; x < 56; x += 4) px(g, x, 21, 'rgba(45,226,230,.6)');
  rect(g, 6, 4, 10, 4, B2); rect(g, 6, 4, 10, 1, '#fff'); rect(g, 22, 3, 14, 5, B2); rect(g, 22, 3, 14, 1, '#fff');
  rect(g, 8, 5, 2, 3, GOLD); rect(g, 24, 4, 3, 4, GOLD);
}
const CREATURES = { hound: [38, 26, drawHound, .12], pup: [24, 22, drawPup, .06], serpent: [48, 32, drawSerpent, .08], collector: [24, 34, drawCollector, .05], mo: [42, 46, drawMo, 0], maglev: [58, 24, drawMaglev, 0] };
export function creatureURL(kind, scale = 4, seed = 3) {
  const def = CREATURES[kind]; if (!def) return beastURL(seed, scale);
  const key = 'cr|' + kind + '|' + scale + '|' + seed;
  if (cache.has(key)) return cache.get(key);
  const g = grid(def[0], def[1]); def[2](g); if (def[3]) glitchify(g, seed, def[3]); outline(g);
  const url = toURL(g, scale); cache.set(key, url); return url;
}

// VGA look: snap every pixel to a coarse palette with ordered (Bayer) dithering.
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
export function vgaize(canvas, levels = 6, strength = 30) {
  const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height, d = ctx.getImageData(0, 0, w, h), a = d.data, step = 255 / (levels - 1);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, t = (BAYER[y & 3][x & 3] / 15 - .5) * strength;
    for (let c = 0; c < 3; c++) a[i + c] = Math.max(0, Math.min(255, Math.round((a[i + c] + t) / step) * step));
  }
  ctx.putImageData(d, 0, 0);
}

// ---- v6: foreground silhouettes (baobab, kente poles, grass) used as a parallax layer ----
export function foregroundURL(theme, seed = 1) {
  const key = 'fg|' + theme + '|' + seed;
  if (cache.has(key)) return cache.get(key);
  const R = rng(seed * 4099 + theme.length * 31), W2 = 256, H2 = 40, c = mk(W2, H2), g = c.getContext('2d');
  const r = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h)); };
  const tint = { skycity: '#1a0a18', rail: '#10102a', night: '#0a0a22', market: '#3a1a0a', hall: '#140818', weave: '#041208' }[theme] || '#140a18';
  const rim = { skycity: '#e8782a', rail: '#d8502a', night: '#2de2e6', market: '#ffd23f', hall: '#c05a1c', weave: '#5fe36b' }[theme] || '#e8782a';
  const baobab = (x, h) => { // fat trunk, bare flat canopy
    r(tint, x - 5, H2 - h, 10, h); r(tint, x - 7, H2 - 4, 14, 4); r(rim, x - 5, H2 - h, 1, h - 2);
    for (let b = 0; b < 5; b++) { const bx = x - 14 + b * 7, by = H2 - h - 2 - (b % 2) * 3; r(tint, bx, by, 8, 3); r(tint, x - 1, by + 2, 2, 5); r(rim, bx, by, 8, 1); }
  };
  const pole = x => { r(tint, x, 12, 2, 28); const cols = ['#e0392f', GOLD, '#2fb25a', INK]; for (let k = 0; k < 4; k++) r(cols[k], x + 2, 12 + k * 3, 7 - k, 3); r(rim, x, 12, 1, 28); };
  const tuft = x => { for (let k = 0; k < 4; k++) { r(tint, x + k * 2, H2 - 5 - (k % 2) * 3, 1, 5 + (k % 2) * 3); } };
  let x = 14; while (x < W2 - 10) { const t = R(); if (t < .22) baobab(x, 18 + Math.floor(R() * 12)); else if (t < .42 && theme !== 'weave') pole(x); else tuft(x); x += 24 + Math.floor(R() * 26); }
  r(tint, 0, H2 - 3, W2, 3); r(rim, 0, H2 - 3, W2, 1);
  const url = c.toDataURL(); cache.set(key, url); return url;
}
