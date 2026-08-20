import { cva } from 'class-variance-authority';

/** Separate module so badge.jsx exports components only (see button-variants.js). */
export const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap',
    'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    "[&>svg]:pointer-events-none [&>svg:not([class*='size-'])]:size-3",
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-brand-500/30 bg-brand-500/15 text-brand-300',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        outline: 'border-border bg-transparent text-muted-foreground',
        success: 'border-success/30 bg-success/12 text-success',
        warning: 'border-warning/30 bg-warning/12 text-warning',
        destructive: 'border-danger/30 bg-danger/12 text-danger',
        info: 'border-info/30 bg-info/12 text-info',
        muted: 'border-border bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Maps the order/availability status strings the API already returns onto badge
 * variants. Presentation only — the status values themselves are untouched.
 */
export const statusBadgeVariant = (status) => {
  switch (String(status ?? '').toLowerCase()) {
    case 'completed':
    case 'delivered':
    case 'available':
    case 'active':
      return 'success';
    case 'pending':
    case 'preparing':
      return 'warning';
    case 'cancelled':
    case 'canceled':
    case 'blocked':
    case 'unavailable':
      return 'destructive';
    default:
      return 'secondary';
  }
};
