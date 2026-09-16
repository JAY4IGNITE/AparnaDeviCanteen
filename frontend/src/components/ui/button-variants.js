import { cva } from 'class-variance-authority';

/**
 * Kept in its own module (rather than exported from button.jsx) so the
 * component file exports components only — oxlint's react/only-export-components
 * rule warns on files that mix component and non-component exports.
 *
 * `bg-transparent border-0` in the base is deliberate: this app skips Tailwind's
 * preflight, so <button> keeps its UA background and border unless reset here.
 * Variants that want a border re-declare it and win via tailwind-merge.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'appearance-none border-0 bg-transparent',
    'font-semibold cursor-pointer select-none transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.96] active:translate-y-0',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary-500 text-white shadow-[0_4px_12px_rgba(249,115,22,0.28)] hover:bg-primary-600 hover:shadow-[0_8px_20px_rgba(249,115,22,0.4)]',
        secondary:
          'border border-border bg-secondary text-secondary-foreground hover:bg-accent hover:border-input',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:border-input',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_4px_14px_-2px_rgba(239,68,68,0.4)] hover:brightness-110',
        success:
          'bg-success text-white shadow-[0_4px_14px_-2px_rgba(34,197,94,0.35)] hover:brightness-110',
        whatsapp:
          'border border-success/40 bg-success/10 text-success hover:bg-success/20',
        link: 'text-brand-400 underline-offset-4 hover:text-brand-300 hover:underline',
      },
      size: {
        xs: 'h-7 gap-1 rounded-md px-2 text-xs',
        sm: 'h-9 gap-1.5 rounded-md px-3 text-[0.8rem]',
        default: 'h-10 rounded-md px-4 text-sm',
        lg: 'h-12 rounded-lg px-6 text-base',
        icon: 'size-10 rounded-md',
        'icon-sm': 'size-8 rounded-md',
        'icon-xs': 'size-7 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
