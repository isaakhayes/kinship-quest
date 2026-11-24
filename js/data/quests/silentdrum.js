// QUEST 1: The Silent Drum of Ndoto City. Afrofuturist adventure about community, sharing, and keeping your word.
export default {
  id: 'silentdrum',
  name: 'THE SILENT DRUM OF NDOTO CITY',
  short: 'SILENT DRUM',
  theme: 'skycity',
  tags: ['MATH', 'FIGHTS', 'RIDDLES'],
  blurb: 'The Great Drum that keeps Ndoto City together has gone quiet. Glitch Beasts are creeping in from the Weave. Ayo the courier needs a crew. Hurry up!',
  est: { 1: 10, 2: 13, 3: 16 },
  coins: 10,
  allies: ['Sefu', 'Builder Crew', 'Kwesi', 'Glow Pup', 'Mystery Charm'],
  twists: {
    pup: { before: 'earn', scene: 'tw_pup' },
    storm: { before: 'serpent', scene: 'tw_storm' },
    trickster: { before: 'prep', scene: 'tw_trick' }
  },
  rush: 'prep',
  late: ['prep', 'swarm', 'sw_end', 'r_end', 'end_a', 'end_b', 'end_c'],
  start: 'intro',
  scenes: {
    intro: {
      th: 'skycity', title: 'AYO NEEDS YOU',
      t: 'A courier on a glowing sail board skids to a stop in front of you. "I am Ayo! The Great Drum of Ndoto City has gone silent, and Glitch Beasts are slipping out of the Weave. Without the Drum the city forgets how to work together. I need a crew. Hurry up!"',
      next: 'c1'
    },
    c1: {
      th: 'rail', title: 'WHICH WAY IN?', min: 2, skip: 'loan',
      t: 'Ayo points two ways. The Skyrail is the quick road to the market, but a Static Hound is chewing the tracks. The old stairs are slow and safe. Which way?',
      lesson: { v: 'UNITY', tip: 'A crew decides together. Everybody gets a voice.', ask: 'When did your family decide something together?' },
      choices: [
        { l: 'Ride the Skyrail', res: 'Whoosh! The rail hums as you climb aboard. Then something snarls up ahead.', next: 'hound' },
        { l: 'Take the old stairs', res: 'Ayo grins. "Slow and steady. Still hurry up!" The stairs lead down into the market.', next: 'loan' }
      ]
    },
    hound: {
      th: 'rail', title: 'THE STATIC HOUND', noch: true,
      t: 'A Static Hound blocks the rail. It is not evil, only scrambled. A hero who knows its weak spot can un-scramble it! Answer fast.',
      ch: { kind: 'fight', trait: 'BRAVE', p: [
        { q: 'The Hound scrambles when sound is loud and clear. Which hero move should you try?', o: ['A rhythm wave', 'A nap', 'A whisper', 'Run away'], a: 0, beast: 'STATIC HOUND', weak: 'SOUND' },
        { q: 'Static clears when you give it a pattern. What is a pattern?', o: ['Something that repeats', 'A kind of fruit', 'A loud noise', 'A flat tire'], a: 0, beast: 'STATIC HOUND', weak: 'THREAD' }
      ] },
      out: {
        great: 'The Hound un-scrambles into a happy glowing puppy and licks everyone. The rail is clear!',
        ok: 'The Hound shakes itself and trots off, mostly un-scrambled. The rail is clear enough.',
        oops: 'The Hound hiccups static all over your boots. It runs off, but the ride is bumpy and slow.'
      },
      next: 'loan'
    },
    loan: {
      th: 'market', title: 'BABA KWESI\'S OFFER',
      t: 'The Sunday Market is loud and warm. An old trader, Baba Kwesi, waves you over. "Young heroes! You need coins to get through the Weave. I will lend you 25 coins today. When you come back, you pay me 50. Fair deal?"',
      lesson: { v: 'ECONOMY', tip: 'Borrowed coins must be paid back, and sometimes with extra. Plan before you spend.', ask: 'If you borrow 25 and owe 50, how much extra is that?' },
      choices: [
        { l: 'Accept the 25 coin loan', res: 'Baba Kwesi presses 25 coins into your hands. "Remember. Fifty back."', coin: 25, give: 'Kwesi Loan', next: 'shop' },
        { l: 'Politely say no thanks', res: 'Baba Kwesi laughs. "A careful crew! My stall is open anyway."', next: 'shop' }
      ]
    },
    shop: {
      th: 'market', title: 'THE STALLS', min: 2, skip: 'earn',
      t: 'The stalls glitter. A Glow Lantern costs 10 coins and lights dark places. A bottle of Drum Oil costs 5 coins. Coins spent now cannot help later.',
      lesson: { v: 'ECONOMY', tip: 'Saving keeps your options open. Spending early closes some doors.', ask: 'What is something you saved for instead of buying right away?' },
      choices: [
        { l: 'Buy a Glow Lantern (10 coins)', res: 'The lantern glows warm gold. Ayo whistles. "Nice!"', coin: -10, give: 'Glow Lantern', next: 'earn' },
        { l: 'Buy Drum Oil (5 coins)', res: 'The oil smells like cedar. A silent drum might love it.', coin: -5, give: 'Drum Oil', next: 'earn' },
        { l: 'Save every coin', res: 'You tuck the coins away. A wise crew keeps something for later.', next: 'earn' }
      ]
    },
    earn: {
      th: 'market', title: 'THE MARKET JOB',
      t: 'A stall owner needs help counting change for a long line of customers. Each right answer earns the crew coins. Pay attention to the math!',
      lesson: { v: 'WORK', tip: 'Working together gets more done, and fair work earns fair pay.', ask: 'What job at home is easier when everyone helps?' },
      ch: { kind: 'math', trait: 'CLEVER', p: [
        { q: 'A customer pays 20 coins for a mask that costs 14. How much change?', o: ['4', '6', '8', '10'], a: 1 },
        { q: 'Three friends each buy a drum charm for 5 coins. How many coins in all?', o: ['10', '12', '15', '20'], a: 2 },
        { q: 'You have 30 coins and spend 12. How many are left?', o: ['16', '18', '20', '22'], a: 1 }
      ] },
      outCoin: { great: 30, ok: 20, oops: 10 },
      lanternBonus: { item: 'Glow Lantern', coin: 5 },
      out: {
        great: 'The line moves like a dance and the owner overpays you. Coins rain in!',
        ok: 'A few mistakes, but the owner nods and pays you fairly.',
        oops: 'The change is a mess, but the owner is kind and pays you a little for the effort.'
      },
      next: 'sigil'
    },
    sigil: {
      th: 'hall', title: 'THE GATE OF SIGNS', min: 2, skip: 'serpent',
      t: 'The way to the Drum Hall is a gate with a glowing lock. {spot} sees the sign on a secret screen and draws it. Everyone else must pick the sign that matches. The lock only opens for the right answer.',
      lesson: { v: 'CREATIVITY', tip: 'A drawing is a message. Making something new helps others understand.', ask: 'What is the best thing you have ever made?' },
      ch: { kind: 'sigil', trait: 'CLEVER', p: [
        { t: 'a sun with three rays', o: ['Sun with 3 rays', 'Moon', 'Square', 'Wave'], a: 0 },
        { t: 'a bird over a hill', o: ['Fish', 'Bird over a hill', 'Tree', 'Cloud'], a: 1 },
        { t: 'a drum with a star above it', o: ['Drum and star', 'House', 'Heart', 'Boat'], a: 0 }
      ] },
      out: {
        great: 'The gate chimes and swings wide. Ayo does a little spin.',
        ok: 'The gate shudders, then opens with a long creak.',
        oops: 'The gate sulks, then opens anyway. It was not impressed.'
      },
      next: 'sefu'
    },
    sefu: {
      th: 'hall', title: 'SEFU THE DRUMMER', min: 2, skip: 'serpent',
      t: 'Inside the hall, a young drummer named Sefu sits beside the Great Drum, sticks in his lap. "I forgot how to start the beat," he whispers. "I know I cannot do it alone."',
      lesson: { v: 'PURPOSE', tip: 'Knowing why you do something gives you courage to begin.', ask: 'Why is your family important to you?' },
      choices: [
        { l: 'Sit and keep the beat with him', res: 'You tap along. Sefu smiles. "Now I remember. I will drum with you!"', give: 'Sefu', spirit: 1, next: 'door' },
        { l: 'Tell him it will be okay and move on', res: 'Sefu nods, but his hands still shake. Maybe later.', next: 'door' }
      ]
    },
    door: {
      th: 'hall', title: 'THE RIDDLE DOOR', min: 2, skip: 'serpent',
      t: 'A door of woven light blocks the stairs. A voice says, "Solve my riddle and you may pass." Everyone can answer. First to type it wins!',
      ch: { kind: 'riddle', trait: 'CLEVER', p: [
        { q: 'I have a face and two hands, but no arms or legs. What am I?', a: ['clock', 'a clock', 'watch', 'a watch'], hint: 'I tell you what time it is.' },
        { q: 'The more you take, the more you leave behind. What am I?', a: ['footsteps', 'steps', 'footstep'], hint: 'Walk on sand and look back.' },
        { q: 'I speak without a mouth and answer without ears. What am I?', a: ['echo', 'an echo'], hint: 'Shout in a canyon.' }
      ] },
      out: {
        great: 'The door unravels like a happy scarf. The voice says, "Wise crew."',
        ok: 'The door grumbles and slides open.',
        oops: 'The door sighs, "Close enough," and lets you through anyway.'
      },
      next: 'fair'
    },
    fair: {
      th: 'hall', title: 'THE FAIR SHARE', min: 3, skip: 'charades',
      t: 'Past the door, a basket holds 24 glow berries for the hungry folk of the hall. Six people are waiting. The crew must share fairly.',
      lesson: { v: 'ECONOMY', tip: 'Sharing fairly means everyone gets the same, or what they truly need.', ask: 'How do you share something when there is not enough?' },
      ch: { kind: 'math', trait: 'CLEVER', p: [
        { q: '24 berries shared equally among 6 people. How many each?', o: ['3', '4', '5', '6'], a: 1 },
        { q: '18 berries shared equally among 3 people. How many each?', o: ['5', '6', '7', '9'], a: 1 }
      ] },
      out: {
        great: 'Everybody gets a fair share and someone starts singing.',
        ok: 'Most folks get a fair share, with a small mix-up.',
        oops: 'Nobody goes hungry, but it takes three tries.'
      },
      next: 'charades'
    },
    charades: {
      th: 'hall', title: 'THE SILENT PERFORMANCE', min: 3, skip: 'neg',
      t: 'Ayo whispers that Glitch Beasts hate to be understood. {spot} will act out a secret animal of the Weave without words. Everyone else guesses!',
      ch: { kind: 'charades', trait: 'CHARMING', p: [
        { t: 'a giant stalking cat', k: ['lion', 'cat', 'leopard', 'cheetah'] },
        { t: 'a slow wise elephant', k: ['elephant'] },
        { t: 'a tall graceful bird', k: ['crane', 'bird', 'flamingo', 'ostrich'] },
        { t: 'a big laughing hyena', k: ['hyena'] }
      ] },
      out: {
        great: 'The Weave hums happily. A path opens, bright and wide.',
        ok: 'The Weave blinks. A narrow path opens.',
        oops: 'The Weave is confused, but a path wobbles open.'
      },
      next: 'neg'
    },
    neg: {
      th: 'hall', title: 'THE HARD TALK', min: 3, skip: 'serpent',
      t: 'The Keeper of the Hall will not let anyone near the Great Drum without a promise. Speak for the crew in one sentence. Tell why the city needs the Drum.',
      lesson: { v: 'SELF', tip: 'You get to say who you are and what you stand for.', ask: 'What is something you stand for?' },
      ch: { kind: 'roleplay', trait: 'CHARMING', p: ['In one sentence, tell the Keeper why the city needs the Drum', 'In one sentence, promise the Keeper how your crew will protect the Drum'] },
      out: {
        great: 'The Keeper bows. "A promise worth keeping."',
        ok: 'The Keeper nods slowly and steps aside.',
        oops: 'The Keeper sighs and mutters, "Fine. Go."'
      },
      next: 'serpent'
    },
    serpent: {
      th: 'weave', title: 'THE GLITCH SERPENT',
      t: 'Under the hall, the Weave glows green. A huge Glitch Serpent uncoils from the code, hissing static. Heroes whose weapons are woven can calm it. Everyone answer!',
      ch: { kind: 'fight', trait: 'BRAVE', p: [
        { q: 'The Serpent is made of tangled threads. What helps untangle things?', o: ['Patience', 'Shouting', 'Scissors', 'Giving up'], a: 0, beast: 'GLITCH SERPENT', weak: 'THREAD' },
        { q: 'To calm the Serpent, you should...', o: ['Stay calm and steady', 'Scream', 'Hide', 'Throw things'], a: 0, beast: 'GLITCH SERPENT', weak: 'THREAD' }
      ] },
      out: {
        great: 'The Serpent un-scrambles into a river of gold thread and flows peacefully away.',
        ok: 'The Serpent un-scrambles partway and slithers off, grumbling.',
        oops: 'The Serpent thrashes and dents the floor before fading. Everyone is a bit shaky.'
      },
      next: 'trade'
    },
    trade: {
      th: 'weave', title: 'THE STONE BUILDERS', min: 3, skip: 'r1',
      t: 'A crew of stone builders is stuck behind a broken bridge, with no coins to fix it. They would fight beside you if you help. It costs 10 coins to repair the bridge.',
      lesson: { v: 'UNITY', tip: 'When you help a neighbor, you often gain a friend.', ask: 'Who helped you recently?' },
      choices: [
        { l: 'Give 10 coins to fix the bridge', res: 'The builders cheer. "We will stand with you!"', coin: -10, give: 'Builder Crew', spirit: 1, next: 'r1' },
        { l: 'Wish them luck and go on', res: 'The builders wave sadly. Maybe next time.', next: 'r1' }
      ]
    },
    r1: { routes: [{ coins: 50, item: 'Kwesi Loan', to: 'repay' }, { missing: 'Kwesi Loan', to: 'prep' }, { to: 'short' }] },
    repay: {
      th: 'market', title: 'BABA KWESI GETS HIS 50', noch: true,
      t: 'You pass Baba Kwesi on the way back. You borrowed 25 and promised 50, and you have it. You hand over 50 coins. He beams. "A crew that keeps its word is rare. I will walk with you to the fight."',
      on: { coin: -50, take: 'Kwesi Loan', give: 'Kwesi' },
      lesson: { v: 'FAITH', tip: 'Keeping your word makes people believe in you.', ask: 'When did you keep a promise even though it was hard?' },
      next: 'prep'
    },
    short: {
      th: 'market', title: 'SHORT ON COINS', noch: true,
      t: 'Baba Kwesi waits. You owe him 50 coins but you do not have them. He looks sad but kind. "Come back when you can." Your crew feels a little heavy.',
      on: { take: 'Kwesi Loan', spirit: -1 },
      lesson: { v: 'ECONOMY', tip: 'If you borrow, plan how to pay it back. Saving early helps.', ask: 'How could you have saved more?' },
      next: 'prep'
    },
    prep: {
      th: 'hall', title: 'BEFORE THE SWARM',
      t: 'The Drum Hall rumbles. The Weave is cracking and dozens of Glitch Beasts are pouring out. You have a moment. You can spend 10 coins to charge the Drum with an Echo Charge, or save every coin for the fight.',
      lesson: { v: 'PURPOSE', tip: 'Spending on what matters most is a skill.', ask: 'What matters most when you have little?' },
      choices: [
        { l: 'Buy an Echo Charge (10 coins)', res: 'The Drum hums. It will answer once.', coin: -10, give: 'Echo Charge', next: 'swarm' },
        { l: 'Save all coins', res: 'Coins can shield the crew. They will matter.', next: 'swarm' }
      ]
    },
    swarm: {
      th: 'weave', title: 'THE SWARM',
      t: 'The Weave bursts open. Glitch Beasts surround the crew, pixel-bright and humming static. Everyone rolls to un-scramble them. Saved powers, saved coins, and allies all help!',
      lesson: { v: 'UNITY', tip: 'What you saved and who you helped now come back to you.', ask: 'Who would stand with you in a hard moment?' },
      ch: { kind: 'swarm', trait: 'BRAVE', p: [{}] },
      out: {
        great: 'Every beast un-scrambles at once. The Hall glows gold.',
        ok: 'Most of the beasts un-scramble. A few slip away, humming softly.',
        oops: 'The beasts are too many. The crew falls back, but the Drum stays warm.'
      },
      next: 'r_end'
    },
    tw_pup: {
      th: 'market', title: 'A LOST GLOW PUP', noch: true,
      t: 'Something small and glowing tugs at your boot. It is a Glow Pup, a tiny Weave creature that wandered out of the code. It looks lost. Ayo says, "Quick, decide. Hurry up!"',
      lesson: { v: 'UNITY', tip: 'Helping someone small makes the whole crew stronger.', ask: 'When did you help someone who was lost or scared?' },
      choices: [
        { l: 'Pick it up and keep it with the crew', res: 'The pup licks your chin and glows warm. It will fight beside you!', give: 'Glow Pup', spirit: 1, next: '__ret' },
        { l: 'Point it toward the safe lanes and move on', res: 'The pup trots off, wagging its pixel tail.', next: '__ret' }
      ]
    },
    tw_storm: {
      th: 'weave', title: 'A STATIC STORM', noch: true,
      t: 'The air crackles. A Static Storm rolls through the Weave, turning the floor to fizz. You can wait it out together, or race through for a shortcut.',
      lesson: { v: 'FAITH', tip: 'Patience and trust get a team through scary moments.', ask: 'When did waiting together beat rushing?' },
      choices: [
        { l: 'Shelter together and wait it out', res: 'You huddle close. The storm passes and everyone feels steadier.', spirit: 1, next: '__ret' },
        { l: 'Race through the fizz', res: 'Zap! You make it, a bit singed, but you find 10 coins on the other side.', coin: 10, spirit: -1, next: '__ret' }
      ]
    },
    tw_trick: {
      th: 'hall', title: 'AUNTIE STATIC', noch: true,
      t: 'A flickering trickster in a patchwork coat steps out of the shadows. "I am Auntie Static, and I love a good bargain. Ten coins for a Mystery Charm. Could be brilliant. Could be a sock." She winks.',
      lesson: { v: 'SELF', tip: 'You decide what is worth your coins. A good deal is one you chose on purpose.', ask: 'How do you decide if something is worth buying?' },
      choices: [
        { l: 'Pay 10 coins for the Mystery Charm', res: 'The charm hums and sparkles. It is no sock. It will help in the final fight!', coin: -10, give: 'Mystery Charm', next: '__ret' },
        { l: 'Say no thank you', res: 'Auntie Static laughs. "Smart. Or scared. Either way, good luck!" She melts into static.', next: '__ret' }
      ]
    },
    r_end: { routes: [{ spirit: 4, to: 'end_a' }, { spirit: 2, to: 'end_b' }, { to: 'end_c' }] },
    end_a: {
      th: 'skycity', title: 'THE DRUM SINGS AGAIN', end: 'triumph',
      t: 'Sefu strikes the Great Drum and the whole city feels it. Lights flicker on. Neighbors step into the streets. The Glitch Beasts become glowing lanterns drifting over the rooftops. Ayo salutes the crew. "You did not just save the Drum. You reminded us how to be a city."'
    },
    end_b: {
      th: 'skycity', title: 'A STEADY BEAT', end: 'cozy',
      t: 'The Drum starts quietly, a soft heartbeat across Ndoto City. Some Glitch Beasts linger in the corners, but they hum along. Ayo grins. "Good start. We will keep it going together."'
    },
    end_c: {
      th: 'skycity', title: 'THE LONG WAY HOME', end: 'wobbly',
      t: 'The Drum only whispers, but it is awake. The crew limps home, tired and a little scrambled. Ayo shrugs. "Hey, we learned a lot. Next time, we save more and share more." The city waits, patient.'
    }
  }
};
