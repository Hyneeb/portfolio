import { useEffect, useRef, useState } from "react";
import "./index.css";
import { STATIONS, LINES, TOUR_ORDER, SKILLS, type Station, type LineId } from "./data/stations";

const PAINTINGS = [
  { id: "sunset", name: "Warm Sunset Hills", swatch: "#F28482", style: "warm, high-contrast landscapes" },
  { id: "sea", name: "Calm Blue Sea", swatch: "#4A9EB8", style: "cool, calm seascapes" },
  { id: "forest", name: "Green Forest Path", swatch: "#7FB069", style: "green, nature scenes" },
  { id: "city", name: "Busy City Lights", swatch: "#F2B749", style: "bold, urban scenes" },
];

// Inline SVG icons only — no emoji anywhere on this site.
function StationIcon({ kind, size = 22 }: { kind: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "#2B2118", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (kind) {
    case "grad": return (<svg {...common}><path d="M12 4 L22 9 L12 14 L2 9 Z" fill="#F2B749" /><path d="M7 11 v4 c0 1.5 10 1.5 10 0 v-4" /></svg>);
    case "keyboard": return (<svg {...common}><rect x="2" y="7" width="20" height="11" rx="2" fill="#fff" /><path d="M6 11h.5M10 11h.5M14 11h.5M18 11h.5M7 14.5h10" /></svg>);
    case "brush": return (<svg {...common}><path d="M18 3 L21 6 L9 18 L4 19 L5 14 Z" fill="#F28482" /></svg>);
    case "backpack": return (<svg {...common}><rect x="6" y="8" width="12" height="12" rx="3" fill="#BFE3A8" /><path d="M9 8 V6 a3 3 0 0 1 6 0 v2" /><path d="M6 13 h12" /></svg>);
    case "terminal": return (<svg {...common}><rect x="2" y="5" width="20" height="14" rx="2" fill="#2B2118" /><path d="M6 10 l3 2.5 L6 15 M12 15 h5" stroke="#FFE9B8" /></svg>);
    case "coin": return (<svg {...common}><circle cx="12" cy="12" r="9" fill="#F2B749" /><path d="M12 7 v10 M15 9.5 c0-1.5-6-1-6 .8 c0 2.5 6 1 6 3 c0 1.8-6 2-6 .5" /></svg>);
    case "dumbbell": return (<svg {...common}><path d="M7 8 v8 M17 8 v8 M7 12 h10" /><rect x="3" y="9" width="3" height="6" rx="1" fill="#E85D4A" /><rect x="18" y="9" width="3" height="6" rx="1" fill="#E85D4A" /></svg>);
    case "mic": return (<svg {...common}><rect x="9" y="3" width="6" height="11" rx="3" fill="#A8D8EA" /><path d="M5 11 a7 7 0 0 0 14 0 M12 18 v3" /></svg>);
    case "ball": return (<svg {...common}><circle cx="12" cy="12" r="9" fill="#fff" /><path d="M12 8 l3 2 -1 3 h-4 l-1 -3 Z M12 8 V3 M15 10 l4 -1 M14 13 l3 4 M10 13 l-3 4 M9 10 L5 9" /></svg>);
    case "palette": return (<svg {...common}><circle cx="12" cy="12" r="9" fill="#FFF3D6" /><circle cx="9" cy="10" r="1.2" fill="#E85D4A" /><circle cx="14" cy="9" r="1.2" fill="#F2B749" /><circle cx="15" cy="14" r="1.2" fill="#4A9EB8" /></svg>);
    case "radar": return (<svg {...common}><circle cx="12" cy="12" r="9" fill="#EAF6FB" /><circle cx="12" cy="12" r="4" /><path d="M12 12 L19 5" /></svg>);
    case "train": return (<svg {...common}><rect x="5" y="3" width="14" height="13" rx="3" fill="#E85D4A" /><rect x="8" y="6" width="3" height="3" fill="#fff" /><rect x="13" y="6" width="3" height="3" fill="#fff" /><circle cx="9" cy="19" r="1.6" fill="#2B2118" /><circle cx="15" cy="19" r="1.6" fill="#2B2118" /></svg>);
    case "flag": return (<svg {...common}><path d="M6 21 V4" /><path d="M6 5 h11 l-3 4 3 4 H6" fill="#F28482" /></svg>);
    default: return (<svg {...common}><circle cx="12" cy="12" r="9" /></svg>);
  }
}
function TrainIcon({ size = 28 }: { size?: number }) { return <StationIcon kind="train" size={size} />; }
const TYPING_PROMPTS = [
  "The little train chugged happily through Toronto on a sunny morning.",
  "Muneeb built a shell in C and a classifier that loves paintings.",
  "All aboard the Muneeb Line — next stop, Summer 2027.",
];

function ShellDemo() {
  const [lines, setLines] = useState<string[]>(["muneeb@portfolio:~$ type 'help' to start", "Mini demo — inspired by my C shell, not the full C program."]);
  const [input, setInput] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [lines]);
  const run = async (cmd: string) => {
    const c = cmd.trim().toLowerCase();
    if (c === "cat flag.txt" || c === "flag") {
      setLines((prev) => [...prev, `muneeb@portfolio:~$ ${cmd}`, "Found it — check Network."]);
      setInput("");
      requestAnimationFrame(() => inputRef.current?.focus());
      try { await fetch("/api/shell", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: cmd }) }); } catch {}
      return;
    }
    let out = "";
    if (c === "help") out = "try: ls · pwd · whoami · cat resume.txt · echo hello · chat";
    else if (c === "ls") out = "unix-shell/\npainting-classifier/\ncampusclaims/\nsportsdeck/\ntypetyme/\npaintapp/\nresume.txt\nticket-1.txt";
    else if (c === "pwd") out = "/home/muneeb";
    else if (c === "whoami") out = "muneeb — UofT CS '28, open for Summer 2027";
    else if (c === "cat resume.txt") out = "Muneeb Hyder · SWE Intern · Radar · Live AI · Bellwoods · Investi";
    else if (c === "chat") out = "hello! You found the chat command — just like in my shell.";
    else if (c.startsWith("echo ")) out = cmd.slice(5);
    else if (c === "") out = "";
    else out = `hmm, '${cmd}' doesn't live here yet — try 'help'.`;
    setLines((prev) => [...prev, `muneeb@portfolio:~$ ${cmd}`, out].filter(Boolean));
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  return (
    <div className="demo">
      <p><strong>Try the shell</strong></p>
      <p className="demo-note">Mini demo — inspired by my C shell, not the full C program running in your browser.</p>
      <div className="terminal" role="log" aria-label="Mini shell demo" ref={logRef} onClick={() => inputRef.current?.focus()} style={{ maxHeight: 220, overflowY: "auto" }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
        <div>muneeb@portfolio:~$ <input ref={inputRef} aria-label="Shell command" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") run(input); }} placeholder="help" /></div>
      </div>
      <button className="btn small secondary" onClick={() => run("help")}>Run help</button>
    </div>
  );
}

function PaintingDemo() {
  const [picked, setPicked] = useState(PAINTINGS[0]);
  const [serverNote, setServerNote] = useState("");
  const pick = async (painting: (typeof PAINTINGS)[number]) => {
    setPicked(painting);
    try {
      const r = await fetch("/api/painting-predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paintingId: painting.id }) });
      const j = await r.json();
      setServerNote(j.prediction ? `Server says: ${j.prediction}. Check Network.` : "");
    } catch { setServerNote("Backend not running locally — prediction is front-end only here. Deploy on Vercel to enable the CTF check."); }
  };
  return (
    <div className="demo">
      <p><strong>Try the classifier</strong></p>
      <p className="demo-note">Demo — the real model was trained in Python / scikit-learn. This is a front-end illustration of how it works. Accuracy on held-out data: 87.6%.</p>
      <div className="paint-grid">
        {PAINTINGS.map((p) => (
          <button key={p.id} className="paint-card" aria-pressed={picked.id === p.id} onClick={() => pick(p)}>
            <span aria-hidden="true" style={{ display: "inline-block", width: 44, height: 44, borderRadius: 12, background: p.swatch, border: "2px solid #2B2118" }} /><br /><strong>{p.name}</strong>
          </button>
        ))}
      </div>
      <p style={{ marginTop: 10 }}>The model would predict: you like <strong>{picked.style}</strong>.</p>
      {serverNote && <p className="demo-note">{serverNote}</p>}
    </div>
  );
}

function TypingDemo() {
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const prompt = TYPING_PROMPTS[idx];
  const onChange = (v: string) => {
    const clipped = v.slice(0, prompt.length);
    if (!start) setStart(Date.now());
    setValue(clipped);
    if (clipped.trim() === prompt) { setDone(true); setEnd(Date.now()); }
  };
  const wpm = start && done && end ? Math.round(prompt.split(" ").length / ((end - start) / 60000)) : null;
  return (
    <div className="demo">
      <p><strong>Try TypeTyme — 30-second typing challenge</strong></p>
      <p className="demo-note">Mini demo — the real TypeTyme uses Gemini AI for prompts and Flask + SQL for login/scores.</p>
      <div className="typing-box">{prompt}
        <input aria-label="Type the prompt" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Start typing here…" />
      </div>
      <p>{done ? `Done! ${wpm ? `${wpm} WPM` : ""} — in the real game this would save your score.` : `${value.length}/${prompt.length} characters — type the prompt exactly to finish.`} <button className="btn small secondary" onClick={() => { setIdx((prev) => (prev + 1) % TYPING_PROMPTS.length); setValue(""); setStart(null); setEnd(null); setDone(false); }}>New prompt</button></p>
    </div>
  );
}

function PaintCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#E85D4A");
  const drawing = useRef(false);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 900; c.height = 180;
    const ctx = c.getContext("2d"); if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
  }, []);
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current; if (!c || !drawing.current) return;
    const r = c.getBoundingClientRect(); const ctx = c.getContext("2d"); if (!ctx) return;
    const x = ((e.clientX - r.left) / r.width) * c.width;
    const y = ((e.clientY - r.top) / r.height) * c.height;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  };
  return (
    <div className="demo">
      <p><strong>Try PaintApp — mini canvas</strong></p>
      <p className="demo-note">Mini canvas — the real PaintApp has 10+ tools, layering, and a local LLaMA sketch helper.</p>
      <canvas ref={ref} className="paint" aria-label="Mini drawing canvas" onPointerDown={(e) => { drawing.current = true; ref.current?.setPointerCapture(e.pointerId); draw(e); }} onPointerUp={() => { drawing.current = false; }} onPointerLeave={() => { drawing.current = false; }} onPointerMove={draw} />
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {["#E85D4A", "#F2B749", "#4A9EB8", "#7FB069", "#2B2118", "#F28482"].map((col) => (
          <button key={col} aria-label={`Colour ${col}`} onClick={() => setColor(col)} style={{ background: col, width: 32, height: 32, borderRadius: "50%", border: color === col ? "3px solid #2B2118" : "2px solid #2B2118" }} />
        ))}
        <button className="btn small secondary" onClick={() => { const c = ref.current; c?.getContext("2d")?.clearRect(0, 0, c.width, c.height); }}>Clear</button>
      </div>
    </div>
  );
}


// --- Capture the Flag: ONE flag, five stops, savepoints ---
// Best of both: a single-flag chain (inspect -> shell -> painting -> radar -> lost -> flag)
// + savepoints. Each cleared stop is a savepoint: it saves your stage, gives you
// +1 hint credit, and remembers the last code word you found, so you can always
// see it again and never lose progress on reload. No flag or code word is in
// this file — codes are returned only in Network responses and validated server-side.
const CTF_STOPS = [
  { stage: 1, title: "Stop 1 — Peek", hints: [
    "Psst — peek behind the curtain.",
    "Right-click, Inspect. The page is talking.",
    "Look at the very top of the HTML.",
  ]},
  { stage: 2, title: "Stop 2 — Shell", hints: [
    "The shell keeps a lost ticket.",
    "List what's in there. One file doesn't belong.",
    "Try `ls` — then look closer.",
  ]},
  { stage: 3, title: "Stop 3 — Painting", hints: [
    "Warmest wins.",
    "Pick a painting. The answer isn't on the page.",
    "Check the Network tab after you pick one.",
  ]},
  { stage: 4, title: "Stop 4 — Radar", hints: [
    "The radar got quieter.",
    "Something dropped. Find the number.",
    "It's on the Radar station.",
  ]},
  { stage: 5, title: "Stop 5 — Lost & Found", hints: [
    "Someone lost their bag on campus.",
    "CampusClaims knows what it was.",
    "It's in the station.",
  ]},
] as const;

function HardPanel() {
  const [playing, setPlaying] = useState(false);
  const [stage, setStage] = useState<number>(() => { try { return Number(localStorage.getItem("muneeb-ctf-stage") || 1); } catch { return 1; } });
  const [credits, setCredits] = useState<number>(() => { try { return Number(localStorage.getItem("muneeb-ctf-credits") || 1); } catch { return 1; } });
  const [found, setFound] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem("muneeb-ctf-found") || "{}"); } catch { return {}; } });
  const [hintLevel, setHintLevel] = useState(1);
  const [wrong, setWrong] = useState(0);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [flag, setFlag] = useState("");
  const [flagStatus, setFlagStatus] = useState("");
  const [won, setWon] = useState(() => { try { return localStorage.getItem("muneeb-ctf-won") === "1"; } catch { return false; } });
  const [backendDown, setBackendDown] = useState(false);
  const [actionInput, setActionInput] = useState("");
  const [actionStatus, setActionStatus] = useState("");

  const save = (s: number, c: number, f: Record<string, string>) => {
    setStage(s); setCredits(c); setFound(f);
    try { localStorage.setItem("muneeb-ctf-stage", String(s)); localStorage.setItem("muneeb-ctf-credits", String(c)); localStorage.setItem("muneeb-ctf-found", JSON.stringify(f)); } catch {}
  };
  const current = CTF_STOPS[Math.min(stage, 5) - 1];
  const lastFound = Object.entries(found).slice(-1)[0];
  // Hint 3 is locked until you spend a hint credit — you earn +1 per savepoint,
  // and after 2 wrong attempts it unlocks free, so no one ever gets totally stuck.
  const hint3Free = wrong >= 2;
  const showHint3 = () => {
    if (hintLevel >= 3) return;
    if (hint3Free) { setHintLevel(3); return; }
    if (credits > 0) { setCredits((prev) => { const n = prev - 1; try { localStorage.setItem("muneeb-ctf-credits", String(n)); } catch {} return n; }); setHintLevel(3); }
  };
  const advance = async () => {
    if (stage >= 6) { setStatus("All stops cleared — submit the flag below."); return; }
    if (stage === 1) {
      // Inspect is just finding the note — no code, just a savepoint.
      save(2, credits + 1, found);
      setWrong(0); setHintLevel(1);
      setStatus("Found it. Savepoint saved — +1 hint credit.");
      return;
    }
    const c = code.trim().toLowerCase();
    if (!c) { setStatus("Enter the code word you found for this stop."); return; }
    try {
      const r = await fetch("/api/ctf/advance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage: stage - 1, code: c }) });
      const j = await r.json();
      if (j.correct) {
        const nextFound = { ...found, [`stop-${stage}`]: c };
        const nextStage = (j.nextStage as number) + 1;
        // Savepoint: +1 hint credit, remember the last code you found, save stage.
        save(nextStage, credits + 1, nextFound);
        setCode(""); setWrong(0); setHintLevel(1);
        setStatus(nextStage === 6 ? "Last stop cleared — check Network for the flag." : `Stop ${stage} cleared. +1 hint credit.`);
      } else {
        const w = wrong + 1; setWrong(w);
        setStatus(j.message || "Not that code word. Try a hint — Hint 3 unlocks free after 2 wrong tries.");
      }
    } catch { setBackendDown(true); setStatus("Backend not reachable. Run npm run server locally, or deploy on Vercel."); }
  };
  const doAction = async () => {
    // Stops 4 and 5 are done from this panel: it POSTs for you, so you don't
    // need curl — but the code word still comes back in the Network response.
    try {
      const isRadar = stage === 4;
      const r = await fetch(isRadar ? "/api/radar" : "/api/lost-found", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isRadar ? { code: actionInput } : { item: actionInput }) });
      const j = await r.json();
      if (j.correct) setActionStatus("Correct — check Network.");
      else setActionStatus(j.hint || "Not that one. Check the hint.");
    } catch { setBackendDown(true); setActionStatus("Backend not reachable."); }
  };
  const submitFlag = async () => {
    if (!flag.trim()) { setFlagStatus("Enter the one flag."); return; }
    try {
      const r = await fetch("/api/submit-flag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challengeId: "final", flag: flag.trim() }) });
      const j = await r.json();
      if (j.correct) { setWon(true); try { localStorage.setItem("muneeb-ctf-won", "1"); } catch {} setFlagStatus("Correct — you found the one flag. Conductor status unlocked."); }
      else setFlagStatus(j.message || "Not that flag.");
    } catch { setBackendDown(true); setFlagStatus("Backend not reachable."); }
  };

  if (!playing) {
    return (
      <div>
        <p><strong>One flag. Five stops.</strong></p>
        <p>Want to play? Each stop gives you the next hint. Clear a stop, save your place, earn a hint credit.</p>
        <button className="btn" onClick={() => setPlaying(true)}>I want to play</button>
        <p className="muted">Starter hint: inspect element is interesting.</p>
        {stage > 1 && <p><button className="btn small secondary" onClick={() => setPlaying(true)}>Resume from stop {Math.min(stage, 5)} — savepoint saved</button></p>}
      </div>
    );
  }
  if (won) {
    return <div><p><strong>You found the one flag. Conductor status unlocked.</strong></p><p className="muted">Thanks for riding the Muneeb Line.</p></div>;
  }
  return (
    <div>
      <p>{"●".repeat(Math.min(stage, 5))}{"○".repeat(Math.max(0, 5 - Math.min(stage, 5)))} — Stop {Math.min(stage, 5)} of 5 · {credits} hint {credits === 1 ? "credit" : "credits"}{lastFound && <span> · last stub: <code>{lastFound[1]}</code></span>}</p>
      {backendDown && <p className="status bad">Backend not reachable in this preview. Run <code>npm run server</code> in another terminal, then reload — Vite proxies /api to localhost:3001. On Vercel it works without that step.</p>}
      <article className="card ctf-card">
        <h3>{current.title}</h3>
        <p>{current.hints[0]}</p>
        {hintLevel >= 2 && <p className="demo-note">Hint 2: {current.hints[1]}</p>}
        {hintLevel >= 3 && <p className="demo-note"><strong>Hint 3:</strong> {current.hints[2]}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button className="btn small secondary" onClick={() => setHintLevel(2)} disabled={hintLevel >= 2}>Show Hint 2</button>
          <button className="btn small secondary" onClick={showHint3} disabled={hintLevel >= 3}>{hint3Free ? "Show Hint 3 (free — 2 wrong tries)" : credits > 0 ? `Show Hint 3 (spend 1 hint credit, you have ${credits})` : "Show Hint 3 (locked — earn a credit at the next savepoint, or try twice)"}</button>
          <button className="btn small secondary" onClick={() => { setHintLevel(3); }}>I&apos;m stuck — show me the exact step</button>
        </div>
        {(stage === 4 || stage === 5) && (
          <div style={{ marginTop: 12 }}>
            <label htmlFor="ctf-action">{stage === 4 ? "Radar code (the number that dropped)" : "Lost item"}</label>
            <input id="ctf-action" className="ctf-input" value={actionInput} onChange={(e) => setActionInput(e.target.value)} placeholder="…" />
            <button className="btn small secondary" onClick={doAction}>Send it</button>
            {actionStatus && <p className="demo-note">{actionStatus}</p>}
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <label htmlFor="ctf-code">Code word</label>
          <input id="ctf-code" className="ctf-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="type the code word here" autoComplete="off" />
          <button className="btn small" onClick={advance}>Check code — save my savepoint</button>
          {status && <p className="status">{status}</p>}
        </div>
      </article>
      <div style={{ marginTop: 14 }}>
        <h3>The one flag</h3>
        <p className="muted">Clear stop 5, then copy the flag here. Just one.</p>
        <label htmlFor="ctf-flag">Flag</label>
        <input id="ctf-flag" className="ctf-input" value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="FLAG{...}" autoComplete="off" />
        <button className="btn small" onClick={submitFlag}>Submit the flag</button>
        {flagStatus && <p className={`status ${flagStatus.startsWith("Correct") ? "ok" : "bad"}`}>{flagStatus}</p>}
      </div>
      {Object.keys(found).length > 0 && <p className="muted">Stubs saved: {Object.entries(found).map(([, v]) => `${v}`).join(" · ")}</p>}
    </div>
  );
}

const GITHUB_URL = "https://github.com/hyneeb";
const RESUME_URL = "/resume.pdf";
const EMAIL = "muneeb.hyder@mail.utoronto.ca";
const ROUTES: Record<string, { label: string; blurb: string; first: string; line: LineId | "all" }> = {
  systems: { label: "Backend / Systems", blurb: "Unix Shell > Radar > SportsDeck caching", first: "unix-shell", line: "systems" },
  ai: { label: "AI / ML", blurb: "TypeTyme > PaintApp > Classifier > Live AI", first: "typetyme", line: "intelligence" },
  product: { label: "Frontend / Product", blurb: "CampusClaims > Investi > Bellwoods > SportsDeck", first: "campusclaims", line: "product" },
  unsure: { label: "Not sure — best route", blurb: "UofT > CampusClaims > Unix Shell > Radar > Hire Me", first: "uoft", line: "all" },
};


// --- Easy mode: same chain, no DevTools. Everything happens in this panel.
// The code words are shown right here after you do the simple thing —
// that's the whole point for non-technical players. Backend still validates.
function EasyPanel({ onSwitch }: { onSwitch: () => void }) {
  const [stage, setStage] = useState<number>(() => { try { return Number(localStorage.getItem("muneeb-ctf-stage-easy") || 1); } catch { return 1; } });
  const [found, setFound] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem("muneeb-ctf-found-easy") || "{}"); } catch { return {}; } });
  const [note, setNote] = useState("");
  const [flag, setFlag] = useState("");
  const [flagStatus, setFlagStatus] = useState("");
  const [won, setWon] = useState(() => { try { return localStorage.getItem("muneeb-ctf-won-easy") === "1"; } catch { return false; } });
  const [backendDown, setBackendDown] = useState(false);
  const saveStage = (s: number, f: Record<string, string>) => {
    setStage(s); setFound(f);
    try { localStorage.setItem("muneeb-ctf-stage-easy", String(s)); localStorage.setItem("muneeb-ctf-found-easy", JSON.stringify(f)); } catch {}
  };
  const advanceWith = async (backendStage: number, code: string) => {
    try {
      const r = await fetch("/api/ctf/advance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage: backendStage, code }) });
      const j = await r.json();
      if (!j.correct) { setNote("Hmm, that didn't work. Try again."); return; }
      const nextFound = { ...found, [`stop-${backendStage + 1}`]: code };
      if (j.flag) {
        setFlag(j.flag);
        saveStage(6, nextFound);
        setNote("Last stop cleared — here's your flag, right here:");
      } else {
        saveStage(backendStage + 2, nextFound);
        setNote(`Ticket found: ${code} — saved! On to the next stop.`);
      }
    } catch { setBackendDown(true); setNote("Backend not reachable. Run npm run server locally, or deploy on Vercel."); }
  };
  const doShell = async () => {
    try {
      const r = await fetch("/api/shell", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: "cat ticket-1.txt" }) });
      const j = await r.json();
      if (j.code) await advanceWith(1, j.code); else setNote("No ticket in the shell. Try again.");
    } catch { setBackendDown(true); }
  };
  const doPainting = async (id: string) => {
    if (id !== "sunset") { setNote("Not the warmest one. Try again."); return; }
    try {
      const r = await fetch("/api/painting-predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paintingId: id }) });
      const code = r.headers.get("X-CTF-Code") || "";
      if (code) await advanceWith(2, code); else setNote("Hmm, no code came back. Try again.");
    } catch { setBackendDown(true); }
  };
  const doRadar = async (v: string) => {
    if (v !== "45") { setNote("Not that number. Check the Radar station."); return; }
    try {
      const r = await fetch("/api/radar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: v }) });
      const j = await r.json();
      if (j.code) await advanceWith(3, j.code);
    } catch { setBackendDown(true); }
  };
  const doLost = async (item: string) => {
    if (item !== "backpack") { setNote("Not that one. What did CampusClaims help find?"); return; }
    try {
      const r = await fetch("/api/lost-found", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item }) });
      const j = await r.json();
      if (j.code) await advanceWith(4, j.code);
    } catch { setBackendDown(true); }
  };
  const submitFlag = async () => {
    try {
      const r = await fetch("/api/submit-flag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challengeId: "final", flag }) });
      const j = await r.json();
      if (j.correct) { setWon(true); try { localStorage.setItem("muneeb-ctf-won-easy", "1"); } catch {} setFlagStatus("Correct — you found the one flag."); }
      else setFlagStatus("Not that flag.");
    } catch { setBackendDown(true); }
  };
  if (won) return <div><p><strong>You found the one flag. Conductor status unlocked.</strong></p><button className="btn small secondary" onClick={onSwitch}>Switch mode</button></div>;
  const dots = "●".repeat(Math.min(stage, 5)) + "○".repeat(Math.max(0, 5 - Math.min(stage, 5)));
  return (
    <div>
      <p>{dots} — Stop {Math.min(stage, 5)} of 5 · Easy mode, no DevTools needed <button className="btn small secondary" onClick={onSwitch}>Switch mode</button></p>
      {backendDown && <p className="status bad">Backend not reachable. Run <code>npm run server</code>, then reload.</p>}
      {stage === 1 && (
        <article className="card ctf-card"><h3>Stop 1 — Peek</h3><p>Psst — the page is hiding a note.</p>
          <button className="btn small" onClick={() => { setNote("The note says: the conductor lost a ticket. First stop: where commands live."); saveStage(2, found); }}>Peek at the note</button>
          {note && <p className="demo-note">{note}</p>}</article>
      )}
      {stage === 2 && (
        <article className="card ctf-card"><h3>Stop 2 — Shell</h3><p>The shell keeps a lost ticket. One file in there doesn't belong.</p>
          <button className="btn small" onClick={doShell}>Check the shell</button>
          {note && <p className="demo-note">{note}</p>}</article>
      )}
      {stage === 3 && (
        <article className="card ctf-card"><h3>Stop 3 — Painting</h3><p>Warmest wins. Pick one:</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{PAINTINGS.map((pt) => <button key={pt.id} className="btn small secondary" onClick={() => doPainting(pt.id)}>{pt.name}</button>)}</div>
          {note && <p className="demo-note">{note}</p>}</article>
      )}
      {stage === 4 && (
        <article className="card ctf-card"><h3>Stop 4 — Radar</h3><p>By how much did radar incidents drop?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["20%", "45%", "80%"].map((v) => <button key={v} className="btn small secondary" onClick={() => doRadar(v.replace("%", ""))}>{v}</button>)}</div>
          {note && <p className="demo-note">{note}</p>}</article>
      )}
      {stage === 5 && (
        <article className="card ctf-card"><h3>Stop 5 — Lost &amp; Found</h3><p>What did a student lose on campus?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["backpack", "phone", "laptop"].map((v) => <button key={v} className="btn small secondary" onClick={() => doLost(v)}>{v}</button>)}</div>
          {note && <p className="demo-note">{note}</p>}</article>
      )}
      {stage >= 6 && (
        <article className="card ctf-card"><h3>The one flag</h3><p>Here it is — no hunting in Network needed:</p>
          <p><code>{flag}</code></p>
          <button className="btn small" onClick={submitFlag}>Submit the flag</button>
          {flagStatus && <p className={`status ${flagStatus.startsWith("Correct") ? "ok" : "bad"}`}>{flagStatus}</p>}</article>
      )}
      {Object.keys(found).length > 0 && <p className="muted">Stubs saved: {Object.values(found).join(" · ")}</p>}
    </div>
  );
}

function CtfPanel() {
  const [mode, setMode] = useState<"easy" | "hard" | null>(() => {
    try { const m = localStorage.getItem("muneeb-ctf-mode"); return m === "easy" || m === "hard" ? m : null; } catch { return null; }
  });
  const choose = (m: "easy" | "hard") => { setMode(m); try { localStorage.setItem("muneeb-ctf-mode", m); } catch {} };
  const clearMode = () => { setMode(null); try { localStorage.removeItem("muneeb-ctf-mode"); } catch {} };
  if (mode === "easy") return <EasyPanel onSwitch={clearMode} />;
  if (mode === "hard") return <div><p><button className="btn small secondary" onClick={clearMode}>Switch mode</button></p><HardPanel /></div>;
  return (
    <div>
      <p><strong>One flag. Five stops. Pick your ride.</strong></p>
      <div className="ctf-grid">
        <article className="card ctf-card"><h3>Easy — for everyone</h3><p>No DevTools, no Network tab. Everything happens right here, with friendly buttons and multiple choice. Still the same chain, still one flag.</p><button className="btn small" onClick={() => choose("easy")}>Play easy</button></article>
        <article className="card ctf-card"><h3>Hard — the real thing</h3><p>Inspect element, Network tab, response headers. Hints are short riddles, codes are hidden in POST responses. For people who like to dig.</p><button className="btn small" onClick={() => choose("hard")}>Play hard</button></article>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(() => {
    const h = window.location.hash.replace("#station/", "");
    return STATIONS.some((s) => s.id === h) ? h : "muneeb-central";
  });
  const [filter, setFilter] = useState<string>("all");
  const [route, setRoute] = useState<string | null>(null);
  const [touring, setTouring] = useState(false);
  const [copied, setCopied] = useState(false);
  const resetView = () => { setFilter("all"); setRoute(null); setTouring(false); setSelectedId("muneeb-central"); window.history.replaceState(null, "", window.location.pathname); };
  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#station/${selectedId}`;
    try { await navigator.clipboard.writeText(url); }
    catch {
      const ta = document.createElement("textarea"); ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
    }
    setCopied(true); window.setTimeout(() => setCopied(false), 2000);
  };
  const selected: Station = STATIONS.find((s) => s.id === selectedId) || STATIONS[0];
  // Which lines are lit right now? A line filter lights that line only.
  // Otherwise the selected station's lines are lit, the rest are muted —
  // never fully off, so the map doesn't feel broken when you click around.
  const isLineFilter = ["systems", "intelligence", "product", "journey"].includes(filter);
  const litLines: LineId[] = isLineFilter ? [filter as LineId] : selected.lineIds;
  const lineOpacity = (id: LineId) => (litLines.includes(id) ? 1 : isLineFilter ? 0.18 : 0.45);
  const lineWidth = (id: LineId) => (litLines.includes(id) ? 11 : 9);

  const visible = (s: Station) => {
    if (s.id === "muneeb-central" || s.id === "hire-me") return true;
    if (filter === "all") return true;
    if (filter === "experience") return s.type === "experience";
    if (filter === "projects") return s.type === "project";
    return s.lineIds.includes(filter as LineId);
  };

  const openStation = (id: string) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `#station/${id}`);
  };

  // Next stop follows the tour order, not the raw data order — that was confusing.
  const nextStation = () => {
    const i = TOUR_ORDER.indexOf(selectedId);
    const nextId = i >= 0 ? TOUR_ORDER[(i + 1) % TOUR_ORDER.length] : TOUR_ORDER[0];
    openStation(nextId);
  };

  const startTour = () => { setTouring(true); openStation(TOUR_ORDER[0]); };
  const tourNext = () => {
    const current = TOUR_ORDER.indexOf(selectedId);
    const n = current + 1;
    if (n >= TOUR_ORDER.length) { setTouring(false); return; }
    openStation(TOUR_ORDER[n]);
  };
  const tourPos = TOUR_ORDER.indexOf(selectedId) + 1;

  // Newest first, by tour order — not by sorting date strings, which is wrong.
  const experiences = STATIONS.filter((s) => s.type === "experience").sort((a, b) => TOUR_ORDER.indexOf(b.id) - TOUR_ORDER.indexOf(a.id));
  const projects = STATIONS.filter((s) => s.type === "project");

  return (
    <>
      <a className="skip" href="#map">Skip to map</a>
      <a className="skip" href="#list">Skip to list view</a>
      <header className="site">
        <div className="wrap header-in">
          <a className="logo" href="#top"><TrainIcon size={24} /> Muneeb Hyder — The Muneeb Line</a>
          <nav className="main" aria-label="Main">
            <a href="#map">Map</a><a href="#journey">Journey</a><a href="#ctf">CTF</a><a href="#skills">Skills</a><a href="#about">About</a><a href="#contact">Contact</a>
          </nav>
          <a className="btn small" href={RESUME_URL}>Resume PDF</a>
        </div>
      </header>

      <main id="top">
        <section className="hero wrap" aria-labelledby="hero-h">
          <span className="eyebrow">All aboard — Summer 2027</span>
          <h1 id="hero-h">Hi, I&apos;m Muneeb Hyder.</h1>
          <p className="lede">UofT Computer Science student building systems, AI, and products people actually use. This is my career as a transit map — pick a line and ride.</p>
          <div className="hero-actions">
            <a className="btn" href="#map">Ride the map</a>
            <a className="btn secondary" href={RESUME_URL}>Download Resume</a>
          </div>
          <p className="trust">Federal Gov — National Radar Program • Live AI • Bellwoods • Investi • CampusClaims (300+ students) • SportsDeck</p>
          <div className="train-track" aria-hidden="true"><span className="train-emoji"><TrainIcon size={30} /></span></div>
        </section>

        <section className="map-section wrap" id="map" aria-labelledby="map-h">
          <h2 id="map-h">The Muneeb Line — a transit map of my work</h2>
          <p className="muted">Diagrammatic, not to scale — like all good transit maps. Click a station to open its story. Mind the gap — between idea and shipped product.</p>
          <div className="layout">
            <div className="card map-card">
              <div className="legend" aria-label="Map legend — click a line to highlight it">
                {(Object.keys(LINES) as LineId[]).map((k) => (
                  <button type="button" className="pill" key={k} aria-pressed={filter === k} onClick={() => setFilter(filter === k ? "all" : k)} style={{ cursor: "pointer" }}><span className="dot" style={{ background: LINES[k].color }} />{LINES[k].name}</button>
                ))}
              </div>
              <div className="filters" role="group" aria-label="Filter stations">
                {["all", "systems", "intelligence", "product", "experience", "projects"].map((f) => (
                  <button key={f} className="filter" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All lines" : f[0].toUpperCase() + f.slice(1)}</button>
                ))}
                <button className="filter" onClick={resetView}>Reset view</button>
              </div>
              <div className="map-wrap">
                <svg className="map" viewBox="0 0 1200 700" role="img" aria-label="Interactive transit map of Muneeb Hyder's career, with Systems, Intelligence and Product lines all meeting at Muneeb Central">
                  <rect x="0" y="668" width="1200" height="32" fill="#A8D8EA" opacity="0.55" />
                  <text x="30" y="690" fontSize="14" fill="#2B2118">Lake Ontario</text>
                  <g aria-hidden="true" stroke="#2B2118" strokeWidth="2" fill="none">
                    <circle cx="70" cy="52" r="18" fill="#F2B749" />
                    <path d="M70 28 v-8 M70 84 v-8 M46 52 h-8 M102 52 h-8" />
                  </g>
                  <g aria-hidden="true" stroke="#2B2118" strokeWidth="2" fill="none">
                    <path d="M1145 110 L1155 40 L1165 110 Z" fill="#fff" />
                    <ellipse cx="1155" cy="88" rx="14" ry="7" fill="#fff" />
                    <rect x="1151" y="110" width="8" height="22" fill="#fff" />
                  </g>
                  <text x="1115" y="150" fontSize="11" fill="#2B2118">CN Tower</text>
                  <rect x="120" y="80" width="1000" height="560" rx="28" fill="none" stroke="#7FB069" strokeWidth="6" strokeDasharray="12 8" opacity={lineOpacity("journey") * 0.75} />
                  <path d="M120,360 H860" stroke="#E85D4A" strokeWidth={lineWidth("systems")} strokeLinecap="round" fill="none" opacity={lineOpacity("systems")} />
                  <path d="M600,120 V610" stroke="#F2B749" strokeWidth={lineWidth("intelligence")} strokeLinecap="round" fill="none" opacity={lineOpacity("intelligence")} />
                  <path d="M220,200 L420,275 L600,360 L800,450 L980,540" stroke="#4A9EB8" strokeWidth={lineWidth("product")} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={lineOpacity("product")} />
                  {STATIONS.map((s) => {
                    const dim = !visible(s);
                    const color = LINES[s.lineIds[0]].color;
                    const labelAbove = s.y < 200 || s.id === "painting-classifier" || s.id === "hire-me";
                    return (
                      <g key={s.id} className="station" role="button" tabIndex={0}
                        aria-label={`${s.name} station, ${LINES[s.lineIds[0]].name}, ${s.type}, ${s.dates}`}
                        opacity={dim ? 0.25 : 1}
                        onClick={() => openStation(s.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openStation(s.id); } }}>
                        {s.isInterchange && <circle className="core" cx={s.x} cy={s.y} r="21" fill="#fff" stroke={color} strokeWidth="4" />}
                        {s.id === "muneeb-central" && <circle className="core" cx={s.x} cy={s.y} r="24" fill="#fff" stroke="#2B2118" strokeWidth="3" />}
                        <circle className="core" cx={s.x} cy={s.y} r={s.id === "muneeb-central" ? 16 : 13} fill={s.id === "muneeb-central" ? "#2B2118" : color} stroke="#fff" strokeWidth="3" />
                        <g transform={`translate(${s.x - 11}, ${labelAbove ? s.y - 42 : s.y + 20})`}>
                          <StationIcon kind={s.icon} size={22} />
                        </g>
                        <text className="station-label" x={s.x} y={labelAbove ? s.y - 48 : s.y + 56} textAnchor="middle">{s.shortName || s.name}</text>
                      </g>
                    );
                  })}
                  <g aria-hidden="true" opacity={visible(selected) ? 1 : 0.25}><circle cx={selected.x} cy={selected.y} r="28" fill="none" stroke="#2B2118" strokeWidth="3" strokeDasharray="5 4" /></g>
                </svg>
              </div>
              <p className="muted" style={{ marginTop: 10 }}>Tip: use Tab + Enter to open stations with a keyboard. <button className="btn small secondary" onClick={startTour}>Take the 2-minute tour</button> {touring && <button className="btn small" onClick={tourNext}>Next stop ({tourPos}/{TOUR_ORDER.length})</button>} {touring && <button className="btn small secondary" onClick={() => setTouring(false)}>Exit tour</button>}</p>
            </div>

            <aside className="card panel" id="station-panel" aria-live="polite" aria-label="Station details">
              <span className="line-pill" style={{ background: LINES[selected.lineIds[0]].color }}>{LINES[selected.lineIds[0]].name} • {selected.dates}</span>
              <h2 style={{ marginTop: 10 }}><StationIcon kind={selected.icon} size={26} /> {selected.name}</h2>
              <p><strong>{selected.org}{selected.role ? ` — ${selected.role}` : ""}</strong></p>
              <p>{selected.oneLiner}</p>
              <ul>{selected.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              {selected.metrics && (
                <div className="metrics" aria-label="Key results">
                  {selected.metrics.map((m) => <div className="ticket" key={m.label}><b>{m.value}</b><span>{m.label}</span></div>)}
                </div>
              )}
              <div className="tags">{selected.tech.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
              {selected.demoType === "shell" && <ShellDemo />}
              {selected.demoType === "painting" && <PaintingDemo />}
              {selected.demoType === "typing" && <TypingDemo />}
              {selected.demoType === "paint" && <PaintCanvas />}
              <div className="panel-actions">
                <a className="btn small" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
                <button className="btn small secondary" onClick={nextStation}>Next stop</button>
                <button className="btn small secondary" onClick={copyLink} aria-live="polite">{copied ? "Copied!" : "Copy station link"}</button>
              </div>
            </aside>
          </div>
        </section>

        <section className="section wrap" id="journey" aria-labelledby="journey-h">
          <h2 id="journey-h">Where are you headed?</h2>
          <p>Pick a ticket — I&apos;ll highlight the right route for you.</p>
          <div className="journey">
            {Object.entries(ROUTES).map(([k, r]) => (
              <button key={k} className="ticket-btn" aria-pressed={route === k} onClick={() => { setRoute(k); setFilter(r.line); openStation(r.first); }}>
                <strong>{r.label}</strong><br /><span className="muted">{r.blurb}</span>
              </button>
            ))}
          </div>
          {route && <p style={{ marginTop: 12 }}>Route: <strong>{ROUTES[route].blurb}</strong> — starting at {STATIONS.find((s) => s.id === ROUTES[route].first)?.name}.</p>}
        </section>

        <section className="section wrap" id="ctf" aria-labelledby="ctf-h">
          <h2 id="ctf-h">Capture the Flag — One Flag, Five Stops</h2>
          <p>One flag, five stops. Easy or hard — your pick.</p>
          <CtfPanel />
        </section>

        <section className="section wrap" id="list" aria-labelledby="list-h">
          <h2 id="list-h">Or view as a list — no map needed</h2>
          <p className="muted">Same content as the map, for phones, screen readers, and anyone in a hurry.</p>
          <h3>Experience — newest first</h3>
          {experiences.map((s) => (
            <article className="card list-item" key={s.id}>
              <h3><StationIcon kind={s.icon} size={22} /> {s.name} — {s.role}</h3>
              <p><strong>{s.org} • {s.dates}</strong></p>
              <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              <div className="tags">{s.tech.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            </article>
          ))}
          <h3>Projects — oldest first</h3>
          {projects.map((s) => (
            <article className="card list-item" key={s.id}>
              <h3><StationIcon kind={s.icon} size={22} /> {s.name} — {s.dates}</h3>
              <p>{s.oneLiner}</p>
              <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              <div className="tags">{s.tech.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            </article>
          ))}
        </section>

        <section className="section wrap" id="skills" aria-labelledby="skills-h">
          <h2 id="skills-h">Skills Neighbourhood</h2>
          <div className="houses">
            <div className="card house"><h3>Languages</h3><div className="tags">{SKILLS.languages.map((s) => <span className="tag" key={s}>{s}</span>)}</div></div>
            <div className="card house"><h3>Technologies</h3><div className="tags">{SKILLS.technologies.map((s) => <span className="tag" key={s}>{s}</span>)}</div></div>
            <div className="card house"><h3>Infrastructure</h3><div className="tags">{SKILLS.infrastructure.map((s) => <span className="tag" key={s}>{s}</span>)}</div></div>
          </div>
          <div className="card house" style={{ marginTop: 14 }}>
            <h3>Also in my projects</h3>
            <div className="tags">{SKILLS.alsoInProjects.map((s) => <span className="tag" key={s.name}>{s.name} — {s.note}</span>)}</div>
          </div>
        </section>

        <section className="section wrap" id="about" aria-labelledby="about-h">
          <h2 id="about-h">About — Muneeb Central</h2>
          <div className="card list-item">
            <p>I&apos;m Muneeb Hyder, a University of Toronto Computer Science Specialist (HBSc, graduating April 2028). I like the part where an idea becomes something shipped — a shell, a classifier, an app 300+ students actually use. I&apos;ve worked on radar tooling for the Government of Canada, on-device voice AI at Live AI, and products at Bellwoods and Investi.</p>
            <p>Relevant coursework: Operating Systems, Computer Networks, Algorithm Design &amp; Analysis, Cybersecurity.</p>
          </div>
        </section>

        <section className="section wrap" id="contact" aria-labelledby="contact-h">
          <h2 id="contact-h">Next stop: your team — Summer 2027</h2>
          <div className="card list-item">
            <p><strong>Open for Software Engineering internships, May–Aug 2027.</strong></p>
            <div className="panel-actions">
              <a className="btn" href={`mailto:${EMAIL}`}>Email Muneeb</a>
              <a className="btn secondary" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
              <a className="btn secondary" href={RESUME_URL}>Download Resume PDF</a>
            </div>
            <p className="muted">{EMAIL} • (647) 762-9037 • github.com/hyneeb</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <p>Built with React + a lot of TTC inspiration. Not affiliated with the TTC. © 2026–2027 Muneeb Hyder. Map is a diagram, not to scale — like all good transit maps.</p>
          <p><a href="#top">Back to top</a></p>
        </div>
      </footer>
    </>
  );
}
