
import { useState, useCallback } from 'react';
import { fetchProducts as fetchProductsApi } from '@/lib/fetchProducts';
import { submitProduct, deleteProduct, toggleProductVisibility } from '@/lib/productUtils';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async (options = {}) => {
    setLoading(true);
    try {
      // Usar la función centralizada con opciones por defecto
      const data = await fetchProductsApi({
        orderBy: 'created_at',
        ascending: false,
        ...options
      });
      setProducts(data);
    } catch (error) {
      console.error('Error en fetchProducts:', error);
      // El manejo de errores ya está en fetchProductsApi
    } finally {
      setLoading(false);
    }
  }, []);

  // La función uploadFile ahora está centralizada en fetchProducts.js

  const handleSubmitProduct = async (productFormData, editingProduct) => {
    const success = await submitProduct(productFormData, editingProduct);
    if (success) {
      await fetchProducts();
    }
    return success;
  };

  const handleDeleteProduct = async (id) => {
    const success = await deleteProduct(id);
    if (success) {
      await fetchProducts();
    }
    return success;
  };

  const handleToggleProductVisibility = async (id, currentVisibility) => {
    const success = await toggleProductVisibility(id, currentVisibility);
    if (success) {
      await fetchProducts();
    }
    return success;
  };

  return { 
    products, 
    loading, 
    fetchProducts, 
    submitProduct: handleSubmitProduct, 
    deleteProduct: handleDeleteProduct, 
    toggleProductVisibility: handleToggleProductVisibility 
  };
};
