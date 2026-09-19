import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const DosaComingSoonModal = ({ open, onClose }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-amber-500/30 z-10 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cross / Close Button at the Top Right of the Image */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/80 hover:bg-amber-600 text-white hover:text-white border border-white/20 shadow-xl backdrop-blur-md transition-all duration-200 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Close modal"
              id="dosa-modal-close-btn"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            {/* Dosa Coming Soon Image */}
            <div className="relative w-full overflow-hidden bg-slate-950">
              <img
                src="/dosa-coming-soon.webp"
                alt="Dosa Orders Will Be Available Soon"
                className="w-full h-auto max-h-[80vh] object-contain mx-auto block select-none"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DosaComingSoonModal;
