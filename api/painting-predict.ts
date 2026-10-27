import { getCode, json } from "./_flags.js";
// POST /api/painting-predict { paintingId }
// Correct painting ("sunset") returns the stage-2 code in the
// X-CTF-Code response header, not in the body. Check Network > Headers.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });
  const id = String(req.body?.paintingId || "");
  if (id === "sunset") {
    const code = getCode(2);
    if (!code) return json(res, 500, { error: "CTF is not configured — set CTF_CODE_2 on Vercel." });
    res.setHeader("X-CTF-Code", code);
    res.setHeader("X-CTF-Hint", "The code was in the response headers, not the body.");
    return json(res, 200, { paintingId: id, prediction: "warm, high-contrast landscapes", note: "Check the response headers." });
  }
  return json(res, 200, { paintingId: id, prediction: "not the warmest one", hint: "The warmest painting wins." });
}
