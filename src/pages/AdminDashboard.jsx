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
import DashboardMobileNav from '@/components/admin/DashboardMobileNav';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';

// Panel de administración Mobile First para Rolu Modas
// Refactorizado para máxima usabilidad y jerarquía visual en dispositivos móviles y escritorio
// Comentarios agregados para facilitar mantenimiento y futuras mejoras

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
    return <div className="flex items-center justify-center min-h-screen text-white bg-black font-negro">Cargando datos de usuario...</div>;
  }

  return (
    <AdminErrorBoundary>
      <Helmet>
        <title>Dashboard Admin - Rolu Modas</title>
        <meta name="description" content="Panel de administración para Rolu Modas" />
      </Helmet>
      {/* Layout principal: fondo gradiente, fuente personalizada, mínimo alto pantalla */}
      <div className="flex flex-col min-h-screen text-white bg-gradient-to-b from-gray-900 via-gray-950 to-black font-negro">
        {/* Header fijo con sombra y separación visual */}
        <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 shadow-md">
        
        </header>
        {/* Main: padding y fondo adaptados, sombra y bordes redondeados */}
        <main className="flex-1 w-full px-2 py-4 mx-auto shadow-lg max-w-7xl sm:px-4 sm:py-8 bg-gray-900/90 rounded-t-2xl mt-0 min-h-[calc(100vh-64px-56px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="dashboard" className="w-full">
              {/* Navegación principal: TabsList fijo en mobile, grid en desktop, feedback visual */}
              <TabsList
                className="fixed bottom-0 left-0 z-50 flex flex-row justify-around w-full py-2 bg-white/90 border-t-2 border-primary shadow-2xl backdrop-blur sm:grid sm:grid-cols-4 sm:static sm:py-0 sm:justify-start sm:rounded-t-2xl sm:mb-8 sm:shadow-none"
              >
                <TabsTrigger value="dashboard" className="flex flex-col items-center text-xs sm:text-base font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-colors">
                  <BarChart2 className="w-5 h-5 mb-1 sm:hidden text-primary" />Dashboard
                </TabsTrigger>
                <TabsTrigger value="pedidos" className="flex flex-col items-center text-xs sm:text-base font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-colors">
                  <ShoppingBag className="w-5 h-5 mb-1 sm:hidden text-primary" />Pedidos
                </TabsTrigger>
                <TabsTrigger value="informes" className="flex flex-col items-center text-xs sm:text-base font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-colors">
                  <Package className="w-5 h-5 mb-1 sm:hidden text-primary" />Informes
                </TabsTrigger>
                <TabsTrigger value="gestion" className="flex flex-col items-center text-xs sm:text-base font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-colors">
                  <Settings className="w-5 h-5 mb-1 sm:hidden text-primary" />Gestión
                </TabsTrigger>
              </TabsList>
              {/* Contenido de cada tab, con jerarquía visual y separación */}
              <TabsContent value="dashboard">
                <AdminStats products={products} formatPrice={formatPrice} />
                <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 md:gap-8 md:mt-8">
                  <Link to="/admin/pedidos" className="flex items-center gap-3 p-4 transition-colors bg-gray-800 rounded-lg shadow-md md:p-6 hover:bg-gray-700 md:gap-4 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <ShoppingBag className="text-blue-400 h-7 w-7 md:h-8 md:w-8"/>
                    <div>
                      <h3 className="text-base font-bold md:text-lg">Ver Pedidos</h3>
                      <p className="text-xs text-gray-400 md:text-sm">Revisa y gestiona los pedidos de los clientes.</p>
                    </div>
                  </Link>
                  <Link to="/admin/informes" className="flex items-center gap-3 p-4 transition-colors bg-gray-800 rounded-lg shadow-md md:p-6 hover:bg-gray-700 md:gap-4 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <BarChart2 className="text-green-400 h-7 w-7 md:h-8 md:w-8"/>
                    <div>
                      <h3 className="text-base font-bold md:text-lg">Ver Informes</h3>
                      <p className="text-xs text-gray-400 md:text-sm">Analiza las métricas de ventas y rendimiento.</p>
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
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 md:gap-8">
                  <div className="space-y-4 xl:col-span-2 md:space-y-8">
                    {/* Gestión de productos */}
                    <ProductManagement
                      products={products}
                      categories={categories}
                      handleProductFormSubmit={handleProductFormSubmit}
                      handleDeleteProduct={handleDeleteProduct}
                      toggleProductVisibility={toggleProductVisibility}
                      formatPrice={formatPrice}
                    />
                  </div>
                  <div className="space-y-4 md:space-y-8">
                    {/* Gestión de categorías y sitio */}
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
        {/* Espaciador para barra inferior en mobile, asegura que el contenido no quede oculto */}
        <div className="block sm:hidden h-2" />
      </div>
      <DashboardMobileNav />
    </AdminErrorBoundary>
  );
};

export default AdminDashboard;
