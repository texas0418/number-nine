// src/db.ts
// expo-sqlite wrapper. All SQL and mapping live in dbCore.ts (pure, tested).
// House pattern: lazy singleton, PRAGMA user_version migrations in a
// transaction, integer epoch-ms everywhere.

import * as SQLite from 'expo-sqlite';
import type { ChapterProgress } from './models';
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
  RESET_CHAPTER_SQL,
  RESET_PROGRESS_SQL,
  RESET_STORY_KV_SQL,
  SET_KV_SQL,
  UPSERT_PROGRESS_SQL,
  progressToParams,
  rowToProgress,
} from './dbCore';

const DB_NAME = 'number-nine.db';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
    db.execSync('PRAGMA journal_mode = WAL');
    db.execSync(ENABLE_FK_SQL);
    runMigrations(db);
  }
  return db;
}

function runMigrations(d: SQLite.SQLiteDatabase): void {
  const row = d.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < MIGRATIONS.length) {
    const batch = MIGRATIONS[version];
    d.withTransactionSync(() => {
      for (const sql of batch) d.execSync(sql);
    });
    version++;
    d.execSync(`PRAGMA user_version = ${version}`);
  }
}

// ---------------------------------------------------------------- progress

export function saveProgress(p: ChapterProgress): void {
  getDb().runSync(UPSERT_PROGRESS_SQL, progressToParams(p));
}

export function getProgress(chapterId: number): ChapterProgress | null {
  const row = getDb().getFirstSync<ChapterProgressRow>(GET_PROGRESS_SQL, [
    chapterId,
  ]);
  return row ? rowToProgress(row) : null;
}

export function listProgress(): ChapterProgress[] {
  return getDb().getAllSync<ChapterProgressRow>(ALL_PROGRESS_SQL).map(rowToProgress);
}

export function resetProgress(): void {
  getDb().runSync(RESET_PROGRESS_SQL);
  getDb().runSync(RESET_STORY_KV_SQL);
}

/** Erase ONE broadcast's progress (replay it) without touching the others. */
export function resetChapter(chapterId: number): void {
  getDb().runSync(RESET_CHAPTER_SQL, [chapterId]);
}

// ------------------------------------------------------------ daily solves

export function recordSolve(dayKey: string, solvedMs: number): void {
  getDb().runSync(INSERT_SOLVE_SQL, [dayKey, solvedMs]);
}

export function isDaySolved(dayKey: string): boolean {
  return getDb().getFirstSync(GET_SOLVE_SQL, [dayKey]) != null;
}

export function listSolvedDays(): string[] {
  return getDb()
    .getAllSync<{ day_key: string }>(ALL_SOLVE_DAYS_SQL)
    .map((r) => r.day_key);
}

export function countSolves(): number {
  return getDb().getFirstSync<{ n: number }>(COUNT_SOLVES_SQL)?.n ?? 0;
}

// ------------------------------------------------------------------- kv

export function setKv(key: string, value: string): void {
  getDb().runSync(SET_KV_SQL, [key, value]);
}

export function getKv(key: string): string | null {
  return getDb().getFirstSync<{ v: string }>(GET_KV_SQL, [key])?.v ?? null;
}

export function deleteKv(key: string): void {
  getDb().runSync(DELETE_KV_SQL, [key]);
}
