import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { LogOut, Loader2, Package, BarChart2, Settings, ShoppingBag, Eye } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import AdminStats from '@/components/admin/AdminStats';
import ProductManagement from '@/components/admin/ProductManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import SiteManagement from '@/components/admin/SiteManagement';
import OrderDetailsTab from '@/components/admin/OrderDetailsTab';
import { supabase } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminReportsPage from '@/pages/AdminReportsPage';
import DashboardMobileNav from '@/components/admin/DashboardMobileNav';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Panel de administración Mobile First para Rolu Modas
// Refactorizado para máxima usabilidad y jerarquía visual en dispositivos móviles y escritorio
// Comentarios agregados para facilitar mantenimiento y futuras mejoras

const AdminDashboard = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Manejar cambio de tab desde URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['dashboard', 'pedidos', 'detalles-pedido', 'informes', 'gestion'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Actualizar URL cuando cambia el tab
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'dashboard') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newTab });
    }
  };

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

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los pedidos.", variant: "destructive" });
    } else {
      setOrders(data);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchProducts(), fetchOrders()]);
      setLoading(false);
    };
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchCategories, fetchProducts, fetchOrders]);

  // Suscripción a cambios en tiempo real de pedidos
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const channel = supabase.channel('realtime orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        toast({ title: "Nuevo Pedido", description: `Se ha recibido un nuevo pedido: ${payload.new.order_number}` });
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, fetchOrders]);

  // Funciones de manejo de pedidos
  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado del pedido.", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Estado del pedido actualizado." });
      fetchOrders();
      // Actualizar el pedido seleccionado si es el mismo
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este pedido? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el pedido.', variant: 'destructive' });
    } else {
      toast({ title: 'Pedido eliminado', description: 'El pedido fue eliminado correctamente.' });
      fetchOrders();
      setSelectedOrder(null);
      handleTabChange('pedidos');
    }
  };

  const handleDeleteAllOrders = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar TODOS los pedidos? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('orders').delete().neq('id', null);
    if (error) {
      toast({ title: 'Error', description: 'No se pudieron eliminar los pedidos.', variant: 'destructive' });
    } else {
      toast({ title: 'Pedidos eliminados', description: 'Todos los pedidos fueron eliminados correctamente.' });
      fetchOrders();
      setSelectedOrder(null);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    handleTabChange('detalles-pedido');
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    handleTabChange('pedidos');
  };

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
          options: Array.isArray(v.options)
            ? v.options
            : v.options.split(',').map(opt => opt.trim()).filter(Boolean)
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
        colors: productFormData.colors && productFormData.colors.length > 0 ? productFormData.colors : null,
        short_description: productFormData.short_description || null,
        long_description: productFormData.long_description || null,
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

  // Filtrado de pedidos
  const filteredOrders = orders.filter(order =>
    (order.order_number && String(order.order_number).toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'processing': return 'bg-blue-500/20 text-blue-400';
      case 'pending_payment': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  const statusOptions = ['pending_payment', 'processing', 'completed', 'cancelled'];

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
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              {/* Navegación principal: TabsList fijo en mobile, grid en desktop, feedback visual */}
              <TabsList
                className="fixed bottom-0 left-0 z-50 flex flex-row justify-around w-full py-2 bg-white/90 border-t-2 border-primary shadow-2xl backdrop-blur sm:grid sm:grid-cols-5 sm:static sm:py-0 sm:justify-start sm:rounded-t-2xl sm:mb-8 sm:shadow-none"
              >
                <TabsTrigger value="dashboard" className="flex flex-col items-center text-xs sm:text-base font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-colors">
                  <BarChart2 className="w-5 h-5 mb-1 sm:hidden text-primary" />Dashboard
                </TabsTrigger>
                <TabsTrigger value="pedidos" className="flex flex-col items-center text-xs sm:text-base font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-colors">
                  <ShoppingBag className="w-5 h-5 mb-1 sm:hidden text-primary" />Pedidos
                </TabsTrigger>
                <TabsTrigger value="detalles-pedido" className="flex flex-col items-center text-xs sm:text-base font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-bold transition-colors">
                  <Eye className="w-5 h-5 mb-1 sm:hidden text-primary" />Detalles
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
                  <button onClick={() => handleTabChange('pedidos')} className="flex items-center gap-3 p-4 transition-colors bg-gray-800 rounded-lg shadow-md md:p-6 hover:bg-gray-700 md:gap-4 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <ShoppingBag className="text-blue-400 h-7 w-7 md:h-8 md:w-8"/>
                    <div>
                      <h3 className="text-base font-bold md:text-lg">Ver Pedidos</h3>
                      <p className="text-xs text-gray-400 md:text-sm">Revisa y gestiona los pedidos de los clientes.</p>
                    </div>
                  </button>
                  <button onClick={() => handleTabChange('informes')} className="flex items-center gap-3 p-4 transition-colors bg-gray-800 rounded-lg shadow-md md:p-6 hover:bg-gray-700 md:gap-4 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <BarChart2 className="text-green-400 h-7 w-7 md:h-8 md:w-8"/>
                    <div>
                      <h3 className="text-base font-bold md:text-lg">Ver Informes</h3>
                      <p className="text-xs text-gray-400 md:text-sm">Analiza las métricas de ventas y rendimiento.</p>
                    </div>
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="pedidos">
                <div className="p-6 text-white bg-gray-900 border border-gray-700 shadow-sm rounded-lg">
                  <div className="flex flex-col mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="mb-4 text-2xl font-bold sm:mb-0">Gestión de Pedidos</h2>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Buscar por N°, cliente o email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full py-2 pl-10 pr-3 text-sm text-white placeholder-gray-400 bg-gray-800 border border-gray-600 sm:w-64 focus:outline-none focus:ring-1 focus:ring-white rounded"
                        />
                        <svg className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <Button
                        onClick={handleDeleteAllOrders}
                        className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm"
                        title="Eliminar todos los pedidos"
                      >
                        Eliminar todos
                      </Button>
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="py-16 text-center">
                      <Package className="w-12 h-12 mx-auto text-gray-500" />
                      <h3 className="mt-2 text-lg font-medium">No se encontraron pedidos</h3>
                      <p className="mt-1 text-sm text-gray-400">Intenta ajustar tu búsqueda o espera a que llegue un nuevo pedido.</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile: tarjetas apiladas, Desktop: tabla */}
                      <div className="block sm:hidden">
                        <div className="grid grid-cols-1 gap-4">
                          {filteredOrders.map(order => (
                            <div
                              key={order.id}
                              className="bg-gray-800 rounded-xl p-4 shadow border border-gray-700 flex flex-col justify-between max-w-full w-full overflow-hidden"
                              style={{ maxWidth: '100vw', boxSizing: 'border-box' }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400 truncate max-w-[110px] block break-all" title={order.order_number}>Pedido #{order.order_number}</span>
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusClass(order.status)} min-w-[90px] justify-center`} title={order.status}>
                                  {order.status === 'completed' ? 'Completado' : order.status === 'processing' ? 'En proceso' : order.status === 'pending_payment' ? 'Pendiente' : order.status === 'cancelled' ? 'Cancelado' : order.status}
                                </span>
                              </div>
                              <div className="flex flex-col gap-0.5 min-h-[48px] justify-center mb-2">
                                <span className="text-base font-bold text-white leading-tight truncate break-all max-w-full">{order.customer_name || 'N/A'}</span>
                                <span className="text-xs text-gray-400 truncate break-all max-w-full">{order.customer_email}</span>
                                <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('es-UY')}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center gap-2 mt-3 pt-2 border-t border-gray-700">
                                <span className="text-2xl font-extrabold text-green-400 whitespace-nowrap text-center">{formatPrice(order.total_amount)}</span>
                                <div className="flex flex-row items-center justify-center gap-2 w-full mt-1">
                                  <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-md max-w-[120px]" onClick={() => handleSelectOrder(order)}>
                                    <Eye className="w-4 h-4" />
                                    <span>Detalle</span>
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-md max-w-[120px]">
                                        <span>Estado</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      {statusOptions.map(status => (
                                        <DropdownMenuItem key={status} onSelect={() => handleStatusChange(order.id, status)}>
                                          {status === 'completed' ? 'Completado' : status === 'processing' ? 'En proceso' : status === 'pending_payment' ? 'Pendiente' : status === 'cancelled' ? 'Cancelado' : status}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    title="Eliminar pedido"
                                    className="flex-1 p-1 rounded-full hover:bg-red-100/10 transition-colors flex items-center justify-center max-w-[40px] min-w-[40px]"
                                    style={{ lineHeight: 0 }}
                                  >
                                    <svg className="w-5 h-5 text-red-400 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full min-w-max">
                          <thead className="bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase"></th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Pedido</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Cliente</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Fecha</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Total</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Estado</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {filteredOrders.map(order => (
                              <tr key={order.id} className="cursor-pointer hover:bg-gray-800/50" onClick={e => { if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'svg' && e.target.tagName !== 'path') handleSelectOrder(order); }}>
                                <td className="px-4 py-3">
                                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); handleSelectOrder(order); }}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </Button>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">{order.order_number}</td>
                                <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap">{order.customer_name || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('es-UY')}</td>
                                <td className="px-4 py-3 text-sm whitespace-nowrap">{formatPrice(order.total_amount)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                    {order.status === 'completed' ? 'Completado' : order.status === 'processing' ? 'En proceso' : order.status === 'pending_payment' ? 'Pendiente de pago' : order.status === 'cancelled' ? 'Cancelado' : order.status}
                                  </span>
                                </td>
                                <td className="flex items-center gap-2 px-4 py-3 whitespace-nowrap">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" className="text-xs bg-gray-800 border-gray-600 hover:bg-gray-700">Cambiar Estado</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      {statusOptions.map(status => (
                                        <DropdownMenuItem key={status} onSelect={() => handleStatusChange(order.id, status)}>
                                          {status === 'completed' ? 'Completado' : status === 'processing' ? 'En proceso' : status === 'pending_payment' ? 'Pendiente de pago' : status === 'cancelled' ? 'Cancelado' : status}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); handleDeleteOrder(order.id); }} title="Eliminar pedido">
                                    <svg className="w-4 h-4 text-red-400 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="detalles-pedido">
                {selectedOrder ? (
                  <OrderDetailsTab
                    order={selectedOrder}
                    onBack={handleBackToOrders}
                    onDelete={handleDeleteOrder}
                    onStatusChange={handleStatusChange}
                  />
                ) : (
                  <div className="p-6 text-center">
                    <Eye className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-white">No hay pedido seleccionado</h3>
                    <p className="text-sm text-gray-400 mt-2">Selecciona un pedido desde la pestaña "Pedidos" para ver sus detalles.</p>
                    <Button onClick={() => handleTabChange('pedidos')} className="mt-4">
                      Ir a Pedidos
                    </Button>
                  </div>
                )}
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
