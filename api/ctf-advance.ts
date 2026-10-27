import { isCorrectCode, getFlagOrDev, getFlag, rateLimited, getIp, json } from "./_flags.js";
// POST /api/ctf/advance { stage: 1|2|3|4, code }
// Validates a stage code word server-side (SHA-256). On stage 4 success,
// returns the ONE final flag in the JSON body — check Network, it is not
// printed on the page. Submit that flag to /api/submit-flag.
export default async function handler(req: any, res: any) {
  try {
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });
  if (rateLimited(getIp(req))) return json(res, 429, { error: "Too many attempts — wait a minute." });
  const stage = Number(req.body?.stage);
  const code = String(req.body?.code || "");
  if (![1, 2, 3, 4].includes(stage) || !code) return json(res, 400, { error: "stage (1-4) and code are required" });
  if (!isCorrectCode(stage, code)) return json(res, 200, { correct: false, message: "Not that code. Check the hint for this stop." });
  if (stage === 4) {
    return json(res, 200, { correct: true, nextStage: 5, message: "Last stop cleared.", flag: getFlagOrDev("final") });
  }
  return json(res, 200, { correct: true, nextStage: stage + 1, message: `Stop ${stage} cleared — on to stop ${stage + 1}.` });
  } catch (e) {
    console.error("ctf-advance failed", e);
    if (!getFlag("final")) return json(res, 500, { error: "CTF is not configured — set FLAG_FINAL on Vercel." });
    return json(res, 500, { error: "Something went wrong — try again." });
  }
}
