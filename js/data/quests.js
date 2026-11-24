import lighthouse from './quests/lighthouse.js';
import candybank from './quests/candybank.js';
import starzoo from './quests/starzoo.js';

export const QUESTS = { lighthouse, candybank, starzoo };
export const QUEST_LIST = [lighthouse, candybank, starzoo];

// Length tiers: 1 = Quick, 2 = Standard, 3 = Epic.
export const LENGTHS = [
  { id: 1, name: 'QUICK', mins: '~15 MIN' },
  { id: 2, name: 'STANDARD', mins: '~22 MIN' },
  { id: 3, name: 'EPIC', mins: '~30 MIN' }
];
