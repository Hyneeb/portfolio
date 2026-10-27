# The Muneeb Line — Portfolio

Charming, accessible TTC-inspired portfolio for Muneeb Hyder.
React + Vite + TypeScript. The portfolio itself is static — the only backend
is for the Capture the Flag, so flags never leak into the frontend.

## Run locally
```
npm install
npm run dev        # portfolio only, at http://localhost:5173
npm run server     # CTF backend only, in a second terminal, port 3001
```
Vite proxies `/api` to the local CTF server in dev. Without the server,
the site still works — the CTF panel will say the backend is not reachable.

## Build
```
npm run build
npm run preview
```

## Deploy — Vercel, free
1. Push this folder to a GitHub repo (see the walkthrough in chat — no paid plan needed).
2. On vercel.com, Add New > Project > Import that repo. Framework: Vite (auto-detected).
   Leave Build Command `npm run build` and Output Directory `dist` as-is, then Deploy.
3. For the CTF, add env vars in Project Settings > Environment Variables:
   `FLAG_FINAL`, `CTF_CODE_1`, `CTF_CODE_2`, `CTF_CODE_3`, `CTF_CODE_4`.
   Generate them with `node scripts/generate-flags.mjs`, then Redeploy.
   Without them the site still works, but the CTF returns "not configured".
   Vercel's Hobby plan is free — no card needed for this.
- GitHub Pages works for the portfolio alone, but there is no backend there —
  the CTF calls will fail. Use Vercel if you want the CTF live.
- Resume PDF is already at `public/resume.pdf` — the Resume buttons link to `/resume.pdf`.

## Capture the Flag — one flag, five stops, savepoints
- One final flag. Pick Easy or Hard, then opt in — each stop gives you the next hint.
- Easy mode: no DevTools. Everything happens in the panel — peek at the note, check the shell, pick a painting, multiple choice for radar / lost & found. Code words and the final flag are shown right there. Hard mode: the same chain, but codes are hidden in Network responses / headers, hints are short riddles.
- Chain: inspect (one short HTML comment, no answers) -> shell -> painting -> radar -> lost & found -> the ONE final flag, in the Network response to POST /api/ctf/advance.
- Savepoints: every stop you clear saves your stage, gives +1 hint credit, and remembers the last code word you found.
- Hints are short riddles, 3 levels per stop. Hint 3 costs a credit, or unlocks free after 2 wrong tries. "I'm stuck" reveals Hint 3, never the code.
- Owner answers (not on the site): inspect comment -> `ls`, `cat ticket-1.txt` -> warmest painting (sunset) -> radar 45 -> backpack. Codes/flag are in backend env vars only (`FLAG_FINAL`, `CTF_CODE_1..4`), validated by SHA-256.

## What is in here
- 13 major stations: 4 jobs, 6 projects, UofT, Muneeb Central, Hire Me
- SVG transit map (Systems / Intelligence / Product / Journey Loop), keyboard-accessible
- Station panel, Journey Planner, 2-minute tour, list-view fallback
- Demos (front-end only, clearly labelled): shell, painting classifier, TypeTyme typing, PaintApp canvas
- Charming style: cream #FFF8E7, Baloo 2 + Nunito, flat illustration, reduced-motion support
- Full outline: see the TTC outline file Muneeb has separately
