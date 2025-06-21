
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export const useCategories = (initialCategories = []) => {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar las categorías.", variant: "destructive" });
    } else {
      setCategories(data);
    }
    setLoading(false);
  }, []);

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('category-images').upload(filePath, file);
    if (uploadError) {
      throw uploadError;
    }
    const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const createCategory = async (name, slug, imageFile) => {
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }
      const { error } = await supabase.from('categories').insert([{ name, slug, image: imageUrl }]);
      if (error) throw error;
      toast({ title: "Éxito", description: "Categoría creada." });
      await fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear la categoría.", variant: "destructive" });
    }
  };

  const updateCategory = async (id, name, imageFile) => {
    try {
      const updateData = { name };
      if (imageFile) {
        updateData.image = await uploadFile(imageFile);
      }
      const { error } = await supabase.from('categories').update(updateData).eq('id', id);
      if (error) throw error;
      toast({ title: "Éxito", description: "Categoría actualizada." });
      await fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar la categoría.", variant: "destructive" });
    }
  };

  const deleteCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar la categoría. Asegúrate de que no tenga productos asociados.", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Categoría eliminada." });
      await fetchCategories();
    }
  };

  return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory };
};
