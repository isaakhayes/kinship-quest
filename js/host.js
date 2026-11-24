// Host-authoritative game engine. The host browser owns the truth and broadcasts a full
// state snapshot after every change. Everyone else sends small "act" messages.
import { QUESTS } from './data/quests.js';
import { CLASS, CLASSES, CHAOS, LESSON_TOPICS, rollHero, validHero } from './data/heroes.js';

const pick = a => a[Math.floor(Math.random() * a.length)];
const SECS = { draw: 90, caption: 60, roleplay: 60, charades: 75, riddle: 90, trivia: 30 };
const JUDGE_SECS = 25;
const MAX_PLAYERS = CLASSES.length;
const OFFLINE_MS = 16000;

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
export function matches(guess, keys) {
  const g = norm(guess);
  if (!g) return false;
  const words = g.split(' ');
  return keys.some(k => {
    k = norm(k);
    if (g === k || (' ' + g + ' ').includes(' ' + k + ' ') || (k.length > 3 && g.includes(k))) return true;
    return words.some(w => w.length > 3 && k.length > 3 && lev(w, k) <= 1);
  });
}

const AWARDS = [
  { key: 'wins', title: 'CROWD FAVORITE' }, { key: 'solved', title: 'SHARP MIND' },
  { key: 'correct', title: 'BRAINIAC' }, { key: 'moments', title: 'CLUTCH HERO' }, { key: 'subs', title: 'IDEA MACHINE' }
];

export class Host {
  constructor(room, hostId, hostName, send, onChange, saved, blocked = []) {
    this.send = send; this.onChange = onChange; this.blocked = blocked; this.priv = {};
    this.G = saved || {
      room, hostId, phase: 'lobby', players: {}, order: [], sel: { quest: 'lighthouse', len: 2 },
      quest: null, len: 2, sceneId: null, sub: null, turn: 0, spot: null, spirit: 4, coins: null, items: [], visited: 0,
      dials: { silly: false, lesson: false, topics: [...LESSON_TOPICS], slow: false },
      deadline: 0, dur: 0, prompt: null, votes: {}, vres: null, subs: {}, shown: null, favs: {}, winners: null,
      solved: {}, guesses: [], answers: {}, tres: null, roll: null, chaos: null, hint: false, hintText: null, reveal: null,
      stats: {}, awards: null, ending: null, seq: 0
    };
    this.lastOnline = '';
    this.handle({ t: 'join', pid: hostId, name: hostName });
    if (saved && this.G.phase === 'play' && this.G.sceneId) { this.G.visited--; this.G.turn--; this.enter(this.G.sceneId); }
    this.timer = setInterval(() => this.tick(), 500);
  }

  stop() { clearInterval(this.timer); }
  Q() { return QUESTS[this.G.quest]; }
  scene() { return this.Q().scenes[this.G.sceneId]; }
  online(p) { return p.id === this.G.hostId || Date.now() - (p.lastSeen || 0) < OFFLINE_MS; }
  onlineIds() { return this.G.order.filter(id => this.G.players[id] && this.online(this.G.players[id])); }

  clean(s, max = 120) {
    let t = String(s || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
    for (const w of this.blocked) if (w && new RegExp('\\b' + w + '\\b', 'i').test(t)) t = t.replace(new RegExp('\\b' + w + '\\b', 'gi'), '***');
    return t;
  }

  pub() {
    const players = {};
    for (const [id, p] of Object.entries(this.G.players)) { const { lastSeen, ...rest } = p; players[id] = { ...rest, online: this.online(p) }; }
    return { ...this.G, players, now: Date.now() };
  }

  broadcast() {
    this.G.seq++;
    const s = this.pub();
    this.send({ t: 'state', s });
    this.onChange(s);
    try { localStorage.setItem('kq-host-' + this.G.room, JSON.stringify({ ...this.G, savedAt: Date.now() })); } catch (e) {}
  }

  // ---------- incoming ----------
  handle(m) {
    const G = this.G, pid = m.pid, p = G.players[pid];
    if (m.t === 'join') return this.join(m);
    if (!p) return;
    p.lastSeen = Date.now();
    if (m.t === 'ping') return;
    if (m.t !== 'act') return;
    if (m.a === 'host') { if (pid === G.hostId) this.hostCmd(m); return; }
    this.playerAct(p, m);
  }

  join(m) {
    const G = this.G;
    let p = G.players[m.pid];
    if (!p) {
      if (Object.keys(G.players).length >= MAX_PLAYERS) { this.send({ t: 'full', pid: m.pid }); return; }
      p = G.players[m.pid] = {
        id: m.pid, name: this.clean(m.name, 14) || 'HERO', hero: rollHero(Object.values(G.players).map(q => q.hero.cls)),
        ready: false, moment: false, momentUsed: false, lastSeen: Date.now()
      };
      G.stats[m.pid] = { wins: 0, solved: 0, correct: 0, moments: 0, subs: 0 };
      if (!G.order.includes(m.pid)) G.order.push(m.pid);
      if (G.phase !== 'lobby') p.ready = true;
    } else { p.lastSeen = Date.now(); if (m.name) p.name = this.clean(m.name, 14) || p.name; }
    if (G.phase === 'play' && G.sub === 'work' && this.scene().ch.kind === 'charades' && m.pid === G.spot && this.priv.secret)
      this.send({ t: 'secret', to: m.pid, text: this.priv.secret.t, sc: G.sceneId });
    this.broadcast();
  }

  playerAct(p, m) {
    const G = this.G, pid = p.id;
    switch (m.a) {
      case 'hero': {
        if (G.phase !== 'lobby' || !validHero(m.hero)) return;
        if (Object.values(G.players).some(q => q.id !== pid && q.hero.cls === m.hero.cls)) return;
        p.hero = { cls: m.hero.cls, skin: m.hero.skin, outfit: m.hero.outfit, quirk: String(m.hero.quirk).slice(0, 60), catch: String(m.hero.catch).slice(0, 80) };
        p.ready = false; break;
      }
      case 'ready': if (G.phase === 'lobby') p.ready = !!m.v; break;
      case 'vote': {
        if (G.phase !== 'play' || G.sub !== 'vote') return;
        const sc = this.scene(), c = sc.choices[m.i];
        if (!c || !this.avail(c)) return;
        (this.priv.votes ||= {})[pid] = m.i; G.votes[pid] = true;
        this.broadcast(); if (this.onlineIds().every(id => G.votes[id])) setTimeout(() => { if (G.sub === 'vote') this.resolveVote(); }, 700);
        return;
      }
      case 'submit': {
        if (G.sub !== 'work') return;
        const k = this.scene().ch.kind;
        if (!['draw', 'caption', 'roleplay'].includes(k) || G.subs[pid]) return;
        let data = m.data;
        if (k === 'draw') { if (typeof data !== 'string' || !data.startsWith('data:image/png;base64,') || data.length > 60000) return; }
        else { data = this.clean(data, k === 'caption' ? 90 : 120); if (!data) return; }
        (this.priv.subs ||= {})[pid] = { kind: k === 'draw' ? 'img' : 'text', data };
        G.subs[pid] = true; G.stats[pid].subs++;
        this.broadcast(); this.checkWork(); return;
      }
      case 'guess': {
        if (G.sub !== 'work') return;
        const ch = this.scene().ch;
        if (!['charades', 'riddle'].includes(ch.kind) || G.solved[pid]) return;
        if (ch.kind === 'charades' && pid === G.spot) return;
        const text = this.clean(m.text, 40); if (!text) return;
        const ok = matches(text, ch.kind === 'charades' ? this.priv.prompt.k : this.priv.prompt.a);
        if (ok) { G.solved[pid] = true; G.stats[pid].solved++; }
        G.guesses = [...G.guesses, { n: p.name, t: ch.kind === 'riddle' && ok ? '' : text, ok }].slice(-8);
        this.broadcast(); this.checkWork(); return;
      }
      case 'ans': {
        if (G.sub !== 'work' || this.scene().ch.kind !== 'trivia' || G.answers[pid]) return;
        (this.priv.ans ||= {})[pid] = m.i; G.answers[pid] = true;
        this.broadcast(); this.checkWork(); return;
      }
      case 'fav': {
        if (G.sub !== 'judge' || m.to === pid || !G.shown.some(e => e.pid === m.to)) return;
        (this.priv.favs ||= {})[pid] = m.to; G.favs[pid] = true;
        this.broadcast(); if (this.onlineIds().every(id => G.favs[id])) setTimeout(() => { if (G.sub === 'judge') this.endJudge(); }, 700);
        return;
      }
      case 'moment': {
        if (G.sub !== 'roll' || G.roll || p.momentUsed) return;
        p.moment = !!m.v; break;
      }
    }
    this.broadcast();
  }

  // ---------- host commands ----------
  hostCmd(m) {
    const G = this.G;
    switch (m.cmd) {
      case 'select': if (G.phase === 'pick' && QUESTS[m.quest]) { G.sel = { quest: m.quest, len: [1, 2, 3].includes(m.len) ? m.len : 2 }; } break;
      case 'pick': if (G.phase !== 'pick') this.toPick(); return;
      case 'begin': if (G.phase === 'pick') this.begin(); return;
      case 'next': this.advance(); return;
      case 'skip': if (G.phase === 'play') this.enter(this.defaultNext(this.scene())); return;
      case 'chaos': if (G.phase === 'play') { G.chaos = { text: pick(CHAOS), n: Date.now() }; } break;
      case 'time': if (G.deadline) G.deadline += 30000; break;
      case 'hint': if (G.sub === 'work' && this.scene().ch.kind === 'riddle') { G.hint = true; G.hintText = this.priv.prompt.hint; } break;
      case 'dial': if (['silly', 'lesson', 'slow'].includes(m.k)) G.dials[m.k] = !!m.v; break;
      case 'topic': { const t = m.t, a = G.dials.topics; if (LESSON_TOPICS.includes(t)) G.dials.topics = a.includes(t) ? a.filter(x => x !== t) : [...a, t]; break; }
      case 'lobby': G.phase = 'lobby'; Object.values(G.players).forEach(p => p.ready = false); break;
    }
    this.broadcast();
  }

  toPick() {
    const G = this.G;
    G.phase = 'pick'; G.sceneId = null; G.sub = null; G.ending = null; G.awards = null; G.chaos = null;
    this.broadcast();
  }

  begin() {
    const G = this.G, Qd = QUESTS[G.sel.quest];
    G.phase = 'play'; G.quest = Qd.id; G.len = G.sel.len; G.spirit = 4; G.coins = Qd.coins ?? null; G.items = [];
    G.visited = 0; G.turn = 0; G.awards = null; G.ending = null;
    for (const id of G.order) { G.stats[id] = { wins: 0, solved: 0, correct: 0, moments: 0, subs: 0 }; G.players[id].momentUsed = false; G.players[id].moment = false; }
    this.enter(Qd.start);
  }

  // ---------- story flow ----------
  resolveNext(id) {
    const sc = this.Q().scenes; let guard = 0;
    while (sc[id] && (sc[id].min || 1) > this.G.len && guard++ < 25) { id = sc[id].skip || sc[id].next; if (id && typeof id === 'object') id = id.ok; }
    return id;
  }

  defaultNext(sc) {
    if (sc.choices) return sc.choices[0].next;
    return typeof sc.next === 'object' ? sc.next.ok : sc.next;
  }

  route(sc) {
    const G = this.G;
    for (const r of sc.routes) {
      if (r.spirit != null && G.spirit < r.spirit) continue;
      if (r.coins != null && (G.coins || 0) < r.coins) continue;
      if (r.item && !G.items.includes(r.item)) continue;
      if (r.anyItem && !r.anyItem.some(i => G.items.includes(i))) continue;
      return r.to;
    }
    return sc.routes[sc.routes.length - 1].to;
  }

  enter(id) {
    const G = this.G, Qd = this.Q();
    id = this.resolveNext(id);
    let sc = Qd.scenes[id], guard = 0;
    while (sc && sc.routes && guard++ < 5) { id = this.route(sc); sc = Qd.scenes[id]; }
    if (!sc) { console.error('Missing scene', id); return this.toPick(); }
    this.priv = {};
    Object.assign(G, {
      sceneId: id, sub: 'read', prompt: null, votes: {}, vres: null, subs: {}, shown: null, favs: {}, winners: null,
      solved: {}, guesses: [], answers: {}, tres: null, roll: null, chaos: null, hint: false, hintText: null, reveal: null,
      deadline: 0, dur: 0
    });
    G.visited++; G.turn++;
    const ids = G.order; G.spot = ids[(G.turn - 1) % ids.length];
    Object.values(G.players).forEach(p => p.moment = false);
    if (sc.end) { G.phase = 'end'; G.ending = { id, kind: sc.end }; G.sub = 'end'; this.computeAwards(); }
    else if (sc.ch) {
      const pr = pick(sc.ch.p); this.priv.prompt = pr;
      G.prompt = sc.ch.kind === 'riddle' ? { q: pr.q } : sc.ch.kind === 'trivia' ? { q: pr.q, o: pr.o } : sc.ch.kind === 'charades' ? null : pr;
      if (sc.ch.kind === 'charades') this.priv.secret = pr;
    }
    this.broadcast();
  }

  avail(c) {
    const G = this.G;
    if (c.needs && !G.items.includes(c.needs)) return false;
    if (c.coin && (G.coins || 0) + c.coin < 0) return false;
    return true;
  }

  advance() {
    const G = this.G; if (G.phase !== 'play') return;
    const sc = this.scene();
    if (G.sub === 'read') {
      if (sc.choices) { G.sub = 'vote'; this.broadcast(); }
      else if (sc.ch) this.startWork();
      else this.enter(sc.next);
    } else if (G.sub === 'vote') this.resolveVote();
    else if (G.sub === 'result') this.enter(sc.choices[G.vres.i].next);
    else if (G.sub === 'work') this.endWork();
    else if (G.sub === 'judge') this.endJudge();
    else if (G.sub === 'roll') {
      if (!G.roll) this.doRoll();
      else this.enter(typeof sc.next === 'object' ? (sc.next[G.roll.outcome] || sc.next.ok) : sc.next);
    }
  }

  resolveVote() {
    const G = this.G, sc = this.scene(), votes = this.priv.votes || {};
    const tally = {};
    Object.values(votes).forEach(i => tally[i] = (tally[i] || 0) + 1);
    let best = Math.max(0, ...Object.values(tally));
    let tied = Object.keys(tally).filter(i => tally[i] === best).map(Number);
    let win;
    if (!tied.length) { const opts = sc.choices.map((c, i) => i).filter(i => this.avail(sc.choices[i])); win = pick(opts); }
    else if (tied.length === 1) win = tied[0];
    else win = votes[G.spot] != null && tied.includes(votes[G.spot]) ? votes[G.spot] : pick(tied);
    const c = sc.choices[win];
    if (c.give && !G.items.includes(c.give)) G.items.push(c.give);
    if (c.spirit) G.spirit = Math.max(0, Math.min(5, G.spirit + c.spirit));
    if (c.coin) G.coins = Math.max(0, (G.coins || 0) + c.coin);
    G.vres = { i: win, tally, byPlayer: { ...votes }, tied: tied.length > 1 };
    G.sub = 'result';
    this.broadcast();
  }

  startWork() {
    const G = this.G, k = this.scene().ch.kind;
    G.sub = 'work';
    G.dur = SECS[k] * (G.dials.slow ? 2 : 1) * 1000; G.deadline = Date.now() + G.dur;
    if (k === 'charades') this.send({ t: 'secret', to: G.spot, text: this.priv.secret.t, sc: G.sceneId });
    this.broadcast();
  }

  checkWork() {
    const G = this.G; if (G.sub !== 'work') return;
    const k = this.scene().ch.kind, on = this.onlineIds();
    const done = k === 'charades' ? Object.keys(G.solved).length > 0
      : k === 'riddle' ? on.every(id => G.solved[id])
      : k === 'trivia' ? on.every(id => G.answers[id])
      : on.every(id => G.subs[id]);
    if (done) setTimeout(() => { if (G.sub === 'work') this.endWork(); }, 900);
  }

  endWork() {
    const G = this.G, ch = this.scene().ch, k = ch.kind;
    if (['draw', 'caption', 'roleplay'].includes(k)) {
      const entries = Object.entries(this.priv.subs || {}).map(([pid, d]) => ({ pid, kind: d.kind, data: d.data }));
      G.shown = entries;
      if (entries.length >= 2) { G.sub = 'judge'; G.dur = JUDGE_SECS * 1000; G.deadline = Date.now() + G.dur; this.broadcast(); return; }
    } else if (k === 'trivia') {
      const correct = {};
      Object.entries(this.priv.ans || {}).forEach(([pid, i]) => { if (i === this.priv.prompt.a) { correct[pid] = true; G.stats[pid].correct++; } });
      G.tres = { a: this.priv.prompt.a, correct };
    } else if (k === 'charades') G.reveal = this.priv.secret.t;
    else if (k === 'riddle') G.reveal = this.priv.prompt.a[0];
    this.toRoll();
  }

  endJudge() {
    const G = this.G, tally = {};
    Object.values(this.priv.favs || {}).forEach(to => tally[to] = (tally[to] || 0) + 1);
    const best = Math.max(0, ...Object.values(tally));
    G.winners = best ? Object.keys(tally).filter(id => tally[id] === best) : [];
    G.winners.forEach(id => G.stats[id].wins++);
    this.toRoll();
  }

  toRoll() { const G = this.G; G.sub = 'roll'; G.roll = null; G.deadline = 0; G.dur = 0; this.broadcast(); }

  doRoll() {
    const G = this.G, sc = this.scene(), ch = sc.ch, k = ch.kind;
    const ids = G.order.filter(id => G.players[id]);
    const solvedAny = Object.keys(G.solved).length > 0;
    const rolls = ids.map(pid => {
      const hero = G.players[pid].hero, d = 1 + Math.floor(Math.random() * 6), tb = CLASS[hero.cls].traits[ch.trait] || 0;
      let bonus = 0;
      if (['draw', 'caption', 'roleplay'].includes(k)) bonus = (G.subs[pid] ? 1 : 0) + (G.winners && G.winners.includes(pid) ? 2 : 0);
      else if (k === 'charades') bonus = (solvedAny ? 1 : 0) + (G.solved[pid] ? 2 : 0) + (pid === G.spot ? (solvedAny ? 2 : 1) : 0);
      else if (k === 'riddle') bonus = G.solved[pid] ? 2 : 0;
      else if (k === 'trivia') bonus = G.tres && G.tres.correct[pid] ? 2 : 0;
      return { pid, d, tb, bonus, total: d + tb + bonus };
    });
    const total = rolls.reduce((s, r) => s + r.total, 0), n = ids.length;
    const need = { great: Math.ceil(6.3 * n), ok: Math.ceil(5 * n) };
    let lvl = total >= need.great ? 2 : total >= need.ok ? 1 : 0;
    const used = [];
    for (const id of ids) {
      const p = G.players[id];
      if (p.moment && !p.momentUsed && lvl < 2) { lvl++; p.momentUsed = true; used.push(id); G.stats[id].moments++; }
      p.moment = false;
    }
    const outcome = ['oops', 'ok', 'great'][lvl];
    G.spirit = Math.max(0, Math.min(5, G.spirit + (outcome === 'great' ? 1 : outcome === 'oops' ? -1 : 0)));
    G.roll = { rolls, total, need, outcome, used, text: sc.out[outcome], at: Date.now() };
    this.broadcast();
  }

  computeAwards() {
    const G = this.G, given = {};
    AWARDS.forEach(a => {
      const top = Math.max(0, ...G.order.map(id => G.stats[id][a.key]));
      if (!top || (G.order.length > 1 && G.order.every(id => G.stats[id][a.key] === top))) return;
      G.order.filter(id => G.stats[id][a.key] === top).forEach(id => (given[id] ||= []).push(a.title));
    });
    G.awards = Object.fromEntries(G.order.map(id => [id, (given[id] || ['LEGEND IN TRAINING']).slice(0, 2)]));
  }

  tick() {
    const G = this.G;
    const sig = G.order.map(id => (this.online(G.players[id]) ? 1 : 0)).join('');
    if (sig !== this.lastOnline) { this.lastOnline = sig; this.broadcast(); return; }
    if (G.phase !== 'play') return;
    if (G.deadline && Date.now() >= G.deadline) {
      if (G.sub === 'work') this.endWork(); else if (G.sub === 'judge') this.endJudge();
    }
    if (G.sub === 'work' && !G.hint && G.dur && this.scene().ch.kind === 'riddle' && G.deadline - Date.now() < G.dur / 2) { G.hint = true; G.hintText = this.priv.prompt.hint; this.broadcast(); }
  }
}
