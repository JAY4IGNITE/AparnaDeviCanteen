import { cn } from '@/lib/utils';

/**
 * On narrow screens each row collapses into a card and every cell grows a label
 * from its `label` prop, mirroring the app's existing `.table-responsive-cards`
 * behaviour but self-contained so the legacy CSS can eventually be dropped.
 */
function Table({ className, containerClassName, responsive = true, ...props }) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-border bg-card',
        responsive && 'max-md:overflow-visible max-md:rounded-none max-md:border-0 max-md:bg-transparent',
        containerClassName
      )}
    >
      <table
        data-slot="table"
        className={cn(
          'w-full caption-bottom border-collapse text-sm',
          responsive && [
            'max-md:block',
            'max-md:[&_thead]:hidden',
            'max-md:[&_tbody]:block',
            'max-md:[&_tbody_tr]:mb-3 max-md:[&_tbody_tr]:block max-md:[&_tbody_tr]:rounded-lg',
            'max-md:[&_tbody_tr]:border max-md:[&_tbody_tr]:border-border max-md:[&_tbody_tr]:bg-card max-md:[&_tbody_tr]:p-4',
            'max-md:[&_td]:flex max-md:[&_td]:items-center max-md:[&_td]:justify-between max-md:[&_td]:gap-4',
            'max-md:[&_td]:border-0 max-md:[&_td]:px-0 max-md:[&_td]:py-1.5',
            "max-md:[&_td[data-label]]:before:content-[attr(data-label)]",
            'max-md:[&_td]:before:shrink-0 max-md:[&_td]:before:text-xs max-md:[&_td]:before:font-semibold',
            'max-md:[&_td]:before:tracking-wider max-md:[&_td]:before:text-[var(--text-muted)] max-md:[&_td]:before:uppercase',
            'max-md:[&_td:last-child]:mt-2 max-md:[&_td:last-child]:border-t max-md:[&_td:last-child]:border-border max-md:[&_td:last-child]:pt-3',
          ],
          className
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn('border-b border-border bg-[var(--bg-secondary)]', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }) {
  return <tbody data-slot="table-body" className={cn('', className)} {...props} />;
}

function TableFooter({ className, ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t border-border bg-[var(--bg-secondary)] font-semibold', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border transition-colors last:border-0 hover:bg-[var(--bg-card-hover)]',
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'px-4 py-3 text-left align-middle text-xs font-bold tracking-wider text-muted-foreground uppercase whitespace-nowrap',
        className
      )}
      {...props}
    />
  );
}

/** `label` becomes the `data-label` shown as the field name in mobile card mode. */
function TableCell({ className, label, ...props }) {
  return (
    <td
      data-slot="table-cell"
      data-label={label}
      className={cn('px-4 py-3 align-middle', className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
