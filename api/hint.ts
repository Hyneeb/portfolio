import { json, asciiHeader } from "./_flags.js";
// GET /api/hint?stage=1 — short riddles only, never codes or flags.
const HINTS: Record<number, string> = {
  0: "Psst — peek behind the curtain.",
  1: "The shell keeps a lost ticket.",
  2: "Warmest wins.",
  3: "The radar got quieter.",
  4: "Someone lost their bag on campus.",
  5: "One flag. You know where to look.",
};
export default async function handler(req: any, res: any) {
  const stage = Number(req.query?.stage ?? req.query?.challengeId ?? 0);
  const hint = HINTS[stage] || HINTS[0];
  res.setHeader("X-CTF-Hint", asciiHeader(hint));
  return json(res, 200, { stage, hint });
}
