// Host-authoritative game engine. The host browser owns the truth and broadcasts a full
// state snapshot after every change. Everyone else sends small "act" messages.
import { QUESTS } from './data/quests.js';
import { CLASS, CLASSES, CHAOS, rollHero, validHero } from './data/heroes.js';

const pick = a => a[Math.floor(Math.random() * a.length)];
const SECS = { draw: 90, caption: 60, roleplay: 60, charades: 75, riddle: 90, trivia: 30, math: 75, fight: 45, sigil: 75, swarm: 0 };
const QUIZ = ['trivia', 'math', 'fight'];
const AYO = { id: 'ayo', name: 'AYO', hero: { cls: 'runner', skin: 3, hair: 2, outfit: 4, quirk: '', catch: '' } };
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
      room, hostId, phase: 'lobby', players: {}, order: [], sel: { quest: 'silentdrum', mode: 'chapters', len: 2, mins: 30 },
      quest: null, len: 2, sceneId: null, sub: null, turn: 0, spot: null, spirit: 4, coins: null, items: [], visited: 0,
      dials: { silly: false, slow: false }, clockEnd: 0, rushed: false, companion: null, fight: null, sigil: null, lastWord: null,
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
    if (G.phase === 'play' && G.sub === 'work' && ['charades', 'sigil'].includes(this.scene().ch.kind) && m.pid === G.spot && this.priv.secret)
      this.send({ t: 'secret', to: m.pid, text: this.priv.secret.t, sc: G.sceneId });
    this.broadcast();
  }

  playerAct(p, m) {
    const G = this.G, pid = p.id;
    switch (m.a) {
      case 'hero': {
        if (G.phase !== 'lobby' || !validHero(m.hero)) return;
        if (Object.values(G.players).some(q => q.id !== pid && q.hero.cls === m.hero.cls)) return;
        p.hero = { cls: m.hero.cls, skin: p.hero.skin, hair: p.hero.hair, outfit: m.hero.outfit, quirk: String(m.hero.quirk).slice(0, 60), catch: String(m.hero.catch).slice(0, 80) };
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
        if (k === 'sigil' && pid !== G.spot) return;
        if (!['draw', 'caption', 'roleplay', 'sigil'].includes(k) || G.subs[pid]) return;
        let data = m.data;
        if (k === 'draw' || k === 'sigil') { if (typeof data !== 'string' || !data.startsWith('data:image/png;base64,') || data.length > 60000) return; }
        else { data = this.clean(data, k === 'caption' ? 90 : 120); if (!data) return; }
        (this.priv.subs ||= {})[pid] = { kind: k === 'draw' || k === 'sigil' ? 'img' : 'text', data };
        G.subs[pid] = true; G.stats[pid].subs++;
        if (k === 'sigil') G.sigil = data;
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
        const ak = this.scene().ch.kind;
        if (G.sub !== 'work' || ![...QUIZ, 'sigil'].includes(ak) || G.answers[pid] || (ak === 'sigil' && (pid === G.spot || !G.sigil))) return;
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
      case 'select': if (G.phase === 'pick' && QUESTS[m.quest]) G.sel = { quest: m.quest, mode: m.mode === 'clock' ? 'clock' : 'chapters', len: [1, 2, 3].includes(m.len) ? m.len : 2, mins: [20, 40, 60].includes(m.mins) ? m.mins : 40 }; break;
      case 'pick': if (G.phase !== 'pick') this.toPick(); return;
      case 'begin': if (G.phase === 'pick') this.begin(); return;
      case 'next': this.advance(); return;
      case 'skip': if (G.phase === 'play') this.enter(this.defaultNext(this.scene())); return;
      case 'chaos': if (G.phase === 'play') { G.chaos = { text: pick(CHAOS), n: Date.now() }; } break;
      case 'time': if (G.deadline) G.deadline += 30000; break;
      case 'hint': if (G.sub === 'work' && this.scene().ch.kind === 'riddle') { G.hint = true; G.hintText = this.priv.prompt.hint; } break;
      case 'dial': if (['silly', 'slow'].includes(m.k)) G.dials[m.k] = !!m.v; break;
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
    G.phase = 'play'; G.quest = Qd.id; G.spirit = 4; G.coins = Qd.coins ?? null; G.items = [];
    G.len = G.sel.mode === 'clock' ? (G.sel.mins <= 25 ? 1 : G.sel.mins <= 45 ? 2 : 3) : G.sel.len;
    G.clockEnd = G.sel.mode === 'clock' ? Date.now() + G.sel.mins * 60000 : 0; G.rushed = false;
    G.companion = G.order.length <= 3 ? AYO : null;
    const tw = Object.keys(Qd.twists || {}).sort(() => Math.random() - .5);
    G.twists = tw.slice(0, G.len >= 3 ? 2 : G.len === 2 ? 2 : 1); G.twDone = []; G.chap = 0;
    G.chapTotal = G.sel.mode === 'clock' ? 0 : { 1: 5, 2: 10, 3: 15 }[G.sel.len];
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
      if (r.missing && G.items.includes(r.missing)) continue;
      if (r.anyItem && !r.anyItem.some(i => G.items.includes(i))) continue;
      return r.to;
    }
    return sc.routes[sc.routes.length - 1].to;
  }

  enter(id) {
    const G = this.G, Qd = this.Q();
    if (G.clockEnd && !G.rushed && Qd.rush && Date.now() > G.clockEnd - 240000 && !(Qd.late || []).includes(id)) { G.rushed = true; id = Qd.rush; }
    if (id === '__ret') id = G.ret;
    id = this.resolveNext(id);
    const twId = (G.twists || []).find(t => Qd.twists[t].before === id && !G.twDone.includes(t));
    if (twId) { G.twDone.push(twId); G.ret = id; id = Qd.twists[twId].scene; }
    let sc = Qd.scenes[id], guard = 0;
    while (sc && sc.routes && guard++ < 5) { id = this.route(sc); sc = Qd.scenes[id]; }
    if (!sc) { console.error('Missing scene', id); return this.toPick(); }
    this.priv = {};
    Object.assign(G, {
      sceneId: id, sub: 'read', prompt: null, votes: {}, vres: null, subs: {}, shown: null, favs: {}, winners: null,
      solved: {}, guesses: [], answers: {}, tres: null, roll: null, chaos: null, hint: false, hintText: null, reveal: null,
      deadline: 0, dur: 0, fight: null, sigil: null
    });
    if (sc.on) {
      if (sc.on.give && !G.items.includes(sc.on.give)) G.items.push(sc.on.give);
      if (sc.on.coin) G.coins = Math.max(0, (G.coins || 0) + Math.max(sc.on.coin, -(G.coins || 0)));
      if (sc.on.takeAll) G.coins = 0;
      if (sc.on.spirit) G.spirit = Math.max(0, Math.min(5, G.spirit + sc.on.spirit));
      if (sc.on.take) G.items = G.items.filter(i => i !== sc.on.take);
    }
    if (!sc.noch && !sc.end && id !== Qd.start) G.chap++;
    G.visited++; G.turn++;
    const ids = G.order; G.spot = ids[(G.turn - 1) % ids.length];
    Object.values(G.players).forEach(p => p.moment = false);
    if (sc.end) { G.phase = 'end'; G.ending = { id, kind: sc.end }; G.sub = 'end'; this.computeAwards(); }
    else if (sc.ch) {
      const pr = pick(sc.ch.p); this.priv.prompt = pr;
      const k = sc.ch.kind;
      G.prompt = k === 'riddle' ? { q: pr.q } : QUIZ.includes(k) ? { q: pr.q, o: pr.o, beast: pr.beast || null, seed: Math.floor(Math.random() * 99999) } : k === 'sigil' ? { o: pr.o } : (k === 'charades' || k === 'swarm') ? null : pr;
      if (k === 'charades' || k === 'sigil') this.priv.secret = pr;
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
      else if (sc.ch && sc.ch.kind === 'swarm') this.toRoll();
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
    if (k === 'charades' || k === 'sigil') this.send({ t: 'secret', to: G.spot, text: this.priv.secret.t, sc: G.sceneId });
    this.broadcast();
  }

  checkWork() {
    const G = this.G; if (G.sub !== 'work') return;
    const k = this.scene().ch.kind, on = this.onlineIds();
    const done = k === 'charades' ? Object.keys(G.solved).length > 0
      : k === 'riddle' ? on.every(id => G.solved[id])
      : QUIZ.includes(k) ? on.every(id => G.answers[id])
      : k === 'sigil' ? on.filter(id => id !== G.spot).every(id => G.answers[id]) && !!G.sigil
      : on.every(id => G.subs[id]);
    if (done) setTimeout(() => { if (G.sub === 'work') this.endWork(); }, 900);
  }

  endWork() {
    const G = this.G, ch = this.scene().ch, k = ch.kind;
    if (['draw', 'caption', 'roleplay'].includes(k)) {
      const entries = Object.entries(this.priv.subs || {}).map(([pid, d]) => ({ pid, kind: d.kind, data: d.data }));
      G.shown = entries;
      if (entries.length >= 2) { G.sub = 'judge'; G.dur = JUDGE_SECS * 1000; G.deadline = Date.now() + G.dur; this.broadcast(); return; }
    } else if (QUIZ.includes(k) || k === 'sigil') {
      const correct = {};
      Object.entries(this.priv.ans || {}).forEach(([pid, i]) => { if (i === this.priv.prompt.a) { correct[pid] = true; G.stats[pid].correct++; } });
      G.tres = { a: this.priv.prompt.a, correct };
      if (k === 'fight') G.fight = { name: this.priv.prompt.beast, weak: this.priv.prompt.weak, hit: Object.keys(correct).length > 0 };
      if (k === 'sigil') G.reveal = this.priv.secret.t;
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
      else if (QUIZ.includes(k)) bonus = G.tres && G.tres.correct[pid] ? 2 : 0;
      else if (k === 'sigil') bonus = G.tres && G.tres.correct[pid] ? 2 : (pid === G.spot ? 1 : 0);
      if (k === 'fight' && this.priv.prompt.weak === CLASS[hero.cls].type) bonus += 2;
      return { pid, d, tb, bonus, total: d + tb + bonus };
    });
    if (k === 'swarm') return this.doSwarm(ids, sc);
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
    if (sc.outCoin && sc.outCoin[outcome]) G.coins = Math.max(0, (G.coins || 0) + sc.outCoin[outcome] + (sc.lanternBonus && G.items.includes(sc.lanternBonus.item) ? sc.lanternBonus.coin : 0));
    this.broadcast();
  }

  doSwarm(ids, sc) {
    const G = this.G, n = ids.length, total = Math.min(20, 8 + 3 * n);
    const allies = G.items.filter(i => (this.Q().allies || []).includes(i)).length + (G.companion ? 1 : 0);
    const rolls = ids.map(pid => {
      const hero = G.players[pid].hero, p = G.players[pid], dice = [1, 2, 3].map(() => 1 + Math.floor(Math.random() * 6));
      const tb = CLASS[hero.cls].traits[sc.ch.trait] || 0, power = !p.momentUsed;
      const hits = dice.reduce((a, d) => a + Math.floor(d / 2), 0) + tb + (power ? 4 : 0);
      return { pid, dice, tb, power, hits, d: dice.reduce((a, b) => a + b, 0), bonus: tb + (power ? 4 : 0), total: hits };
    });
    const coinHits = Math.floor((G.coins || 0) / 5) + (G.items.includes('Echo Charge') ? 3 : 0), allyHits = allies * 2;
    const down = rolls.reduce((a, r) => a + r.hits, 0) + coinHits + allyHits, left = Math.max(0, total - down);
    const outcome = left <= 0 ? 'great' : left <= 5 ? 'ok' : 'oops';
    G.spirit = Math.max(0, Math.min(5, G.spirit + (outcome === 'great' ? 1 : outcome === 'oops' ? -1 : 0)));
    G.roll = { swarm: true, rolls, total: down, beasts: total, coinHits, allyHits, left, outcome, used: [], need: null, text: sc.out[outcome], at: Date.now() };
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
