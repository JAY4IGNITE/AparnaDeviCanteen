import { cn } from '@/lib/utils';
import { fieldBaseClass } from './field-styles';

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBaseClass, 'min-h-24 resize-y leading-relaxed', className)}
      {...props}
    />
  );
}

export { Textarea };
