
import { useState, useCallback } from 'react';
import { fetchCategories as fetchCategoriesApi, createCategory, updateCategory, deleteCategory } from '@/lib/categoryUtils';

export const useCategories = (initialCategories = []) => {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async (options = {}) => {
    setLoading(true);
    try {
      // Usar la función centralizada con opciones por defecto
      const data = await fetchCategoriesApi({
        orderBy: 'name',
        ascending: true,
        ...options
      });
      setCategories(data);
    } catch (error) {
      console.error('Error en fetchCategories:', error);
      // El manejo de errores ya está en fetchCategoriesApi
    } finally {
      setLoading(false);
    }
  }, []);

  // La función uploadFile ahora está centralizada en fetchProducts.js

  const handleCreateCategory = async (name, imageFile) => {
    const success = await createCategory(name, imageFile);
    if (success) {
      await fetchCategories();
    }
    return success;
  };

  const handleUpdateCategory = async (id, name, imageFile) => {
    const success = await updateCategory(id, name, imageFile);
    if (success) {
      await fetchCategories();
    }
    return success;
  };

  const handleDeleteCategory = async (id) => {
    const success = await deleteCategory(id);
    if (success) {
      await fetchCategories();
    }
    return success;
  };

  return { 
    categories, 
    loading, 
    fetchCategories, 
    createCategory: handleCreateCategory, 
    updateCategory: handleUpdateCategory, 
    deleteCategory: handleDeleteCategory 
  };
};
