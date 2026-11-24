// Stepped, chunky starfield. Moves in jumps like an old console, and sleeps when the tab is hidden.
export function startStars(c) {
  const g = c.getContext('2d');
  let stars = [], W = 0, H = 0;
  const S = 4;
  function size() {
    W = c.width = Math.ceil(innerWidth / S); H = c.height = Math.ceil(innerHeight / S);
    stars = Array.from({ length: Math.round(W * H / 140) }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 1 + Math.floor(Math.random() * 3), c: Math.random() < .12 ? '#ffd23f' : Math.random() < .2 ? '#2de2e6' : '#fff7e0' }));
  }
  function tick() {
    if (document.hidden) return;
    g.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.x -= s.l * .12; if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
      g.fillStyle = s.c; g.globalAlpha = .35 + s.l * .2;
      g.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
    }
  }
  addEventListener('resize', size); size();
  setInterval(tick, 140);
}
