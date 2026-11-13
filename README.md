# Kinship Quest: two-activity family game prototype

A static browser game built with HTML, CSS and JavaScript. Supabase Realtime Broadcast synchronizes the room. There is no app server and no account sign-up flow.

## Included in this prototype

- Adventure Mission: 20 branching mission cards and 5 cooperative dilemmas, with group choices.
- Draw It or Caption It: 10 drawing prompts and 20 caption prompts.
- Host starts the game and controls reveal/round progression.
- Players join using a name and six-digit room code.
- `blocked_words.txt` is a placeholder for the future story-moderation feature. Story mode is intentionally not included.

## 1. Configure Supabase

1. Create a project at https://supabase.com/dashboard.
2. In **Project Settings → API**, copy the Project URL and the `anon` / publishable public key.
3. Paste those values into `config.js`.
4. In **Project Settings → Realtime**, make sure Realtime is enabled.

This prototype uses public Realtime Broadcast channels and does not require database tables or SQL. It does not store game history; room state is live while players are connected.

**Security note:** This is a family demo, not a production-secure multiplayer service. The Supabase public anon key is designed to be exposed in browser code, but never expose a `service_role` key. Public room broadcasts are not private or authenticated. Anyone who knows a room code may be able to listen or send messages. Use temporary room codes and do not share sensitive information. For production-grade host permissions, private rooms, abuse prevention, or durable state, add authenticated access and server-side authorization.

## 2. Test locally

Because the app uses JavaScript modules, serve the folder through a local web server rather than opening `index.html` directly.

For example, if Python 3 is installed:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser. Use a second device on the same network with your computer's local IP address and port 8000, or publish a private test repository and use the GitHub Pages URL.

## 3. Publish on GitHub Pages

1. Create a repository at https://github.com/new.
2. Choose a repository name such as `kinship-quest`. Public is simplest for GitHub Pages on a free GitHub account.
3. Upload the contents of this folder to the repository root. `index.html` must be at the top level.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main` and folder `/ (root)`, then Save.
7. Wait for GitHub Pages to publish. Your URL will look like `https://YOUR-USERNAME.github.io/kinship-quest/`.

## 4. Three-device test

1. Open the published URL on the host device.
2. Host enters a name and creates a room.
3. On two other devices, open the same URL, enter names and the six-digit room code.
4. Confirm all three names appear in the crew list.
5. Host starts the Adventure Mission. Each player selects a choice; confirm the submission count updates.
6. Host reveals the choices.
7. Host advances to Draw It. Each player submits a drawing or caption.
8. Host reveals creations and advances through Caption It.
9. Test a device refreshing/rejoining and note the limitations: the prototype has no durable session restore or saved game state.

## Notes

- Keep `config.js` in the repository for GitHub Pages to load. It contains only the public anon key, never a service-role key.
- If the game does not connect, verify the project URL/key and that Realtime is enabled.
- This is an initial prototype. Run the three-device test before adding the planned Cranium Remix and Never-Ending Story activities.
