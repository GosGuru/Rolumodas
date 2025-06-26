import React from 'react';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Trash2, Eye } from 'lucide-react';

const statusLabels = {
  'completed': 'Completado',
  'processing': 'En proceso',
  'pending_payment': 'Pendiente de pago',
  'cancelled': 'Cancelado',
};

const AdminOrderDetail = ({ order, onClose, onDelete, onStatusChange }) => {
  if (!order) return null;
  const items = Array.isArray(order.items) ? order.items : [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="relative bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-700 p-4 sm:p-8 overflow-auto text-white"
        style={{
          width: '100%',
          maxWidth: '500px',
          minWidth: 'min(95vw, 350px)',
          margin: '0 5vw',
          boxSizing: 'border-box',
          maxHeight: '90vh',
        }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-white">Pedido #{order.order_number} - {order.customer_name}</h2>
        <p className="text-gray-300 mb-4">{new Date(order.created_at).toLocaleString('es-UY')}</p>
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
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Estado y Pago</h3>
            <p className="text-white"><strong>Estado:</strong> <span className="inline-block px-2 py-1 rounded bg-gray-800 text-white">{statusLabels[order.status] || order.status}</span></p>
            <p className="text-white"><strong>Método de Pago:</strong> {order.payment_method === 'mp' ? 'Mercado Pago' : 'Manual'}</p>
            <p className="text-white"><strong>Total:</strong> UYU {order.total_amount}</p>
            {order.payment_id && <p className="text-white"><strong>ID Pago:</strong> {order.payment_id}</p>}
            <div className="mt-4 flex gap-2">
              {order.customer_phone && (
                <button
                  type="button"
                  onClick={() => {
                    let phone = order.customer_phone.trim();
                    if (!phone.startsWith('+598')) {
                      phone = '+598' + phone.replace(/^0+/, '').replace(/^\+?598/, '');
                    }
                    const url = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=Hola%20${encodeURIComponent(order.customer_name)},%20te%20contactamos%20por%20tu%20pedido%20en%20Rolu%20Modas!`;
                    window.open(url, '_blank');
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#25D366] hover:bg-[#1DA851] transition-colors focus:outline-none"
                  title="Contactar por WhatsApp"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" style={{ background: 'none' }} />
                  <span className="text-white font-medium">WhatsApp</span>
                </button>
              )}
              <Button variant="destructive" onClick={() => onDelete(order.id)} className="ml-auto">
                Eliminar Pedido
              </Button>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-white">Productos</h3>
          <ul className="divide-y divide-gray-800">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <li key={item.cartId || item.id || idx} className="flex justify-between py-2">
                  <a
                    href={item && item.id ? `/producto/${item.id}` : '#'}
                    className="text-blue-400 hover:underline truncate max-w-[160px] block"
                    title={item && item.name ? item.name : ''}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item && item.name
                      ? (item.name.length > 28 ? item.name.slice(0, 25) + '...' : item.name)
                      : 'Producto sin nombre'} x {item && item.quantity ? item.quantity : '?'}
                  </a>
                  <span>UYU {item && item.price && item.quantity ? item.price * item.quantity : '-'}</span>
                </li>
              ))
            ) : (
              <li className="py-2 text-gray-400">Sin productos en este pedido.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
