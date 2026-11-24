// Heroes, traits, quirks. Pure data, shared by host and clients.
export const TRAITS = ['BRAVE', 'CLEVER', 'SNEAKY', 'CHARMING', 'HANDY'];

export const CLASSES = [
  { id: 'knight',   name: 'KNIGHT',   traits: { BRAVE: 2, HANDY: 1 },    move: 'SHIELD WALL',     blurb: 'Stands in front of everything, including soup.', hat: '#c9d1e6' },
  { id: 'wizard',   name: 'WIZARD',   traits: { CLEVER: 2, CHARMING: 1 }, move: 'OOPS-BE-GONE',   blurb: 'Knows 900 spells. Uses 3 of them.',               hat: '#6a3de8' },
  { id: 'rogue',    name: 'ROGUE',    traits: { SNEAKY: 2, CLEVER: 1 },  move: 'SHADOW SLIP',     blurb: 'Quiet as a sock. Sneakier than a sock, even.',    hat: '#1e7a46' },
  { id: 'bard',     name: 'BARD',     traits: { CHARMING: 2, BRAVE: 1 }, move: 'POWER BALLAD',    blurb: 'Turns any problem into a catchy song.',           hat: '#d9366f' },
  { id: 'tinkerer', name: 'TINKERER', traits: { HANDY: 2, CLEVER: 1 },   move: 'MEGA GADGET',     blurb: 'Fixes things. Also breaks things. Fixes those.',  hat: '#8a5a2b' },
  { id: 'pirate',   name: 'PIRATE',   traits: { BRAVE: 2, CHARMING: 1 }, move: 'CANNONBALL CHEER', blurb: 'Has a parrot. The parrot has opinions.',         hat: '#ff3b5c' },
  { id: 'ninja',    name: 'NINJA',    traits: { SNEAKY: 2, HANDY: 1 },   move: 'SMOKE POOF',      blurb: 'Vanishes when the dishes appear.',                hat: '#2a2250' },
  { id: 'robot',    name: 'ROBOT',    traits: { CLEVER: 2, HANDY: 1 },   move: 'BEEP BOOP BRAIN', blurb: 'Beep. Boop. Computing snacks.',                    hat: '#e8e8f0' }
];
export const CLASS = Object.fromEntries(CLASSES.map(c => [c.id, c]));

export const SKINS = ['#ffd9b3', '#f1b98a', '#d99a6c', '#b97a4f', '#8a5a3a', '#5e3b25'];
export const OUTFITS = ['#ff3b5c', '#ff8a1f', '#ffd23f', '#5fe36b', '#2de2e6', '#4d7cff', '#b266ff', '#ff6fb5'];

export const QUIRKS = [
  'Is scared of pigeons', 'Always has a snack', 'Can only yell-whisper', 'Collects interesting rocks',
  'Talks to plants', 'Wears socks with sandals', 'Names every cloud', 'Hums when thinking',
  'Has very dramatic sneezes', 'Thinks every puddle is a portal', 'Loves to rhyme', 'Gets lost in their own backyard'
];
export const CATCHES = [
  '"Trust me, I read half a book about this!"', '"Snacks first, then destiny."', '"I have a plan! It is loud."',
  '"Nothing can go wrong now!"', '"That sounded cooler in my head."', '"Adventure, assemble!"',
  '"Is that a clue or lunch?"', '"Plot twist!"', '"I was born ready. Mostly."', '"Hold my juice box."',
  '"Let us goooooo!"', '"I have three plans and one is good."'
];

const pick = a => a[Math.floor(Math.random() * a.length)];

export function rollHero(takenClasses = []) {
  const free = CLASSES.filter(c => !takenClasses.includes(c.id));
  const cls = pick(free.length ? free : CLASSES).id;
  return {
    cls,
    skin: Math.floor(Math.random() * SKINS.length),
    outfit: Math.floor(Math.random() * OUTFITS.length),
    quirk: pick(QUIRKS),
    catch: pick(CATCHES)
  };
}

export function validHero(h) {
  return h && CLASS[h.cls] && Number.isInteger(h.skin) && h.skin >= 0 && h.skin < SKINS.length &&
    Number.isInteger(h.outfit) && h.outfit >= 0 && h.outfit < OUTFITS.length &&
    typeof h.quirk === 'string' && typeof h.catch === 'string';
}

export const CHAOS = [
  'PIRATE RULE: Everyone talks like a pirate until the next scene.',
  'WHISPER ALERT: Everyone yell-whispers for this whole scene.',
  'SOUND EFFECTS: Every sentence needs a sound effect. Boing! Whoosh! Splat!',
  'HERO SWAP: Pretend to be the player on your left for one minute.',
  'SLOW MOTION: Everyone moves and talks in slow motion.',
  'ROBOT MODE: Talk like a robot. Beep boop. Use full robot voice.',
  'HERO POSE: Strike your hero pose before you say anything.',
  'RHYME TIME: Everything you say must rhyme.',
  'TINY VOICE: Everyone talks in the tiniest voice they can.',
  'OPERA MODE: Sing every answer like a big dramatic opera.',
  'ACCENT ATTACK: Pick a silly accent. Keep it until the next scene.',
  'COMPLIMENT STORM: Say something kind about the player on your right.',
  'SNACK BREAK: Everybody get a snack right now, then keep playing.',
  'STATUE: When the host says freeze, everybody freezes for five seconds.'
];

export const LESSON_TOPICS = ['TEAMWORK', 'HONESTY', 'KINDNESS', 'MONEY', 'COURAGE', 'CURIOSITY'];
