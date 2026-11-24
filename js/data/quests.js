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
