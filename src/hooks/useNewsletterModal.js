import { useState, useEffect } from 'react';

const useNewsletterModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  // Mostrar modal después de 30 segundos de estar en la página
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasShownModal && !isModalOpen) {
        setIsModalOpen(true);
        setHasShownModal(true);
      }
    }, 30000); // 30 segundos

    return () => clearTimeout(timer);
  }, [hasShownModal, isModalOpen]);

  // Mostrar modal después de hacer scroll al 70% de la página
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage > 70 && !hasShownModal && !isModalOpen) {
        setIsModalOpen(true);
        setHasShownModal(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShownModal, isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    hasShownModal
  };
};

export default useNewsletterModal; 