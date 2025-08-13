import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardMobileNav from '@/components/admin/DashboardMobileNav';
import ProductManagement from '@/components/admin/ProductManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import CategorySortableList from '@/components/admin/CategorySortableList';
import SiteManagement from '@/components/admin/SiteManagement';
import { supabase } from '@/lib/supabaseClient';
import { uploadFile } from '@/lib/fetchProducts';
import { toast } from '@/components/ui/use-toast';
import Sidebar from '@/components/admin/Sidebar';

export const AdminGestionPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    // Intentar ordenar primero por sort_order si la columna existe, luego por name
  const query = supabase.from('categories').select('*');
    // Primero intentar ordenar por sort_order (puede fallar si columna no existe todavía)
    let data, error;
    try {
      ({ data, error } = await query.order('sort_order', { ascending: true }).order('name', { ascending: true }));
  } catch {
      // Fallback silencioso
      ({ data, error } = await supabase.from('categories').select('*').order('name', { ascending: true }));
    }
    if (error) {
      toast({ title: "Error al cargar categorías", description: error.message, variant: "destructive" });
      return;
    }
    if (!data) return;
    // Normalizar sort_order si hay valores nulos: asignar orden incremental al final
    const withOrder = [...data];
    let maxOrder = withOrder.reduce((m, c) => c.sort_order != null && c.sort_order > m ? c.sort_order : m, -1);
    const needsUpdate = [];
    withOrder.forEach(c => {
      if (c.sort_order == null) {
        maxOrder += 1;
        c.sort_order = maxOrder;
        needsUpdate.push({ id: c.id, sort_order: c.sort_order });
      }
    });
    if (needsUpdate.length) {
      await supabase.from('categories').upsert(needsUpdate, { onConflict: 'id' });
    }
    // Ordenar en memoria por sort_order asc, luego name
    withOrder.sort((a,b) => {
      if (a.sort_order == null && b.sort_order == null) return a.name.localeCompare(b.name);
      if (a.sort_order == null) return 1;
      if (b.sort_order == null) return -1;
      if (a.sort_order === b.sort_order) return a.name.localeCompare(b.name);
      return a.sort_order - b.sort_order;
    });
    setCategories(withOrder);
  }, []);

  const fetchProducts = useCallback(async () => {
    // Modificado para hacer un JOIN y obtener el nombre de la categoría
    const { data, error } = await supabase
      .from('products')
      .select('*, categories (id, name)')
      .order('name', { ascending: true });

    if (error) {
      toast({ title: "Error al cargar productos", description: error.message, variant: "destructive" });
    } else {
      setProducts(data);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
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

  const toggleCategoryVisibility = async (id, currentVisibility) => {
    try {
      const { error } = await supabase.from('categories').update({ visible: !currentVisibility }).eq('id', id);
      if (error) {
        toast({ title: "Error al cambiar visibilidad", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Éxito", description: "Visibilidad actualizada." });
        fetchCategories();
      }
    } catch (err) {
      toast({ title: "Error", description: "Problema al cambiar visibilidad.", variant: "destructive" });
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
        imageUrl = await uploadFile(imageFile, 'category-images', 'cat');
      }
      const slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const nextOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order ?? -1)) + 1 : 0;
      let { error } = await supabase.from('categories').insert([{ name: trimmedName, slug, image: imageUrl, sort_order: nextOrder, visible: true }]);
      if (error && /sort_order/i.test(error.message)) {
        const retry = await supabase.from('categories').insert([{ name: trimmedName, slug, image: imageUrl, visible: true }]);
        error = retry.error;
      }
      if (error) throw error;
      toast({ title: "Éxito", description: "Categoría creada." });
      fetchCategories();
    } catch (error) {
      toast({ title: "Error al crear categoría", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveCategory = async (id, name, imageFile, currentImage) => {
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" });
      return;
    }
    try {
      const updateData = { name: trimmedName };
      if (imageFile) {
        updateData.image = await uploadFile(imageFile, 'category-images', 'cat');
      } else {
        updateData.image = currentImage;
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

  const handleReorderCategories = async (orderedIds) => {
    // Estrategia en dos fases para evitar duplicados en índice único sort_order
    // 1) Asignar valores temporales altos únicos
    // 2) Asignar los valores finales consecutivos
    try {
      if (!orderedIds || !orderedIds.length) return true;
      const currentMax = categories.reduce((m, c) => c.sort_order != null && c.sort_order > m ? c.sort_order : m, -1);
      const tempBase = currentMax + 1000; // base alta para evitar colisiones
      // Fase 1: valores temporales
      const tempResults = await Promise.all(
        orderedIds.map((id, idx) => supabase.from('categories').update({ sort_order: tempBase + idx }).eq('id', id))
      );
      const tempError = tempResults.find(r => r.error)?.error;
      if (tempError) throw tempError;
      // Fase 2: valores finales 0..n-1 según el orden recibido
      const finalResults = await Promise.all(
        orderedIds.map((id, idx) => supabase.from('categories').update({ sort_order: idx }).eq('id', id))
      );
      const finalError = finalResults.find(r => r.error)?.error;
      if (finalError) throw finalError;
      await fetchCategories();
      toast({ title: 'Orden guardado', description: 'El nuevo orden de categorías se aplicó correctamente.' });
      return true;
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'No se pudo guardar el nuevo orden.', variant: 'destructive' });
      throw e;
    }
  };

  if (!isAuthenticated && !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white bg-black font-negro">Cargando datos...</div>;
  }

  return (
    <div className="w-full px-4 py-4 mx-auto max-w-7xl min-h-screen">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ProductManagement
            products={products}
            categories={categories}
            handleProductFormSubmit={handleProductFormSubmit}
            handleDeleteProduct={handleDeleteProduct}
            toggleProductVisibility={toggleProductVisibility}
            formatPrice={price => new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(price)}
          />
          <CategorySortableList categories={categories} onReorder={handleReorderCategories} />
        </div>
        <div className="space-y-6">
          <CategoryManagement
            categories={categories}
            handleCreateCategory={async (name, imageFile) => {
              await handleCreateCategory(name, imageFile);
              return true; // indicar éxito
            }}
            handleSaveCategory={async (id, name, imageFile, currentImage) => {
              await handleSaveCategory(id, name, imageFile, currentImage);
              return true;
            }}
            handleDeleteCategory={async (id) => {
              await handleDeleteCategory(id);
              return true;
            }}
            toggleCategoryVisibility={toggleCategoryVisibility}
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
      <div className="md:pl-56">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </div>
      {isAuthenticated && user && <DashboardMobileNav />}
    </div>
  );
};

export default AdminPanel;