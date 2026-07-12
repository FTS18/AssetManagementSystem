import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const EXTENSIONS = new Set([".tsx", ".ts", ".css"]);

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === "node_modules" || name === ".next") continue;
    if (statSync(full).isDirectory()) entries.push(...walk(full));
    else if (EXTENSIONS.has(extname(name))) entries.push(full);
  }
  return entries;
}

const files = walk("src");
let totalFixed = 0;

for (const file of files) {
  let src = readFileSync(file, "utf8");
  const original = src;

  // 1. someutil-[var(--name)] → someutil-(--name)   e.g. bg-[var(--surface)] → bg-(--surface)
  src = src.replace(/([\w:.-]+)-\[var\((--[\w-]+)\)\]/g, "$1-($2)");

  // 2. rounded-(--radius-md) → rounded-md
  src = src.replace(/rounded-\(--radius-md\)/g, "rounded-md");

  // 3. rounded-(--radius-sm) → rounded-sm
  src = src.replace(/rounded-\(--radius-sm\)/g, "rounded-sm");

  // 4. z-[NNN] → z-NNN  (arbitrary z-index bracket values)
  src = src.replace(/z-\[(\d+)\]/g, "z-$1");

  // 5. -left-[5px] → left-[-5px]
  src = src.replace(/-left-\[(\d+px)\]/g, "left-[-$1]");

  if (src !== original) {
    writeFileSync(file, src, "utf8");
    console.log("✅ Fixed:", file.replace(process.cwd() + "/", "").replace(/\\/g, "/"));
    totalFixed++;
  }
}

console.log(`\nDone — ${totalFixed} file(s) updated.`);
