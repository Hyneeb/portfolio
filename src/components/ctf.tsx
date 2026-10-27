import { useEffect, useRef, useState } from "react";
import { EASY_CODE_EVENT, EASY_PEEK_EVENT, EASY_STAGE_EVENT, emitEasyCode, goToStation } from "../lib/ctf-bridge";
import { EMAIL } from "../lib/site";

// --- Capture the Flag: ONE flag, five stops, savepoints ---
// Best of both: a single-flag chain (inspect -> shell -> painting -> radar -> lost -> flag)
// + savepoints. Each cleared stop is a savepoint: it saves your stage, gives you
// +1 hint credit, and remembers the last code word you found, so you can always
// see it again and never lose progress on reload. No flag or code word is in
// this file — codes are returned only in Network responses and validated server-side.
const CTF_STOPS = [
  { stage: 1, title: "Stop 1: Peek", hints: [
    "Psst. Peek behind the curtain.",
    "Right-click, Inspect. The page is talking.",
    "Look at the very top of the HTML.",
  ]},
  { stage: 2, title: "Stop 2: Shell", hints: [
    "The shell keeps a lost ticket.",
    "List what's in there. One file doesn't belong.",
    "Try `ls`, then look closer.",
  ]},
  { stage: 3, title: "Stop 3: Painting", hints: [
    "Warmest wins.",
    "Pick a painting. The answer isn't on the page.",
    "Check the Network tab after you pick one.",
  ]},
  { stage: 4, title: "Stop 4: Radar", hints: [
    "The radar got quieter.",
    "Something dropped. Find the number.",
    "It's on the Radar station.",
  ]},
  { stage: 5, title: "Stop 5: Lost & Found", hints: [
    "Someone lost their bag on campus.",
    "CampusClaims knows what it was.",
    "It's in the station.",
  ]},
] as const;

function HardPanel({ onSwitch }: { onSwitch: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [stage, setStage] = useState<number>(() => { try { return Number(localStorage.getItem("muneeb-ctf-stage") || 1); } catch { return 1; } });
  const [credits, setCredits] = useState<number>(() => { try { return Number(localStorage.getItem("muneeb-ctf-credits") || 1); } catch { return 1; } });
  const [found, setFound] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem("muneeb-ctf-found") || "{}"); } catch { return {}; } });
  const [hintLevel, setHintLevel] = useState(1);
  const [wrong, setWrong] = useState(0);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [flag, setFlag] = useState(() => { try { return localStorage.getItem("muneeb-ctf-flag") || ""; } catch { return ""; } });
  const [flagStatus, setFlagStatus] = useState("");
  const [won, setWon] = useState(() => { try { return localStorage.getItem("muneeb-ctf-won") === "1"; } catch { return false; } });
  const [backendDown, setBackendDown] = useState(false);
  const [actionInput, setActionInput] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const resetCtf = () => {
    try { ["muneeb-ctf-stage", "muneeb-ctf-credits", "muneeb-ctf-found", "muneeb-ctf-won", "muneeb-ctf-flag"].forEach((k) => localStorage.removeItem(k)); } catch {}
    setStage(1); setCredits(1); setFound({}); setHintLevel(1); setWrong(0); setCode(""); setStatus(""); setFlag(""); setFlagStatus(""); setWon(false); setActionInput(""); setActionStatus(""); setPlaying(false);
  };

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
    if (credits > 0) { setCredits((prev) => { const n = prev - 1; try { localStorage.setItem("muneeb-ctf-credits", String(n)); } catch {} return n; }); setHintLevel(3); return; }
    setStatus("Hint 3 is locked. Earn a credit at the next savepoint, or get 2 wrong tries first.");
  };
  const advance = async () => {
    if (stage >= 6) { setStatus("All stops cleared. Submit the flag below."); return; }
    if (stage === 1) {
      // Inspect is just finding the note — no code, just a savepoint.
      save(2, credits + 1, found);
      setWrong(0); setHintLevel(1);
      setStatus("Found it. Savepoint saved. +1 hint credit.");
      return;
    }
    const c = code.trim().toLowerCase();
    if (!c) { setStatus("Enter the code you found for this stop."); return; }
    try {
      const r = await fetch("/api/ctf-advance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage: stage - 1, code: c }) });
      const j = await r.json();
      if (j.correct) {
        const nextFound = { ...found, [`stop-${stage}`]: c };
        const nextStage = (j.nextStage as number) + 1;
        // Savepoint: +1 hint credit, remember the last code you found, save stage.
        save(nextStage, credits + 1, nextFound);
        setCode(""); setWrong(0); setHintLevel(1);
        if (j.flag) { setFlag(j.flag); try { localStorage.setItem("muneeb-ctf-flag", j.flag); } catch {} }
        setStatus(nextStage === 6 ? "Last stop cleared. Check Network for the flag." : `Stop ${stage} cleared. +1 hint credit.`);
      } else {
        const w = wrong + 1; setWrong(w);
        setStatus(j.message || "Not that code. Try a hint. Hint 3 unlocks free after 2 wrong tries.");
      }
    } catch { setBackendDown(true); setStatus("Backend not reachable right now. Try again in a moment."); }
  };
  const doAction = async () => {
    // Stops 4 and 5 are done from this panel: it POSTs for you, so you don't
    // need curl — but the code word still comes back in the Network response.
    try {
      const isRadar = stage === 4;
      const r = await fetch(isRadar ? "/api/radar" : "/api/lost-found", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isRadar ? { code: actionInput } : { item: actionInput }) });
      const j = await r.json();
      if (j.correct) setActionStatus("Correct. Check Network.");
      else setActionStatus(j.hint || "Not that one. Check the hint.");
    } catch { setBackendDown(true); setActionStatus("Backend not reachable right now. Try again in a moment."); }
  };
  const submitFlag = async () => {
    if (!flag.trim()) { setFlagStatus("Enter the one flag."); return; }
    try {
      const r = await fetch("/api/submit-flag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challengeId: "final", flag: flag.trim() }) });
      const j = await r.json();
      if (j.correct) { setWon(true); try { localStorage.setItem("muneeb-ctf-won", "1"); } catch {} setFlagStatus("Correct. You found the one flag. Conductor status unlocked."); }
      else setFlagStatus(j.message || "Not that flag.");
    } catch { setBackendDown(true); setFlagStatus("Backend not reachable right now. Try again in a moment."); }
  };

  if (!playing) {
    return (
      <div>
        <p><strong>One flag. Five stops.</strong></p>
        <p>Want to play? Each stop gives you the next hint. Clear a stop, save your place, earn a hint.</p>
        <button className="btn" onClick={() => setPlaying(true)}>I want to play</button>
        <p className="muted">Starter hint: inspect element is interesting.</p>
        {stage > 1 && <p><button className="btn small secondary" onClick={() => setPlaying(true)}>Resume from stop {Math.min(stage, 5)} (savepoint saved)</button></p>}
      </div>
    );
  }
  if (won) {
    return <div><p><strong>You found the one flag. Conductor status unlocked.</strong></p><p className="muted">Thanks for riding the Muneeb Line.</p><p><a className="btn small" href={`mailto:${EMAIL}`}>Email Muneeb</a> <button className="btn small secondary" onClick={resetCtf}>Play again</button> <button className="btn small secondary" onClick={onSwitch}>Switch mode</button></p></div>;
  }
  return (
    <div>
      <p>Hard mode · {"●".repeat(Math.min(stage, 5))}{"○".repeat(Math.max(0, 5 - Math.min(stage, 5)))} Stop {Math.min(stage, 5)} of 5 · {credits} hint {credits === 1 ? "credit" : "credits"}{lastFound && <span> · last stub: <code>{lastFound[1]}</code></span>} <button className="btn small secondary" onClick={resetCtf}>Reset CTF</button></p>
      {backendDown && <p className="status bad">The CTF backend isn&apos;t reachable right now. Try again in a moment.</p>}
      <article className="card ctf-card">
        <h3>{current.title}</h3>
        <p>{current.hints[0]}</p>
        {hintLevel >= 2 && <p className="demo-note">Hint 2: {current.hints[1]}</p>}
        {hintLevel >= 3 && <p className="demo-note"><strong>Hint 3:</strong> {current.hints[2]}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button className="btn small secondary" onClick={() => setHintLevel(2)} disabled={hintLevel >= 2}>Show Hint 2</button>
          <button className="btn small secondary" onClick={showHint3} disabled={hintLevel >= 3 || (!hint3Free && credits === 0)}>{hint3Free ? "Show Hint 3 (free after 2 wrong tries)" : credits > 0 ? `Show Hint 3 (spend 1 hint credit, you have ${credits})` : "Show Hint 3 (locked. Earn a credit at the next savepoint, or try twice)"}</button>
        </div>
        <p className="demo-note">Hint 2 is free. Hint 3 costs 1 hint credit, or unlocks free after 2 wrong tries. You earn +1 credit at every stop you clear.</p>
        {(stage === 4 || stage === 5) && (
          <div style={{ marginTop: 12 }}>
            <label htmlFor="ctf-action">{stage === 4 ? "Radar code. Just the number that dropped, no %" : "Lost item"}</label>
            <input id="ctf-action" className="ctf-input" value={actionInput} onChange={(e) => setActionInput(e.target.value)} placeholder={stage === 4 ? "45" : "…"} />
            <button className="btn small secondary" onClick={doAction}>Send it</button>
            {actionStatus && <p className="demo-note">{actionStatus}</p>}
          </div>
        )}
        {stage === 1 ? (
          <div style={{ marginTop: 12 }}>
            <p className="demo-note">Stop 1 has no code. Just find the note.</p>
            <button className="btn small" onClick={advance}>I found the note. Save my stop</button>
            {status && <p className="status">{status}</p>}
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <label htmlFor="ctf-code">Code</label>
            <input id="ctf-code" className="ctf-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="type the code here" autoComplete="off" />
            <button className="btn small" onClick={advance}>Check code and save my savepoint</button>
            {status && <p className="status">{status}</p>}
          </div>
        )}
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

// --- Easy mode: same chain, no DevTools — but you still have to dig a little.
// The panel only tells you where to go and what to do, in one short sentence.
// The stub is revealed where you found it — in the real station/demo — and
// finding it is what advances you. No panel button does the stop for you.
export function EasyPanel({ onSwitch }: { onSwitch: () => void }) {
  const [stage, setStage] = useState<number>(() => { try { return Number(localStorage.getItem("muneeb-ctf-stage-easy") || 1); } catch { return 1; } });
  const [found, setFound] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem("muneeb-ctf-found-easy") || "{}"); } catch { return {}; } });
  const [note, setNote] = useState("");
  const [nudge, setNudge] = useState(false);
  const [flag, setFlag] = useState(() => { try { return localStorage.getItem("muneeb-ctf-flag-easy") || ""; } catch { return ""; } });
  const [flagStatus, setFlagStatus] = useState("");
  const [won, setWon] = useState(() => { try { return localStorage.getItem("muneeb-ctf-won-easy") === "1"; } catch { return false; } });
  const [backendDown, setBackendDown] = useState(false);
  const saveStage = (s: number, f: Record<string, string>) => {
    setStage(s); setFound(f); setNote(""); setNudge(false);
    try { localStorage.setItem("muneeb-ctf-stage-easy", String(s)); localStorage.setItem("muneeb-ctf-found-easy", JSON.stringify(f)); } catch {}
  };
  const resetCtf = () => {
    try { ["muneeb-ctf-stage-easy", "muneeb-ctf-found-easy", "muneeb-ctf-won-easy", "muneeb-ctf-flag-easy"].forEach((k) => localStorage.removeItem(k)); } catch {}
    setStage(1); setFound({}); setNote(""); setFlag(""); setFlagStatus(""); setWon(false); setNudge(false);
  };
  const advanceWith = async (backendStage: number, code: string) => {
    // Read found from storage, not from a stale closure — this is called from window events.
    const currentFound = (() => { try { return JSON.parse(localStorage.getItem("muneeb-ctf-found-easy") || "{}"); } catch { return {}; } })();
    try {
      const r = await fetch("/api/ctf-advance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage: backendStage, code }) });
      const j = await r.json();
      if (!j.correct) { setNote("Hmm, that didn't work. Try again."); return; }
      const nextFound = { ...currentFound, [`stop-${backendStage + 1}`]: code };
      if (j.flag) {
        setFlag(j.flag);
        try { localStorage.setItem("muneeb-ctf-flag-easy", j.flag); } catch {}
        saveStage(6, nextFound);
        setNote("Last stop cleared. Here's your flag, right here:");
      } else {
        saveStage(backendStage + 2, nextFound);
        setNote(`Ticket found: ${code}. Saved! On to the next stop.`);
      }
    } catch { setBackendDown(true); setNote("Backend not reachable right now. Try again in a moment."); }
  };
  const advanceRef = useRef(advanceWith);
  advanceRef.current = advanceWith;
  useEffect(() => {
    const onCode = (e: Event) => { const d = (e as CustomEvent).detail; if (d?.code) advanceRef.current(d.stage, d.code); };
    const onPeek = () => { const f = (() => { try { return JSON.parse(localStorage.getItem("muneeb-ctf-found-easy") || "{}"); } catch { return {}; } })(); saveStage(2, f); setNote("The note says: the conductor lost a ticket. First stop: where commands live."); };
    window.addEventListener(EASY_CODE_EVENT, onCode);
    window.addEventListener(EASY_PEEK_EVENT, onPeek);
    return () => { window.removeEventListener(EASY_CODE_EVENT, onCode); window.removeEventListener(EASY_PEEK_EVENT, onPeek); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(EASY_STAGE_EVENT, { detail: { mode: "easy", stage } }));
    return () => { window.dispatchEvent(new CustomEvent(EASY_STAGE_EVENT, { detail: { mode: null, stage: 1 } })); };
  }, [stage]);
  const submitFlag = async () => {
    if (!flag.trim()) { setFlagStatus("No flag to submit yet. Clear stop 5 first."); return; }
    try {
      const r = await fetch("/api/submit-flag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challengeId: "final", flag }) });
      const j = await r.json();
      if (j.correct) { setWon(true); try { localStorage.setItem("muneeb-ctf-won-easy", "1"); } catch {} setFlagStatus("Correct. You found the one flag."); }
      else setFlagStatus("Not that flag.");
    } catch { setBackendDown(true); }
  };
  if (won) return <div><p><strong>You found the one flag. Conductor status unlocked.</strong></p><p><a className="btn small" href={`mailto:${EMAIL}`}>Email Muneeb</a> <button className="btn small secondary" onClick={resetCtf}>Play again</button> <button className="btn small secondary" onClick={onSwitch}>Switch mode</button></p></div>;
  const dots = "●".repeat(Math.min(stage, 5)) + "○".repeat(Math.max(0, 5 - Math.min(stage, 5)));
  const clue = (title: string, riddle: string, hint: string, station: string, btn: string) => (
    <article className="card ctf-card"><h3>{title}</h3><p>{riddle}</p>
      <button className="btn small secondary" onClick={() => setNudge((v) => !v)}>{nudge ? "Hide the nudge" : "Need a nudge?"}</button>
      {nudge && <><p className="demo-note">{hint}</p><button className="btn small" onClick={() => goToStation(station)}>{btn}</button></>}
      {note && <p className="demo-note">{note}</p>}</article>
  );
  return (
    <div>
      <p>{dots} Stop {Math.min(stage, 5)} of 5 · Easy mode, no DevTools needed <button className="btn small secondary" onClick={onSwitch}>Switch mode</button> <button className="btn small secondary" onClick={resetCtf}>Reset CTF</button></p>
      {backendDown && <p className="status bad">Backend not reachable right now. Try again in a moment.</p>}
      {stage === 1 && clue("Stop 1: Peek", "The conductor lost a ticket and left a note somewhere on the map. It is pinned to the station where all three lines meet.", "Go to Muneeb Central and read the conductor's note.", "muneeb-central", "Go to Muneeb Central")}
      {stage === 2 && clue("Stop 2: Shell", "The shell is keeping a lost ticket. One file in there does not belong.", "Head to the Custom Unix Shell. Run ls, spot the file that doesn't belong, then cat ticket-1.txt. The stub pops up right in the shell.", "unix-shell", "Go to the Shell")}
      {stage === 3 && clue("Stop 3: Painting", "The classifier knows which painting is warmest. Pick it, and the stub will show up.", "Go to the Painting Classifier and pick the warmest painting. The stub appears under the result.", "painting-classifier", "Go to the Classifier")}
      {stage === 4 && clue("Stop 4: Radar", "The radar got quieter. One number dropped.", "Open the Radar station and read its metrics. One number dropped. Type just that number into the little box on that station.", "radar", "Go to Radar")}
      {stage === 5 && clue("Stop 5: Lost & Found", "Someone lost something on campus. CampusClaims knows what it was.", "Open CampusClaims. Someone lost something on campus. Type what it was into the box on that station. Hint: it has straps and you carry it on your back.", "campusclaims", "Go to CampusClaims")}
      {stage >= 6 && (
        <article className="card ctf-card"><h3>The one flag</h3><p>Here it is. No hunting in Network needed:</p>
          <p><code>{flag || "…"}</code></p>
          <button className="btn small" onClick={submitFlag}>Submit the flag</button>
          {flagStatus && <p className={`status ${flagStatus.startsWith("Correct") ? "ok" : "bad"}`}>{flagStatus}</p>}</article>
      )}
      {Object.keys(found).length > 0 && <p className="muted">Stubs saved: {Object.values(found).join(" · ")}</p>}
    </div>
  );
}

// --- Easy clue boxes that live on the stations themselves, not in the CTF panel.
// They only appear in Easy mode, at the right stop, on the right station.
export function EasyStationClue({ stationId, mission }: { stationId: string; mission: { mode: string | null; stage: number } }) {
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  if (mission.mode !== "easy") return null;
  if (mission.stage === 1 && stationId === "muneeb-central") {
    return (<div className="demo"><p><strong>Conductor&apos;s note</strong></p><p className="demo-note">Pinned here by the conductor: “I lost a ticket. First stop: where commands live, the shell.”</p><button className="btn small" onClick={() => window.dispatchEvent(new Event(EASY_PEEK_EVENT))}>Found the note. Save my stop</button></div>);
  }
  if (mission.stage === 4 && stationId === "radar") {
    const check = async () => {
      const v = input.trim().replace(/%/g, "");
      try {
        const r = await fetch("/api/radar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: v }) });
        const j = await r.json();
        if (j.correct && j.code) { setMsg(`Ticket stub: ${j.code}. Saved!`); emitEasyCode(3, j.code); }
        else setMsg(j.hint || "Not that number. Read the metrics on this station.");
      } catch { setMsg("Backend not reachable right now. Try again in a moment."); }
    };
    return (<div className="demo"><p><strong>Lost ticket: Radar</strong></p><p className="demo-note">One number on this station dropped. Type just the number and the stub shows up.</p><input aria-label="Radar number" className="ctf-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="45" /><button className="btn small" onClick={check}>Check it</button>{msg && <p className="demo-note">{msg}</p>}</div>);
  }
  if (mission.stage === 5 && stationId === "campusclaims") {
    const check = async () => {
      const v = input.trim().toLowerCase().replace(/^(a|an|the)\s+/, "").replace(/s$/, "");
      try {
        const r = await fetch("/api/lost-found", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item: v }) });
        const j = await r.json();
        if (j.correct && j.code) { setMsg(`Ticket stub: ${j.code}. Saved!`); emitEasyCode(4, j.code); }
        else setMsg(j.hint || "Not that one. What did CampusClaims help find?");
      } catch { setMsg("Backend not reachable right now. Try again in a moment."); }
    };
    return (<div className="demo"><p><strong>Lost ticket: CampusClaims</strong></p><p className="demo-note">Someone lost something on campus. Type what it was.</p><input aria-label="Lost item" className="ctf-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="…" /><button className="btn small" onClick={check}>Check it</button>{msg && <p className="demo-note">{msg}</p>}</div>);
  }
  return null;
}

export function CtfPanel() {
  const [mode, setMode] = useState<"easy" | "hard" | null>(() => {
    try { const m = localStorage.getItem("muneeb-ctf-mode"); return m === "easy" || m === "hard" ? m : null; } catch { return null; }
  });
  const choose = (m: "easy" | "hard") => { setMode(m); try { localStorage.setItem("muneeb-ctf-mode", m); } catch {} };
  const clearMode = () => { setMode(null); try { localStorage.removeItem("muneeb-ctf-mode"); } catch {} };
  if (mode === "easy") return <EasyPanel onSwitch={clearMode} />;
  if (mode === "hard") return <div><p><button className="btn small secondary" onClick={clearMode}>Switch mode</button></p><HardPanel onSwitch={clearMode} /></div>;
  return (
    <div>
      <p><strong>One flag. Five stops. Pick your ride.</strong></p>
      <div className="ctf-grid">
        <article className="card ctf-card"><h3>Easy, for everyone</h3><p>No DevTools, no Network tab. You&apos;ll hop around the site. One obvious thing at each stop, and the stub shows up where you found it. Still the same chain, still one flag.</p><button className="btn small" onClick={() => choose("easy")}>Play easy</button></article>
        <article className="card ctf-card"><h3>Hard, the real thing</h3><p>Inspect element, Network tab, response headers. Hints are short riddles, codes are hidden in POST responses. For people who like to dig.</p><button className="btn small" onClick={() => choose("hard")}>Play hard</button></article>
      </div>
    </div>
  );
}
