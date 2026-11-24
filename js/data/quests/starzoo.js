// QUEST 3: Starship Zoo-Gone-Wrong. Space comedy about courage, honesty and animals.
export default {
  id: 'starzoo',
  name: 'STARSHIP ZOO-GONE-WRONG',
  short: 'STAR ZOO',
  theme: 'space',
  tags: ['COMEDY', 'COURAGE'],
  blurb: 'The galaxy\'s only flying zoo has lost its animals mid-flight. Round them up before the ship docks at Planet Plum.',
  est: { 1: 9, 2: 11, 3: 14 },
  start: 'intro',
  scenes: {
    intro: {
      th: 'ship', title: 'STARSHIP WIGGLE',
      t: "Welcome aboard the Starship Wiggle, the galaxy's only flying zoo! You are the junior zookeepers. The cheerful robot captain, Captain Zorp, is flashing every light he has. \"ALERT! ALERT! Several animals have escaped! We dock at Planet Plum in thirty minutes and nobody wants a ship full of loose space bunnies!\"",
      silly: 'Captain Zorp also announces that someone has stolen his favorite sandwich. He says this is a bigger emergency.',
      next: 'c1'
    },
    c1: {
      th: 'ship', title: 'WHERE TO START?',
      t: 'The crew has two ways to start the roundup. The Bridge has the scanner, but it is locked. The Feeding Deck is where animals gather, but they are nervous. Where to?',
      lesson: { topic: 'TEAMWORK', tip: 'Different jobs help the team. Planners and doers both matter.', ask: 'What is your best skill on a team?' },
      choices: [
        { l: 'The Bridge: find them on the scanner', res: 'Up the ladder you go. The scanner has a password and the password is a riddle. Of course it is.', next: 'bridge' },
        { l: 'The Feeding Deck: calm them down', res: 'Down the hall you tiptoe. A hundred glowing eyes watch you from the shadows.', next: 'deck' }
      ]
    },
    bridge: {
      th: 'ship', title: 'THE LOCKED SCANNER',
      t: 'The scanner is locked with a password riddle written by a very silly engineer. Solve it together to turn it on!',
      ch: { kind: 'riddle', trait: 'CLEVER', p: [
        { q: 'What has one eye but cannot see?', a: ['needle', 'a needle'], hint: 'You use me to sew.' },
        { q: 'What has teeth but cannot bite?', a: ['comb', 'a comb', 'saw', 'a saw'], hint: 'Hair loves me.' },
        { q: 'I am full of holes but I still hold water. What am I?', a: ['sponge', 'a sponge'], hint: 'You use me to wash things.' },
        { q: 'What can travel around the world while staying in a corner?', a: ['stamp', 'a stamp', 'postage stamp'], hint: 'You put me on letters.' }
      ] },
      out: {
        great: 'The scanner lights up with a happy chirp and shows seven little dots. Easy!',
        ok: 'The scanner wakes up grumpy but shows most of the dots.',
        oops: 'The scanner shows seventeen dots, all of them wrong. Captain Zorp apologizes for the sandwich on the screen.'
      },
      next: 'tracker'
    },
    deck: {
      th: 'ship', title: 'THE NERVOUS CRITTERS',
      t: 'The Feeding Deck is full of nervous critters who only trust other animals. {spot} acts like a creature to calm them down, and everyone else guesses which one!',
      ch: { kind: 'charades', trait: 'CHARMING', p: [
        { t: 'a space bunny hopping', k: ['bunny', 'rabbit'] },
        { t: 'a sleepy sloth', k: ['sloth'] },
        { t: 'a tiny dinosaur', k: ['dinosaur', 'dino', 'rex'] },
        { t: 'a very proud peacock', k: ['peacock', 'bird'] },
        { t: 'an octopus juggling', k: ['octopus', 'juggle', 'juggling'] },
        { t: 'a giant moth', k: ['moth', 'butterfly'] }
      ] },
      out: {
        great: 'The critters calm right down and a few of them follow you around like a parade.',
        ok: 'The critters settle, although one of them keeps staring at you suspiciously.',
        oops: 'The critters join in and now everyone is acting. Nobody is calm. It is a very loud zoo.'
      },
      next: 'tracker'
    },
    tracker: {
      th: 'ship', title: 'THREE BLEEPS', min: 2, skip: 'vent',
      t: 'The scanner is beeping from three directions at once. Which bleep does the crew chase?',
      choices: [
        { l: 'The slow bleep, mostly blinking', res: 'It is Bloop, a giant sleepy slug who was napping in a vent. Easy. He mumbles thanks.', spirit: 1, next: 'vent' },
        { l: 'The fast bleep', res: 'You chase a space bunny tornado in circles for ten minutes. It was glorious and no one caught anything.', next: 'vent' },
        { l: 'The tiny squeaking bleep', res: 'A small glowing creature peeks out of a boot. You pick it up gently. It gives you a half-eaten Space Cookie to say thanks.', give: 'Space Cookie', next: 'vent' }
      ]
    },
    vent: {
      th: 'ship', title: 'THE VENT MAZE',
      t: 'Several animals are hiding in the vents. Time to invent a gentle trap that gets them out without scaring or hurting anyone.',
      ch: { kind: 'draw', trait: 'HANDY', p: ['Draw a kind animal trap with no cages', 'Draw a snack-powered vacuum that does no harm', 'Draw a super comfy bed that lures critters out'] },
      out: {
        great: 'The animals walk out one by one, yawning. Zorp gives you a very tiny medal.',
        ok: 'Most of the animals come out. Two stay behind to enjoy the vents.',
        oops: 'The trap catches a bunch of socks. The animals do not care. The socks are very pleased.'
      },
      next: 'bay'
    },
    bay: {
      th: 'ship', title: 'ASTRO QUIZ', min: 3, skip: 'stowaway',
      t: 'The ship\'s computer says, "Before I open the cargo bay, answer my question. Beep."',
      ch: { kind: 'trivia', trait: 'CLEVER', p: [
        { q: 'How many planets are in our solar system?', o: ['6', '8', '10', '12'], a: 1 },
        { q: 'What is the name of our galaxy?', o: ['Milky Way', 'Andromeda', 'Cheese Cloud', 'Orion'], a: 0 },
        { q: 'What is the closest star to Earth?', o: ['The Sun', 'Polaris', 'Sirius', 'Alpha'], a: 0 },
        { q: 'Which planet is famous for its big rings?', o: ['Saturn', 'Mars', 'Venus', 'Mercury'], a: 0 }
      ] },
      out: {
        great: 'The computer plays a happy jingle and opens the cargo bay with a bow.',
        ok: 'The computer says, "Close enough. Beep." and opens the bay.',
        oops: 'The computer says, "Wrong. Beep. But I like you." and opens the bay anyway.'
      },
      next: 'stowaway'
    },
    stowaway: {
      th: 'ship', title: 'THE LAST CRATE',
      t: "Behind the last crate, something is breathing. It is a small, fluffy creature the color of a sunset, holding a half-eaten space cookie. A tag says: FUZZLE. PLEASE DO NOT PET. WILL DEFINITELY BE PET. It looks scared.",
      next: 'meet'
    },
    meet: {
      th: 'ship', title: 'WHAT ABOUT FUZZLE?',
      t: "The Fuzzle sniffles. The ship will dock soon, and the Planet Plum zoo wants every animal in a cage. But the Fuzzle just wants to find its family.",
      lesson: { topic: 'HONESTY', tip: 'Telling the truth is brave, and it often gets you more help than hiding.', ask: 'When was telling the truth hard, and how did it go?' },
      choices: [
        { l: 'Tell Captain Zorp the truth and ask for help', res: 'Zorp blinks his bulb eyes. "I appreciate honesty," he says. "Also I love Fuzzles. Let us plan."', give: "Captain's Help", next: 'finale' },
        { l: 'Sneak the Fuzzle off the ship', res: 'It works, kind of. Then Zorp finds out and gives you a very long, very kind lecture about trust.', spirit: -1, next: 'finale' },
        { l: 'Share a Space Cookie with the Fuzzle', needs: 'Space Cookie', res: 'The Fuzzle nibbles the cookie and curls into your hands. Trust: unlocked.', give: "Fuzzle's Trust", next: 'finale' }
      ]
    },
    finale: {
      th: 'ship', title: 'AT THE ZOO BOARD',
      t: 'The ship docks and the Planet Plum zoo board is waiting. Everyone gets one sentence to speak up for the Fuzzle.',
      ch: { kind: 'roleplay', trait: 'CHARMING', p: ['In one sentence, convince the zoo board to let the Fuzzle go home', 'Give the kindest, most convincing one-line speech for the Fuzzle'] },
      out: {
        great: 'The board is in tears. One of them blows their nose very loudly. The Fuzzle gets a free ride home.',
        ok: 'The board nods slowly. They agree to help the Fuzzle find its family, with paperwork.',
        oops: 'The board loses track of the speeches and starts arguing about sandwiches. The Fuzzle sneaks out. It all works out, weirdly.'
      },
      next: 'r'
    },
    r: { routes: [{ spirit: 4, anyItem: ["Fuzzle's Trust", "Captain's Help"], to: 'end_a' }, { spirit: 2, to: 'end_b' }, { to: 'end_c' }] },
    end_a: {
      th: 'space', title: 'THE BIGGEST REUNION IN THE GALAXY', end: 'triumph',
      t: 'The Fuzzle finds its entire family, all one hundred and four of them, on a small orange moon. They throw you a parade. It is very fluffy and slightly sticky. Captain Zorp makes you official Junior Captains and gives you each a tiny hat.'
    },
    end_b: {
      th: 'space', title: 'A NEW CREW MEMBER', end: 'cozy',
      t: 'The Fuzzle decides to stay on the Starship Wiggle for a while. It sleeps on the Bridge and eats exactly one cookie a day. The animals are back, the ship is safe, and everyone is a little bit fluffier.'
    },
    end_c: {
      th: 'space', title: 'OOPS, ALL BUNNIES', end: 'wobbly',
      t: 'The roundup is a little chaotic. You get most of the animals, plus nine extra bunnies you did not know about. Captain Zorp declares the ship officially a bunny zoo now. Everyone is fine. Everyone is also covered in fur.'
    }
  }
};
