import { useState, useCallback } from 'react';
import { 
  fetchHeroImage, 
  updateHeroImage, 
  fetchMpMaxInstallments, 
  updateMpMaxInstallments 
} from '@/lib/siteUtils';

export const useSiteContent = () => {
  const [heroImage, setHeroImage] = useState(null);
  const [mpInstallments, setMpInstallments] = useState(3); // Valor por defecto
  const [loading, setLoading] = useState(false);

  const fetchSiteContent = useCallback(async () => {
    setLoading(true);
    try {
      // Obtener imagen de héroe
      const heroImageUrl = await fetchHeroImage();
      setHeroImage(heroImageUrl);
      
      // Obtener número máximo de cuotas
      const installments = await fetchMpMaxInstallments();
      setMpInstallments(installments);
    } catch (error) {
      console.error('Error en fetchSiteContent:', error);
      // El manejo de errores ya está en las funciones individuales
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateHeroImage = async (imageFile) => {
    const success = await updateHeroImage(imageFile);
    if (success) {
      // Actualizar estado local con la nueva imagen
      const heroImageUrl = await fetchHeroImage();
      setHeroImage(heroImageUrl);
    }
    return success;
  };

  const handleUpdateMpInstallments = async (value) => {
    const success = await updateMpMaxInstallments(value);
    if (success) {
      // Actualizar estado local con el nuevo valor
      setMpInstallments(parseInt(value, 10));
    }
    return success;
  };

  return { 
    heroImage, 
    mpInstallments, 
    loading, 
    fetchSiteContent, 
    updateHeroImage: handleUpdateHeroImage, 
    updateMpInstallments: handleUpdateMpInstallments 
  };
};