import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

/**
 * @description Custom hook to fetch and manage product data.
 * @param {string} productId - The ID of the product to fetch.
 * @returns {object} An object containing product data, loading state, and related products.
 */
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('id', productId)
          .single();

        if (error || !data) {
          throw new Error("No se pudo encontrar el producto.");
        }

        const productData = {
          ...data,
          images: data.images?.length > 0 ? data.images : ["https://placehold.co/600x800/e0e0e0/000000?text=Rolu"],
          inStock: data.stock > 0,
        };
        setProduct(productData);

        // Initialize selected variants (only those with stock)
        if (data.variants?.length > 0) {
          const initialVariants = {};
          data.variants.forEach(variant => {
            if (variant.options?.length > 0) {
              // Buscar la primera opción con stock disponible
              const availableOption = variant.options.find(option => 
                (parseInt(option.stock) || 0) > 0
              );
              // Si hay una opción con stock, usarla; sino usar la primera
              initialVariants[variant.name] = availableOption || variant.options[0];
            }
          });
          setSelectedVariants(initialVariants);
        }

        // Initialize selected color
        if (data.colors?.length > 0) {
          const firstColor = data.colors[0];
          setSelectedColor(typeof firstColor === 'string' ? { value: firstColor, name: firstColor } : firstColor);
        }

        // Fetch related products
        if (data.category_id) {
          const { data: related, error: relatedError } = await supabase
            .from('products')
            .select('*, categories(name, slug)')
            .eq('category_id', data.category_id)
            .eq('visible', true)
            .neq('id', data.id)
            .limit(4);

          if (relatedError) throw new Error("Error al buscar productos relacionados.");
          setRelatedProducts(related || []);
        }
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }, [productId]);

  return { 
    product, 
    loading, 
    relatedProducts, 
    selectedVariants, 
    setSelectedVariants, 
    selectedColor, 
    setSelectedColor 
  };
};
