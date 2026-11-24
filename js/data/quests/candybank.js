// QUEST 2: Sugar Rush at the Candy Bank. Silly money mystery with a gumdrop budget.
export default {
  id: 'candybank',
  name: 'SUGAR RUSH AT THE CANDY BANK',
  short: 'CANDY BANK',
  theme: 'candy',
  tags: ['SILLY', 'MONEY SMARTS'],
  blurb: 'The Gumdrop Bank is almost empty and the Sugar Festival starts soon. Crack the case, spend your gumdrops wisely, and save the city.',
  est: { 1: 9, 2: 11, 3: 14 },
  start: 'intro',
  coins: 10,
  coinName: 'GUMDROPS',
  scenes: {
    intro: {
      th: 'candy', title: 'SPRINKLE CITY',
      t: "Welcome to Sprinkle City, where the streets are licorice and the rain is lemonade. Mayor Fudgington slides a very sticky envelope to {crew}. \"The Gumdrop Bank is nearly EMPTY and the Sugar Festival is almost here! Here are 10 gumdrops for expenses. Spend wisely. Or not. I am a mayor, not a mind reader.\"",
      silly: 'The envelope is also a snack. The mayor did not mention that. Somebody already licked it.',
      next: 'c1'
    },
    c1: {
      th: 'candy', title: 'WHERE TO LOOK?',
      t: 'The bank has two leads. The janitor saw something odd last night, and the vault itself is wide open. Where does the squad start?',
      choices: [
        { l: 'Question the Jelly Bean Janitor', res: 'Silent Sam the janitor nods slowly and picks up his mop like it is a microphone.', next: 'janitor' },
        { l: 'Inspect the open vault', res: 'The vault door is a giant cookie. It squeaks as you push it open.', next: 'vault' }
      ]
    },
    janitor: {
      th: 'candy', title: 'SILENT SAM',
      t: 'Silent Sam took a vow of silence after a very loud tuba accident. He saw everything, but he can only act it out. {spot} plays Sam. Everyone else guesses what he saw!',
      ch: { kind: 'charades', trait: 'CHARMING', p: [
        { t: 'a puddle growing bigger', k: ['puddle', 'water', 'spill'] },
        { t: 'a melting ice cream cone', k: ['ice cream', 'cone', 'melt'] },
        { t: 'the sun shining through a window', k: ['sun', 'window'] },
        { t: 'fanning yourself because it is hot', k: ['fan', 'hot'] },
        { t: 'a very sweaty gumdrop', k: ['gumdrop', 'sweat', 'sweaty'] },
        { t: 'a tuba player', k: ['tuba', 'trumpet', 'horn', 'music'] }
      ] },
      out: {
        great: 'Sam bows, drops his mop, and does a tiny victory dance. You got every clue.',
        ok: 'Sam gives a thumbs up and a worried shrug. You got most of it.',
        oops: 'Sam acts out something for five minutes. Nobody knows what. It might have been a tuba.'
      },
      next: 'shop'
    },
    vault: {
      th: 'vault', title: 'THE STICKY VAULT',
      t: 'The vault is open, the floor is sticky, and there are strange puddles. But there are zero thieves. Draw your best theory of what happened.',
      ch: { kind: 'draw', trait: 'CLEVER', p: ['Draw what really happened in the vault', 'Draw the sneakiest, silliest thief imaginable', 'Draw a clue the other detectives missed'] },
      out: {
        great: 'Your theories are so detailed the cookie door applauds. You are practically professional detectives.',
        ok: 'Some great ideas, some wobbly ones. Together they point in a useful direction.',
        oops: 'Your drawings suggest the thief is a sentient pudding. It is not the thief. But who knows.'
      },
      next: 'shop'
    },
    shop: {
      th: 'candy', title: 'THE COTTON CANDY CART', min: 2, skip: 'clue',
      t: 'On the corner stands the Cotton Candy Cart. The owner, Floss, has three offers for detectives on a budget.',
      lesson: { topic: 'MONEY', tip: 'Spending, saving, and sharing are all choices. Each one gives you something different.', ask: 'What is something you saved for, and was it worth the wait?' },
      choices: [
        { l: 'Buy a Magnifying Lollipop (2 gumdrops)', coin: -2, give: 'Magnifying Lollipop', res: 'You can see tiny clues now. You can also lick it. Both are good.', next: 'clue' },
        { l: 'Buy a Fizzy Cooling Fan (3 gumdrops)', coin: -3, give: 'Cooling Fan', res: 'It blows cool air and smells like root beer.', next: 'clue' },
        { l: 'Keep your gumdrops for later', res: "Floss nods. \"Smart. Rainy days come in all flavors.\"", next: 'clue' }
      ]
    },
    clue: {
      th: 'vault', title: 'THE STICKY NOTE',
      t: "Inside the vault, a note is stuck to the safe: SOLVE MY RIDDLE TO LEARN THE TRUTH. Type the answer as a team!",
      ch: { kind: 'riddle', trait: 'CLEVER', p: [
        { q: 'What has to be broken before you can use it?', a: ['egg', 'an egg'], hint: 'You crack it open at breakfast.' },
        { q: 'What comes down but never goes up?', a: ['rain', 'raindrops', 'the rain'], hint: 'Umbrellas are made for me.' },
        { q: 'What has a neck but no head?', a: ['bottle', 'a bottle'], hint: 'You can pour things out of me.' },
        { q: 'What can you catch but never throw?', a: ['cold', 'a cold'], hint: 'Tissues and soup help.' }
      ] },
      out: {
        great: 'The safe pops open with a happy BOING. Behind it, a note says GOOD WORK, DETECTIVES.',
        ok: 'The safe opens after a little shaking. A note says YOU TOOK A WHILE, BUT FINE.',
        oops: 'The safe shoots a gumball at the ceiling. It opens anyway. The note says OOPS. IT IS MY MISTAKE.'
      },
      next: 'reveal'
    },
    reveal: {
      th: 'vault', title: 'THE REAL CULPRIT',
      t: "It was never a robbery! A skylight above the vault lets in hot summer sun, and the gumdrops have been melting into puddles. The mayor goes pale. \"Oh,\" he says. \"That is much more embarrassing than a thief.\"",
      next: 'plan'
    },
    plan: {
      th: 'candy', title: 'SAVE THE SAVINGS',
      t: 'The festival is about to begin and the bank needs a fix. How does the city protect its gumdrops?',
      lesson: { topic: 'MONEY', tip: 'You can spend to fix a problem fast, save to build something lasting, or share so everyone benefits.', ask: 'When would spending, saving, or sharing be the best choice?' },
      choices: [
        { l: 'Spend 4 gumdrops on a giant shade umbrella', coin: -4, give: 'Giant Umbrella', res: 'Fast, shady, and extremely dramatic.', next: 'umbrella' },
        { l: 'Save: build a cool cellar with neighbor helpers', res: 'It takes more effort, but it will last all summer.', next: 'cellar' },
        { l: 'Share: give gumdrops to neighbors with cold fridges', coin: 2, res: 'Your neighbors are so touched they pay you back with extra gumdrops and cookies.', next: 'fridges' }
      ]
    },
    umbrella: {
      th: 'candy', title: 'THE GIANT UMBRELLA',
      t: 'The giant shade umbrella needs a design. It has to cover the whole vault and look fabulous.',
      ch: { kind: 'draw', trait: 'HANDY', p: ['Design the most fabulous giant shade umbrella', 'Draw an umbrella with a built-in lemonade fountain', 'Design an umbrella that could also be a trampoline'] },
      out: {
        great: 'The umbrella is gorgeous, enormous, and a little too showy. The crowd loves it.',
        ok: 'The umbrella is good and shady. It leans a bit, but it works.',
        oops: 'The umbrella flips inside out in the first breeze. It makes a great hat for the mayor, though.'
      },
      next: 'treats'
    },
    cellar: {
      th: 'candy', title: 'THE COOL CELLAR',
      t: 'To dig the cool cellar you need volunteers. Everyone gives a persuasive, one-sentence speech to the neighbors.',
      ch: { kind: 'roleplay', trait: 'CHARMING', p: ['In one sentence, convince the neighbors to help dig the cool cellar', 'Give a one-sentence speech that makes people WANT to help'] },
      out: {
        great: 'Neighbors line up with shovels, snacks, and music. The cellar is done by lunch.',
        ok: 'A handful of neighbors help. It is slower, but the cellar gets built.',
        oops: 'Only three squirrels volunteer. They dig a very small, very cute cellar.'
      },
      next: 'treats'
    },
    fridges: {
      th: 'candy', title: 'COLD FRIDGE QUIZ',
      t: 'Neighbor Priya has the biggest fridge and the best trivia. "I will keep your gumdrops cold," she says, "if you pass my quiz."',
      ch: { kind: 'trivia', trait: 'CLEVER', p: [
        { q: 'What happens to chocolate in the heat?', o: ['It melts', 'It grows', 'It sings', 'It turns blue'], a: 0 },
        { q: 'Which of these keeps food coldest?', o: ['Refrigerator', 'Sunny window', 'Oven', 'A hat'], a: 0 },
        { q: 'Sugar is mostly made from sugar cane or what?', o: ['Sugar beets', 'Clouds', 'Rocks', 'Cheese'], a: 0 }
      ] },
      out: {
        great: 'Priya is delighted and offers to store the gumdrops all summer, for free.',
        ok: 'Priya agrees, with a small look that says she hoped you knew more.',
        oops: 'Priya gives up on the quiz and just says, "Fine. But you owe me a cookie."'
      },
      next: 'treats'
    },
    treats: {
      th: 'candy', title: 'THE CHOCOLATE RIVER', min: 3, skip: 'festival',
      t: 'On the way to the festival, the Chocolate River overflows and floods the main street. Caption the chaos!',
      ch: { kind: 'caption', trait: 'CHARMING', p: ['Write a funny headline for the Chocolate River Flood', 'Caption this photo: the mayor, waist-deep in chocolate', 'Write what the ducks in the river are saying'] },
      out: {
        great: 'The best caption goes viral. Tourists arrive. The city sells chocolate tickets. Mayor Fudgington is thrilled.',
        ok: 'The captions get some laughs. The river drains with a loud slurp.',
        oops: 'Nobody can think of anything. The ducks are very disappointed in the humans.'
      },
      next: 'festival'
    },
    festival: {
      th: 'candy', title: 'THE SUGAR FESTIVAL',
      t: "It is time! The Sugar Festival opens, the crowd is hungry, and the Mayor needs a spectacular opening speech. He hands each of you a microphone. \"Make it count,\" he says. \"And please do not lick it.\"",
      ch: { kind: 'roleplay', trait: 'CHARMING', p: ['In one sentence, announce the opening of the Sugar Festival', 'Give the most dramatic one-line toast to Sprinkle City'] },
      out: {
        great: 'The crowd roars. Confetti shoots out of the umbrella, the cellar door, or somebody\'s hat. Everyone cheers.',
        ok: 'The crowd cheers and a few people wave glow sticks. It is a nice festival.',
        oops: 'The microphone squeals so loudly that three pigeons faint. But the festival is on!'
      },
      next: 'r'
    },
    r: { routes: [{ coins: 5, spirit: 4, to: 'end_a' }, { spirit: 2, to: 'end_b' }, { to: 'end_c' }] },
    end_a: {
      th: 'candy', title: 'THE SWEETEST SAVINGS', end: 'triumph',
      t: "The festival is a smash. The bank's new cool vault holds more gumdrops than ever, because you saved some, shared some, and spent some wisely. Mayor Fudgington makes the crew honorary candy detectives and gives each of you a tiny badge. It is also a snack."
    },
    end_b: {
      th: 'candy', title: 'STICKY BUT HAPPY', end: 'cozy',
      t: 'The festival goes fine. The vault is cooler, the gumdrops are safe, and the Mayor promises to fix the skylight. Not everything is perfect, but nobody is sad. You eat cake. Good cake.'
    },
    end_c: {
      th: 'candy', title: 'THE GREAT MELTDOWN', end: 'wobbly',
      t: 'The festival happens in a puddle of melted everything. The mayor wears a gumdrop crown and refuses to explain. Everyone gets a spoon. Everyone eats the festival. You are all sticky. You are all happy. Mostly sticky.'
    }
  }
};
