// Local CTF backend only — NOT the portfolio itself. The portfolio is static.
// Run: npm run server   (port 3001, Vite proxies /api to it in dev)
// The final flag comes ONLY from FLAG_FINAL; stage codes from CTF_CODE_1..4.
// If none are set, dev flags are used and printed to THIS console only —
// never to the browser.
// Set real flags on Vercel: Project Settings > Environment Variables.
import http from "node:http";
import { createHash } from "node:crypto";
import fs from "node:fs";

const PORT = 3001;
function loadEnv() {
  try {
    for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {}
}
loadEnv();
// One final flag only (env). Stage code words are backend-only, env-overridable.
const FINAL_FLAG = process.env.FLAG_FINAL || "FLAG{dev_final_change_me}";
const CODES = {
  1: process.env.CTF_CODE_1 || "all-aboard",
  2: process.env.CTF_CODE_2 || "warm-sunset",
  3: process.env.CTF_CODE_3 || "forty-five",
  4: process.env.CTF_CODE_4 || "found-it",
};
const HINTS = {
  0: "Psst — peek behind the curtain.",
  1: "The shell keeps a lost ticket.",
  2: "Warmest wins.",
  3: "The radar got quieter.",
  4: "Someone lost their bag on campus.",
  5: "One flag. You know where to look.",
};
const hash = (s) => createHash("sha256").update(String(s).trim()).digest("hex");
const attempts = new Map();
function rateLimited(ip) {
  const now = Date.now(); const r = attempts.get(ip);
  if (!r || now > r.reset) { attempts.set(ip, { count: 1, reset: now + 60000 }); return false; }
  r.count++; return r.count > 20;
}
function ascii(s){ return String(s).replace(/[^\x20-\x7E]/g, "-"); }
function send(res, status, obj, headers = {}) {
  const safe = {}; for (const [k,v] of Object.entries(headers)) safe[k]=ascii(v);
  res.writeHead(status, { "Content-Type": "application/json", ...safe });
  res.end(JSON.stringify(obj));
}
function body(req) {
  return new Promise((resolve) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch { resolve({}); } }); });
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const ip = req.socket.remoteAddress || "unknown";
  if (url.pathname === "/api/health") return send(res, 200, { ok: true, ctf: "backend only" });
  if (url.pathname === "/api/hint") {
    const stage = Number(url.searchParams.get("stage") || 0);
    const hint = HINTS[stage] || HINTS[0];
    return send(res, 200, { stage, hint }, { "X-CTF-Hint": hint });
  }
  if (req.method !== "POST") return send(res, 405, { error: "POST only" });
  if (rateLimited(ip)) return send(res, 429, { error: "Too many attempts" });
  const b = await body(req);
  if (url.pathname === "/api/submit-flag") {
    const ok = hash(b.flag || "") === hash(FINAL_FLAG);
    return send(res, 200, { challengeId: "final", correct: !!ok, message: ok ? "Correct — you found the one flag. Conductor status unlocked." : "Not that flag.", hint: HINTS[5] }, { "X-CTF-Hint": HINTS[5] });
  }
  if (url.pathname === "/api/ctf/advance") {
    const stage = Number(b.stage);
    const ok = [1,2,3,4].includes(stage) && hash(String(b.code||"").toLowerCase()) === hash(CODES[stage].toLowerCase());
    if (!ok) return send(res, 200, { correct: false, message: "Not that code word. Check the hint for this stop." });
    if (stage === 4) return send(res, 200, { correct: true, nextStage: 5, message: "Last stop cleared.", flag: FINAL_FLAG });
    return send(res, 200, { correct: true, nextStage: stage + 1, message: "Stop " + stage + " cleared — on to stop " + (stage + 1) + "." });
  }
  if (url.pathname === "/api/shell") {
    const cmd = String(b.command || "").trim().toLowerCase();
    if (cmd === "cat ticket-1.txt" || cmd === "cat flag.txt" || cmd === "flag") return send(res, 200, { output: "Ticket found. Check the Network response, not the terminal.", code: CODES[1] });
    return send(res, 200, { output: "No ticket here. Try: ls, then cat ticket-1.txt" });
  }
  if (url.pathname === "/api/painting-predict") {
    if (b.paintingId === "sunset") return send(res, 200, { paintingId: b.paintingId, prediction: "warm, high-contrast landscapes" }, { "X-CTF-Code": CODES[2], "X-CTF-Hint": "The code was in the response headers." });
    return send(res, 200, { paintingId: b.paintingId, prediction: "not the warmest one" });
  }
  if (url.pathname === "/api/radar") {
    if (String(b.code).trim() === "45" || String(b.code).trim() === "-45") return send(res, 200, { correct: true, code: CODES[3] });
    return send(res, 200, { correct: false, hint: "Look at the Radar station metrics." });
  }
  if (url.pathname === "/api/lost-found") {
    if (String(b.item || "").trim().toLowerCase() === "backpack") return send(res, 200, { correct: true, code: CODES[4] });
    return send(res, 200, { correct: false, hint: "What did CampusClaims help students find?" });
  }
  return send(res, 404, { error: "Unknown /api route" });
});
server.listen(PORT, () => {
  console.log(`CTF backend only — http://localhost:${PORT}/api/health`);
  console.log("Dev flags are in this console only, never in the frontend. Change them via FLAG_* env vars before deploying.");
  if (!process.env.FLAG_FINAL) console.log("Using dev flags — set FLAG_FINAL and CTF_CODE_1..4 in .env for real flags.");
});
