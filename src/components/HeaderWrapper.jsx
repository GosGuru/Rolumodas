import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainHeader from './MainHeader';

// Eliminar la constante TOPNAV_HEIGHT y comentarios de TopNav
// const TOPNAV_HEIGHT = 40; // px
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