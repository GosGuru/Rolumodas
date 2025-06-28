import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, MessageCircle, ChevronLeft } from 'lucide-react';

const formatPrice = (price) => new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(price);

const statusLabels = {
  completed: 'Completado',
  processing: 'En proceso',
  pending_payment: 'Pendiente de pago',
  cancelled: 'Cancelado',
};

const OrderDetailsTab = ({ order, onBack, onDelete, onStatusChange }) => {
  if (!order) return null;
  const items = order.items || [];

  return (
    <div className="p-6 bg-gray-900 border border-gray-700 shadow rounded-xl max-w-3xl mx-auto mt-6">
      <div className="flex items-center mb-6 gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold text-white">Detalles de Pedido</h2>
        <span className="ml-4 px-2 py-1 rounded bg-gray-800 text-white text-xs font-semibold">
          #{order.order_number}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold mb-2 text-white">Datos del Cliente</h3>
          <p className="text-white"><strong>Nombre:</strong> {order.customer_name}</p>
          <p className="text-white"><strong>Email:</strong> {order.customer_email}</p>
          <p className="text-white"><strong>Teléfono:</strong> {order.customer_phone || 'N/A'}</p>
          <p className="text-white"><strong>Método de Envío:</strong> {order.shipping_method === 'agency' ? 'Agencia' : 'Retiro en persona'}</p>
          {order.shipping_method === 'agency' && (
            <>
              <p className="text-white"><strong>Agencia:</strong> {order.agency_name}</p>
              <p className="text-white"><strong>Dirección:</strong> {order.agency_address}</p>
              <p className="text-white"><strong>Ciudad:</strong> {order.agency_city}</p>
              {order.agency_extra && <p className="text-white"><strong>Detalles:</strong> {order.agency_extra}</p>}
            </>
          )}
          {order.customer_phone && (
            <Button
              type="button"
              onClick={() => {
                let phone = order.customer_phone.trim();
                if (!phone.startsWith('+598')) {
                  phone = '+598' + phone.replace(/^0+/, '').replace(/^?598/, '');
                }
                const url = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=Hola%20${encodeURIComponent(order.customer_name)},%20te%20contactamos%20por%20tu%20pedido%20en%20Rolu%20Modas!`;
                window.open(url, '_blank');
              }}
              className="mt-4 flex items-center gap-2 px-3 py-2 rounded-full bg-[#25D366] hover:bg-[#1DA851] transition-colors focus:outline-none"
              title="Contactar por WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="text-white font-medium">WhatsApp</span>
            </Button>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-white">Estado y Pago</h3>
          <p className="text-white"><strong>Estado:</strong> <span className="inline-block px-2 py-1 rounded bg-gray-800 text-white">{statusLabels[order.status] || order.status}</span></p>
          <p className="text-white"><strong>Método de Pago:</strong> {order.payment_method === 'mp' ? 'Mercado Pago' : 'Manual'}</p>
          <p className="text-white"><strong>Total:</strong> {formatPrice(order.total_amount)}</p>
          {order.payment_id && <p className="text-white"><strong>ID Pago:</strong> {order.payment_id}</p>}
          <div className="mt-4 flex gap-2">
            <Button variant="destructive" onClick={() => onDelete(order.id)}>
              <Trash2 className="w-5 h-5 mr-1" /> Eliminar Pedido
            </Button>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-white">Productos</h3>
        <ul className="divide-y divide-gray-800">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <li key={item.cartId || item.id || idx} className="flex flex-col md:flex-row md:justify-between py-2 gap-2 md:gap-0">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <a
                    href={item && item.id ? `/producto/${item.id}` : '#'}
                    className="text-blue-400 hover:underline truncate max-w-[180px] block"
                    title={item && item.name ? item.name : ''}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item && item.name
                      ? (item.name.length > 28 ? item.name.slice(0, 25) + '...' : item.name)
                      : 'Producto sin nombre'} x {item && item.quantity ? item.quantity : '?'}
                  </a>
                  {/* Mostrar variantes si existen */}
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <div className="flex flex-wrap gap-1 text-xs text-gray-300">
                      {Object.entries(item.selectedVariants).map(([variant, value]) => (
                        <span key={variant} className="bg-gray-800 px-2 py-0.5 rounded">
                          {variant}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))
          ) : (
            <li className="py-2 text-gray-400">Sin productos en este pedido.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default OrderDetailsTab; 