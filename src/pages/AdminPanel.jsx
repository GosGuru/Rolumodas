import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardMobileNav from '@/components/admin/DashboardMobileNav';
import ProductManagement from '@/components/admin/ProductManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import SiteManagement from '@/components/admin/SiteManagement';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import Sidebar from '@/components/admin/Sidebar';

export const AdminGestionPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error) {
      toast({ title: "Error al cargar categorías", description: error.message, variant: "destructive" });
    } else {
      setCategories(data);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (error) {
      toast({ title: "Error al cargar productos", description: error.message, variant: "destructive" });
    } else {
      setProducts(data);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    setLoading(false);
  }, [fetchCategories, fetchProducts]);

  const handleProductFormSubmit = async (e, productFormData, editingProduct, resetForm) => {
    e.preventDefault();
    try {
      // 1. Manejar la subida de imágenes
      const uploadedImageUrls = await Promise.all(
        productFormData.images.map(async (image) => {
          if (typeof image === 'string') {
            return image; // Ya es una URL
          }
          if (image instanceof File) {
            return await uploadFile(image, 'product-images');
          }
          return null;
        })
      );

      const finalProductData = {
        ...productFormData,
        images: uploadedImageUrls.filter(Boolean), // Filtrar nulos
      };

      // 2. Enviar datos a Supabase
      if (editingProduct) {
        const { error } = await supabase.from('products').update(finalProductData).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: "Éxito", description: "Producto actualizado correctamente." });
      } else {
        const { error } = await supabase.from('products').insert([finalProductData]);
        if (error) throw error;
        toast({ title: "Éxito", description: "Producto creado correctamente." });
      }
      
      fetchProducts();
      resetForm();
    } catch (error) {
      toast({ title: "Error al guardar producto", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: "Error al eliminar producto", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Producto eliminado correctamente." });
      fetchProducts();
    }
  };

  const toggleProductVisibility = async (id, currentVisibility) => {
    const { error } = await supabase.from('products').update({ visible: !currentVisibility }).eq('id', id);
    if (error) {
      toast({ title: "Error al cambiar visibilidad", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Visibilidad actualizada." });
      fetchProducts();
    }
  };

  const handleCreateCategory = async (name, imageFile) => {
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" });
      return;
    }
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'category-images');
      }
      const slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const { error } = await supabase.from('categories').insert([{ name: trimmedName, slug, image: imageUrl }]);
      if (error) throw error;
      toast({ title: "Éxito", description: "Categoría creada." });
      fetchCategories();
    } catch (error) {
      toast({ title: "Error al crear categoría", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveCategory = async (id, name, imageFile) => {
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" });
      return;
    }
    try {
      const updateData = { name: trimmedName };
      if (imageFile) {
        updateData.image = await uploadFile(imageFile, 'category-images');
      }
      const { error } = await supabase.from('categories').update(updateData).eq('id', id);
      if (error) throw error;
      toast({ title: "Éxito", description: "Categoría actualizada." });
      fetchCategories();
    } catch (error) {
      toast({ title: "Error al actualizar categoría", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: "Error al eliminar categoría", description: "Asegúrate de que no tenga productos asociados. " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Categoría eliminada." });
      fetchCategories();
    }
  };

  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `cat-${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  if (!isAuthenticated && !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!user && isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen text-white bg-black font-negro">Cargando datos de usuario...</div>;
  }

  return (
    <div className="w-full px-2 py-4 mx-auto max-w-7xl sm:px-4 sm:py-8">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 md:gap-8">
        <div className="space-y-4 xl:col-span-2 md:space-y-8">
          <ProductManagement
            products={products}
            categories={categories}
            handleProductFormSubmit={handleProductFormSubmit}
            handleDeleteProduct={handleDeleteProduct}
            toggleProductVisibility={toggleProductVisibility}
            formatPrice={price => new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(price)}
          />
        </div>
        <div className="space-y-4 md:space-y-8">
          <CategoryManagement
            categories={categories}
            handleCreateCategory={handleCreateCategory}
            handleSaveCategory={handleSaveCategory}
            handleDeleteCategory={handleDeleteCategory}
          />
          <SiteManagement />
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      <Sidebar />
      <div className="pt-16 md:pl-56">
        <Outlet />
      </div>
      {isAuthenticated && user && <DashboardMobileNav />}
    </div>
  );
};

export default AdminPanel;
