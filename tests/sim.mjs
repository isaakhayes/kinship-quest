// Simulates full games with random players against the host engine. Run: node tests/sim.mjs
globalThis.localStorage = { setItem() {}, getItem() { return null; } };
import { Host } from '../js/host.js';
import { QUESTS } from '../js/data/quests.js';

let bad = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.floor(Math.random() * a.length)];

for (const qid of Object.keys(QUESTS)) for (const len of [1, 2, 3]) for (let run = 0; run < 12; run++) {
  const n = 1 + Math.floor(Math.random() * 6);
  const sent = [];
  const h = new Host('TEST', 'p0', 'Host', m => sent.push(m), () => {});
  for (let i = 1; i < n; i++) h.handle({ t: 'join', pid: 'p' + i, name: 'P' + i });
  const ids = Array.from({ length: n }, (_, i) => 'p' + i);
  ids.forEach(id => h.handle({ t: 'act', pid: id, a: 'ready', v: true }));
  const host = c => h.handle({ t: 'act', pid: 'p0', a: 'host', ...c });
  host({ cmd: 'pick' }); host({ cmd: 'select', quest: qid, len, mode: run % 2 ? 'clock' : 'chapters', mins: [20, 40, 60][len - 1] }); host({ cmd: 'begin' });
  const seen = []; let steps = 0;
  while (h.G.phase === 'play' && steps++ < 200) {
    const G = h.G, sc = h.scene();
    if (!seen.includes(G.sceneId)) seen.push(G.sceneId);
    if (G.sub === 'vote') ids.forEach(id => { const opts = sc.choices.map((c, i) => i).filter(i => h.avail(sc.choices[i])); h.handle({ t: 'act', pid: id, a: 'vote', i: pick(opts) }); });
    if (G.sub === 'work') {
      const k = sc.ch.kind;
      ids.forEach(id => {
        if (k === 'draw') h.handle({ t: 'act', pid: id, a: 'submit', data: 'data:image/png;base64,AAAA' });
        else if (k === 'caption' || k === 'roleplay') h.handle({ t: 'act', pid: id, a: 'submit', data: 'hello ' + id });
        else if (k === 'sigil') { if (id === G.spot) h.handle({ t: 'act', pid: id, a: 'submit', data: 'data:image/png;base64,AAAA' }); else h.handle({ t: 'act', pid: id, a: 'ans', i: Math.floor(Math.random() * 4) }); }
        else if (['trivia', 'math', 'fight'].includes(k)) h.handle({ t: 'act', pid: id, a: 'ans', i: Math.floor(Math.random() * 4) });
        else if (k === 'riddle') h.handle({ t: 'act', pid: id, a: 'guess', text: Math.random() < .5 ? h.priv.prompt.a[0] : 'nope' });
        else if (k === 'charades' && id !== G.spot) h.handle({ t: 'act', pid: id, a: 'guess', text: Math.random() < .5 ? h.priv.secret.k[0] : 'nope' });
      });
    }
    if (G.sub === 'judge') ids.forEach(id => { const other = ids.find(x => x !== id); if (other) h.handle({ t: 'act', pid: id, a: 'fav', to: other }); });
    if (G.sub === 'roll' && !G.roll && Math.random() < .5) h.handle({ t: 'act', pid: pick(ids), a: 'moment', v: true });
    host({ cmd: 'next' });
    if (sc.ch && G.sub === 'roll' && G.roll) { /* next call continues */ }
  }
  if (h.G.phase !== 'end') { bad++; console.log('STUCK', qid, len, 'scene', h.G.sceneId, h.G.sub, 'steps', steps); }
  else if (run === 0) console.log(qid, 'len', len, 'players', n, 'scenes', seen.length, seen.join('>'), '=>', h.G.ending.id, 'spirit', h.G.spirit);
  h.stop();
}
console.log(bad ? 'FAILED ' + bad : 'ALL OK');
process.exit(bad ? 1 : 0);
