import React from 'react';
import { Button } from '@/components/ui/button';
import { X, MessageCircle } from 'lucide-react';

const statusLabels = {
  'completed': 'Completado',
  'processing': 'En proceso',
  'pending_payment': 'Pendiente de pago',
  'cancelled': 'Cancelado',
};

const AdminOrderDetail = ({ order, onClose, onDelete, onStatusChange }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-2">Pedido #{order.order_number} - {order.customer_name}</h2>
        <p className="text-gray-400 mb-4">{new Date(order.created_at).toLocaleString('es-UY')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Datos del Cliente</h3>
            <p><strong>Nombre:</strong> {order.customer_name}</p>
            <p><strong>Email:</strong> {order.customer_email}</p>
            <p><strong>Teléfono:</strong> {order.customer_phone || 'N/A'}</p>
            <p><strong>Método de Envío:</strong> {order.shipping_method === 'agency' ? 'Agencia' : 'Retiro en persona'}</p>
            {order.shipping_method === 'agency' && (
              <>
                <p><strong>Agencia:</strong> {order.agency_name}</p>
                <p><strong>Dirección:</strong> {order.agency_address}</p>
                <p><strong>Ciudad:</strong> {order.agency_city}</p>
                {order.agency_extra && <p><strong>Detalles:</strong> {order.agency_extra}</p>}
              </>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Estado y Pago</h3>
            <p><strong>Estado:</strong> <span className="inline-block px-2 py-1 rounded bg-gray-800 text-white">{statusLabels[order.status] || order.status}</span></p>
            <p><strong>Método de Pago:</strong> {order.payment_method === 'mp' ? 'Mercado Pago' : 'Manual'}</p>
            <p><strong>Total:</strong> UYU {order.total_amount}</p>
            {order.payment_id && <p><strong>ID Pago:</strong> {order.payment_id}</p>}
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
                  <MessageCircle className="w-4 h-4 text-white" />
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
          <h3 className="font-semibold mb-2">Productos</h3>
          <ul className="divide-y divide-gray-800">
            {order.items.map((item, idx) => (
              <li key={item.cartId || item.id || idx} className="flex justify-between py-2">
                <span>{item.name} x {item.quantity}</span>
                <span>UYU {item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
