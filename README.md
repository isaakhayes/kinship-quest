# Kinship Quest

An Afrofuturist family story game for a parent and kids on separate screens. 2 to 8 heroes, ages 8 to 12.

Play: https://isaakhayes.github.io/kinship-quest/

- Pick or roll a hero (8 roles with weapon, power and cultural roots), then play The Silent Drum of Ndoto City.
- Scenes: votes, riddles, charades, drawing a gate sigil, math and money, Glitch Beast fights, and a final swarm where saved powers, coins and allies matter.
- Parent chooses length by chapters or by the clock. Lessons are built in (Wisdom Stones with a Swahili word).
- Small crews get Ayo the courier as a companion.
- Practice alone: add ?local and open several tabs.
- Tests: node tests/sim.mjs

## v4 changes
- **Character editor**: outfit color, trim color, pattern, gear (crown, goggles, cape...), weapon glow, your own catchphrase. Skin and hair stay random and locked.
- **Team scenes**: in "BEFORE THE SWARM" every hero picks their own job (Charge the Drum, Train, Guard, Scout) and every pick counts in the final fight.
- **Harder math**: generated word problems for ages 11 to 13 (js/data/math.js): percent off, profit, fractions, unit price, order of operations, area.
- **Secret thief twist** (2+ players, medium and long): in secret, each hero is offered a deal to take 15 coins. Later the crew can accuse. Wrong accusations cost spirit. The shadow is revealed at the end.
- **Dodge the loan**: when repaying Baba Kwesi you can slip away. It works, but it costs spirit, adds beasts, and halves what your coins do in the final fight.

## v5 changes
- **Cold open**: 3-panel comic on a maglev freight line, a Static Hound, the cars tearing loose, then a team scene where every hero picks a move, then Ayo's pitch. Mission shows in the top bar all game.
- **Big Mo's Overdrive Core** replaces the Baba Kwesi loan. Pay 50 now, take it for 10 coins a bell, or refuse (the scrappy path). Miss one bell and it dims (+1 instead of +2). Miss two and the Collectors come for it.
- **Field guide cards** show a picture, a one-liner and the weakness the first time a creature or character appears. New creature art: Hound, Glow Pup, Serpent, Collector, Big Mo, maglev car.
- **90s graphics card look**: backdrops are quantized to a coarse palette with ordered dithering (see vgaize in js/sprites.js; tests/creatures.html previews everything).
- The orphan backstory (why only kids) is revealed by Sefu.

## v6 changes
- **Afrobeat soundtrack** (js/music.js): generated live in the browser. Built on the 12/8 bell pattern, with djembe-style bass/tone/slap, kalimba melody, bass line and pads. Moods change by scene (calm, market, night, hall, battle, win). SOUND and MUSIC toggles are in the top bar. tests/music.html renders each mood offline and proves it is not silent.
- **Living world**: sunset skies in indigo, terracotta and ochre; towers with Djenne-style beams and Ndebele-inspired bands; baobab and kente-pole foreground; layers drift at different speeds; fireflies, embers or code rain by scene.
- **Game feel**: floating +/- coins, spirit and item pop-ups, screen shake on bad outcomes, confetti on great ones.
- **Spirit Gems**: earn gems at the end of each quest (saved on that player's device). Spend them to unlock gear, patterns and weapon glows in the hero builder.
- Narration trimmed in the longest scenes. Kente-inspired stripe under the top bar.
- All patterns are inspired by real traditions but simplified. Worth a cultural review before sharing widely.
