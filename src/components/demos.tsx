import { useEffect, useRef, useState } from "react";
import { easyModeOn, easyStageNow, emitEasyCode } from "../lib/ctf-bridge";

const PAINTINGS = [
  { id: "sunset", name: "Warm Sunset Hills", swatch: "#F28482", style: "warm, high-contrast landscapes" },
  { id: "sea", name: "Calm Blue Sea", swatch: "#4A9EB8", style: "cool, calm seascapes" },
  { id: "forest", name: "Green Forest Path", swatch: "#7FB069", style: "green, nature scenes" },
  { id: "city", name: "Busy City Lights", swatch: "#F2B749", style: "bold, urban scenes" },
];

const TYPING_PROMPTS = [
  "The little train chugged happily through Toronto on a sunny morning.",
  "Muneeb built a shell in C and a classifier that loves paintings.",
  "All aboard the Muneeb Line. Next stop, Summer 2027.",
];

export function ShellDemo() {
  const [lines, setLines] = useState<string[]>(["muneeb@portfolio:~$ type 'help' to start", "Mini demo, inspired by my C shell. Not the full C program."]);
  const [input, setInput] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [lines]);
  const run = async (cmd: string) => {
    const c = cmd.trim().toLowerCase();
    // ticket-1.txt is the only ticket file — `ls` shows it, and only it works.
    if (c === "cat ticket-1.txt") {
      setInput("");
      requestAnimationFrame(() => inputRef.current?.focus());
      try {
        const r = await fetch("/api/shell", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: cmd }) });
        const j = await r.json();
        if (j.code) {
          if (easyModeOn() && easyStageNow() === 2) {
            setLines((prev) => [...prev, `muneeb@portfolio:~$ ${cmd}`, `Ticket stub: ${j.code}. Saved!`]);
            emitEasyCode(1, j.code);
          } else {
            setLines((prev) => [...prev, `muneeb@portfolio:~$ ${cmd}`, "Found it. Check Network."]);
          }
        } else setLines((prev) => [...prev, `muneeb@portfolio:~$ ${cmd}`, "Backend didn't return a ticket. Try again in a moment."]);
      } catch {
        setLines((prev) => [...prev, `muneeb@portfolio:~$ ${cmd}`, "Backend not reachable. Run npm run server, then try again."]);
      }
      return;
    }
    let out = "";
    if (c === "help") out = "try: ls · pwd · whoami · cat resume.txt · echo hello · chat. Cat works on any file you see in ls";
    else if (c === "ls") out = "unix-shell/\npainting-classifier/\ncampusclaims/\nsportsdeck/\ntypetyme/\npaintapp/\nresume.txt\nticket-1.txt";
    else if (c === "pwd") out = "/home/muneeb";
    else if (c === "whoami") out = "muneeb, UofT CS '28, open for Summer 2027";
    else if (c === "cat resume.txt") out = "Muneeb Hyder · SWE Intern · Radar · Live AI · Bellwoods · Investi";
    else if (c === "chat") out = "hello! You found the chat command, just like in my shell.";
    else if (c.startsWith("echo ")) out = cmd.slice(5);
    else if (c === "") out = "";
    else out = `hmm, '${cmd}' doesn't live here yet. Try 'help'.`;
    setLines((prev) => [...prev, `muneeb@portfolio:~$ ${cmd}`, out].filter(Boolean));
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  return (
    <div className="demo">
      <p><strong>Try the shell</strong></p>
      <p className="demo-note">Mini demo, inspired by my C shell. Not the full C program running in your browser.</p>
      <div className="terminal" role="log" aria-label="Mini shell demo" ref={logRef} onClick={() => inputRef.current?.focus()} style={{ maxHeight: 240, overflowY: "auto" }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
        <div>muneeb@portfolio:~$ <input ref={inputRef} aria-label="Shell command" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") run(input); }} placeholder="type a command, e.g. ls" /></div>
      </div>
      <button className="btn small secondary" onClick={() => run("help")}>Run help</button> <button className="btn small secondary" onClick={() => run("ls")}>Run ls</button>
    </div>
  );
}

export function PaintingDemo() {
  // No painting is pre-selected — the warmest one must be picked, not given away.
  const [picked, setPicked] = useState<(typeof PAINTINGS)[number] | null>(null);
  const [serverNote, setServerNote] = useState("");
  const reqId = useRef(0);
  const pick = async (painting: (typeof PAINTINGS)[number]) => {
    setPicked(painting);
    const myReq = ++reqId.current;
    try {
      const r = await fetch("/api/painting-predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paintingId: painting.id }) });
      const code = r.headers.get("X-CTF-Code") || "";
      const j = await r.json();
      if (myReq !== reqId.current) return; // a newer pick already won the race
      // Easy mode (stop 3 only): the stub shows up right here, under the result.
      if (easyModeOn() && easyStageNow() === 3 && painting.id === "sunset" && code) {
        setServerNote(`Ticket stub: ${code}. Saved! Check the CTF ticket at the bottom of the page for the next stop.`);
        emitEasyCode(2, code);
      } else {
        setServerNote(j.prediction ? `Server says: ${j.prediction}.` + (painting.id === "sunset" ? " Check Network." : "") : "");
      }
    } catch { if (myReq === reqId.current) setServerNote("Backend not reachable right now. Try again in a moment."); }
  };
  return (
    <div className="demo">
      <p><strong>Try the classifier</strong></p>
      <p className="demo-note">Demo. The real model was trained in Python / scikit-learn. This is a front-end illustration of how it works. Accuracy on held-out data: 87.6%.</p>
      <div className="paint-grid">
        {PAINTINGS.map((p) => (
          <button key={p.id} className="paint-card" aria-pressed={picked?.id === p.id} onClick={() => pick(p)}>
            <span aria-hidden="true" style={{ display: "inline-block", width: 44, height: 44, borderRadius: 12, background: p.swatch, border: "2px solid #2B2118" }} /><br /><strong>{p.name}</strong>
          </button>
        ))}
      </div>
      <p style={{ marginTop: 10 }}>{picked ? <>The model would predict: you like <strong>{picked.style}</strong>.</> : "Pick a painting and the model will guess what you like."}</p>
      {serverNote && <p className="demo-note">{serverNote}</p>}
    </div>
  );
}

export function TypingDemo() {
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
    else if (done) { setDone(false); setEnd(null); }
  };
  const wpm = start && done && end ? Math.round(prompt.split(" ").length / ((end - start) / 60000)) : null;
  return (
    <div className="demo">
      <p><strong>Try TypeTyme: typing challenge</strong></p>
      <p className="demo-note">Mini demo. The real TypeTyme uses Gemini AI for prompts and Flask + SQL for login/scores.</p>
      <div className="typing-box">{prompt}
        <input aria-label="Type the prompt" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Start typing here…" />
      </div>
      <p>{done ? `Done! ${wpm ? `${wpm} WPM` : ""}. In the real game this would save your score.` : `${value.length}/${prompt.length} characters. Type the prompt exactly to finish.`} <button className="btn small secondary" onClick={() => { setIdx((prev) => (prev + 1) % TYPING_PROMPTS.length); setValue(""); setStart(null); setEnd(null); setDone(false); }}>New prompt</button></p>
    </div>
  );
}

export function PaintCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#E85D4A");
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const clearCanvas = () => { const c = ref.current; const ctx = c?.getContext("2d"); if (c && ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); } };
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 900; c.height = 180;
    const ctx = c.getContext("2d"); if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
  }, []);
  const posOf = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current; if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current; if (!c || !drawing.current) return;
    const ctx = c.getContext("2d"); const pos = posOf(e); if (!ctx || !pos) return;
    // Draw a line from the last point, not isolated dots — fast drags stay smooth.
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 20; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    if (lastPos.current) { ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); }
    else { ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2); }
    ctx.stroke(); ctx.fill();
    lastPos.current = pos;
  };
  return (
    <div className="demo">
      <p><strong>Try PaintApp: mini canvas</strong></p>
      <p className="demo-note">Mini canvas. The real PaintApp has 10+ tools, layering, and a local LLaMA sketch helper.</p>
      <canvas ref={ref} className="paint" aria-label="Mini drawing canvas. Press and drag to draw" onPointerDown={(e) => { drawing.current = true; lastPos.current = null; ref.current?.setPointerCapture(e.pointerId); draw(e); }} onPointerUp={() => { drawing.current = false; lastPos.current = null; }} onPointerLeave={() => { drawing.current = false; lastPos.current = null; }} onPointerMove={draw} />
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {[["#E85D4A", "Coral"], ["#F2B749", "Honey"], ["#4A9EB8", "Teal"], ["#7FB069", "Leaf"], ["#2B2118", "Ink"], ["#F28482", "Pink"]].map(([col, name]) => (
          <button key={col} aria-label={`Colour ${name}`} aria-pressed={color === col} onClick={() => setColor(col)} style={{ background: col, width: 32, height: 32, borderRadius: "50%", border: color === col ? "3px solid #2B2118" : "2px solid #2B2118" }} />
        ))}
        <button className="btn small secondary" onClick={clearCanvas}>Clear</button>
      </div>
    </div>
  );
}
