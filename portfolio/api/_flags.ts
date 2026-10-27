// CTF backend only. Flags live ONLY in env vars, never in frontend code.
// On Vercel: set FLAG_FINAL and CTF_CODE_1..4 — exactly the five vars that
// scripts/generate-flags.mjs prints — in Project Settings > Environment
// Variables. Do NOT commit real flags. Local dev: copy .env.example to .env,
// or run scripts/generate-flags.mjs to generate the five values.
import { createHash } from "node:crypto";

export type ChallengeId = "final";

export const CHALLENGES: Record<ChallengeId, { title: string; hint: string }> = {
  final: { title: "The One Flag", hint: "One flag. You know where to look." },
};

export function hashFlag(flag: string): string {
  return createHash("sha256").update(flag.trim()).digest("hex");
}

// Stage code words — one per stop in the chain. Backend only, never in the frontend.
// Override with CTF_CODE_1..4 env vars on Vercel. Dev defaults are in code
// only so local dev works; they are NOT flags, and the final flag is still env-only.
export function getCode(stage: number): string {
  const env = { 1: "CTF_CODE_1", 2: "CTF_CODE_2", 3: "CTF_CODE_3", 4: "CTF_CODE_4" } as Record<number, string>;
  const dev = { 1: "all-aboard", 2: "warm-sunset", 3: "forty-five", 4: "found-it" } as Record<number, string>;
  return process.env[env[stage]] || dev[stage] || "";
}
export function isCorrectCode(stage: number, code: string): boolean {
  return hashFlag(code.toLowerCase()) === hashFlag(getCode(stage).toLowerCase());
}

export function getFlag(id: ChallengeId): string | null {
  const env: Record<ChallengeId, string> = {
    final: "FLAG_FINAL",
  };
  return process.env[env[id]] || null;
}

// Dev-only fallback so `npm run server` works locally without env vars.
// In production (Vercel) this fallback is disabled — missing env = 500, not a leaked flag.
export function getFlagOrDev(id: ChallengeId): string {
  const v = getFlag(id);
  if (v) return v;
  if (process.env.NODE_ENV === "production") throw new Error(`Missing env var for ${id}`);
  return `FLAG{dev_${id}_change_me_before_deploy}`;
}

export function isCorrect(id: ChallengeId, submitted: string): boolean {
  try {
    return hashFlag(submitted) === hashFlag(getFlagOrDev(id));
  } catch {
    return false;
  }
}

// Simple in-memory rate limit: 20 attempts / IP / minute. Vercel functions are
// stateless, so this is per-instance only — good enough for a portfolio CTF.
const attempts = new Map<string, { count: number; reset: number }>();
export function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.reset) { attempts.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  rec.count += 1;
  return rec.count > 20;
}

export function getIp(req: any): string {
  return req?.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req?.socket?.remoteAddress || "unknown";
}

export function asciiHeader(s: string): string { return s.replace(/[^\x20-\x7E]/g, "-"); }

export function json(res: any, status: number, body: unknown, headers: Record<string, string> = {}) {
  res.status(status);
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, asciiHeader(v));
  res.setHeader("Content-Type", "application/json");
  res.json(body);
}
