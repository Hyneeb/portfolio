// Local CTF backend only. NOT the portfolio itself. The portfolio is static.
// Run: npm run server   (port 3001, Vite proxies /api to it in dev)
// The final flag comes ONLY from FLAG_FINAL; stage codes from CTF_CODE_1..4.
// If none are set, dev flags are used locally only. never printed, and
// never sent to the browser.
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
  return new Promise((resolve) => { let d = ""; req.on("data", (c) => { d += c; if (d.length > 10000) { d = ""; req.destroy(); resolve({}); } }); req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch { resolve({}); } }); });
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const ip = req.socket.remoteAddress || "unknown";
  if (url.pathname === "/api/health") return send(res, 200, { ok: true, ctf: "backend only" });
  if (req.method !== "POST") return send(res, 405, { error: "POST only" });
  if (rateLimited(ip)) return send(res, 429, { error: "Too many attempts" });
  const b = await body(req);
  if (url.pathname === "/api/submit-flag") {
    if (!b.flag || b.challengeId !== "final") return send(res, 400, { error: "challengeId (final) and flag are required" });
    const ok = hash(b.flag || "") === hash(FINAL_FLAG);
    return send(res, 200, { challengeId: "final", correct: !!ok, message: ok ? "Correct. you found the one flag. Conductor status unlocked." : "Not that flag." });
  }
  if (url.pathname === "/api/ctf-advance" || url.pathname === "/api/ctf/advance") {
    const stage = Number(b.stage);
    const ok = [1,2,3,4].includes(stage) && hash(String(b.code||"").toLowerCase()) === hash(CODES[stage].toLowerCase());
    if (!ok) return send(res, 200, { correct: false, message: "Not that code. Check the hint for this stop." });
    if (stage === 4) return send(res, 200, { correct: true, nextStage: 5, message: "Last stop cleared.", flag: FINAL_FLAG });
    return send(res, 200, { correct: true, nextStage: stage + 1, message: "Stop " + stage + " cleared. On to stop " + (stage + 1) + "." });
  }
  if (url.pathname === "/api/shell") {
    const cmd = String(b.command || "").trim().toLowerCase();
    if (cmd === "cat ticket-1.txt") return send(res, 200, { output: "Ticket found. Check the Network response, not the terminal.", code: CODES[1] });
    return send(res, 200, { output: "No ticket here. Try: ls, then cat ticket-1.txt" });
  }
  if (url.pathname === "/api/painting-predict") {
    if (b.paintingId === "sunset") return send(res, 200, { paintingId: b.paintingId, prediction: "warm, high-contrast landscapes" }, { "X-CTF-Code": CODES[2], "X-CTF-Hint": "The code was in the response headers." });
    return send(res, 200, { paintingId: b.paintingId, prediction: "not the warmest one" });
  }
  if (url.pathname === "/api/radar") {
    const code = String(b.code || "").trim().replace(/%/g, "").replace(/\s+/g, "");
    if (code === "45" || code === "-45") return send(res, 200, { correct: true, code: CODES[3] });
    return send(res, 200, { correct: false, hint: "Look at the Radar station metrics." });
  }
  if (url.pathname === "/api/lost-found") {
    const item = String(b.item || "").trim().toLowerCase().replace(/^(a|an|the)\s+/, "").replace(/s$/, "");
    if (item === "backpack") return send(res, 200, { correct: true, code: CODES[4] });
    return send(res, 200, { correct: false, hint: "What did CampusClaims help students find?" });
  }
  return send(res, 404, { error: "Unknown /api route" });
});
server.listen(PORT, () => {
  console.log(`CTF backend only. http://localhost:${PORT}/api/health`);
  if (!process.env.FLAG_FINAL) console.log("Using dev flags. set FLAG_FINAL and CTF_CODE_1..4 in .env for real flags.");
});
