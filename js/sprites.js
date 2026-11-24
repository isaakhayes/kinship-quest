// Procedural pixel art: hero sprites and scene backdrops. No image files needed.
import { CLASS, SKINS, OUTFITS } from './data/heroes.js';

const W = 12, H = 14;
const fr = i => '..k' + i + 'k..';
const FACE = [fr('ssssss'), fr('sesses'), '...ksmmsk...'];
const TORSO = [
  '..kooooook..', '.kooaooaook.', '.kooooooook.', '.ksoOOOOosk.', '..koaaaaok..',
  '..kOOOOOOk..', '..kbb..bbk..', '..kbb..bbk..', '..kkk..kkk..'
];
// Each head is rows 0 and 1, plus optional overrides for rows 2, 3, 4.
const HEADS = {
  knight:   { 0: '...kkkkkk.aa', 1: '..kmmmmmmkka', 2: '..kmssssmk..' },
  wizard:   { 0: '.....khhk...', 1: '.kkhhahhhkk.', 4: '...kmmmmk...' },
  rogue:    { 0: '...kkkkkk...', 1: '..khhhhhhk..', 2: '..khsssssk..' },
  bard:     { 0: '..kkkkkk..aa', 1: '..khhhhhhk.a' },
  tinkerer: { 0: '..khkhkhkhk.', 1: '..kcckhhcck.' },
  pirate:   { 0: '..kkhhhhkk..', 1: '..khhhhhhk.h', 3: fr('sksses') },
  ninja:    { 0: '..kkkkkkkk..', 1: '..kddddddk..', 2: '..krrrrrrk..', 4: '...kddddk...' },
  robot:    { 0: '.....kaa....', 1: '..kmmmmmmk..', 2: '..kcccccck..', 3: fr('ceccec'), 4: '...kmmmmk...' }
};

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

function rowsFor(cls) {
  const h = HEADS[cls] || HEADS.knight;
  const rows = [h[0], h[1], h[2] || FACE[0], h[3] || FACE[1], h[4] || FACE[2], ...TORSO];
  return rows.map(r => (r + '............').slice(0, W));
}

const cache = new Map();
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

export function spriteURL(hero, scale = 4) {
  const key = [hero.cls, hero.skin, hero.outfit, scale].join('|');
  if (cache.has(key)) return cache.get(key);
  const cls = CLASS[hero.cls];
  const out = OUTFITS[hero.outfit % OUTFITS.length];
  const pal = {
    k: '#0d0a1f', s: SKINS[hero.skin % SKINS.length], e: '#0d0a1f', m: '#e8e8f0',
    h: cls.hat, a: '#ffd23f', c: '#2de2e6', r: '#ff3b5c', d: '#2a2250',
    o: out, O: shade(out, 0.7), b: '#5a3a1e'
  };
  const c = mk(W * scale, H * scale), g = c.getContext('2d');
  rowsFor(hero.cls).forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.' || !pal[ch]) return;
    g.fillStyle = pal[ch];
    g.fillRect(x * scale, y * scale, scale, scale);
  }));
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

export const spriteHTML = (hero, px = 48, cls = '') =>
  `<img class="spr ${cls}" src="${spriteURL(hero, 4)}" width="${px}" height="${Math.round(px * H / W)}" alt="">`;

// ---------- backdrops ----------
const THEMES = {
  sea:   { sky: ['#1b1b4b', '#3a2a7a', '#7a3a8a', '#d9566a', '#ff9a55'], sun: [.72, .56, 7, '#ffe27a'], stars: 1, layers: [['waves', '#1d3f8a', .62], ['waves', '#142c68', .74], ['waves', '#0d1c4a', .86]], x: 'lighthouse' },
  cliff: { sky: ['#2b2a6b', '#4a4aa0', '#8a6ac0', '#e58aa0', '#ffc27a'], sun: [.25, .5, 6, '#fff0a0'], layers: [['hills', '#5a4a8a', .55, .16], ['hills', '#3a2f66', .68, .2], ['hills', '#1d1840', .84, .1]] },
  tower: { sky: ['#07051a', '#0d0a2e', '#16104a', '#241766', '#33217f'], sun: [.8, .3, 6, '#f4f1ff'], stars: 1, layers: [['waves', '#171a4f', .78], ['hills', '#0d0a1f', .9, .06]], x: 'bigtower' },
  candy: { sky: ['#ff9ad5', '#ffb3e0', '#ffd1ec', '#ffe8f5', '#fff4fa'], sun: [.8, .3, 6, '#fff3a0'], layers: [['hills', '#ff6fb5', .58, .12], ['hills', '#e0489a', .72, .14], ['hills', '#b8307a', .88, .06]], x: 'lollies' },
  vault: { room: ['#2a1f4a', '#3a2a66', '#ffb3e0'], x: 'vault' },
  space: { sky: ['#05031a', '#0b0630', '#150a4a', '#220f66', '#311a82'], stars: 1, layers: [], x: 'planets' },
  ship:  { room: ['#1c2a4f', '#2a3f78', '#05031a'], x: 'ship' }
};

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function backdropURL(theme, seed = 1) {
  const key = 'bd|' + theme + '|' + seed;
  if (cache.has(key)) return cache.get(key);
  const T = THEMES[theme] || THEMES.sea, BW = 160, BH = 64, R = rng(seed * 7919 + theme.length);
  const c = mk(BW, BH), g = c.getContext('2d');
  const rect = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h)); };
  const hz = Math.floor(BH * .62);

  if (T.room) {
    rect(T.room[0], 0, 0, BW, BH); rect(T.room[1], 0, 0, BW, 16);
    for (let x = 0; x < BW; x += 16) rect(T.room[1], x, 16, 2, 30);
    rect(T.room[2] === '#ffb3e0' ? '#5a3a86' : '#0d1530', 0, 46, BW, 18);
    for (let x = 0; x < BW; x += 8) rect('#00000033', x, 46, 1, 18);
    if (T.x === 'ship') { for (let i = 0; i < 3; i++) { const x = 18 + i * 52; rect('#0d0a1f', x - 2, 8, 34, 26); rect(T.room[2], x, 10, 30, 22); for (let s = 0; s < 14; s++) rect('#fff7e0', x + R() * 28, 10 + R() * 20, 1, 1); } }
    else { rect('#0d0a1f', 58, 8, 44, 40); rect('#8a8aa8', 60, 10, 40, 36); rect('#ffe27a', 78, 24, 4, 4); for (let y = 12; y < 44; y += 8) rect('#6a6a88', 60, y, 40, 1); for (let i = 0; i < 6; i++) rect('#ff9ad5', 100 + R() * 40, 52 + R() * 8, 4, 2); }
  } else {
    T.sky.forEach((col, i) => {
      const y0 = Math.floor(hz * i / T.sky.length), y1 = Math.floor(hz * (i + 1) / T.sky.length);
      rect(col, 0, y0, BW, y1 - y0 + 1);
      if (i < T.sky.length - 1) for (let x = (y1 % 2); x < BW; x += 2) rect(T.sky[i + 1], x, y1 - 1, 1, 1);
    });
    rect(T.layers.length ? T.layers[T.layers.length - 1][1] : T.sky[T.sky.length - 1], 0, hz, BW, BH - hz);
    if (T.stars) for (let i = 0; i < 40; i++) rect(R() > .8 ? '#ffd23f' : '#fff7e0', R() * BW, R() * hz * .8, 1, 1);
    if (T.sun) { const [sx, sy, sr, sc] = T.sun; for (let y = -sr; y <= sr; y++) for (let x = -sr; x <= sr; x++) if (x * x + y * y <= sr * sr) rect(sc, sx * BW + x, sy * BH + y, 1, 1); }
    T.layers.forEach(([kind, col, by, amp]) => {
      for (let x = 0; x < BW; x += 2) {
        let y;
        if (kind === 'waves') y = by * BH + Math.round(Math.sin(x / 6 + by * 40) * 1.5);
        else y = by * BH - (Math.sin(x / 17 + by * 9 + seed) * .5 + Math.sin(x / 7 + by * 5) * .25 + .5) * amp * BH;
        rect(col, x, y, 2, BH - y);
      }
    });
    if (T.x === 'lighthouse' || T.x === 'bigtower') {
      const big = T.x === 'bigtower';
      const bx = big ? 122 : 128, top = big ? 12 : 18, h = big ? 40 : 28, bw = big ? 20 : 11, tw = big ? 13 : 7;
      if (big) for (let dx = 4; dx < 100; dx++) rect('#ffe27a24', bx - dx, top - 2 - dx * .05, 1, 4 + dx * .22);
      for (let i = 0; i < h; i++) { const w = tw + (bw - tw) * i / h; rect(Math.floor(i / 5) % 2 ? '#ff3b5c' : '#fff7e0', bx - w / 2, top + 6 + i, w, 1); rect('#00000030', bx + w / 2 - 2, top + 6 + i, 2, 1); }
      rect('#0d0a1f', bx - tw / 2 - 2, top + 4, tw + 4, 2);
      rect('#2a2250', bx - tw / 2 + 1, top, tw - 2, 4); rect('#ffe27a', bx - tw / 2 + 2, top + 1, tw - 4, 2);
      rect('#0d0a1f', bx - tw / 2, top - 2, tw, 2); rect('#0d0a1f', bx - 1, top - 4, 2, 2);
    }
    if (T.x === 'lollies') for (let i = 0; i < 6; i++) { const x = 12 + i * 26 + R() * 10, y = 30 + R() * 10; rect('#fff7e0', x + 3, y, 2, 20); for (let k = 0; k < 36; k++) { const a = k / 36 * 6.28; rect(k % 6 < 3 ? '#ff3b5c' : '#ffd23f', x + 4 + Math.cos(a) * 5, y + Math.sin(a) * 5, 1.4, 1.4); } }
    if (T.x === 'planets') { for (let y = -12; y <= 12; y++) for (let x = -12; x <= 12; x++) if (x * x + y * y <= 144) rect(y % 6 < 3 ? '#ff8a1f' : '#ffb35a', 120 + x, 24 + y, 1, 1); rect('#fff7e0', 100, 24, 40, 1); for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 36) rect('#2de2e6', 30 + x, 40 + y, 1, 1); }
  }
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}
