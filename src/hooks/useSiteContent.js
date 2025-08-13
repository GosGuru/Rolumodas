import { useState, useCallback } from 'react';
import { 
  fetchHeroImage, 
  updateHeroImage, 
  fetchMpMaxInstallments, 
  updateMpMaxInstallments,
  fetchCategoryDisplaySettings,
  updateCategoryDisplaySettings
} from '@/lib/siteUtils';

export const useSiteContent = () => {
  const [heroImage, setHeroImage] = useState(null);
  const [mpInstallments, setMpInstallments] = useState(3); // Valor por defecto
  const [categorySettings, setCategorySettings] = useState({
    homeLimit: 6,
    shopLimit: null,
    homeShowAll: false,
    shopShowAll: true
  });
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
      
      // Obtener configuración de categorías
      const catSettings = await fetchCategoryDisplaySettings();
      setCategorySettings(catSettings);
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

  const handleUpdateCategorySettings = async (settings) => {
    const success = await updateCategoryDisplaySettings(settings);
    if (success) {
      // Actualizar estado local con la nueva configuración
      setCategorySettings(prevSettings => ({ ...prevSettings, ...settings }));
    }
    return success;
  };

  return { 
    heroImage, 
    mpInstallments, 
    categorySettings,
    loading, 
    fetchSiteContent, 
    updateHeroImage: handleUpdateHeroImage, 
    updateMpInstallments: handleUpdateMpInstallments,
    updateCategorySettings: handleUpdateCategorySettings
  };
};