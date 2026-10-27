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
npm run preview   # serves the build; start `npm run server` too if you want the CTF to work in preview
```

## Deploy — Vercel, free
1. Push this folder to a GitHub repo (see the walkthrough in chat — no paid plan needed).
2. On vercel.com, Add New > Project > Import that repo. Framework: Vite (auto-detected).
   Leave Build Command `npm run build` and Output Directory `dist` as-is, then Deploy.
3. For the CTF, add env vars in Project Settings > Environment Variables:
   `FLAG_FINAL`, `CTF_CODE_1`, `CTF_CODE_2`, `CTF_CODE_3`, `CTF_CODE_4`.
   Generate them with `node scripts/generate-flags.mjs`, then Redeploy.
   Without them the CTF is not configured — set all five, then Redeploy.
   Vercel's Hobby plan is free — no card needed for this.
- GitHub Pages works for the portfolio alone, but there is no backend there —
  the CTF calls will fail. Use Vercel if you want the CTF live.
- Resume PDF is already at `public/resume.pdf` — the Resume buttons link to `/resume.pdf`.

## Capture the Flag — one flag, five stops, savepoints
- One final flag. Pick Easy or Hard, then opt in — each stop gives you the next hint.
- Easy mode: no DevTools. The panel tells you where to go — one obvious thing at each real stop (shell, classifier, Radar, CampusClaims) — and the stub shows up where you found it. Hard mode: the same chain, but codes are hidden in Network responses / headers, hints are short riddles.
- Chain: inspect (one short HTML comment, no answers) -> shell -> painting -> radar -> lost & found -> the ONE final flag, in the Network response to POST /api/ctf/advance.
- Savepoints: every stop you clear saves your stage, gives +1 hint credit, and remembers the last code word you found.
- Hints are short riddles, 3 levels per stop. Hint 3 costs a credit, or unlocks free after 2 wrong tries. "I'm stuck" reveals Hint 3, never the code.
- Codes/flag are in backend env vars only (`FLAG_FINAL`, `CTF_CODE_1..4`), validated by SHA-256. Do not commit real values — the answers are not written down in this repo.

## What is in here
- 13 major stations: 4 jobs, 6 projects, UofT, Muneeb Central, Hire Me
- SVG transit map (Systems / Intelligence / Product / Journey Loop), keyboard-accessible
- Station panel, Journey Planner, guided tour, list-view fallback
- Demos (front-end only, clearly labelled): shell, painting classifier, TypeTyme typing, PaintApp canvas
- Charming style: cream #FFF8E7, Baloo 2 + Nunito, flat illustration, reduced-motion support
- Full outline: see the TTC outline file Muneeb has separately
