// QUEST 1: The Lighthouse That Lost Its Light. Mystery and kindness. Quick/Standard/Epic.
// Scene tokens: {spot} = spotlight player, {crew} = everyone.
export default {
  id: 'lighthouse',
  name: 'THE LIGHTHOUSE THAT LOST ITS LIGHT',
  short: 'THE LOST LIGHT',
  theme: 'sea',
  tags: ['MYSTERY', 'KINDNESS'],
  blurb: 'The lighthouse at Gull Cove has gone dark, and ships are drifting toward the rocks. Find out why before the tide comes in.',
  est: { 1: 9, 2: 11, 3: 14 },
  start: 'intro',
  scenes: {
    intro: {
      th: 'sea', title: 'GULL COVE, DUSK',
      t: "Dusk at Gull Cove. The harbor puffin, Captain Marlow, waves his tiny hat at {crew}. \"The lighthouse has gone DARK! Ships are drifting toward the rocks and the tide comes in at midnight. You are my last hope. Also my first hope. I ran out of hopes.\"",
      silly: 'Captain Marlow is wearing two hats. He says one is for emergencies. Both are for emergencies.',
      next: 'c1'
    },
    c1: {
      th: 'cliff', title: 'TWO WAYS UP',
      t: 'Two ways lead to the lighthouse. The bay is choppy but quick. The cliff path is steep but dry. Which way does the crew go?',
      lesson: { topic: 'TEAMWORK', tip: 'Big choices are easier when everybody gets a say.', ask: 'What helps our family decide things together?' },
      choices: [
        { l: 'Row across the bay', res: 'Splash! The old rowboat lurches away from the dock. Hold on tight!', next: 'boat' },
        { l: 'Climb the cliff path', res: 'Up you go! The path is narrow and the seagulls are watching you very closely.', next: 'cliff' }
      ]
    },
    boat: {
      th: 'sea', title: 'LEAK AT SEA',
      t: 'Halfway across the bay, the rowboat springs a leak! Water bubbles up through the floor. Time to invent something, fast.',
      ch: { kind: 'draw', trait: 'HANDY', p: ['Draw a gadget that stops the leak', 'Draw a super patch made from things you would find on a boat', 'Draw a silly pump that bails out water FAST'] },
      out: {
        great: 'Your inventions are so clever the boat practically fixes itself. It even gives a happy little burp.',
        ok: 'The patch holds, mostly. You arrive a bit soggy but proud.',
        oops: 'The patch pops off. You paddle the rest of the way with a bucket and a lot of splashing.'
      },
      next: 'whirl'
    },
    whirl: {
      th: 'sea', title: 'THE WHIRLPOOL', min: 3, skip: 'arrive',
      t: "A whirlpool swirls ahead and a wise old crab pops up. \"Answer my question and I will let you pass,\" he clicks.",
      ch: { kind: 'trivia', trait: 'CLEVER', p: [
        { q: 'How many hearts does an octopus have?', o: ['1', '2', '3', '8'], a: 2 },
        { q: 'Which of these is NOT a fish?', o: ['Seahorse', 'Jellyfish', 'Shark', 'Clownfish'], a: 1 },
        { q: 'What is the biggest animal on Earth?', o: ['Elephant', 'Blue whale', 'Giraffe', 'Great white shark'], a: 1 },
        { q: 'The Moon pulls on the ocean and causes what?', o: ['Tides', 'Rainbows', 'Sharks', 'Hiccups'], a: 0 }
      ] },
      out: {
        great: 'The crab is so impressed he gives you a tiny shell salute and parts the whirlpool.',
        ok: 'The crab sighs, but lets you through. "Close enough," he mutters.',
        oops: 'The crab takes a bow and the whirlpool spins you around three times. You arrive a little dizzy.'
      },
      next: 'arrive'
    },
    cliff: {
      th: 'cliff', title: 'THE GOAT BLOCKADE',
      t: 'The cliff path is narrow and crumbly. A mountain goat is blocking the way, and he only understands acting. {spot} must show him a message. Everyone else guesses!',
      ch: { kind: 'charades', trait: 'BRAVE', p: [
        { t: 'a seagull stealing a sandwich', k: ['seagull', 'gull', 'sandwich', 'bird'] },
        { t: 'a sleepy walrus', k: ['walrus'] },
        { t: 'a crab doing a dance', k: ['crab'] },
        { t: 'a goat climbing a mountain', k: ['goat'] },
        { t: 'rowing a boat', k: ['row', 'boat', 'paddle'] },
        { t: 'a puffin in a tiny hat', k: ['puffin', 'penguin', 'hat'] }
      ] },
      out: {
        great: 'The goat understands everything, bows, and trots aside like a mountain butler.',
        ok: 'The goat squints, shrugs, and steps aside. Good enough.',
        oops: 'The goat thinks you are doing the Chicken Dance. He joins in. It takes a while to get past him.'
      },
      next: 'goat'
    },
    goat: {
      th: 'cliff', title: 'GERALD THE GOAT', min: 2, skip: 'arrive',
      t: "At the top, the goat, whose name is Gerald, is munching sadly on a cardboard sign. \"Nobody ever shares their lunch with me,\" he sniffles.",
      lesson: { topic: 'KINDNESS', tip: 'Small kindnesses can turn into big surprises.', ask: 'When did a small kind thing turn into something bigger?' },
      choices: [
        { l: 'Share your snacks with Gerald', res: "Gerald is so happy he gives you his Goat Whistle. \"For emergencies,\" he says. \"Or for fun.\"", give: 'Goat Whistle', next: 'arrive' },
        { l: 'Trade riddles with Gerald', res: 'Gerald LOVES riddles. He tells a terrible one. You pretend to be amazed. He gives you a high hoof.', spirit: 1, next: 'arrive' },
        { l: 'Politely walk past', res: 'Gerald nods and goes back to his cardboard. Maybe next time.', next: 'arrive' }
      ]
    },
    arrive: {
      th: 'tower', title: 'THE LOCKED DOOR',
      t: "The lighthouse looms above, tall and dark, with one very serious door. A brass plate reads: SPEAK THE ANSWER TO ENTER.",
      silly: 'The doorknob is shaped like a nose. Nobody mentions it.',
      next: 'lock'
    },
    lock: {
      th: 'tower', title: 'THE RIDDLE LOCK',
      t: 'The door has a riddle lock. Type the answer together. First one to crack it saves the day!',
      lesson: { topic: 'CURIOSITY', tip: 'Not knowing yet is the start of figuring it out.', ask: 'What is something you were curious about this week?' },
      ch: { kind: 'riddle', trait: 'CLEVER', p: [
        { q: 'I have hands but I cannot clap. What am I?', a: ['clock', 'a clock', 'watch'], hint: 'You look at me to see what time it is.' },
        { q: 'I follow you in the sun but vanish in the dark. What am I?', a: ['shadow', 'a shadow', 'your shadow'], hint: 'You cannot lose me, but you can stand on me.' },
        { q: 'The more you take, the more you leave behind. What am I?', a: ['footsteps', 'footstep', 'steps', 'footprints'], hint: 'Walk in sand and you will make plenty.' },
        { q: 'I am tall when I am young and short when I am old. What am I?', a: ['candle', 'a candle'], hint: 'Birthday cakes have lots of me.' },
        { q: 'What gets wetter the more it dries?', a: ['towel', 'a towel'], hint: 'You use me after a bath.' }
      ] },
      out: {
        great: 'Click! The door swings open without a sound. Very smooth.',
        ok: 'The door creaks open. A bat wakes up and complains.',
        oops: 'The door bursts open with a loud BONG that rattles every window. Sorry, bat!'
      },
      next: 'diary'
    },
    diary: {
      th: 'tower', title: "THE KEEPER'S DIARY", min: 2, skip: 'top',
      t: "On the keeper's desk is an old diary with a drawing of a tiny glowing creature. The last page is just a smudge. Time to fill in what the keeper might have written.",
      ch: { kind: 'caption', trait: 'CHARMING', p: ["Write the keeper's last diary entry in one funny sentence", 'Caption the smudge. What was the keeper eating?', 'Write a title for this mysterious diary page'] },
      out: {
        great: 'The best entry makes the whole room giggle. A hidden drawer pops open with a map of the lamp room.',
        ok: 'A few good giggles. You find a dusty note about a glowing visitor.',
        oops: 'Nobody can read the smudge. It might be jam. Still, the stairs up are right there.'
      },
      next: 'top'
    },
    top: {
      th: 'tower', title: 'THE COLD LAMP',
      t: "At the top of the tower, the great lamp sits cold and silent. In the empty lamp holder, something small is trembling. It glows a soft blue. \"Please do not be loud,\" it squeaks. \"Please do not be bright.\"",
      next: 'storm'
    },
    storm: {
      th: 'tower', title: 'BIG WAVE!', min: 3, skip: 'meet',
      t: 'WHOOSH! A giant wave slams the tower and the whole room tilts. The lamp crystal rolls toward the open window. Everyone has to act at once!',
      ch: { kind: 'roleplay', trait: 'BRAVE', p: ['In one sentence, what does your hero do to save the crystal?'] },
      out: {
        great: 'Teamwork! Somebody catches it, somebody steadies the tower, and somebody yells encouraging things.',
        ok: 'The crystal dangles from the window ledge. You get it back with only a little screaming.',
        oops: 'The crystal bounces down three floors and into a bucket. Somehow it is fine.'
      },
      next: 'meet'
    },
    meet: {
      th: 'tower', title: 'MEET NIB',
      t: "The little creature is Nib, a sea-sprite. He is holding the lamp crystal tight. \"I took it because the light keeps waking up my family of glow-fish,\" he whispers. \"They never get to sleep!\"",
      lesson: { topic: 'KINDNESS', tip: 'When someone does something that seems wrong, asking why can change the whole story.', ask: 'Has someone ever misunderstood why you did something?' },
      choices: [
        { l: 'Grab the crystal and pull', res: 'Nib squeaks and the glow-fish flash like a disco. The crystal comes loose, but everybody feels terrible.', spirit: -1, next: 'finale' },
        { l: 'Sit down and ask Nib what he needs', res: 'Nib sniffles and tells you everything. Then, for the first time in weeks, he smiles.', give: "Nib's Trust", next: 'finale' },
        { l: "Offer Gerald's Goat Whistle as a gift", needs: 'Goat Whistle', res: 'Nib toots the whistle. A glow-fish toots back. Instant best friends.', give: "Nib's Trust", next: 'finale' }
      ]
    },
    finale: {
      th: 'tower', title: 'THE NEW LAMP',
      t: "Now the real puzzle. Ships need a bright light and Nib's family needs a gentle one. The crew must design a brand new lamp that does both!",
      ch: { kind: 'draw', trait: 'HANDY', p: ['Design a lamp that is bright for ships and cozy for glow-fish', 'Draw a lighthouse that shines at ships and hums lullabies to fish', 'Invent a lamp with a dimmer, a night mode, and a snooze button'] },
      out: {
        great: 'The new lamp is a masterpiece. Ships glide home and every glow-fish yawns in peace.',
        ok: 'The lamp is a little lopsided, but it works. Ships find their way and the fish only grumble a bit.',
        oops: 'The lamp flickers, wobbles, and plays one very long kazoo note. Somehow, it still works.'
      },
      next: 'r'
    },
    r: { routes: [{ spirit: 4, item: "Nib's Trust", to: 'end_a' }, { spirit: 2, to: 'end_b' }, { to: 'end_c' }] },
    end_a: {
      th: 'tower', title: 'THE BRIGHTEST NIGHT', end: 'triumph',
      t: "By midnight the lighthouse glows warm and steady, and the whole harbor cheers. Captain Marlow cries into both hats. Nib and the glow-fish become the lighthouse's official night shift. Gull Cove has never been safer, or cozier."
    },
    end_b: {
      th: 'tower', title: 'DIM BUT HAPPY', end: 'cozy',
      t: "The lighthouse is a little dimmer than before, but the ships find their way, the tide rolls in, and Nib agrees to try 'visiting hours' for the crystal. It is not perfect. It is pretty good."
    },
    end_c: {
      th: 'tower', title: 'THE WOBBLY WAVES', end: 'wobbly',
      t: "The lighthouse blinks on and off like a confused firefly. Ships honk, fish grumble, and Captain Marlow puts on a third hat to calm down. But everybody is safe, and you all agree tomorrow's plan will be better. Tomorrow's plan will also have snacks."
    }
  }
};
