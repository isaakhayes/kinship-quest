// Field guide entries. Shown as a card the first time a creature or character appears.
export const GUIDE = {
  hound:     { name: 'STATIC HOUND', line: 'A guard dog whose rhythm got scrambled. It is not mean, only loud and confused.', weak: 'Clear loud sound and steady patterns.' },
  pup:       { name: 'GLOW PUP', line: 'A tiny Weave creature that wandered out of the code. It glows when it is happy.', weak: 'Not a fight. It just needs a friend.' },
  serpent:   { name: 'GLITCH SERPENT', line: 'A rail serpent stitched from broken signals. It coils around anything that moves too fast.', weak: 'Thread and twisting moves.' },
  collector: { name: 'COLLECTOR', line: 'Big Mo\'s repo crew. They float on hover boots and take back what was never paid for.', weak: 'Pay on time, or outrun them.' },
  mo:        { name: 'BIG MO', line: 'The best weapon dealer in Ndoto. He sells the Overdrive Core, and he never forgets a bell.', weak: 'A fair deal and a firm no.' }
};
// fight prompts name their beast; map the name to a picture
export const BEAST_KEY = { 'STATIC HOUND': 'hound', 'GLITCH SERPENT': 'serpent' };
