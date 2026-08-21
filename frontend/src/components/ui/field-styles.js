/**
 * Shared field chrome for Input / Textarea / Select. Kept in a non-component
 * module so those files export components only (satisfies oxlint's
 * `react/only-export-components`, matching the `*-variants.js` convention).
 *
 * Explicit `appearance-none` + border/background because this app skips
 * Tailwind's preflight, so form controls keep their UA styling otherwise.
 */
export const fieldBaseClass = [
  'w-full appearance-none rounded-md border border-border bg-[var(--bg-input)]',
  'px-3.5 py-2.5 text-sm text-foreground',
  'transition-[color,box-shadow,border-color] duration-200 outline-none',
  'placeholder:text-[var(--text-muted)]',
  'hover:border-input',
  'focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/25',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/25',
].join(' ');
