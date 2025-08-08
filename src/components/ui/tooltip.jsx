import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Lightweight tooltip for hover/focus. Usage:
// <Tooltip content="Texto"><button>...</button></Tooltip>
const Tooltip = ({ content, children, side: _side = 'top', offset = 8, className = '' }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Positioning: only top supported for now (fits our color chips)
  const variants = {
    initial: { opacity: 0, y: 4, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 4, scale: 0.98 },
  };

  return (
    <span
      ref={wrapperRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
    >
      {children}
      <AnimatePresence>
        {open && content && (
          <motion.div
            role="tooltip"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2"
            style={{ bottom: `calc(100% + ${offset}px)` }}
          >
            <div className="relative">
              <div className="px-2.5 py-1.5 rounded-md bg-black text-white text-xs shadow-lg whitespace-nowrap">
                {content}
              </div>
              <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-black" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export default Tooltip;
