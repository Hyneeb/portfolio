import { getCode, json } from "./_flags.js";
// POST /api/lost-found { item }. item must be "backpack".
// Returns the stage-4 code word in the body. Check Network.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });
  const item = String(req.body?.item || "").trim().toLowerCase().replace(/^(a|an|the)\s+/, "").replace(/s$/, "");
  if (item === "backpack") {
    const next = getCode(4);
    if (!next) return json(res, 500, { error: "CTF is not configured. set CTF_CODE_4 on Vercel." });
    return json(res, 200, { correct: true, code: next, note: "Found it. 72% recovery rate, after all." });
  }
  return json(res, 200, { correct: false, hint: "What did CampusClaims help students find? Check the station." });
}
