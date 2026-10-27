import { getCode, json } from "./_flags.js";
// POST /api/radar { code } — code is the radar metric number, e.g. "45".
// Returns the stage-3 code word in the body. Check Network.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });
  const code = String(req.body?.code || "").trim();
  if (code === "45" || code === "-45") {
    return json(res, 200, { correct: true, code: getCode(3), note: "SEV1/SEV2 incidents down 45% — that was the code." });
  }
  return json(res, 200, { correct: false, hint: "Look at the Radar station metrics. What number dropped?" });
}
