// Heroes, traits, quirks. Pure data, shared by host and clients.
// Heroes are ROLES inspired by real African crafts and traditions, not deities or sacred figures.
// Each role lists its roots so the game can credit where the idea comes from.
export const TRAITS = ['BRAVE', 'CLEVER', 'SNEAKY', 'CHARMING', 'HANDY'];

export const CLASSES = [
  { id: 'keeper',    name: 'STORY KEEPER',   weapon: 'TALKING DRUM',    type: 'SOUND',   traits: { CHARMING: 2, BRAVE: 1 }, power: 'ECHO BOOM',      powerText: 'A wave of rhythm that calms beasts.', roots: 'Griot storytellers of West Africa (Mande and Wolof peoples), who keep history in song.' },
  { id: 'weaver',    name: 'WEB WEAVER',     weapon: 'THREAD GAUNTLETS', type: 'THREAD',  traits: { CLEVER: 2, SNEAKY: 1 },  power: 'GRAND LOOM',     powerText: 'Ties beasts up and holds the crew together.', roots: 'Akan weaving and spider stories from Ghana, where cloth and cleverness go together.' },
  { id: 'smith',     name: 'FORGE SMITH',    weapon: 'PLASMA HAMMER',   type: 'FORCE',   traits: { HANDY: 2, BRAVE: 1 },    power: 'SPARK STRIKE',   powerText: 'Breaks any lock, wall or barrier.', roots: 'Blacksmith traditions of the Mande and Yoruba peoples, respected as makers of tools and change.' },
  { id: 'navigator', name: 'STAR NAVIGATOR', weapon: 'STAR STAFF',      type: 'INSIGHT', traits: { CLEVER: 2, HANDY: 1 },   power: 'SKY MAP',        powerText: 'Shows the weak spot of every beast.', roots: 'Dogon star knowledge (Mali) and the dhow navigators of the Swahili coast.' },
  { id: 'archer',    name: 'SUN ARCHER',     weapon: 'LIGHT BOW',       type: 'LIGHT',   traits: { BRAVE: 2, SNEAKY: 1 },   power: 'SUNBURST',       powerText: 'Fires at many targets at once.', roots: 'The archers of Kush and Nubia, once called the Land of the Bow.' },
  { id: 'runner',    name: 'TIDE RUNNER',    weapon: 'SAIL BLADE',      type: 'WATER',   traits: { SNEAKY: 2, CHARMING: 1 }, power: 'RIVER RUSH',     powerText: 'Moves the whole crew fast and safe.', roots: 'The dhow sailors of the Swahili coast, who crossed oceans by wind and stars.' },
  { id: 'healer',    name: 'ROOT HEALER',    weapon: 'SEED STAFF',      type: 'LIFE',    traits: { CHARMING: 2, CLEVER: 1 }, power: 'BLOOM',          powerText: 'Restores a heart of crew spirit.', roots: 'Herbalists and community healers found across the continent.' },
  { id: 'builder',   name: 'STONE BUILDER',  weapon: 'EARTH SHIELD',    type: 'EARTH',   traits: { BRAVE: 2, HANDY: 1 },    power: 'GREAT WALL',     powerText: 'Raises a wall nothing can pass.', roots: 'The stone builders of Great Zimbabwe, Timbuktu and Lalibela.' }
];
export const CLASS = Object.fromEntries(CLASSES.map(c => [c.id, c]));

// Skin tones (deep to warm brown), hair styles, outfit colors.
export const SKINS = ['#3f2416', '#5a3520', '#7a4a2a', '#9a6238', '#bb7f4a', '#d9a066'];
export const HAIRS = ['AFRO', 'LOCS', 'BRAIDS', 'WRAP', 'PUFFS', 'FADE'];
export const OUTFITS = ['#ff3b5c', '#ff8a1f', '#ffd23f', '#5fe36b', '#2de2e6', '#4d7cff', '#b266ff', '#ff6fb5'];

export const PATTERNS = ['PLAIN', 'STRIPES', 'ZIGZAG', 'DIAMONDS', 'DOTS'];
export const ACCESSORIES = ['NONE', 'GOGGLES', 'HEADBAND', 'CROWN', 'EARRINGS', 'FACE PAINT', 'SCARF', 'CAPE', 'SHOULDER PADS'];
export const GLOWS = [['#2de2e6', 'CYAN'], ['#ffd23f', 'GOLD'], ['#ff6fb5', 'PINK'], ['#5fe36b', 'GREEN'], ['#b266ff', 'PURPLE'], ['#ff3b5c', 'RED']];

// Spirit Gem costs to unlock cosmetics (saved on each player's own device)
export const COSTS = { acc: { 3: 5, 5: 2, 7: 4, 8: 3 }, glow: { 4: 3, 5: 3 }, pattern: { 3: 3, 4: 2 } };

export const QUIRKS = [
  'Hums a different song for every mood', 'Always carries one extra snack', 'Names every machine they meet',
  'Cannot walk past a puddle without checking it', 'Talks to the stars like old friends', 'Collects shiny bolts and bottle caps',
  'Dramatic about everything, even toast', 'Gives every beast a nickname', 'Falls asleep in the middle of a plan',
  'Laughs at the worst possible time', 'Remembers every joke ever told', 'Makes up rhymes when nervous'
];
export const CATCHES = [
  '"Together, we are louder."', '"I have a plan. It has sparks in it."', '"The Weave is listening."',
  '"Snacks first, then destiny."', '"Do not worry. I have read the map. Upside down."', '"Trust the rhythm."',
  '"Everybody gets a turn to shine."', '"We rise together."', '"That was a glitch. I meant it."',
  '"One more try. Always one more."', '"Nothing is lost if we stay together."', '"Let us make some noise!"'
];

const pick = a => a[Math.floor(Math.random() * a.length)];

export function rollHero(takenClasses = []) {
  const free = CLASSES.filter(c => !takenClasses.includes(c.id));
  return {
    cls: pick(free.length ? free : CLASSES).id,
    skin: Math.floor(Math.random() * SKINS.length),
    hair: Math.floor(Math.random() * HAIRS.length),
    outfit: Math.floor(Math.random() * OUTFITS.length),
    trim: 2, pattern: 0, acc: 0, glow: 0,
    quirk: pick(QUIRKS),
    catch: pick(CATCHES)
  };
}

export function validHero(h) {
  const ok = (v, n) => Number.isInteger(v) && v >= 0 && v < n;
  return h && CLASS[h.cls] && ok(h.skin, SKINS.length) && ok(h.hair, HAIRS.length) && ok(h.outfit, OUTFITS.length) &&
    (h.trim == null || ok(h.trim, OUTFITS.length)) && (h.pattern == null || ok(h.pattern, PATTERNS.length)) && (h.acc == null || ok(h.acc, ACCESSORIES.length)) && (h.glow == null || ok(h.glow, GLOWS.length)) &&
    typeof h.quirk === 'string' && typeof h.catch === 'string';
}

export const CHAOS = [
  'DRUM CIRCLE: Everybody drums a beat on the table for ten seconds.',
  'WHISPER ALERT: Everyone yell-whispers for this whole scene.',
  'SOUND EFFECTS: Every sentence needs a sound effect. Zap! Whoosh! Boing!',
  'HERO SWAP: Pretend to be the player on your left for one minute.',
  'SLOW MOTION: Everyone moves and talks in slow motion.',
  'ROBOT MODE: Talk like a Weave robot. Beep boop.',
  'HERO POSE: Strike your hero pose before you say anything.',
  'RHYME TIME: Everything you say must rhyme.',
  'TINY VOICE: Everyone talks in the tiniest voice they can.',
  'GRIOT MODE: Tell the next part of the story like a grand storyteller.',
  'COMPLIMENT STORM: Say something kind about the player on your right.',
  'SNACK BREAK: Everybody get a snack right now, then keep playing.',
  'STATUE: When the host says freeze, everybody freezes for five seconds.'
];

// Values woven into the story, in plain English with an old word for each.
export const VALUES = {
  UNITY: 'Umoja', SELF: 'Kujichagulia', WORK: 'Ujima', ECONOMY: 'Ujamaa', PURPOSE: 'Nia', CREATIVITY: 'Kuumba', FAITH: 'Imani'
};
export const VALUE_NAMES = {
  UNITY: 'STAYING TOGETHER', SELF: 'DECIDING WHO YOU ARE', WORK: 'SHARED WORK', ECONOMY: 'SHARING AND SAVING',
  PURPOSE: 'KNOWING YOUR WHY', CREATIVITY: 'MAKING SOMETHING NEW', FAITH: 'BELIEVING IN EACH OTHER'
};
