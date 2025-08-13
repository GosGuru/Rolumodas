import { useState, useEffect, useCallback } from 'react';
import { fetchCategoryDisplaySettings } from '@/lib/siteUtils';

export const useCategoryDisplaySettings = () => {
  const [settings, setSettings] = useState({
    homeLimit: 6,
    shopLimit: null,
    homeShowAll: false,
    shopShowAll: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const categorySettings = await fetchCategoryDisplaySettings();
      
      // Validar y sanitizar datos
      const validatedSettings = {
        homeLimit: Number(categorySettings?.homeLimit) || 6,
        shopLimit: categorySettings?.shopLimit === null ? null : (Number(categorySettings?.shopLimit) || null),
        homeShowAll: Boolean(categorySettings?.homeShowAll),
        shopShowAll: Boolean(categorySettings?.shopShowAll)
      };
      
      setSettings(validatedSettings);
    } catch (err) {
      setError(err.message || 'Error al cargar configuración');
      // Mantener valores por defecto en caso de error
      setSettings({
        homeLimit: 6,
        shopLimit: null,
        homeShowAll: false,
        shopShowAll: true
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  /**
   * Calcula cuántas categorías mostrar según la configuración
   * @param {Array} allCategories - Todas las categorías disponibles
   * @param {'home' | 'shop'} section - Sección para la cual calcular el límite
   * @returns {Array} - Categorías filtradas según la configuración
   */
  const getCategoriesToShow = useCallback((allCategories, section) => {
    // Validar entrada
    if (!Array.isArray(allCategories) || allCategories.length === 0) {
      return [];
    }

    if (section !== 'home' && section !== 'shop') {
      return allCategories; // Por defecto devolver todas si la sección es inválida
    }

    const isHome = section === 'home';
    const showAll = isHome ? settings.homeShowAll : settings.shopShowAll;
    const limit = isHome ? settings.homeLimit : settings.shopLimit;

    if (showAll) {
      return allCategories;
    }

    if (typeof limit === 'number' && limit > 0) {
      return allCategories.slice(0, limit);
    }

    // Si no hay límite específico, mostrar todas
    return allCategories;
  }, [settings]);

  return {
    settings,
    loading,
    error,
    getCategoriesToShow,
    refetch: fetchSettings
  };
};
