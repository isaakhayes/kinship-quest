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
  mission: 'WAKE THE DRUM',
  fixed: [{ before: 'door', scene: 'bell1', item: 'Overdrive Core' }, { before: 'prep', scene: 'bell2', item: 'Overdrive Core' }],
  allies: ['Sefu', 'Builder Crew', 'Glow Pup', 'Mystery Charm'],
  twists: {
    pup: { before: 'earn', scene: 'tw_pup' },
    thief: { before: 'sigil', scene: 'tw_tempt', players: 2 },
    storm: { before: 'door', scene: 'tw_storm' },
    accuse: { before: 'serpent', scene: 'tw_accuse', needs: 'thief' },
    trickster: { before: 'prep', scene: 'tw_trick' }
  },
  rush: 'prep',
  late: ['prep', 'swarm', 'sw_end', 'r_end', 'end_a', 'end_b', 'end_c'],
  start: 'intro',
  scenes: {
    intro: {
      th: 'night', title: 'THE FALL', meets: ['hound'],
      panels: [
        { th: 'night', seed: 11, cap: 'THE SKYLINE HAULER. 400 MILES AN HOUR. YOU ARE STOWED IN CRATE NINE.', layers: [{ k: 'c:maglev', x: 8, y: 52, w: 82 }, { k: 'crew', x: 18, y: 46, w: 40 }] },
        { th: 'night', seed: 14, shake: true, cap: 'SOMETHING LANDS ON THE ROOF.', layers: [{ k: 'c:maglev', x: 2, y: 62, w: 96 }, { k: 'c:hound', x: 30, y: 10, w: 46 }] },
        { th: 'skycity', seed: 6, shake: true, cap: 'THE CARS TEAR LOOSE. THE CITY IS 300 FEET BELOW.', layers: [{ k: 'crew', x: 10, y: 34, w: 70, tilt: true }] }
      ],
      t: 'You are stowed in crate nine on the Skyline Hauler, racing over Ndoto City. Then the roof screams. A Static Hound lands and the car tears loose!',
      next: 'fall'
    },
    fall: {
      th: 'skycity', title: 'THE DROP', noch: true, team: true,
      t: 'You are falling. Everybody moves at once. Pick your move, because every move counts!',
      choices: [
        { l: 'Leap for the sail board streaking past', res: 'You launch. A glowing board scoops you up mid-air and somebody laughs in your ear.', next: 'pitch' },
        { l: 'Kick the Hound off the car', res: 'THUNK. The Hound tumbles away, zapping your boots on the way out.', next: 'pitch' },
        { l: 'Dive into the cargo crate', res: 'You slam the lid. The crate bounces, rattles, and spits you out with bruises.', next: 'pitch' }
      ],
      next: 'pitch'
    },
    pitch: {
      th: 'rail', title: 'AYO SAVES YOU', noch: true, on: { spirit: -1 },
      panels: [{ th: 'rail', seed: 9, cap: 'AYO, COURIER OF NDOTO.', layers: [{ k: 'ayo', x: 30, y: 28, w: 24 }, { k: 'crew', x: 4, y: 52, w: 56 }] }],
      t: 'Ayo, a courier on a patched sail board, hauls you aboard. "I will get you out, but I need your help. The Great Drum has gone silent. Reach the Drum Hall with me, or those things will hunt us again." The board coughs smoke. "We have ten coins. We need an edge."',
      lesson: { v: 'UNITY', tip: 'Strangers become a crew when they help each other first.', ask: 'When did someone help you before you could help them back?' },
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
      th: 'market', title: 'BIG MO\'S DEAL', meets: ['mo'],
      panels: [{ th: 'market', seed: 21, cap: 'BIG MO. BEST WEAPONS IN NDOTO.', layers: [{ k: 'c:mo', x: 56, y: 12, w: 34 }, { k: 'crew', x: 4, y: 54, w: 44 }] }],
      t: 'Big Mo steps out of the crowd, holding a sword of pure light. "The Overdrive Core beats anything in this city. Fifty coins, normally. For you, ten a bell." He grins. "Miss one and it dims. Miss two and my Collectors visit."',
      lesson: { v: 'ECONOMY', tip: 'A great deal can still cost you every week.', ask: 'What is something you wanted that ended up costing more than the price tag?' },
      choices: [
        { l: 'Take the Core (10 coins each bell)', res: 'The Core snaps onto your weapon and hums. Big Mo winks. "Ten at the next bell. Do not forget."', give: 'Overdrive Core', next: 'shop' },
        { l: 'Pay 50 coins now', res: 'Big Mo whistles. "Cash in hand. I like you." The Core is yours for good.', coin: -50, give: 'Overdrive Core', fixcore: true, next: 'shop' },
        { l: 'No thanks, we do this the scrappy way', res: 'Big Mo laughs. "Scrappy! Good luck with that." The crew stands a little taller.', spirit: 1, next: 'shop' }
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
      t: 'A stall owner needs sharp heads for a big deal. Discounts, profits, and tricky pricing, and everyone answers on their own screen. Each right answer earns the crew coins!',
      lesson: { v: 'WORK', tip: 'Working together gets more done, and fair work earns fair pay.', ask: 'What job at home is easier when everyone helps?' },
      ch: { kind: 'math', trait: 'CLEVER', gen: ['percentOff', 'multiStep', 'unitPrice', 'orderOps', 'change'], p: [{}] },
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
      t: 'The way to the Drum Hall is a gate with a glowing lock. {spot} sees the sign on a secret screen and draws it. Everyone else picks the sign that matches.',
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
      t: 'A young drummer named Sefu sits beside the Great Drum. "Last Festival the Drum stopped mid-beat. Every grown-up froze, humming static. Only kids are left to run the city." He looks at his hands. "I forgot how to start the beat. I cannot do it alone."',
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
      t: 'Past the door, the hall keeper has a pile of supplies and a pile of puzzles. Fractions, shares, and a tricky trade-off. The crew must figure out what is fair.',
      lesson: { v: 'ECONOMY', tip: 'Sharing fairly means everyone gets the same, or what they truly need.', ask: 'How do you share something when there is not enough?' },
      ch: { kind: 'math', trait: 'CLEVER', gen: ['fraction', 'shareRemainder', 'interest', 'area', 'rate'], p: [{}] },
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
      meets: ['serpent'], th: 'weave', title: 'THE GLITCH SERPENT',
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
      th: 'weave', title: 'THE STONE BUILDERS', min: 3, skip: 'prep',
      t: 'A crew of stone builders is stuck behind a broken bridge, with no coins to fix it. They would fight beside you if you help. It costs 10 coins to repair the bridge.',
      lesson: { v: 'UNITY', tip: 'When you help a neighbor, you often gain a friend.', ask: 'Who helped you recently?' },
      choices: [
        { l: 'Give 10 coins to fix the bridge', res: 'The builders cheer. "We will stand with you!"', coin: -10, give: 'Builder Crew', spirit: 1, next: 'prep' },
        { l: 'Wish them luck and go on', res: 'The builders wave sadly. Maybe next time.', next: 'prep' }
      ]
    },
    prep: {
      th: 'hall', title: 'BEFORE THE SWARM', team: true,
      t: 'The Drum Hall rumbles. Dozens of Glitch Beasts are pouring out of the Weave. You have one moment. Every hero picks their OWN job, and every job counts. The crew will be stronger for each one chosen!',
      lesson: { v: 'PURPOSE', tip: 'A team wins when each person picks a different job that fits them.', ask: 'What job do you do best when your family works together?' },
      choices: [
        { l: 'Charge the Drum (10 coins): the Drum answers once', res: 'You charge the Drum. It hums and waits.', coin: -10, give: 'Echo Charge', perk: 'charge', next: 'swarm' },
        { l: 'Train hard: your strikes land harder (+3 hits)', res: 'You drill your strikes until they sing.', perk: 'train', next: 'swarm' },
        { l: 'Guard the crew: fewer beasts get through (3 less)', res: 'You plant yourself in front of the crew.', perk: 'guard', next: 'swarm' },
        { l: 'Scout the Weave map: find the weak spots (+2 hits)', res: 'You find the beasts weak seams.', perk: 'scout', next: 'swarm' }
      ],
      next: 'swarm'
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
    bell1: {
      th: 'market', title: 'THE MARKET BELL', noch: true,
      t: 'DONG. The market bell rings. Big Mo steps out of the crowd, tapping his wrist. "Ten coins. Bell time." The Core on your weapon hums, waiting.',
      choices: [
        { l: 'Pay Big Mo 10 coins', res: 'Big Mo nods. "A pleasure doing business." The Core glows brighter.', coin: -10, next: '__ret' },
        { l: 'Skip it and hope he does not notice', res: 'The Core flickers and dims. Big Mo narrows his eyes. "Noted."', missed: true, next: 'r_bell' }
      ]
    },
    bell2: {
      th: 'hall', title: 'LAST BELL', noch: true,
      t: 'DONG. The bell rings through the Hall. Big Mo is there, arms crossed. "Ten coins, hero. Last bell before the big fight."',
      choices: [
        { l: 'Pay Big Mo 10 coins', res: 'He tips an imaginary hat. The Core hums at full power.', coin: -10, next: '__ret' },
        { l: 'Skip it. The Drum matters more.', res: 'The Core dims. Big Mo shrugs. "Your funeral." He melts into the shadows.', missed: true, next: 'r_bell' }
      ]
    },
    r_bell: { routes: [{ item: 'Dead Core', to: 'collectors' }, { to: '__ret' }] },
    collectors: {
      th: 'market', title: 'THE COLLECTORS', noch: true, meets: ['collector'],
      panels: [{ th: 'market', seed: 33, shake: true, cap: 'HOVER BOOTS. HOOKS. NO SMILES.', layers: [{ k: 'c:collector', x: 6, y: 20, w: 28 }, { k: 'c:collector', x: 38, y: 20, w: 28 }, { k: 'crew', x: 68, y: 55, w: 28 }] }],
      t: 'Two Collectors drop in on hover boots, hooks swinging. "Big Mo says you missed two bells. The Core comes back with us. Or you pay up, with interest." They tap their hooks together.',
      lesson: { v: 'FAITH', tip: 'Promises to pay are promises. Breaking them has a cost, even if nobody is looking.', ask: 'What happens to trust when a promise gets skipped?' },
      choices: [
        { l: 'Pay 20 coins and get the Core working again', res: 'The Collectors count the coins. "Pleasure." The Core snaps back to life.', coin: -20, fixcore: true, next: '__ret' },
        { l: 'Let them take it and stand tall', res: 'They yank the Core off and hover away. The crew is lighter, and a little proud.', spirit: -1, next: '__ret' }
      ]
    },
    tw_pup: {
      th: 'market', title: 'A LOST GLOW PUP', noch: true, meets: ['pup'],
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
    tw_tempt: {
      th: 'market', title: 'A SECRET OFFER', noch: true, team: true, secret: true,
      t: 'A hooded figure whispers on your own screen only: "Slip 15 coins from the crew pouch. Nobody will know, and I will make sure you get a secret reward." Choose in secret.',
      lesson: { v: 'FAITH', tip: 'Trust is the most valuable coin a crew has. Once it is spent, it is hard to earn back.', ask: 'Why does trust matter more when nobody is watching?' },
      choices: [
        { l: 'Refuse. The crew comes first.', res: 'You shake your head and walk away.', next: '__ret' },
        { l: 'Take the deal in secret (15 coins disappear)', res: 'The coins slip into your sleeve.', coin: -15, thief: true, next: '__ret' }
      ],
      resTaken: 'The hooded figure is gone. Ayo frowns. "The pouch feels lighter. Somebody here made a deal." Nobody says a word.',
      resNone: 'The hooded figure leaves with nothing. Ayo grins. "Loyal crew. I like it."',
      next: '__ret'
    },
    tw_accuse: {
      th: 'hall', title: 'THE LIGHT POUCH', noch: true, accuse: true,
      t: 'Ayo holds up the crew pouch. "It is lighter than it should be. Did someone take coins?" Talk it over, then secretly name who you think it was, or trust the crew. Careful: a wrong accusation hurts everyone.',
      lesson: { v: 'SELF', tip: 'Accusing someone without proof can hurt a team. Asking questions first is fairer.', ask: 'How do you tell the truth from a fib?' },
      resCaught: 'It was {name}! The coins come back and the whole crew feels lighter. Honesty brings the glow back.',
      resWrong: '{name} did nothing wrong. The crew argues and the real shadow keeps quiet. Spirit drops.',
      resNone: 'The crew decides to trust each other. The pouch stays light, and somebody is smiling in the dark.',
      next: '__ret'
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
      t: 'Sefu strikes the Great Drum and the whole city feels it. Lights flicker on. Neighbors step into the streets. The Glitch Beasts become glowing lanterns drifting over the rooftops. Ayo salutes the crew. "You did not just save the Drum. You reminded us how to be together."'
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
