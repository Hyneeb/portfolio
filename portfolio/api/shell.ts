import { getCode, json } from "./_flags";
// POST /api/shell { command }
// "cat ticket-1.txt" returns the stage-1 code word in the JSON body.
// The frontend shell does NOT print it — open DevTools > Network to see it.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return json(res, 405, { error: "POST only" });
  const command = String(req.body?.command || "").trim().toLowerCase();
  if (command === "cat ticket-1.txt" || command === "cat flag.txt" || command === "flag") {
    return json(res, 200, { output: "Ticket found. Check the Network response, not the terminal.", code: getCode(1) });
  }
  return json(res, 200, { output: "No ticket here. Try: ls, then cat ticket-1.txt", hint: "The shell knows a secret file." });
}
