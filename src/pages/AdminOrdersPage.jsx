import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Package, Search, ChevronDown, ChevronRight, X, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrderDetailsTab from '@/components/admin/OrderDetailsTab';
import { useNavigate } from 'react-router-dom';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los pedidos.", variant: "destructive" });
    } else {
      setOrders(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    
    const channel = supabase.channel('realtime orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        toast({ title: "Nuevo Pedido", description: `Se ha recibido un nuevo pedido: ${payload.new.order_number}` });
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  useEffect(() => {
    const savedOrder = localStorage.getItem('admin_selected_order');
    if (savedOrder) {
      try {
        setSelectedOrder(JSON.parse(savedOrder));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      localStorage.setItem('admin_selected_order', JSON.stringify(selectedOrder));
    } else {
      localStorage.removeItem('admin_selected_order');
    }
  }, [selectedOrder]);

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
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(price);
  };

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

  if (selectedOrder) {
    return (
      <OrderDetailsTab
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onDelete={handleDeleteOrder}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>Gestión de Pedidos - Rolu Modas</title>
      </Helmet>
      <div className="p-6 text-white bg-gray-900 border border-gray-700 shadow-sm">
        <div className="flex flex-col mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="mb-4 text-2xl font-bold sm:mb-0">Gestión de Pedidos</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Buscar por N°, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-3 text-sm text-white placeholder-gray-400 bg-gray-800 border border-gray-600 sm:w-64 focus:outline-none focus:ring-1 focus:ring-white"
              />
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 bg-gray-700 border-gray-600 hover:bg-gray-600 rounded-md max-w-[120px]">
                              <span>Estado</span>
                              <ChevronDown className="w-4 h-4 ml-1" />
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
                          <Trash2 className="w-5 h-5 text-red-400 hover:text-red-600" />
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
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-400 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Email</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Total</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-800/50 cursor-pointer" onClick={() => {
                      navigate('/admin/detalles', { state: { order } });
                    }}>
                      <td className="px-4 py-3 text-center">
                        <span className="text-base md:text-lg font-bold text-white text-center break-all">{order.customer_name || 'N/A'}</span>
                        <span className="text-xs text-gray-400 mt-1 block">#{order.order_number}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">{order.customer_email}</td>
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
                            <Button variant="outline" className="text-xs bg-gray-800 border-gray-600 hover:bg-gray-700" onClick={e => e.stopPropagation()}>Cambiar Estado</Button>
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
                          <X className="w-4 h-4 text-red-400 hover:text-red-600" />
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
      {selectedOrder && (
        <OrderDetailsTab
          order={selectedOrder}
          onBack={() => setSelectedOrder(null)}
          onDelete={handleDeleteOrder}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
};

export default AdminOrdersPage;
