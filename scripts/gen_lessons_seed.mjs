// Generates a SQL seed for public.lessons from the app's source of truth
// (src/data/lessons.ts). Run: node scripts/gen_lessons_seed.mjs > <out>.sql
//
// We transpile the TS data module on the fly with esbuild (already a dep via
// vite) by stripping types is overkill; instead we read and eval the exported
// `lessons` array through a tiny dynamic import of a transpiled copy.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Bundle just the data module to plain JS in-memory, then import it.
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
const lessons = mod.lessons;

const sqlStr = (v) => (v === undefined || v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const sqlInt = (v) => (v === undefined || v === null ? "NULL" : String(v));

const rows = lessons.map((l) => {
  // Quizzes use `question` instead of `description`; description is NOT NULL.
  const description = l.description ?? l.question ?? l.title;
  const reflection = l.reflection ?? null;
  return `  (${sqlStr(l.id)}, ${sqlInt(l.levelId)}, ${sqlInt(l.order)}, ${sqlStr(l.title)}, ${sqlStr(description)}, ${sqlStr(l.videoUrl)}, ${sqlStr(l.bibleVerse)}, ${sqlStr(l.bibleRef)}, ${sqlStr(reflection)}, ${sqlInt(l.xp)}, ${sqlStr(l.type)})`;
});

const header = `-- AUTO-GENERATED from src/data/lessons.ts by scripts/gen_lessons_seed.mjs
-- Seeds public.lessons. Required because completed_lessons.lesson_id has a
-- foreign key to lessons(id); without these rows, completing a lesson fails
-- with 23503 (completed_lessons_lesson_id_fkey) and progress never persists.
-- Idempotent via ON CONFLICT.
INSERT INTO public.lessons
  (id, level_id, sort_order, title, description, video_url, bible_verse, bible_ref, reflection_question, xp, type)
VALUES`;

const footer = `ON CONFLICT (id) DO UPDATE SET
  level_id            = EXCLUDED.level_id,
  sort_order          = EXCLUDED.sort_order,
  title               = EXCLUDED.title,
  description         = EXCLUDED.description,
  video_url           = EXCLUDED.video_url,
  bible_verse         = EXCLUDED.bible_verse,
  bible_ref           = EXCLUDED.bible_ref,
  reflection_question = EXCLUDED.reflection_question,
  xp                  = EXCLUDED.xp,
  type                = EXCLUDED.type;`;

process.stdout.write(`${header}\n${rows.join(",\n")}\n${footer}\n`);
