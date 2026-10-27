import { getCode, json } from "./_flags";
// POST /api/lost-found { item } — item must be "backpack".
// Returns the stage-4 code word in the body. Check Network.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });
  const item = String(req.body?.item || "").trim().toLowerCase();
  if (item === "backpack") {
    return json(res, 200, { correct: true, code: getCode(4), note: "Found it — 72% recovery rate, after all." });
  }
  return json(res, 200, { correct: false, hint: "What did CampusClaims help students find? Check the station." });
}
