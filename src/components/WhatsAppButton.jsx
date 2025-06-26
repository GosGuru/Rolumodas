import React from 'react';
import { motion } from 'framer-motion';

const WhatsAppButton = ({ phoneNumber, hidden }) => {
  if (hidden) return null;
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <motion.div
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="fixed bottom-[5px] right-[5px] z-50 bg-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="w-9 h-9"
          style={{ background: 'none' }}
        />
      </motion.div>
    </a>
  );
};

export default WhatsAppButton;
