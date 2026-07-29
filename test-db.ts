// test-db.ts — runs the real schema/SQL from dbCore.ts against node:sqlite.
// Requires Node 22+ (node:sqlite). Run with: npx tsx test-db.ts
import { DatabaseSync } from 'node:sqlite';
import {
  ALL_PROGRESS_SQL,
  ALL_SOLVE_DAYS_SQL,
  ChapterProgressRow,
  COUNT_SOLVES_SQL,
  DELETE_KV_SQL,
  ENABLE_FK_SQL,
  GET_KV_SQL,
  GET_PROGRESS_SQL,
  GET_SOLVE_SQL,
  INSERT_SOLVE_SQL,
  MIGRATIONS,
  RESET_PROGRESS_SQL,
  SET_KV_SQL,
  TARGET_DB_VERSION,
  UPSERT_PROGRESS_SQL,
  progressToParams,
  rowToProgress,
} from './src/dbCore';

let failures = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    console.log(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    failures++;
  } else console.log(`ok   ${name}`);
};

const db = new DatabaseSync(':memory:');
db.exec(ENABLE_FK_SQL);

function migrate(): void {
  let v = (db.prepare('PRAGMA user_version').get() as { user_version: number })
    .user_version;
  while (v < MIGRATIONS.length) {
    for (const sql of MIGRATIONS[v]) db.exec(sql);
    v++;
    db.exec(`PRAGMA user_version = ${v}`);
  }
}

migrate();
eq('migrates to target version',
  (db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version,
  TARGET_DB_VERSION);

// --- chapter progress ----------------------------------------------------
db.prepare(UPSERT_PROGRESS_SQL).run(
  ...progressToParams({ chapterId: 1, blockIndex: 5, completedMs: null }),
);
let row = db.prepare(GET_PROGRESS_SQL).get(1) as unknown as ChapterProgressRow;
eq('progress round-trips', rowToProgress(row), {
  chapterId: 1,
  blockIndex: 5,
  completedMs: null,
});

// Upsert keeps the furthest block and the first completion.
db.prepare(UPSERT_PROGRESS_SQL).run(
  ...progressToParams({ chapterId: 1, blockIndex: 3, completedMs: 111 }),
);
row = db.prepare(GET_PROGRESS_SQL).get(1) as unknown as ChapterProgressRow;
eq('upsert never regresses block index', row.block_index, 5);
eq('upsert records completion', row.completed_ms, 111);
db.prepare(UPSERT_PROGRESS_SQL).run(
  ...progressToParams({ chapterId: 1, blockIndex: 9, completedMs: 999 }),
);
row = db.prepare(GET_PROGRESS_SQL).get(1) as unknown as ChapterProgressRow;
eq('upsert advances block index', row.block_index, 9);
eq('upsert keeps first completion', row.completed_ms, 111);

db.prepare(UPSERT_PROGRESS_SQL).run(
  ...progressToParams({ chapterId: 2, blockIndex: 1, completedMs: null }),
);
eq('all-progress lists in order',
  (db.prepare(ALL_PROGRESS_SQL).all() as unknown as ChapterProgressRow[]).map(
    (r) => r.chapter_id,
  ),
  [1, 2]);

db.prepare(RESET_PROGRESS_SQL).run();
eq('reset clears progress', db.prepare(ALL_PROGRESS_SQL).all().length, 0);

// --- daily solves --------------------------------------------------------
db.prepare(INSERT_SOLVE_SQL).run('2026-07-24', 1000);
db.prepare(INSERT_SOLVE_SQL).run('2026-07-25', 2000);
db.prepare(INSERT_SOLVE_SQL).run('2026-07-25', 3000); // replay attempt
eq('solve insert is idempotent',
  (db.prepare(COUNT_SOLVES_SQL).get() as { n: number }).n, 2);
eq('first solve time wins',
  (db.prepare(GET_SOLVE_SQL).get('2026-07-25') as { solved_ms: number }).solved_ms,
  2000);
eq('solved days list in order',
  (db.prepare(ALL_SOLVE_DAYS_SQL).all() as { day_key: string }[]).map((r) => r.day_key),
  ['2026-07-24', '2026-07-25']);

// ------------------------------------------------------------------- kv
db.prepare(SET_KV_SQL).run('daily-guesses:2026-07-27', '{"3":"E"}');
db.prepare(SET_KV_SQL).run('daily-guesses:2026-07-27', '{"3":"E","7":"T"}');
eq('kv upserts',
  (db.prepare(GET_KV_SQL).get('daily-guesses:2026-07-27') as { v: string }).v,
  '{"3":"E","7":"T"}');
db.prepare(DELETE_KV_SQL).run('daily-guesses:2026-07-27');
eq('kv deletes', db.prepare(GET_KV_SQL).get('daily-guesses:2026-07-27'), undefined);

if (failures) {
  console.log(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nall db tests passed');
