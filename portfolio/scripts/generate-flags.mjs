// Generate the ONE final flag + stage code words. Run: node scripts/generate-flags.mjs
// Put the values in Vercel env vars. The final flag is validated by SHA-256.
import { randomBytes } from "node:crypto";
console.log(`FLAG_FINAL=FLAG{muneeb_conductor_${randomBytes(4).toString("hex")}}`);
for (const id of [1, 2, 3, 4]) {
  console.log(`CTF_CODE_${id}=${randomBytes(3).toString("hex")}`);
}
