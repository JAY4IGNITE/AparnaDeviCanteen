import { cn } from '@/lib/utils';
import { fieldBaseClass } from './field-styles';

function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldBaseClass,
        'h-11',
        // Dark-theme calendar/clock pickers, used by the revenue + stats filters.
        '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert-[0.75]',
        className
      )}
      {...props}
    />
  );
}

export { Input };
