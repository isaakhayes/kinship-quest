// Kinship Quest client: screens, input, and sync. Everyone renders from the host's state snapshot.
import { connect, LOCAL } from './net.js';
import { Host } from './host.js';
import { QUESTS, QUEST_LIST, CHAPTER_LENGTHS, CLOCK_LENGTHS, COMING_SOON } from './data/quests.js';
import { CLASSES, CLASS, SKINS, OUTFITS, HAIRS, TRAITS, VALUES, VALUE_NAMES, rollHero } from './data/heroes.js';
import { spriteHTML, spriteURL, backdropURL, beastURL } from './sprites.js';
import { sfx, isMuted, setMuted } from './audio.js';
import { startStars } from './stars.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = LOCAL ? sessionStorage : localStorage;
const ROOM_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ';

let S = null;               // latest game state from the host
let net = null, host = null, pid = null, name = '', room = '', isHost = false;
let view = 'title', skew = 0, secret = null, B = null, connState = '';
let joinTimer = null, pingTimer = null, connectTimer = null;
const ui = { fav: null, draftKey: '', guessFocus: false, rollAt: 0, lastChaos: 0, parentOpen: false, tw: { key: '', t: null }, zoneKey: '', sceneKey: '' };

const now = () => Date.now() + skew;
const me = () => S && S.players[pid];
const names = () => { const n = Object.values(S.players).map(p => p.name); return n.length > 1 ? n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1] : n[0] || 'you'; };
const fill = t => String(t).replace('{spot}', () => S.players[S.spot]?.name || 'someone').replace('{crew}', () => names());
const quest = () => S.quest && QUESTS[S.quest];
const scene = () => quest()?.scenes[S.sceneId];

// ---------- session ----------
function newPid() { return Math.random().toString(36).slice(2, 10); }
function getPid() { let p = store.getItem('kq-pid'); if (!p) { p = newPid(); store.setItem('kq-pid', p); } return p; }
const saveSession = () => store.setItem('kq-session', JSON.stringify({ room, name, isHost, at: Date.now() }));
const loadSession = () => { try { const s = JSON.parse(store.getItem('kq-session')); return s && Date.now() - s.at < 12 * 3600 * 1000 ? s : null; } catch (e) { return null; } };

async function start(r, n, h) {
  room = r; name = n; isHost = h; pid = getPid(); S = null; secret = null;
  saveSession(); view = 'room'; connState = 'connecting'; render();
  try {
    net = await connect(room, onMsg, st => { connState = st; if (st === 'bad') toast('Connection trouble. Check your internet.'); });
  } catch (e) { connState = 'bad'; toast('Could not connect.'); render(); return; }
  if (isHost) {
    let blocked = [];
    try { blocked = (await (await fetch('blocked_words.txt')).text()).split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')); } catch (e) {}
    let saved = null;
    try { const raw = JSON.parse(localStorage.getItem('kq-host-' + room)); if (raw && raw.hostId === pid && Date.now() - raw.savedAt < 12 * 3600 * 1000) saved = raw; } catch (e) {}
    host = new Host(room, pid, name, m => { net.send(m); if (m.t === 'secret' && m.to === pid) onMsg(m); }, s => { S = s; skew = 0; render(); }, saved, blocked);
  } else {
    const hello = () => net.send({ t: 'join', pid, name });
    hello(); joinTimer = setInterval(() => { if (!S || !S.players[pid]) hello(); else clearInterval(joinTimer); }, 2000);
    pingTimer = setInterval(() => net.send({ t: 'ping', pid }), 4000);
  }
  render();
}

function leave() {
  clearInterval(joinTimer); clearInterval(pingTimer);
  host?.stop(); net?.close?.(); host = net = S = null;
  store.removeItem('kq-session'); view = 'title'; B = null; render();
}

function onMsg(m) {
  if (!m) return;
  if (isHost) { if (m.t === 'join' || m.t === 'ping' || m.t === 'act') host.handle(m); else if (m.t === 'secret' && m.to === pid) secret = { text: m.text, sc: m.sc }, render(); return; }
  if (m.t === 'state') { S = m.s; skew = S.now - Date.now(); render(); }
  else if (m.t === 'secret' && m.to === pid) { secret = { text: m.text, sc: m.sc }; render(); }
  else if (m.t === 'full' && m.pid === pid) { toast('That room is full (8 heroes max).'); leave(); }
}

function act(a, extra = {}) {
  const m = { t: 'act', pid, a, ...extra };
  if (isHost) host.handle(m); else net?.send(m);
}
const cmd = (c, extra = {}) => act('host', { cmd: c, ...extra });

// ---------- helpers ----------
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2600); }
const heart = on => `<svg class="heart ${on ? '' : 'off'}" viewBox="0 0 7 6" shape-rendering="crispEdges"><path d="M1 0h2v1H1zM4 0h2v1H4zM0 1h7v2H0zM1 3h5v1H1zM2 4h3v1H2zM3 5h1v1H3z"/></svg>`;
const hearts = n => Array.from({ length: 5 }, (_, i) => heart(i < n)).join('');
const btn = (label, attrs = '', cls = 'y') => `<button class="btn ${cls}" ${attrs}>${label}</button>`;
const fmtTime = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const crewStrip = flags => `<div class="strip">${S.order.map(id => { const p = S.players[id]; return `<div class="chip ${flags[id] ? 'done' : ''} ${p.online ? '' : 'away'}">${spriteHTML(p.hero, 34)}<small>${esc(p.name)}</small><i></i></div>`; }).join('')}</div>`;
const traitPips = (cls, big) => TRAITS.map(t => { const v = CLASS[cls].traits[t] || 0; return `<div class="trait"><span>${t}</span><b>${'■'.repeat(v)}<u>${'■'.repeat(3 - v)}</u></b></div>`; }).join('');
function lessonCard(sc) {
  if (!sc.lesson) return '';
  const v = sc.lesson.v;
  return `<div class="lesson box"><h4>WISDOM STONE: ${esc(VALUE_NAMES[v])} <small>${esc(VALUES[v])}</small></h4><p>${esc(sc.lesson.tip)}</p><p class="ask">TALK ABOUT IT: ${esc(sc.lesson.ask)}</p></div>`;
}

// ---------- screens ----------
function titleScreen() {
  const urlRoom = (new URLSearchParams(location.search).get('room') || '').toUpperCase().slice(0, 4);
  const sess = loadSession();
  const marching = CLASSES.map((c, i) => `<img class="march" style="animation-delay:${-i * .9}s" src="${spriteURL({ cls: c.id, skin: (i * 2) % 6, hair: i % 6, outfit: i }, 3)}" width="72" alt="">`).join('');
  return `<section class="title">
    <h1 class="logo" aria-label="Kinship Quest"><span class="l1">${[...'KINSHIP'].map((c, i) => `<i style="--i:${i}">${c}</i>`).join('')}</span><span class="l2">${[...'QUEST'].map((c, i) => `<i style="--i:${i + 3}">${c}</i>`).join('')}</span></h1>
    <p class="sub">A FAMILY ADVENTURE FOR 2 TO 8 HEROES</p>
    <div class="march-row" aria-hidden="true">${marching}</div>
    <div class="menu box">
      <label>YOUR NAME<input id="nameIn" maxlength="14" autocomplete="off" placeholder="TYPE HERE" value="${esc(store.getItem('kq-name') || '')}"></label>
      <div class="row2">
        <div>${btn('NEW GAME', 'data-act="new"', 'y big')}<small>Start a room. Share the code.</small></div>
        <div><label>ROOM CODE<input id="codeIn" maxlength="4" autocomplete="off" placeholder="ABCD" value="${esc(urlRoom)}" class="code"></label>${btn('JOIN GAME', 'data-act="join"', urlRoom ? 'c big pulse' : 'c big')}</div>
      </div>
      ${sess ? `<div class="cont">${btn('CONTINUE ROOM ' + esc(sess.room), 'data-act="cont"', 'g')}</div>` : ''}
    </div>
    <p class="foot">NO ACCOUNTS. NO ADS. JUST YOUR FAMILY.${LOCAL ? '<br>PRACTICE MODE: OPEN MORE TABS WITH ?local' : ''}</p>
  </section>`;
}

function connectingScreen() {
  const bad = connState === 'bad';
  return `<section class="center"><div class="box pad"><h2>${bad ? 'NO SIGNAL' : 'CONNECTING'}<span class="dots">...</span></h2>
    <p>${bad ? 'Could not reach the game server. Check your internet and try again.' : 'ROOM ' + esc(room) + (isHost ? '' : '. Waiting for the host to let you in.')}</p>
    ${btn('BACK', 'data-act="leave"', 'p')}</div></section>`;
}

function inviteLink() { return location.origin + location.pathname + '?room=' + room + (LOCAL ? '&local' : ''); }

function lobbyScreen() {
  const p = me();
  if (!B) B = { ...p.hero };
  const taken = Object.values(S.players).filter(q => q.id !== pid).map(q => q.hero.cls);
  const cls = CLASS[B.cls];
  const everyoneReady = Object.values(S.players).filter(q => q.online).every(q => q.ready);
  return `<section class="lobby">
    <div class="box builder">
      <h2>BUILD YOUR HERO</h2>
      <div class="preview"><div class="stage-floor">${spriteHTML(B, 168, 'idle')}</div>
        <div class="who"><b>${esc(p.name)}</b> THE ${cls.name}<p class="catch">${esc(B.catch)}</p><p class="quirk">QUIRK: ${esc(B.quirk)}</p></div></div>
      <div class="label">CHOOSE A CLASS</div>
      <div class="classes">${CLASSES.map(c => { const t = taken.includes(c.id); return `<button class="cls ${B.cls === c.id ? 'sel' : ''}" ${t ? 'disabled' : ''} data-act="cls" data-v="${c.id}">${spriteHTML({ cls: c.id, skin: B.skin, hair: B.hair, outfit: B.outfit }, 40)}<small>${t ? 'TAKEN' : c.name}</small></button>`; }).join('')}</div>
      <div class="info"><div class="traits">${traitPips(B.cls)}</div><p><b>WEAPON: ${cls.weapon}</b> <em>(${cls.type})</em><br><b>POWER: ${cls.power}</b><br>${esc(cls.powerText)}<br><em>Save your power! Spend it early and it is gone for the final swarm.</em></p><p class="roots"><b>ROOTS:</b> ${esc(cls.roots)}</p></div>
      <div class="swatches"><div><div class="label">OUTFIT COLOR</div>${OUTFITS.map((c, i) => `<button class="sw ${B.outfit === i ? 'sel' : ''}" style="--c:${c}" data-act="outfit" data-v="${i}" aria-label="color ${i + 1}"></button>`).join('')}</div></div>
      <div class="btnrow">${btn(p.ready ? 'READY!' : 'I AM READY', 'data-act="ready"', p.ready ? 'g' : 'y')}</div>
    </div>
    <div class="side">
      <div class="box pad room"><div class="label">ROOM CODE</div><div class="bigcode">${esc(room)}</div>
        <div class="btnrow">${btn('COPY INVITE LINK', 'data-act="copy"', 'c small')}</div></div>
      <div class="box pad crew"><div class="label">THE CREW (${S.order.length}/8)</div>
        ${S.order.map(id => { const q = S.players[id]; return `<div class="member ${q.online ? '' : 'away'}">${spriteHTML(q.hero, 52)}<div><b>${esc(q.name)}${id === S.hostId ? ' *' : ''}</b><small>${CLASS[q.hero.cls].name}${q.online ? '' : ' (AWAY)'}</small></div><span class="tag ${q.ready ? 'ok' : ''}">${q.ready ? 'READY' : 'BUILDING'}</span></div>`; }).join('')}
        <p class="note">* HOST</p></div>
      ${isHost ? `<div class="startbox">${btn(everyoneReady ? 'CHOOSE A QUEST' : 'WAITING FOR READY...', 'data-act="pick"' + (everyoneReady ? '' : ' disabled'), 'y big')}<small>${everyoneReady ? 'Everyone is ready.' : 'Everyone needs to press I AM READY.'}</small></div>` : '<div class="note center">WAITING FOR THE HOST TO START...</div>'}
    </div></section>`;
}

function pickScreen() {
  const sel = S.sel, q = QUESTS[sel.quest], clock = sel.mode === 'clock';
  const lenName = clock ? sel.mins + ' MIN CLOCK' : CHAPTER_LENGTHS[sel.len - 1].name + ' STORY';
  return `<section class="pick">
    <h2 class="shead">CHOOSE YOUR QUEST</h2>
    <div class="quests">${QUEST_LIST.map(qq => `<button class="quest box ${sel.quest === qq.id ? 'sel' : ''}" ${isHost ? '' : 'disabled'} data-act="sel" data-q="${qq.id}">
      <img class="qimg" src="${backdropURL(qq.theme, 3)}" alt=""><div class="qbody"><h3>${esc(qq.name)}</h3><div class="tags">${qq.tags.map(t => `<span>${t}</span>`).join('')}</div><p>${esc(qq.blurb)}</p></div></button>`).join('')}${COMING_SOON.map(qq => `<div class="quest box soon"><img class="qimg" src="${backdropURL(qq.theme, 7)}" alt=""><span class="badge">COMING SOON</span><div class="qbody"><h3>${esc(qq.name)}</h3><div class="tags">${qq.tags.map(t => `<span>${t}</span>`).join('')}</div><p>${esc(qq.blurb)}</p></div></div>`).join('')}</div>
    <div class="box pad opts">
      <div><div class="label">HOW TO MEASURE LENGTH</div><div class="seg">
        <button class="${!clock ? 'sel' : ''}" ${isHost ? '' : 'disabled'} data-act="mode" data-v="chapters">BY CHAPTERS</button>
        <button class="${clock ? 'sel' : ''}" ${isHost ? '' : 'disabled'} data-act="mode" data-v="clock">BY THE CLOCK</button></div>
        <div class="seg">${clock
          ? CLOCK_LENGTHS.map(l => `<button class="${sel.mins === l.mins ? 'sel' : ''}" ${isHost ? '' : 'disabled'} data-act="mins" data-v="${l.mins}">${l.name}<small>${l.note}</small></button>`).join('')
          : CHAPTER_LENGTHS.map(l => `<button class="${sel.len === l.id ? 'sel' : ''}" ${isHost ? '' : 'disabled'} data-act="len" data-v="${l.id}">${l.name}<small>${l.note}</small></button>`).join('')}</div>
        ${clock ? '<p class="note">The story speeds up near the end so the final battle always happens. In chapter mode it always happens too.</p>' : ''}</div>
      <div><div class="label">EACH GAME IS DIFFERENT</div><p class="note">Surprise guests and twists are picked at random every time you play.</p></div>
    </div>
    <div class="box pad crewrow"><div class="label">CREW</div><div class="heroes">${S.order.map(id => { const q = S.players[id]; return `<div class="hh">${spriteHTML(q.hero, 52, 'idle')}<small>${esc(q.name)}</small></div>`; }).join('')}</div>
      ${S.order.length <= 3 ? '<p class="note">With a small crew, AYO the courier joins your team!</p>' : ''}</div>
    ${isHost ? `<div class="startbox">${btn('BEGIN: ' + esc(q.short), 'data-act="begin"', 'y big')}<small>${lenName}</small>${btn('BACK TO HEROES', 'data-act="tolobby"', 'p small')}</div>` : '<div class="note center">THE HOST IS CHOOSING THE QUEST...</div>'}
  </section>`;
}

function dialsHTML() {
  if (!isHost) return `<div class="dials ro"><span class="${S.dials.silly ? 'on' : ''}">SILLY ${S.dials.silly ? 'ON' : 'OFF'}</span><span class="${S.dials.slow ? 'on' : ''}">EXTRA TIME ${S.dials.slow ? 'ON' : 'OFF'}</span></div>`;
  const t = (k, label) => `<button class="toggle ${S.dials[k] ? 'on' : ''}" data-act="dial" data-k="${k}"><i></i>${label}</button>`;
  return `<div class="dials">${t('silly', 'MAKE IT SILLIER')}${t('slow', 'EXTRA TIME')}</div>`;
}

function playScreen() {
  const sc = scene(), q = quest();
  const sceneKey = S.quest + S.sceneId + S.turn;
  if (ui.sceneKey !== sceneKey) {
    ui.sceneKey = sceneKey; ui.zoneKey = ''; ui.fav = null;
    $('#screen').innerHTML = `<section class="play">
      <div class="banner"><img src="${backdropURL(sc.th || q.theme, S.turn)}" alt="">
        <div class="cast">${S.companion ? `<div class="actor ayo">${spriteHTML(S.companion.hero, 92, 'idle')}<small>AYO</small></div>` : ''}${S.order.map(id => { const p = S.players[id]; return `<div class="actor ${id === S.spot ? 'spot' : ''}" id="a-${id}">${id === S.spot ? '<em>SPOTLIGHT</em>' : ''}${spriteHTML(p.hero, 56, id === S.spot ? 'hop' : 'idle')}<small>${esc(p.name)}</small></div>`; }).join('')}</div></div>
      <div class="dialog box" id="dialog"><div class="speaker">${esc(sc.title)}</div><p id="narr"></p><span class="more">▼</span></div>
      <div id="inter"></div>
      <div id="hostbar"></div>
    </section>`;
  }
  $('.play').dataset.sub = S.sub;
  // narration
  let text = fill(sc.t), nk = sceneKey + S.sub;
  if (S.sub === 'result' && S.vres) { text = fill(sc.choices[S.vres.i].res); }
  else if (S.sub === 'roll' && S.roll) text = S.roll.text;
  else if (S.dials.silly && sc.silly && S.sub === 'read') text += ' ' + fill(sc.silly);
  narrate(nk, text);
  // interaction zone (rebuilt only when its key changes, so drawings and typing survive updates)
  const zk = [S.sub, S.subs[pid] ? 's' : '', S.answers[pid] ? 'a' : '', S.solved[pid] ? 'v' : '', S.votes[pid] ? 'o' : '', S.favs[pid] ? 'f' : '', S.roll ? S.roll.at : 'n', secret?.sc === S.sceneId ? 'k' : '', S.sigil ? 'g' : ''].join('|');
  if (ui.zoneKey !== zk) { ui.zoneKey = zk; $('#inter').innerHTML = interactionHTML(sc); afterMount(sc); }
  else liveUpdate(sc);
  $('#hostbar').innerHTML = hostBar(sc);
}

function narrate(key, text) {
  const el = $('#narr'); if (!el || ui.tw.key === key) return;
  ui.tw.key = key; clearInterval(ui.tw.t);
  let i = 0; el.textContent = ''; el.dataset.full = text;
  $('#dialog').classList.remove('done');
  ui.tw.t = setInterval(() => {
    i += 2; el.textContent = text.slice(0, i);
    if (i % 6 === 0) sfx.type();
    if (i >= text.length) { clearInterval(ui.tw.t); el.textContent = text; $('#dialog').classList.add('done'); }
  }, 22);
}

function interactionHTML(sc) {
  const sub = S.sub, p = me();
  if (sub === 'read') return lessonCard(sc) + (sc.ch ? `<div class="card box mission"><h4>${KIND_LABEL[sc.ch.kind]}</h4><p>${KIND_BRIEF[sc.ch.kind]}</p><p class="tr">LUCKY TRAIT: <b>${sc.ch.trait}</b></p></div>` : '');
  if (sub === 'vote') {
    const mine = null;
    return `<div class="choices">${sc.choices.map((c, i) => { const ok = availChoice(c); return `<button class="choice box" ${ok ? '' : 'disabled'} data-act="vote" data-i="${i}"><b>${'ABC'[i]}</b><span>${esc(c.l)}${c.needs ? `<em>NEEDS: ${esc(c.needs)}</em>` : ''}${c.coin && c.coin < 0 ? `<em>COST: ${-c.coin} ${esc(quest().coinName || 'COINS')}</em>` : ''}</span></button>`; }).join('')}</div>
      <div id="status"></div>`;
  }
  if (sub === 'result' && S.vres) {
    const v = S.vres, tot = Math.max(1, Object.keys(v.byPlayer).length);
    return `<div class="tally">${sc.choices.map((c, i) => `<div class="trow ${v.i === i ? 'won' : ''}"><b>${'ABC'[i]}</b><div class="bar"><i style="width:${(v.tally[i] || 0) / tot * 100}%"></i></div><span>${v.tally[i] || 0}</span><div class="who">${Object.entries(v.byPlayer).filter(([, k]) => k === i).map(([id]) => S.players[id] ? spriteHTML(S.players[id].hero, 22) : '').join('')}</div></div>`).join('')}</div>
      ${v.tied ? `<p class="note center">TIE! The spotlight hero breaks it.</p>` : ''}${lessonCard(sc)}`;
  }
  if (sub === 'work') return workHTML(sc);
  if (sub === 'judge') return `<div class="card box"><h4>${S.shown[0].kind === 'img' ? 'VOTE FOR YOUR FAVORITE' : 'VOTE FOR THE BEST ONE'}</h4><p>You cannot vote for your own. Tap one!</p></div>
    <div class="entries">${S.shown.map(e => `<button class="entry box ${e.pid === pid ? 'mine' : ''} ${ui.fav === e.pid ? 'sel' : ''}" ${e.pid === pid ? 'disabled' : ''} data-act="fav" data-to="${e.pid}">${e.kind === 'img' ? `<img src="${e.data}" alt="">` : `<q>${esc(e.data)}</q>`}<small>${e.pid === pid ? 'YOURS' : '???'}</small></button>`).join('')}</div><div id="status"></div><div id="timer"></div>`;
  if (sub === 'roll') return rollHTML(sc);
  return '';
}

const availChoice = c => !(c.needs && !S.items.includes(c.needs)) && !(c.coin && (S.coins || 0) + c.coin < 0);
const KIND_LABEL = { draw: 'DRAW IT', caption: 'CAPTION IT', roleplay: 'IN CHARACTER', charades: 'ACT IT OUT', riddle: 'RIDDLE LOCK', trivia: 'QUICK QUIZ', math: 'MATH TIME', fight: 'GLITCH FIGHT', sigil: 'THE SIGIL', swarm: 'THE SWARM' };
const KIND_BRIEF = {
  draw: 'Everyone draws at once on a little pixel canvas. Then the crew votes for a favorite.',
  caption: 'Everyone writes one funny line. Then the crew votes for the best one.',
  roleplay: 'Say what your hero does or says, in one sentence. The crew votes for the best.',
  charades: 'The spotlight hero acts it out with NO WORDS. Everyone else types guesses.',
  riddle: 'Everybody types answers at once. Everyone who solves it helps the team.',
  trivia: 'One question each. Right answers help the team roll.',
  math: 'Solve the problem. Right answers boost the roll, and the roll decides how many coins you earn.',
  fight: 'A Glitch Beast! Answer to find its weak spot. Heroes whose weapon matches it get a bonus.',
  sigil: 'The spotlight hero draws a secret sign. Everyone else picks the matching one.',
  swarm: 'The final battle! Every hero rolls three dice. Unused powers, saved coins, and allies add hits.'
};
const PALETTE = ['#0d0a1f', '#fff7e0', '#ff3b5c', '#ff8a1f', '#ffd23f', '#5fe36b', '#1e7a46', '#2de2e6', '#4d7cff', '#b266ff', '#ff6fb5', '#8a5a2b', '#e0b48a', '#6b6b8a', '#3a1f7a', '#c9d1e6'];

function workHTML(sc) {
  const ch = sc.ch, k = ch.kind, mine = S.subs[pid];
  const timer = `<div id="timer"></div>`;
  const head = txt => `<div class="card box mission"><h4>${KIND_LABEL[k]}</h4><p class="prompt">${esc(txt)}</p></div>`;
  if (k === 'draw') return head(S.prompt) + (mine ? sent() : `<div class="drawing box">
      <canvas id="pix" width="128" height="80"></canvas>
      <div class="tools"><div class="pal">${PALETTE.map((c, i) => `<button class="sw ${i === 0 ? 'sel' : ''}" style="--c:${c}" data-act="ink" data-v="${c}"></button>`).join('')}</div>
        <div class="tt"><button class="toolb sel" data-act="tool" data-v="pen">PEN</button><button class="toolb" data-act="tool" data-v="fill">FILL</button><button class="toolb" data-act="tool" data-v="erase">ERASE</button>
        <button class="toolb" data-act="size" data-v="1">SIZE 1</button><button class="toolb sel" data-act="size" data-v="2">SIZE 2</button><button class="toolb" data-act="size" data-v="4">SIZE 4</button><button class="toolb" data-act="clear">CLEAR</button></div></div>
      ${btn('DONE! SEND IT', 'data-act="send-draw"', 'g')}</div>`) + timer + `<div id="status"></div>`;
  if (k === 'caption' || k === 'roleplay') return head(S.prompt) + (mine ? sent() : `<div class="box pad write"><textarea id="txt" maxlength="${k === 'caption' ? 90 : 120}" placeholder="TYPE YOUR ${k === 'caption' ? 'CAPTION' : 'LINE'} HERE"></textarea>${btn('SEND IT', 'data-act="send-text"', 'g')}</div>`) + timer + `<div id="status"></div>`;
  if (k === 'charades') {
    const actor = pid === S.spot;
    return `<div class="card box mission"><h4>ACT IT OUT</h4>${actor ? `<p class="secret">${secret && secret.sc === S.sceneId ? esc(secret.text.toUpperCase()) : 'LOADING...'}</p><p>Only you can see this. NO WORDS, NO SOUNDS. Use your body and face!</p>` : `<p class="prompt">${esc(S.players[S.spot].name)} is acting. Type what you think it is!</p>`}</div>
      ${actor ? '' : `<div class="box pad write inline"><input id="guess" maxlength="40" autocomplete="off" placeholder="TYPE A GUESS">${btn('GUESS', 'data-act="guess"', 'g')}</div>`}
      <div id="feed" class="feed"></div>${timer}<div id="status"></div>`;
  }
  if (k === 'riddle') return `<div class="card box mission"><h4>RIDDLE LOCK</h4><p class="prompt">${esc(S.prompt.q)}</p><p id="hint" class="hint"></p></div>
      ${S.solved[pid] ? `<div class="box pad center ok">YOU GOT IT!</div>` : `<div class="box pad write inline"><input id="guess" maxlength="40" autocomplete="off" placeholder="TYPE YOUR ANSWER">${btn('TRY IT', 'data-act="guess"', 'g')}</div>`}
      <div id="feed" class="feed"></div>${timer}<div id="status"></div>`;
  if (k === 'sigil') {
    const actor = pid === S.spot;
    if (actor) return `<div class="card box mission"><h4>THE SIGIL</h4><p class="secret">${secret && secret.sc === S.sceneId ? esc(secret.text.toUpperCase()) : 'LOADING...'}</p><p>Draw this sign. Only you can see the name.</p></div>` + (mine ? sent() : `<div class="drawing box">
      <canvas id="pix" width="128" height="80"></canvas>
      <div class="tools"><div class="pal">${PALETTE.map((c, i) => `<button class="sw ${i === 0 ? 'sel' : ''}" style="--c:${c}" data-act="ink" data-v="${c}"></button>`).join('')}</div>
        <div class="tt"><button class="toolb sel" data-act="tool" data-v="pen">PEN</button><button class="toolb" data-act="tool" data-v="fill">FILL</button><button class="toolb" data-act="tool" data-v="erase">ERASE</button><button class="toolb" data-act="clear">CLEAR</button></div></div>
      ${btn('DONE! SHOW THE CREW', 'data-act="send-draw"', 'g')}</div>`) + timer + `<div id="status"></div>`;
    return `<div class="card box mission"><h4>THE SIGIL</h4><p class="prompt">${esc(S.players[S.spot].name)} is drawing the sign. Pick the one that matches!</p></div>
      ${S.sigil ? `<div class="box pad center"><img class="sigimg" src="${S.sigil}" alt="drawing"></div>` : '<div class="box pad center">WAITING FOR THE DRAWING...</div>'}
      <div class="choices">${S.prompt.o.map((o, i) => `<button class="choice box" ${S.answers[pid] || !S.sigil ? 'disabled' : ''} data-act="ans" data-i="${i}"><b>${'ABCD'[i]}</b><span>${esc(o)}</span></button>`).join('')}</div>${timer}<div id="status"></div>`;
  }
  if (['trivia', 'math', 'fight'].includes(k)) return `<div class="card box mission"><h4>${KIND_LABEL[k]}</h4>${k === 'fight' && S.prompt.beast ? `<div class="beastrow"><img class="beast" src="${beastURL(S.prompt.seed, 5)}" width="96" alt=""><b>${esc(S.prompt.beast)}</b></div>` : ''}<p class="prompt">${esc(S.prompt.q)}</p></div>
      <div class="choices">${S.prompt.o.map((o, i) => `<button class="choice box" ${S.answers[pid] ? 'disabled' : ''} data-act="ans" data-i="${i}"><b>${'ABCD'[i]}</b><span>${esc(o)}</span></button>`).join('')}</div>${timer}<div id="status"></div>`;
  return '';
}
const sent = () => `<div class="box pad center ok">SENT! WAITING FOR THE CREW...</div>`;

function swarmHTML(sc) {
  const r = S.roll, pw = id => !S.players[id].momentUsed;
  const beasts = Math.min(20, 8 + 3 * S.order.length);
  const rows = S.order.map(id => { const q = S.players[id], rr = r && r.rolls.find(x => x.pid === id);
    return `<div class="rrow ${id === pid ? 'me' : ''}">${spriteHTML(q.hero, 52)}<div class="rn"><b>${esc(q.name)}</b><small>${CLASS[q.hero.cls].power} ${pw(id) ? '<em>SAVED +4</em>' : '<em class="spent">SPENT</em>'}</small></div>
      <div class="dice3">${rr ? rr.dice.map(d => `<span class="die set">${d}</span>`).join('') : '<span class="die">?</span><span class="die">?</span><span class="die">?</span>'}</div>
      <div class="bon show">${rr ? `<b>${rr.hits} HITS</b>` : ''}</div></div>`; }).join('');
  const allies = r ? r.allyHits / 2 : 0;
  const result = r ? `<div class="result show" id="result"><div class="legend">BEASTS ${r.beasts}: HEROES ${r.rolls.reduce((a, x) => a + x.hits, 0)} + COINS+ECHO ${r.coinHits} + ALLIES ${r.allyHits} (${allies}) = ${r.total}</div>
    <div class="outcome ${r.outcome}">${r.left <= 0 ? 'ALL BEASTS UN-SCRAMBLED!' : r.left + ' BEASTS LEFT'}</div></div>` : '';
  return `<div class="card box"><h4>THE SWARM: ${beasts} GLITCH BEASTS</h4><div class="swarm">${Array.from({ length: beasts }, (_, i) => `<img src="${beastURL(i + 1, 2)}" width="36" class="${r && i >= r.left ? 'gone' : ''}" alt="">`).join('')}</div>
    <p>Saved coins: <b>${S.coins ?? 0}</b>. Allies: <b>${S.items.filter(i => quest().allies.includes(i)).join(', ') || 'none'}</b>${S.companion ? ' + AYO' : ''}.</p></div>
    <div class="rolls box pad">${rows}</div>${result}`;
}

function rollHTML(sc) {
  if (sc.ch.kind === 'swarm') return swarmHTML(sc);
  const ch = sc.ch, r = S.roll, p = me();
  const rows = S.order.map(id => {
    const q = S.players[id], tb = CLASS[q.hero.cls].traits[ch.trait] || 0;
    const rr = r && r.rolls.find(x => x.pid === id);
    return `<div class="rrow ${id === pid ? 'me' : ''}">${spriteHTML(q.hero, 52)}<div class="rn"><b>${esc(q.name)}</b><small>${ch.trait} +${tb}${q.moment ? ' <em>POWER READY</em>' : ''}${q.momentUsed && !(r && r.used.includes(id)) ? ' <em class="spent">POWER SPENT</em>' : ''}</small></div>
      <div class="die" data-d="${rr ? rr.d : 0}">${rr ? '?' : '?'}</div>
      <div class="bon">${rr ? `<span>${rr.tb ? '+' + rr.tb + ' TRAIT' : ''}</span><span>${rr.bonus ? '+' + rr.bonus + ' TEAM' : ''}</span><b data-t="${rr.total}">=${rr.total}</b>` : ''}</div></div>`;
  }).join('');
  const mom = !r && p && !p.momentUsed ? `<div class="btnrow">${btn(p.moment ? 'POWER ARMED!' : 'USE MY POWER: ' + CLASS[p.hero.cls].power, 'data-act="moment"', p.moment ? 'g' : 'p small')}</div>` : '';
  let result = '';
  if (r) {
    const pct = v => Math.min(100, Math.round(v / (r.need.great * 1.25) * 100));
    result = `<div class="result" id="result"><div class="meter"><i style="width:${pct(r.total)}%"></i><u style="left:${pct(r.need.ok)}%"></u><s style="left:${pct(r.need.great)}%"></s></div>
      <div class="legend">TEAM SCORE <b>${r.total}</b> &nbsp; NEED ${r.need.ok} FOR NICE, ${r.need.great} FOR GREAT</div>
      <div class="outcome ${r.outcome}">${{ great: 'GREAT!', ok: 'NICE!', oops: 'OOPS!' }[r.outcome]}${r.used.length ? `<small>POWER used by ${r.used.map(id => esc(S.players[id].name)).join(', ')}! +1 level</small>` : ''}</div>${lessonCard(sc)}</div>`;
  }
  return `<div class="card box"><h4>POWER ROLL</h4><p>${S.reveal ? (sc.ch.kind === 'charades' ? 'It was: <b>' + esc(S.reveal) + '</b>. ' : sc.ch.kind === 'riddle' ? 'The answer: <b>' + esc(S.reveal) + '</b>. ' : '') : ''}Every hero rolls a die. Good teamwork adds bonus points.</p>
    ${S.tres ? `<p class="note">Quiz answer: <b>${esc(S.prompt.o[S.tres.a])}</b></p>` : ''}</div>
    ${S.winners && S.winners.length ? `<div class="box pad center winners">CROWD FAVORITE: ${S.winners.map(id => esc(S.players[id].name)).join(' + ')} (+2)</div>` : ''}
    <div class="rolls box pad">${rows}</div>${mom}${result}`;
}

function afterMount(sc) {
  if (S.sub === 'work' && sc.ch.kind === 'draw' && !S.subs[pid]) initCanvas();
  if (S.sub === 'roll' && S.roll) animateRoll();
  if (S.sub === 'roll' && S.roll && ui.rollAt !== S.roll.at) { ui.rollAt = S.roll.at; sfx[S.roll.outcome](); }
  if (S.sub === 'work' && !S.subs[pid]) setTimeout(() => $('#txt, #guess')?.focus(), 50);
  liveUpdate(sc);
}

function liveUpdate(sc) {
  const st = $('#status');
  if (st) {
    if (S.sub === 'vote') st.innerHTML = crewStrip(S.votes);
    else if (S.sub === 'judge') st.innerHTML = crewStrip(S.favs);
    else if (S.sub === 'work') { const k = sc.ch.kind; st.innerHTML = crewStrip(k === 'riddle' ? S.solved : ['trivia', 'math', 'fight'].includes(k) ? S.answers : k === 'sigil' ? { ...S.answers, [S.spot]: !!S.sigil } : k === 'charades' ? S.solved : S.subs); }
  }
  const feed = $('#feed');
  if (feed) feed.innerHTML = S.guesses.map(g => `<div class="${g.ok ? 'ok' : ''}"><b>${esc(g.n)}</b> ${g.ok ? (g.t ? 'GOT IT: ' + esc(g.t) : 'GOT IT!') : esc(g.t)}</div>`).join('');
  const h = $('#hint'); if (h) h.textContent = S.hint && S.hintText ? 'HINT: ' + S.hintText : '';
  const gi = $('#guess'); if (gi && S.solved[pid]) gi.disabled = true;
}

function hostBar(sc) {
  const sub = S.sub;
  const label = { read: sc.choices ? 'OPEN THE VOTE' : sc.ch ? 'START THE CHALLENGE' : 'CONTINUE', vote: 'LOCK IN VOTES', result: 'CONTINUE', work: "TIME'S UP, GO ON", judge: 'REVEAL THE WINNER', roll: S.roll ? 'CONTINUE' : 'ROLL THE DICE' }[sub] || 'CONTINUE';
  if (!isHost) return `<div class="bar2"><span class="note">THE HOST CONTROLS THE PACE</span></div>`;
  return `<div class="bar2">${btn('HOST', 'data-act="parent"', 'p small')}${btn(label, 'data-act="next"', 'y big pulse')}</div>`;
}

function endScreen() {
  const e = S.ending, q = quest(), sc = scene();
  return `<section class="end"><div class="banner small"><img src="${backdropURL(sc.th, 9)}" alt=""></div>
    <div class="box pad endbox ${e.kind}"><div class="label">QUEST COMPLETE</div><h2>${esc(sc.title)}</h2><p>${esc(fill(sc.t))}</p>
      <div class="hearts">${hearts(S.spirit)}<span>CREW SPIRIT</span></div>
      ${S.items.length ? `<div class="items">ITEMS: ${S.items.map(i => `<span>${esc(i)}</span>`).join('')}</div>` : ''}</div>
    <div class="box pad podium"><div class="label">THE HEROES</div><div class="heroes">${S.order.map(id => { const p = S.players[id]; return `<div class="hh big">${spriteHTML(p.hero, 100, 'hop')}<b>${esc(p.name)}</b><small>THE ${CLASS[p.hero.cls].name}</small>${(S.awards?.[id] || []).map(a => `<span class="award">${a}</span>`).join('')}</div>`; }).join('')}</div></div>
    ${isHost ? `<div class="startbox">${btn('PLAY ANOTHER QUEST', 'data-act="pick"', 'y big')}${btn('NEW HEROES', 'data-act="tolobby"', 'c small')}</div>` : '<div class="note center">WAITING FOR THE HOST...</div>'}</section>`;
}

function hudHTML() {
  const q = quest(), play = S.phase === 'play' || S.phase === 'end';
  const est = q ? q.est[S.len] : 1, pct = S.phase === 'end' ? 100 : S.clockEnd ? Math.min(95, Math.round(100 - Math.max(0, S.clockEnd - now()) / (S.sel.mins * 600))) : Math.min(95, Math.round(S.visited / est * 100));
  return `<div class="hudin"><div class="hq">${play ? esc(q.short) : 'KINSHIP QUEST'}</div>
    ${play ? `${S.chapTotal ? `<div class="coins">CH <b>${Math.min(S.chap, S.chapTotal)}/${S.chapTotal}</b></div>` : ''}<div class="prog" title="Progress"><i style="width:${pct}%"></i></div><div class="hearts">${hearts(S.spirit)}</div>${S.coins != null ? `<div class="coins"><b>${S.coins}</b> COINS</div>` : ''}${S.clockEnd ? `<div class="coins"><b>${fmtTime(S.clockEnd - now())}</b></div>` : ''}` : `<div class="roomtag">ROOM <b>${esc(room)}</b></div>`}
    <button class="mini" data-act="mute" aria-label="sound">${isMuted() ? 'SOUND OFF' : 'SOUND ON'}</button><button class="mini" data-act="leave" aria-label="exit">EXIT</button></div>
    ${play && S.items.length ? `<div class="invbar">ITEMS: ${S.items.map(i => `<span>${esc(i)}</span>`).join('')}</div>` : ''}`;
}

function parentHTML() {
  return `<div class="box pad pp"><h3>HOST PANEL</h3><p class="note">Only the host sees this.</p>
    <div class="btnrow wrap">${btn('CHAOS CARD', 'data-act="chaos"', 'p')}${btn('+30 SECONDS', 'data-act="time"', 'c')}${S.phase === 'play' && S.sub === 'work' && scene().ch.kind === 'riddle' ? btn('GIVE A HINT', 'data-act="hint"', 'g') : ''}${S.phase === 'play' ? btn('SKIP THIS SCENE', 'data-act="skip"', 'y') : ''}</div>
    <div class="btnrow wrap">${S.phase === 'play' ? btn('END QUEST', 'data-act="pick"', 'p small') : ''}${btn('CLOSE', 'data-act="parent"', 'y small')}</div></div>`;
}

// ---------- drawing ----------
const pen = { color: '#0d0a1f', size: 2, tool: 'pen', down: false, last: null };
function initCanvas() {
  const c = $('#pix'); if (!c) return;
  const g = c.getContext('2d'); g.fillStyle = '#fff7e0'; g.fillRect(0, 0, 128, 80);
  pen.color = '#0d0a1f'; pen.size = 2; pen.tool = 'pen';
  const pt = e => { const r = c.getBoundingClientRect(); return { x: Math.floor((e.clientX - r.left) / r.width * 128), y: Math.floor((e.clientY - r.top) / r.height * 80) }; };
  const dot = (x, y) => { g.fillStyle = pen.tool === 'erase' ? '#fff7e0' : pen.color; const s = pen.size, o = Math.floor(s / 2); g.fillRect(x - o, y - o, s, s); };
  const line = (a, b) => { let dx = Math.abs(b.x - a.x), dy = -Math.abs(b.y - a.y), sx = a.x < b.x ? 1 : -1, sy = a.y < b.y ? 1 : -1, er = dx + dy, x = a.x, y = a.y; for (let n = 0; n < 400; n++) { dot(x, y); if (x === b.x && y === b.y) break; const e2 = 2 * er; if (e2 >= dy) { er += dy; x += sx; } if (e2 <= dx) { er += dx; y += sy; } } };
  c.onpointerdown = e => { const p = pt(e); if (pen.tool === 'fill') { flood(g, p.x, p.y, pen.color); return; } pen.down = true; pen.last = p; dot(p.x, p.y); c.setPointerCapture(e.pointerId); };
  c.onpointermove = e => { if (!pen.down) return; const p = pt(e); line(pen.last, p); pen.last = p; };
  c.onpointerup = c.onpointercancel = () => { pen.down = false; };
}
function flood(g, sx, sy, hex) {
  const img = g.getImageData(0, 0, 128, 80), d = img.data, i0 = (sy * 128 + sx) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2]];
  const n = parseInt(hex.slice(1), 16), f = [n >> 16, (n >> 8) & 255, n & 255];
  if (t[0] === f[0] && t[1] === f[1] && t[2] === f[2]) return;
  const st = [[sx, sy]];
  while (st.length) { const [x, y] = st.pop(); if (x < 0 || y < 0 || x >= 128 || y >= 80) continue; const i = (y * 128 + x) * 4; if (d[i] !== t[0] || d[i + 1] !== t[1] || d[i + 2] !== t[2]) continue; d[i] = f[0]; d[i + 1] = f[1]; d[i + 2] = f[2]; st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
  g.putImageData(img, 0, 0);
}

// ---------- dice animation ----------
function animateRoll() {
  const dice = [...document.querySelectorAll('.die')], res = $('#result');
  const finish = () => { dice.forEach(d => { d.textContent = d.dataset.d; d.classList.add('set'); }); res?.classList.add('show'); document.querySelectorAll('.bon').forEach(b => b.classList.add('show')); };
  if (now() - S.roll.at > 2200) return finish();
  let n = 0; const iv = setInterval(() => { dice.forEach(d => { d.textContent = 1 + Math.floor(Math.random() * 6); }); if (n++ % 2 === 0) sfx.roll(); if (n > 14) { clearInterval(iv); finish(); } }, 120);
}

// ---------- timers ----------
setInterval(() => {
  const el = $('#timer'); if (!el || !S || !S.deadline) { if (el) el.innerHTML = ''; return; }
  const left = S.deadline - now(), pct = Math.max(0, Math.min(100, left / S.dur * 100));
  el.innerHTML = `<div class="timer ${pct < 25 ? 'low' : ''}"><i style="width:${pct}%"></i><b>${fmtTime(left)}</b></div>`;
}, 250);

// ---------- chaos banner / parent / render ----------
function chaosCheck() {
  if (!S || !S.chaos || S.chaos.n === ui.lastChaos) { if (S && !S.chaos) { $('#chaos').classList.add('hidden'); } return; }
  ui.lastChaos = S.chaos.n; sfx.chaos();
  const el = $('#chaos'); el.innerHTML = `<div class="box"><h4>CHAOS CARD!</h4><p>${esc(S.chaos.text)}</p><button class="btn y small" data-act="chaosx">GOT IT</button></div>`; el.classList.remove('hidden');
}

function render() {
  const screen = $('#screen'), hud = $('#hud');
  if (view === 'title') { hud.classList.add('hidden'); if (ui.zoneKey !== 'title') { ui.zoneKey = 'title'; ui.sceneKey = ''; screen.innerHTML = titleScreen(); } return; }
  if (!S) { hud.classList.add('hidden'); ui.zoneKey = 'conn' + connState; ui.sceneKey = ''; screen.innerHTML = connectingScreen(); return; }
  hud.classList.remove('hidden'); hud.innerHTML = hudHTML();
  chaosCheck();
  if (S.phase === 'lobby') { ui.sceneKey = ''; ui.zoneKey = ''; if (document.activeElement?.tagName === 'INPUT') return; screen.innerHTML = lobbyScreen(); }
  else if (S.phase === 'pick') { ui.sceneKey = ''; ui.zoneKey = ''; B = null; screen.innerHTML = pickScreen(); }
  else if (S.phase === 'play') playScreen();
  else if (S.phase === 'end') { const k = 'end' + S.ending.id; if (ui.zoneKey !== k) { ui.zoneKey = k; ui.sceneKey = ''; screen.innerHTML = endScreen(); sfx.win(); } }
  const pp = $('#parent'); if (ui.parentOpen && isHost) { pp.innerHTML = parentHTML(); pp.classList.remove('hidden'); } else pp.classList.add('hidden');
}

// ---------- events ----------
const actions = {
  new() { const n = $('#nameIn').value.trim(); if (!n) return toast('Type your name first!'); store.setItem('kq-name', n); sfx.start(); start(Array.from({ length: 4 }, () => ROOM_LETTERS[Math.floor(Math.random() * ROOM_LETTERS.length)]).join(''), n, true); },
  join() { const n = $('#nameIn').value.trim(), c = $('#codeIn').value.trim().toUpperCase(); if (!n) return toast('Type your name first!'); if (!/^[A-Z]{4}$/.test(c)) return toast('Room codes are 4 letters.'); store.setItem('kq-name', n); sfx.join(); start(c, n, false); },
  cont() { const s = loadSession(); if (s) start(s.room, s.name, s.isHost); },
  leave() { if (!S || confirm('Leave this game?')) leave(); },
  mute() { setMuted(!isMuted()); render(); },
  hair(el) { B.hair = +el.dataset.v; sendHero(); sfx.blip(); },
  mode(el) { cmd('select', { quest: S.sel.quest, mode: el.dataset.v, len: S.sel.len, mins: S.sel.mins }); sfx.blip(); },
  mins(el) { cmd('select', { quest: S.sel.quest, mode: 'clock', len: S.sel.len, mins: +el.dataset.v }); sfx.blip(); },
  cls(el) { B.cls = el.dataset.v; B.quirk = B.quirk; sendHero(); sfx.select(); },
  skin(el) { B.skin = +el.dataset.v; sendHero(); sfx.blip(); },
  outfit(el) { B.outfit = +el.dataset.v; sendHero(); sfx.blip(); },
  
  ready() { act('ready', { v: !me().ready }); me().ready ? sfx.back() : sfx.ready(); },
  copy() { navigator.clipboard?.writeText(inviteLink()).then(() => toast('Invite link copied!'), () => toast(inviteLink())); },
  pick() { sfx.select(); cmd('pick'); },
  tolobby() { cmd('lobby'); },
  sel(el) { cmd('select', { quest: el.dataset.q, mode: S.sel.mode, len: S.sel.len, mins: S.sel.mins }); sfx.select(); },
  len(el) { cmd('select', { quest: S.sel.quest, mode: 'chapters', len: +el.dataset.v, mins: S.sel.mins }); sfx.blip(); },
  dial(el) { cmd('dial', { k: el.dataset.k, v: !S.dials[el.dataset.k] }); sfx.blip(); },
  begin() { sfx.start(); cmd('begin'); },
  next() { sfx.select(); cmd('next'); },
  vote(el) { act('vote', { i: +el.dataset.i }); document.querySelectorAll('.choice').forEach(b => b.classList.toggle('sel', b === el)); sfx.select(); },
  ans(el) { act('ans', { i: +el.dataset.i }); sfx.select(); },
  fav(el) { ui.fav = el.dataset.to; act('fav', { to: ui.fav }); document.querySelectorAll('.entry').forEach(b => b.classList.toggle('sel', b === el)); sfx.select(); },
  guess() { const i = $('#guess'); if (i && i.value.trim()) { act('guess', { text: i.value }); i.value = ''; i.focus(); sfx.blip(); } },
  'send-text'() { const t = $('#txt').value.trim(); if (!t) return toast('Write something first!'); act('submit', { data: t }); sfx.ready(); },
  'send-draw'() { act('submit', { data: $('#pix').toDataURL('image/png') }); sfx.ready(); },
  moment() { act('moment', { v: !me().moment }); sfx.select(); },
  ink(el) { pen.color = el.dataset.v; if (pen.tool === 'erase') pen.tool = 'pen'; document.querySelectorAll('.pal .sw').forEach(b => b.classList.toggle('sel', b === el)); document.querySelectorAll('[data-act=tool]').forEach(b => b.classList.toggle('sel', b.dataset.v === pen.tool)); },
  tool(el) { pen.tool = el.dataset.v; document.querySelectorAll('[data-act=tool]').forEach(b => b.classList.toggle('sel', b === el)); },
  size(el) { pen.size = +el.dataset.v; document.querySelectorAll('[data-act=size]').forEach(b => b.classList.toggle('sel', b === el)); },
  clear() { const g = $('#pix').getContext('2d'); g.fillStyle = '#fff7e0'; g.fillRect(0, 0, 128, 80); },
  parent() { ui.parentOpen = !ui.parentOpen; render(); },
  chaos() { cmd('chaos'); },
  chaosx() { $('#chaos').classList.add('hidden'); },
  time() { cmd('time'); },
  hint() { cmd('hint'); },
  skip() { if (confirm('Skip this scene?')) { ui.parentOpen = false; cmd('skip'); } }
};
function sendHero() { act('hero', { hero: B }); }

document.addEventListener('click', e => {
  if (e.target.closest('#dialog')) { const n = $('#narr'); if (n && n.dataset.full && ui.tw.t) { clearInterval(ui.tw.t); n.textContent = n.dataset.full; $('#dialog').classList.add('done'); } }
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act]; if (fn) fn(el);
  if (el.dataset.act === 'pick' && ui.parentOpen) { ui.parentOpen = false; render(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'guess') { e.preventDefault(); actions.guess(); }
  if (e.key === 'Enter' && e.target.id === 'codeIn') actions.join();
  if (e.key === 'Enter' && e.target.id === 'nameIn') ($('#codeIn').value ? actions.join : actions.new)();
  if (e.key === 'Enter' && e.target.id === 'txt' && !e.shiftKey) { e.preventDefault(); actions['send-text'](); }
});
document.addEventListener('input', e => { if (e.target.id === 'codeIn') e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ''); });

startStars($('#stars'));
render();
if (new URLSearchParams(location.search).get('room')) setTimeout(() => $('#nameIn')?.focus(), 100);
