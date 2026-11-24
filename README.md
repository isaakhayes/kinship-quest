# Kinship Quest

A story-and-party game for 2 to 8 players on separate screens, built for parents playing with kids in different places.
Everyone builds a pixel hero, the crew picks a quest, and the story moves through votes, drawing, captions, charades, riddles and quizzes. A host (parent) controls pace.

- 3 authored quests, each with Quick / Standard / Epic lengths, branching paths and 3 endings
- Parent dials: Make it sillier, Add lessons (topic chips), Extra time, Chaos Card, skip, hint
- Host-authoritative sync over Supabase Realtime Broadcast (config.js). No accounts, no database.
- Practice solo: open several tabs at `index.html?local`

Run locally: `python3 -m http.server 8000`. Test the story engine: `node tests/sim.mjs`.
Add a quest: copy a file in `js/data/quests/`, register it in `js/data/quests.js`.
