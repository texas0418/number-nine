// src/engine/scrollLock.ts
// A gate with a live drag (the trace) must be able to FREEZE the chapter
// scroll — on iOS the ScrollView wins a mostly-vertical pan no matter how
// firmly the responder refuses termination (B4 device QA: the tag-strip
// drag scrolled the page instead). One widget holds the lock at a time.

type Listener = (locked: boolean) => void;

let listener: Listener | null = null;

/** ChapterView registers here; returns an unsubscribe. */
export function onScrollLock(l: Listener): () => void {
  listener = l;
  return () => {
    if (listener === l) listener = null;
  };
}

/** Widgets call this on gesture grant (true) and release/terminate (false). */
export function setScrollLock(locked: boolean): void {
  listener?.(locked);
}
