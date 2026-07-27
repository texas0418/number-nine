// src/dbCore.ts
// Pure module: SQL schema/migrations and row<->model mapping.
// No expo imports so it can be tested in Node against node:sqlite.

import type { ChapterProgress, DailySolve } from './models';

/** Each entry is the batch of statements that upgrades user_version N-1 -> N.
 *  MIGRATIONS[0] builds version 1. Append only; never edit shipped entries. */
export const MIGRATIONS: string[][] = [
  [
    `CREATE TABLE IF NOT EXISTS chapter_progress (
      chapter_id INTEGER PRIMARY KEY,
      block_index INTEGER NOT NULL DEFAULT 0,
      completed_ms INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS daily_solves (
      day_key TEXT PRIMARY KEY,
      solved_ms INTEGER NOT NULL
    )`,
  ],
  // v2: small kv store (first use: tonight's in-progress cipher guesses, so
  // leaving the screen never loses a half-finished transcription).
  [
    `CREATE TABLE IF NOT EXISTS kv (
      k TEXT PRIMARY KEY,
      v TEXT NOT NULL
    )`,
  ],
];

export const TARGET_DB_VERSION = MIGRATIONS.length;

export const ENABLE_FK_SQL = 'PRAGMA foreign_keys = ON';

export interface ChapterProgressRow {
  chapter_id: number;
  block_index: number;
  completed_ms: number | null;
}

export interface DailySolveRow {
  day_key: string;
  solved_ms: number;
}

export const UPSERT_PROGRESS_SQL = `INSERT INTO chapter_progress
  (chapter_id, block_index, completed_ms) VALUES (?, ?, ?)
  ON CONFLICT(chapter_id) DO UPDATE SET
    block_index = MAX(block_index, excluded.block_index),
    completed_ms = COALESCE(chapter_progress.completed_ms, excluded.completed_ms)`;
export const GET_PROGRESS_SQL =
  'SELECT * FROM chapter_progress WHERE chapter_id = ?';
export const ALL_PROGRESS_SQL =
  'SELECT * FROM chapter_progress ORDER BY chapter_id';
export const RESET_PROGRESS_SQL = 'DELETE FROM chapter_progress';

export const INSERT_SOLVE_SQL =
  'INSERT OR IGNORE INTO daily_solves (day_key, solved_ms) VALUES (?, ?)';
export const ALL_SOLVE_DAYS_SQL =
  'SELECT day_key FROM daily_solves ORDER BY day_key';
export const GET_SOLVE_SQL = 'SELECT * FROM daily_solves WHERE day_key = ?';
export const COUNT_SOLVES_SQL = 'SELECT COUNT(*) AS n FROM daily_solves';

export const rowToProgress = (r: ChapterProgressRow): ChapterProgress => ({
  chapterId: r.chapter_id,
  blockIndex: r.block_index,
  completedMs: r.completed_ms,
});

export const progressToParams = (
  p: ChapterProgress,
): [number, number, number | null] => [p.chapterId, p.blockIndex, p.completedMs];

export const rowToSolve = (r: DailySolveRow): DailySolve => ({
  dayKey: r.day_key,
  solvedMs: r.solved_ms,
});

export const SET_KV_SQL =
  'INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v';
export const GET_KV_SQL = 'SELECT v FROM kv WHERE k = ?';
export const DELETE_KV_SQL = 'DELETE FROM kv WHERE k = ?';
