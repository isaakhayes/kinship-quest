import silentdrum from './quests/silentdrum.js';

export const QUESTS = { silentdrum };
export const QUEST_LIST = [silentdrum];

export const CHAPTER_LENGTHS = [
  { id: 1, name: 'SHORT', note: '5 CHAPTERS' },
  { id: 2, name: 'MEDIUM', note: '10 CHAPTERS' },
  { id: 3, name: 'LONG', note: '15 CHAPTERS' }
];
export const CLOCK_LENGTHS = [
  { mins: 20, name: 'SHORT', note: '20 MIN' }, { mins: 40, name: 'MEDIUM', note: '40 MIN' }, { mins: 60, name: 'LONG', note: '60 MIN' }
];

// Series: NDOTO CITY CHRONICLES. Shown as locked cards until built.
export const COMING_SOON = [
  { name: 'EPISODE 2: THE MOONMARKET HEIST', theme: 'market', tags: ['SNEAKY', 'MYSTERY', 'TEAMWORK'],
    blurb: 'Someone stole the Sun Crystal from the floating night market. Sneak in, spot the glitch in disguise, and crack the vault before dawn.' },
  { name: 'EPISODE 3: THE GREAT BEAST RACE', theme: 'weave', tags: ['CREATURES', 'RACING', 'COLLECT'],
    blurb: 'Befriend tamed Glitch Beasts, build your team, and race across the seven districts of Ndoto City to win the Golden Drum.' }
];
