/**
 * Shared input styling to match login form inputs (no border, bg-muted, focus ring only).
 */
export const formInputClassName =
  "h-12 rounded-lg bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

/** Wrapper for Alan adı (multi-line). Matches other inputs: base Input uses dark:bg-input/30 in dark mode. */
export const formInputWrapperClassName =
  "flex h-12 items-center gap-0 rounded-lg border-0 bg-muted dark:bg-input/30 focus-within:ring-2 focus-within:ring-ring overflow-hidden";

/** Textarea: same as login form inputs (no border, bg-muted). */
export const formTextareaClassName =
  "rounded-lg border-0 bg-muted text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring min-h-16";
