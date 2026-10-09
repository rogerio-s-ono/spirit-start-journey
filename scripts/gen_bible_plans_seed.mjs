// Generates a SQL seed for public.bible_plans from src/data/lessons.ts
// (the exported `readingPlans` array). Run:
//   node scripts/gen_bible_plans_seed.mjs > <out>.sql
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const result = await build({
  entryPoints: [resolve(root, "src/data/lessons.ts")],
  bundle: true,
  format: "esm",
  write: false,
  platform: "node",
  logLevel: "silent",
});
const code = result.outputFiles[0].text;
const dataUrl = "data:text/javascript;base64," + Buffer.from(code).toString("base64");
const mod = await import(dataUrl);
const plans = mod.readingPlans;

const sqlStr = (v) => (v === undefined || v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const sqlInt = (v) => (v === undefined || v === null ? "NULL" : String(v));

const rows = plans.map((p) => {
  // Table column is `name`; the frontend object uses `title`.
  const name = p.name ?? p.title;
  return `  (${sqlStr(p.id)}, ${sqlStr(name)}, ${sqlStr(p.description)}, ${sqlInt(p.chapters)}, ${sqlStr(p.icon)})`;
});

const header = `-- AUTO-GENERATED from src/data/lessons.ts (readingPlans) by
-- scripts/gen_bible_plans_seed.mjs.
-- Seeds public.bible_plans. Required because user_reading_progress.plan_id
-- has a foreign key to bible_plans(id); without these rows, starting a
-- reading plan fails with 23503 (user_reading_progress_plan_id_fkey).
-- Idempotent via ON CONFLICT.
INSERT INTO public.bible_plans (id, name, description, chapters, icon)
VALUES`;

const footer = `ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  chapters    = EXCLUDED.chapters,
  icon        = EXCLUDED.icon;`;

process.stdout.write(`${header}\n${rows.join(",\n")}\n${footer}\n`);
