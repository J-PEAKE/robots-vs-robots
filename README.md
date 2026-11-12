# Robots vs Robots

A colourful browser game inspired by an eight-year-old creator’s original robot drawings. Prototype v0.1 turns Karat and Cano into playful original SVG characters and a complete character-selection experience. No accounts, tracking or combat system.

## Play

Title → Play → choose Karat or Cano → Let’s Go → Ready → Start Battle → Battles Coming Soon. Back buttons let you change your choice; returning home resets selection.

- **Karat:** level 10, 40 HP. An agile orange robot with a red bandanna.
- **Cano:** level 10, 70 HP. A cool cyan robot with sunglasses, a backwards cap and an oversized shoulder cannon.
- Responsive cards, selection animations, keyboard navigation, focus indicators, reduced-motion support and optional synthesized sounds (off initially).

## Local development

Use Node.js 22.12+ or 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite with `/robots-vs-robots/` appended.

```sh
npm test
npm run build
npm run preview
```

The production bundle is in `dist/`. It must be served over HTTP, not opened as a file. The Vite base path is `/robots-vs-robots/`.

## Deployment

The only intended repository is **J-PEAKE/robots-vs-robots**. Verify the authenticated GitHub account before any remote write. Never use the BattleBuilder account.

1. Create a public repository named `robots-vs-robots` owned by `J-PEAKE` if it does not exist.
2. Push this project to its `main` branch, including `package-lock.json` and `.github/workflows/deploy.yml`.
3. Open repository **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. In **Actions → Deploy to GitHub Pages**, run the workflow, or push to `main`.
5. Wait for the build and deploy jobs to succeed, then verify https://j-peake.github.io/robots-vs-robots/.

The workflow installs with `npm ci`, runs state tests, builds, and uploads `dist`. Build access is read-only; only the deployment job receives Pages write and OIDC permissions. The workflow restricts automatic deployment to `main` and to the exact personal repository.

## Structure and adding a character

Vanilla JavaScript ES modules, HTML, CSS, and Vite. No runtime dependencies. Fredoka and Nunito load from Google Fonts, with local font fallbacks. Sound uses Web Audio with no external sound files.

- Add an original SVG with a `0 0 420 420` viewBox to `public/assets/robots/`.
- Add a character to `src/data/characters.js`, including a unique `id`, name, level, maxHp, description, traits, specialty, number and artwork filename without extension.
- Update the artwork alt-text mapping in `src/components/RobotArtwork.js` and add any character-specific colour/animation styles.
- Cards render from data. Screen transitions and selection rules are isolated in `src/state.js`; UI and sound live in `src/main.js`.
- Review the title composition and card layout when expanding beyond the original two-character roster.

The SVG illustrations are original interpretations of the supplied sketches. Source sketches and identifying information about the creator are not published.

## Next milestone

Design a small turn-based battle together with the young creator: decide what Dance Dance and Axe Chop do, then prototype one friendly practice opponent, readable HP changes and a victory celebration. Levels, experience, switching and rewards can follow after the basic battle is fun.
