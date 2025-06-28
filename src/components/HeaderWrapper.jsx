import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopNav from './TopNav';
import MainHeader from './MainHeader';

const TOPNAV_HEIGHT = 40; // px
const HEADER_MARGIN_TOP = 24; // px

const HeaderWrapper = ({ openSearchModal }) => {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setAtTop(window.scrollY === 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* TopNav - visible solo cuando está en el top */}
      <AnimatePresence initial={false}>
        {atTop && (
          <motion.div
            key="topnav"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{ height: TOPNAV_HEIGHT, width: '100%', zIndex: 60 }}
            className="fixed top-0 left-0 right-0 w-full z-50"
          >
            <TopNav />
          </motion.div>
        )}
      </AnimatePresence>
      {/* MainHeader - sticky, nunca se superpone con TopNav */}
      <div
        style={{
          marginTop: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <MainHeader openSearchModal={openSearchModal} atTop={atTop} />
      </div>
    </div>
  );
};

export default HeaderWrapper; 