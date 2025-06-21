
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*, categories(id, name)').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los productos.", variant: "destructive" });
    } else {
      setProducts(data);
    }
    setLoading(false);
  }, []);

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
    if (uploadError) {
      throw uploadError;
    }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const submitProduct = async (productFormData, editingProduct) => {
    try {
      const imageUrls = await Promise.all(
        productFormData.images.map(image => 
          image instanceof File ? uploadFile(image) : Promise.resolve(image)
        )
      );

      const productData = {
        name: productFormData.name,
        price: parseFloat(productFormData.price) || 0,
        description: productFormData.description,
        category_id: parseInt(productFormData.category_id, 10),
        stock: parseInt(productFormData.stock, 10) || 0,
        visible: productFormData.visible,
        is_trending: productFormData.is_trending,
        images: imageUrls,
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: "Éxito", description: "Producto actualizado correctamente." });
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast({ title: "Éxito", description: "Producto creado correctamente." });
      }
      await fetchProducts();
      return true;
    } catch (error) {
      toast({ title: "Error", description: error.message || "No se pudo guardar el producto.", variant: "destructive" });
      return false;
    }
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Producto eliminado correctamente." });
      await fetchProducts();
    }
  };

  const toggleProductVisibility = async (id, currentVisibility) => {
    const { error } = await supabase.from('products').update({ visible: !currentVisibility }).eq('id', id);
    if (error) {
      toast({ title: "Error", description: `No se pudo cambiar la visibilidad: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Visibilidad del producto actualizada." });
      await fetchProducts();
    }
  };

  return { products, loading, fetchProducts, submitProduct, deleteProduct, toggleProductVisibility };
};
