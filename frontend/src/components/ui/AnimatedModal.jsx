import { Dialog, DialogContent, DialogTitle } from './dialog';

/**
 * Same public API as before (`open` / `onClose` / `children` / `maxWidth`) so no
 * call site changes, but now backed by Radix Dialog — gaining focus-trap,
 * `aria-modal`, ESC-to-close, scroll-lock and overlay-click-close for free.
 * Enter/exit animation is handled by tw-animate-css `data-[state]` utilities on
 * DialogContent (no AnimatePresence, which would fight Radix's mount lifecycle).
 *
 * The existing modals render their own `.modal-header` (with a visible heading +
 * close button), so `showClose` is off and a screen-reader-only DialogTitle
 * supplies the required accessible name. `title` is optional and additive —
 * callers can pass the real heading text to improve the a11y name.
 */
const AnimatedModal = ({ open, onClose, children, maxWidth = '520px', title = 'Dialog' }) => (
  <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogContent
      showClose={false}
      aria-describedby={undefined}
      style={{ maxWidth }}
    >
      <DialogTitle className="sr-only">{title}</DialogTitle>
      {children}
    </DialogContent>
  </Dialog>
);

export default AnimatedModal;
