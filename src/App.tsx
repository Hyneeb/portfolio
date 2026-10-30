import { useEffect, useState } from "react";
import "./index.css";
import { STATIONS, LINES, TOUR_ORDER, SKILLS, type Station, type LineId } from "./data/stations";
import { TrainIcon, StationIcon } from "./components/icons";
import { ShellDemo, PaintingDemo, TypingDemo, PaintCanvas } from "./components/demos";
import { CtfPanel, EasyStationClue } from "./components/ctf";
import { EASY_STAGE_EVENT, EASY_GOTO_EVENT } from "./lib/ctf-bridge";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL } from "./lib/site";

const ROUTES: Record<string, { label: string; blurb: string; first: string; line: LineId | "all" }> = {
  systems: { label: "Backend / Systems", blurb: "Unix Shell > Radar", first: "unix-shell", line: "systems" },
  ai: { label: "AI / ML", blurb: "TypeTyme > PaintApp > Live AI > Painting Classifier", first: "typetyme", line: "intelligence" },
  product: { label: "Frontend / Product", blurb: "CampusClaims > Investi > Bellwoods > SportsDeck", first: "campusclaims", line: "product" },
  unsure: { label: "Best of everything", blurb: "UofT > CampusClaims > Unix Shell > Radar > Hire Me", first: "uoft", line: "all" },
};

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(() => {
    const h = window.location.hash.replace("#station/", "");
    return STATIONS.some((s) => s.id === h) ? h : "radar";
  });
  const [filter, setFilter] = useState<string>("all");
  const [route, setRoute] = useState<string | null>(null);
  const [touring, setTouring] = useState(false);
  const [tourDone, setTourDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [easyMission, setEasyMission] = useState<{ mode: string | null; stage: number }>(() => {
    try { return { mode: localStorage.getItem("muneeb-ctf-mode") === "easy" ? "easy" : null, stage: Number(localStorage.getItem("muneeb-ctf-stage-easy") || 1) }; }
    catch { return { mode: null, stage: 1 }; }
  });
  useEffect(() => {
    const onStage = (e: Event) => { const d = (e as CustomEvent).detail; setEasyMission({ mode: d?.mode ?? null, stage: d?.stage ?? 1 }); };
    const onGoto = (e: Event) => { const id = (e as CustomEvent).detail?.id; if (typeof id === "string" && STATIONS.some((st) => st.id === id)) { openStation(id); document.getElementById("map")?.scrollIntoView({ behavior: "smooth" }); } };
    const onHash = () => { const h = window.location.hash.replace("#station/", ""); if (STATIONS.some((st) => st.id === h)) setSelectedId(h); };
    window.addEventListener(EASY_STAGE_EVENT, onStage);
    window.addEventListener(EASY_GOTO_EVENT, onGoto);
    window.addEventListener("hashchange", onHash);
    return () => { window.removeEventListener(EASY_STAGE_EVENT, onStage); window.removeEventListener(EASY_GOTO_EVENT, onGoto); window.removeEventListener("hashchange", onHash); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const resetView = () => { setFilter("all"); setRoute(null); setTouring(false); setTourDone(false); setSelectedId("radar"); window.history.replaceState(null, "", window.location.pathname); };
  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#station/${selectedId}`;
    let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; }
    catch {
      const ta = document.createElement("textarea"); ta.value = url; document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      ta.remove();
    }
    setCopied(ok); setCopyFailed(!ok);
    window.setTimeout(() => { setCopied(false); setCopyFailed(false); }, 3000);
  };
  const selected: Station = STATIONS.find((s) => s.id === selectedId) || STATIONS[0];
  // Which lines are lit right now? A line filter lights that line only.
  // Otherwise the selected station's lines are lit, the rest are muted —
  // never fully off, so the map doesn't feel broken when you click around.
  const isLineFilter = ["systems", "intelligence", "product", "journey"].includes(filter);
  const litLines: LineId[] = isLineFilter ? [filter as LineId] : selected.lineIds;
  const lineOpacity = (id: LineId) => (litLines.includes(id) ? 1 : isLineFilter ? 0.35 : 0.45);
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
    window.history.pushState(null, "", `#station/${id}`);
    if (window.innerWidth < 1024) document.getElementById("station-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const openStationFromMap = (id: string) => { setRoute(null); openStation(id); };

  // Next stop follows the tour order, not the raw data order — that was confusing.
  const nextStation = () => {
    const i = TOUR_ORDER.indexOf(selectedId);
    const nextId = i >= 0 ? TOUR_ORDER[(i + 1) % TOUR_ORDER.length] : TOUR_ORDER[0];
    openStation(nextId);
  };

  const startTour = () => { setTouring(true); setTourDone(false); openStation(TOUR_ORDER[0]); };
  const tourNext = () => {
    const current = TOUR_ORDER.indexOf(selectedId);
    const n = current < 0 ? 0 : current + 1;
    if (n >= TOUR_ORDER.length) { setTouring(false); setTourDone(true); return; }
    openStation(TOUR_ORDER[n]);
  };
  const tourPos = TOUR_ORDER.indexOf(selectedId) + 1;
  const tourLabel = tourPos > 0 ? `Next tour stop (${tourPos}/${TOUR_ORDER.length})` : "Next tour stop";

  // Newest first, by tour order — not by sorting date strings, which is wrong.
  const experiences = STATIONS.filter((s) => s.type === "experience").sort((a, b) => TOUR_ORDER.indexOf(b.id) - TOUR_ORDER.indexOf(a.id));
  const projects = STATIONS.filter((s) => s.type === "project").sort((a, b) => TOUR_ORDER.indexOf(b.id) - TOUR_ORDER.indexOf(a.id));

  return (
    <>
      <a className="skip" href="#map">Skip to map</a>
      <a className="skip" href="#list">Skip to list view</a>
      <header className="site">
        <div className="wrap header-in">
          <a className="logo" href="#top"><TrainIcon size={24} /> Muneeb Hyder, The Muneeb Line</a>
          <nav className="main" aria-label="Main">
            <a href="#map">Map</a><a href="#journey">Journey</a><a href="#list">List</a><a href="#ctf">CTF</a><a href="#skills">Skills</a><a href="#contact">Contact</a>
          </nav>
          <a className="btn small" href={RESUME_URL}>Resume PDF</a>
        </div>
      </header>

      <main id="top">
        <section className="hero wrap" aria-labelledby="hero-h">
          <span className="eyebrow">All aboard, Summer 2027</span>
          <h1 id="hero-h">Hi, I&apos;m Muneeb Hyder.</h1>
          <p className="lede">UofT Computer Science student based in Toronto, currently a Software Engineering Intern at the Government of Canada&apos;s National Radar Program, graduating April 2028. I build systems, AI, and products people actually use. This is my career as a transit map. Pick a line and ride.</p>
          <div className="hero-actions">
            <a className="btn" href={RESUME_URL}>Download Resume</a>
            <a className="btn secondary" href="#map">Ride the map</a>
            <a className="btn secondary" href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
          <p className="trust">National Radar Program • Live AI • Bellwoods • Investi • CampusClaims (300+ students) • SportsDeck</p>
          <div className="train-track" aria-hidden="true"><span className="train-emoji"><TrainIcon size={30} /></span></div>
        </section>

        <section className="map-section wrap" id="map" aria-labelledby="map-h">
          <h2 id="map-h">The Muneeb Line: a transit map of my work</h2>
          <p className="muted">Navigate my career like any good transit map! Click a station to open its story. Mind the gap between idea and shipped product.</p>
          <div className="layout">
            <div className="card map-card">
              <div className="legend" aria-label="Map legend. Click a line to highlight it">
                {(Object.keys(LINES) as LineId[]).map((k) => (
                  <button type="button" className="pill" key={k} aria-pressed={filter === k} onClick={() => setFilter(filter === k ? "all" : k)} style={{ cursor: "pointer" }}><span className="dot" style={{ background: LINES[k].color }} />{LINES[k].name}</button>
                ))}
              </div>
              <div className="filters" role="group" aria-label="Filter stations">
                {["all", "systems", "intelligence", "product", "journey", "experience", "projects"].map((f) => (
                  <button key={f} className="filter" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All lines" : f[0].toUpperCase() + f.slice(1)}</button>
                ))}
                <button className="filter" onClick={resetView}>Reset view</button>
              </div>
              <div className="map-wrap">
                <svg className="map" viewBox="0 0 1200 700" role="group" aria-label="Interactive transit map of Muneeb Hyder's career, with Systems, Intelligence and Product lines all meeting at Muneeb Central">
                  <rect x="0" y="668" width="1200" height="32" fill="#A8D8EA" opacity="0.55" />
                  <text x="30" y="690" fontSize="14" fill="#2B2118">Lake Ontario</text>
                  <g aria-hidden="true" stroke="#2B2118" strokeWidth="2" fill="none">
                    <circle cx="70" cy="52" r="18" fill="#F2B749" />
                    <path d="M70 28 v-8 M70 84 v-8 M46 52 h-8 M102 52 h-8" />
                  </g>
                  <g aria-hidden="true" stroke="#2B2118" strokeWidth="2" fill="none">
                    <path d="M1085 110 L1095 40 L1105 110 Z" fill="#fff" />
                    <ellipse cx="1095" cy="88" rx="14" ry="7" fill="#fff" />
                    <rect x="1091" y="110" width="8" height="22" fill="#fff" />
                  </g>
                  <text x="1090" y="150" fontSize="11" fill="#2B2118" textAnchor="middle">CN Tower</text>
                  <rect x="120" y="80" width="1000" height="560" rx="28" fill="none" stroke="#7FB069" strokeWidth="6" strokeDasharray="12 8" opacity={lineOpacity("journey") * 0.75} />
                  <path d="M120,360 H860" stroke="#E85D4A" strokeWidth={lineWidth("systems")} strokeLinecap="round" fill="none" opacity={lineOpacity("systems")} />
                  <path d="M600,120 V610" stroke="#F2B749" strokeWidth={lineWidth("intelligence")} strokeLinecap="round" fill="none" opacity={lineOpacity("intelligence")} />
                  <path d="M220,200 L420,275 L600,360 L800,450 L980,540" stroke="#4A9EB8" strokeWidth={lineWidth("product")} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={lineOpacity("product")} />
                  <g aria-hidden="true" opacity={visible(selected) ? 1 : 0.45}><circle cx={selected.x} cy={selected.y} r="26" fill="none" stroke="#2B2118" strokeWidth="2.5" strokeDasharray="5 4" /></g>
                  {STATIONS.map((s) => {
                    const dim = !visible(s);
                    const color = LINES[s.lineIds[0]].color;
                    const labelAbove = s.y < 200 || s.id === "painting-classifier" || s.id === "hire-me" || s.id === "live-ai";
                    return (
                      <g key={s.id} className="station" role="button" tabIndex={0}
                        aria-label={`${s.name} station, ${LINES[s.lineIds[0]].name}, ${s.type}, ${s.dates}${selectedId === s.id ? ", selected" : ""}`}
                        aria-current={selectedId === s.id ? true : undefined}
                        opacity={dim ? 0.45 : 1}
                        onClick={() => openStationFromMap(s.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openStationFromMap(s.id); } }}>
                        {s.isInterchange && s.id !== "muneeb-central" && <circle className="core" cx={s.x} cy={s.y} r="21" fill="#fff" stroke={color} strokeWidth="4" />}
                        {s.id === "muneeb-central" && <circle className="core" cx={s.x} cy={s.y} r="24" fill="#fff" stroke="#2B2118" strokeWidth="3" />}
                        <circle className="core" cx={s.x} cy={s.y} r={s.id === "muneeb-central" ? 16 : 13} fill={s.id === "muneeb-central" ? "#2B2118" : color} stroke="#fff" strokeWidth="3" />
                        <g transform={`translate(${s.x - 11}, ${labelAbove ? s.y - 42 : s.y + 20})`}>
                          <StationIcon kind={s.icon} size={22} />
                        </g>
                        <text className="station-label" x={s.x} y={labelAbove ? s.y - 48 : s.y + 56} textAnchor="middle">{s.shortName || s.name}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <p className="map-hint">Swipe sideways to explore the map, or jump to the list view below.</p>
              <p className="muted" style={{ marginTop: 10 }}>Tip: use Tab + Enter to open stations with a keyboard. <button className="btn small secondary" onClick={startTour}>Take the guided tour</button> {touring && <button className="btn small" onClick={tourNext}>{tourLabel}</button>} {touring && <button className="btn small secondary" onClick={() => setTouring(false)}>Exit tour</button>} {tourDone && <span>Tour complete. You&apos;ve seen all {TOUR_ORDER.length} stops. <button className="btn small secondary" onClick={startTour}>Ride it again</button></span>}</p>
            </div>

            <aside className="card panel" id="station-panel" aria-live="polite" aria-label="Station details">
              <span className="line-pill" style={{ background: LINES[selected.lineIds[0]].color }}>{LINES[selected.lineIds[0]].name} • {selected.dates}</span>
              <h2 style={{ marginTop: 10 }}><StationIcon kind={selected.icon} size={26} /> {selected.name}</h2>
              <p><strong>{selected.org}{selected.role ? `, ${selected.role}` : ""}</strong></p>
              <p>{selected.oneLiner}</p>
              <ul>{selected.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              {selected.metrics && (
                <div className="metrics" aria-label="Key results">
                  {selected.metrics.map((m) => <div className="ticket" key={m.label}><b>{m.value}</b><span>{m.label}</span></div>)}
                </div>
              )}
              <div className="tags">{selected.tech.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
              <EasyStationClue key={selectedId} stationId={selectedId} mission={easyMission} />
              {selected.demoType === "shell" && <ShellDemo />}
              {selected.demoType === "painting" && <PaintingDemo />}
              {selected.demoType === "typing" && <TypingDemo />}
              {selected.demoType === "paint" && <PaintCanvas />}
              {easyMission.mode === "easy" && <p><a className="btn small secondary" href="#ctf">Back to the CTF ticket. See the next stop ↓</a></p>}
              <div className="panel-actions">
                <a className="btn small" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub profile</a>
                <button className="btn small secondary" onClick={nextStation}>Next station</button>
                <button className="btn small secondary" onClick={copyLink} aria-live="polite">{copied ? "Copied!" : copyFailed ? "Copy failed. Copy the URL from the address bar" : "Copy station link"}</button>
              </div>
            </aside>
          </div>
        </section>

        <section className="section wrap" id="journey" aria-labelledby="journey-h">
          <h2 id="journey-h">Pick your route</h2>
          <p>Pick a ticket. I&apos;ll highlight the right route for you.</p>
          <div className="journey">
            {Object.entries(ROUTES).map(([k, r]) => (
              <button key={k} className="ticket-btn" aria-pressed={route === k} onClick={() => { setRoute(k); setFilter(r.line); openStation(r.first); }}>
                <strong>{r.label}</strong><br /><span className="muted">{r.blurb}</span>
              </button>
            ))}
          </div>
          {route && <p style={{ marginTop: 12 }}>Route: <strong>{ROUTES[route].blurb}</strong>. Starting at {STATIONS.find((s) => s.id === ROUTES[route].first)?.name}.</p>}
        </section>

        <section className="section wrap" id="list" aria-labelledby="list-h">
          <h2 id="list-h">Or view as a list. No map needed</h2>
          <p className="muted">Same content as the map, for phones, screen readers, and anyone in a hurry.</p>
          <div className="filters" role="group" aria-label="Jump to a section of the list">
            <a className="filter" href="#list-education">Education</a>
            <a className="filter" href="#list-about">About</a>
            <a className="filter" href="#list-experience">Experience</a>
            <a className="filter" href="#list-projects">Projects</a>
            <a className="filter" href="#top">Top ↑</a>
          </div>
          <h3 id="list-education">Education</h3>
          <div className="filters"><a className="filter" href="#list-about">Jump to the next section ↓</a></div>
          {STATIONS.filter((s) => s.type === "education").map((s) => (
            <article className="card list-item" key={s.id}>
              <h3><StationIcon kind={s.icon} size={22} /> {s.name}, {s.role}</h3>
              <p><strong>{s.org} • {s.dates}</strong></p>
              <p>{s.oneLiner}</p>
              <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </article>
          ))}
          <h3 id="list-about">About</h3>
          <div className="filters"><a className="filter" href="#list-experience">Jump to the next section ↓</a></div>
          {STATIONS.filter((s) => s.type === "about").map((s) => (
            <article className="card list-item" key={s.id}>
              <h3><StationIcon kind={s.icon} size={22} /> {s.name}, {s.dates}</h3>
              <p>{s.oneLiner}</p>
              <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </article>
          ))}
          <h3 id="list-experience">Experience, newest first</h3>
          <div className="filters"><a className="filter" href="#list-projects">Jump to the next section ↓</a></div>
          {experiences.map((s) => (
            <article className="card list-item" key={s.id}>
              <h3><StationIcon kind={s.icon} size={22} /> {s.name}, {s.role}</h3>
              <p><strong>{s.org} • {s.dates}</strong></p>
              <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              {s.metrics && (<div className="metrics" aria-label="Key results">{s.metrics.map((m) => <div className="ticket" key={m.label}><b>{m.value}</b><span>{m.label}</span></div>)}</div>)}
              <div className="tags">{s.tech.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            </article>
          ))}
          <h3 id="list-projects">Projects, newest first</h3>
          <div className="filters"><a className="filter" href="#ctf">Jump to the next section ↓</a></div>
          {projects.map((s) => (
            <article className="card list-item" key={s.id}>
              <h3><StationIcon kind={s.icon} size={22} /> {s.name}, {s.dates}</h3>
              <p>{s.oneLiner}</p>
              <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              {s.metrics && (<div className="metrics" aria-label="Key results">{s.metrics.map((m) => <div className="ticket" key={m.label}><b>{m.value}</b><span>{m.label}</span></div>)}</div>)}
              <div className="tags">{s.tech.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            </article>
          ))}
          <div className="filters"><a className="filter" href="#list">Back to the top of the list</a><a className="filter" href="#top">Back to the very top ↑</a></div>
        </section>
        <section className="section wrap" id="ctf" aria-labelledby="ctf-h">
          <h2 id="ctf-h">Capture the Flag</h2>
          <p>Capture the flag on either easy or hard mode, visiting my projects along the way! <a className="filter" href="#list">Not into games? Skip to the list view →</a></p>
          <CtfPanel />
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
            <div className="tags">{SKILLS.alsoInProjects.map((s) => <span className="tag" key={s.name}>{s.name} ({s.note})</span>)}</div>
          </div>
        </section>


        <section className="section wrap" id="contact" aria-labelledby="contact-h">
          <h2 id="contact-h">Next stop: your team, Summer 2027</h2>
          <div className="card list-item">
            <p><strong>Open for Software Engineering internships, May–Aug 2027.</strong> Based in Toronto, Canada.</p>
            <div className="panel-actions">
              <a className="btn" href={`mailto:${EMAIL}`}>Email Muneeb</a>
              <a className="btn secondary" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
              <a className="btn secondary" href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="btn secondary" href={RESUME_URL}>Download Resume PDF</a>
            </div>
            <div className="tags" style={{ marginTop: 12 }}>
              <span className="tag">{EMAIL}</span>
              <a className="tag" href="tel:+16477629037">(647) 762-9037</a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <p>Built with React + a lot of TTC inspiration. Not affiliated with the TTC. © 2026–2027 Muneeb Hyder. Map is a diagram, not to scale, like all good transit maps.</p>
          <p><a className="filter" href="#top">Back to top ↑</a></p>
        </div>
      </footer>
    </>
  );
}
