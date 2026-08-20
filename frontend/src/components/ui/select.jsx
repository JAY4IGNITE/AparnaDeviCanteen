import { cn } from '@/lib/utils';
import { fieldBaseClass } from './field-styles';

/**
 * Styled *native* <select> rather than a Radix Select.
 *
 * Every select in this app is driven by a shared `handleChange(e)` that reads
 * `e.target.name` and `e.target.value`. Radix's `onValueChange(value)` callback
 * would change that contract at every call site, so the native element is kept
 * and only restyled — identical behaviour, and better mobile pickers for free.
 */
function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          fieldBaseClass,
          'h-11 cursor-pointer pr-10',
          // Native option lists render with the OS palette; force the dark theme.
          '[&>option]:bg-[var(--bg-card)] [&>option]:text-foreground',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export { Select };
