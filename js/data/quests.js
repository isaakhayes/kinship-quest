import silentdrum from './quests/silentdrum.js';

export const QUESTS = { silentdrum };
export const QUEST_LIST = [silentdrum];

export const CHAPTER_LENGTHS = [
  { id: 1, name: 'SHORT', note: '~15 MIN' },
  { id: 2, name: 'MEDIUM', note: '~25 MIN' },
  { id: 3, name: 'LONG', note: '~35 MIN' }
];
export const CLOCK_LENGTHS = [
  { mins: 20, name: '20 MIN' }, { mins: 40, name: '40 MIN' }, { mins: 60, name: '60 MIN' }
];
