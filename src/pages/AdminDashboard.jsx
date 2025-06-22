import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogOut, Loader2, Package, BarChart2, Settings, ShoppingBag } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import AdminStats from '@/components/admin/AdminStats';
import ProductManagement from '@/components/admin/ProductManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import SiteManagement from '@/components/admin/SiteManagement';
import { supabase } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminOrdersPage from '@/pages/AdminOrdersPage';
import AdminReportsPage from '@/pages/AdminReportsPage';

const AdminDashboard = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
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
    const { data, error } = await supabase.from('products').select('*, categories(id, name)').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error al cargar productos", description: error.message, variant: "destructive" });
    } else {
      setProducts(data);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchProducts()]);
      setLoading(false);
    };
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchCategories, fetchProducts]);

  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleProductFormSubmit = async (e, productFormData, editingProduct, resetForm) => {
    e.preventDefault();
    try {
      const imageUrls = await Promise.all(
        productFormData.images.map(image => 
          image instanceof File ? uploadFile(image, 'product-images') : Promise.resolve(image)
        )
      );

      const variants = productFormData.variants
        .filter(v => v.name && v.options)
        .map(v => ({
          name: v.name,
          options: v.options.split(',').map(opt => opt.trim()).filter(Boolean)
        }));

      const productData = {
        name: productFormData.name,
        price: parseFloat(productFormData.price) || 0,
        description: productFormData.description,
        category_id: parseInt(productFormData.category_id, 10),
        stock: parseInt(productFormData.stock, 10) || 0,
        visible: productFormData.visible,
        is_trending: productFormData.is_trending,
        images: imageUrls,
        variants: variants.length > 0 ? variants : null,
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(price);
  };

  if (!isAuthenticated && !user) { 
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!user && isAuthenticated) { 
    return <div className="min-h-screen flex items-center justify-center bg-black text-white font-negro">Cargando datos de usuario...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Admin - Rolu Modas</title>
        <meta name="description" content="Panel de administración para Rolu Modas" />
      </Helmet>

      <div className="min-h-screen bg-black text-white font-negro">
        <header className="bg-gray-900 shadow-sm border-b border-gray-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-negro">Dashboard</h1>
              <Button onClick={logout} variant="outline" className="flex items-center space-x-2 text-white border-gray-600 bg-gray-800 hover:bg-gray-700 hover:text-white">
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : (
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                <TabsTrigger value="informes">Informes</TabsTrigger>
                <TabsTrigger value="gestion">Gestión</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard">
                <AdminStats products={products} formatPrice={formatPrice} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <Link to="/admin/pedidos" className="bg-gray-800 p-6 hover:bg-gray-700 transition-colors flex items-center space-x-4">
                        <ShoppingBag className="h-8 w-8 text-blue-400"/>
                        <div>
                            <h3 className="text-lg font-bold">Ver Pedidos</h3>
                            <p className="text-sm text-gray-400">Revisa y gestiona los pedidos de los clientes.</p>
                        </div>
                    </Link>
                    <Link to="/admin/informes" className="bg-gray-800 p-6 hover:bg-gray-700 transition-colors flex items-center space-x-4">
                        <BarChart2 className="h-8 w-8 text-green-400"/>
                        <div>
                            <h3 className="text-lg font-bold">Ver Informes</h3>
                            <p className="text-sm text-gray-400">Analiza las métricas de ventas y rendimiento.</p>
                        </div>
                    </Link>
                </div>
              </TabsContent>
              <TabsContent value="pedidos">
                <AdminOrdersPage />
              </TabsContent>
              <TabsContent value="informes">
                <AdminReportsPage />
              </TabsContent>
              <TabsContent value="gestion">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 space-y-8">
                    <ProductManagement
                      products={products}
                      categories={categories}
                      handleProductFormSubmit={handleProductFormSubmit}
                      handleDeleteProduct={handleDeleteProduct}
                      toggleProductVisibility={toggleProductVisibility}
                      formatPrice={formatPrice}
                    />
                  </div>
                  <div className="space-y-8">
                    <CategoryManagement
                      categories={categories}
                      handleCreateCategory={handleCreateCategory}
                      handleSaveCategory={handleSaveCategory}
                      handleDeleteCategory={handleDeleteCategory}
                    />
                    <SiteManagement />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
