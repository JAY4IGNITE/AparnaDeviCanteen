import { cva } from 'class-variance-authority';

/** Separate module so alert.jsx exports components only (see button-variants.js). */
export const alertVariants = cva(
  'relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        default: 'border-border bg-card text-foreground',
        success: 'border-success/30 bg-success/10 text-success',
        error: 'border-danger/30 bg-danger/10 text-danger',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        info: 'border-info/30 bg-info/10 text-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
