
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Package, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(price);
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <>
      <Helmet>
        <title>Gestión de Pedidos - Rolu Modas</title>
      </Helmet>
      <div className="bg-gray-900 p-6 shadow-sm border border-gray-700 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-4 sm:mb-0">Gestión de Pedidos</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por N°, cliente o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium">No se encontraron pedidos</h3>
            <p className="mt-1 text-sm text-gray-400">Intenta ajustar tu búsqueda o espera a que llegue un nuevo pedido.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pedido</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                          {expandedOrderId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{order.order_number}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{new Date(order.created_at).toLocaleDateString('es-UY')}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{formatPrice(order.total_amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="text-xs border-gray-600 bg-gray-800 hover:bg-gray-700">Cambiar Estado</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {statusOptions.map(status => (
                              <DropdownMenuItem key={status} onSelect={() => handleStatusChange(order.id, status)}>
                                {status.replace('_', ' ').toUpperCase()}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr className="bg-gray-800">
                        <td colSpan="6" className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-bold mb-2">Items del Pedido</h4>
                              <ul className="space-y-1">
                                {order.items.map(item => (
                                  <li key={item.cartId || item.id} className="flex justify-between">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>{formatPrice(item.price * item.quantity)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-bold mb-2">Detalles</h4>
                              <p><strong>Cliente:</strong> {order.customer_name || 'N/A'}</p>
                              <p><strong>Email:</strong> {order.customer_email || 'N/A'}</p>
                              <p><strong>Método de Envío:</strong> {order.shipping_method || 'N/A'}</p>
                              <p><strong>Método de Pago:</strong> {order.payment_method || 'N/A'}</p>
                              {order.payment_id && <p><strong>ID Pago:</strong> {order.payment_id}</p>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminOrdersPage;
