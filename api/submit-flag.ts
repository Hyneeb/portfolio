import { CHALLENGES, isCorrect, rateLimited, getIp, json, asciiHeader, type ChallengeId } from "./_flags.js";

// POST /api/submit-flag  { challengeId, flag }
// Validates server-side via SHA-256. Never returns a flag. Hints are in the response.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });
  if (rateLimited(getIp(req))) return json(res, 429, { error: "Too many attempts. wait a minute." });
  const { challengeId, flag } = req.body || {};
  if (!challengeId || !CHALLENGES[challengeId as ChallengeId] || typeof flag !== "string") {
    return json(res, 400, { error: "challengeId and flag are required" });
  }
  const ok = isCorrect(challengeId as ChallengeId, flag);
  res.setHeader("X-CTF-Hint", asciiHeader(CHALLENGES[challengeId as ChallengeId].hint));
  return json(res, 200, {
    challengeId,
    correct: ok,
    message: ok ? "Correct. you found the one flag." : "Not that one. Check the hint and try again.",
    hint: CHALLENGES[challengeId as ChallengeId].hint,
  });
}
