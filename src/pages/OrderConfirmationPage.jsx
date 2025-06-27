import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle, User, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import NewsletterForm from '@/components/NewsletterForm';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const { order } = location.state || {};

  useEffect(() => {
    if (order && order.orderNumber) {
      const saveOrder = async () => {
        // 1. Verificar si la orden ya existe
        const { data: existingOrder, error: checkError } = await supabase
          .from('orders')
          .select('id')
          .eq('order_number', order.orderNumber)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116: 'not found'
          console.error("Error checking for existing order:", checkError);
          return;
        }

        // 2. Si no existe, insertarla
        if (!existingOrder) {
          const { error: insertError } = await supabase
            .from('orders')
            .insert([
              {
                order_number: order.orderNumber,
                items: order.items,
                total_amount: order.total,
                shipping_method: order.shipping,
                payment_method: 'manual',
                status: 'pending_payment',
              },
            ]);

          if (insertError) {
            console.error("Error saving order:", insertError);
            toast({
              title: "Error",
              description: "No se pudo guardar tu pedido. Por favor, contacta soporte.",
              variant: "destructive",
            });
          }
        }
      };
      saveOrder();
    }
  }, [order]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">No se encontraron detalles del pedido.</h1>
        <Link to="/">
          <Button className="mt-6">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(price);
  };
  
  const generateWhatsAppMessage = () => {
    let message = `¡Hola Rolu Modas! 👋\n\nAcabo de realizar un pedido (${order.orderNumber}).\n\n*Resumen:*\n`;
    order.items.forEach(item => {
      message += `- ${item.name} (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}\n`;
    });
    message += `\n*Total:* ${formatPrice(order.total)}\n`;
    message += `*Método de envío:* ${order.shipping === 'pickup' ? 'Retiro en persona' : 'Envío por agencia'}\n\n`;
    message += '¡Adjunto el comprobante de pago! Gracias. 😊';

    return encodeURIComponent(message);
  };
  
  const whatsappUrl = `https://wa.me/+59897358715?text=${generateWhatsAppMessage()}`;

  return (
    <>
      <Helmet>
        <title>Pedido Confirmado - Rolu Modas</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-2xl mx-auto bg-white p-8 pt-2 px-[20px] md:p-12 shadow-lg rounded-lg border">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900">¡Muchas gracias por tu compra!</h1>
            <p className="text-muted-foreground mt-2 text-lg">Tu pedido <span className="font-semibold text-primary">{order.orderNumber}</span> ha sido recibido.</p>
          </div>

          <div className="text-left bg-secondary/50 p-6 my-8 pt-2 rounded-md border space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Métodos de Pago</h2>
            <p className="text-gray-700 text-sm">Dentro de Durazno podes utilizar estos métodos de pagos, o abonar en el Punto de Retiro cuando pases por tu pedido.</p>
            <div>
              <p className="font-bold text-gray-800 uppercase">Transferencias a BROU</p>
              <p className="text-gray-700 text-lg font-mono">110592361-00001</p>
            </div>
            <div>
              <p className="font-bold text-gray-800 uppercase">Depósitos por Redes de Cobranza</p>
              <p className="text-gray-700 text-lg font-mono">600-8676866</p>
              <p className="text-xs text-muted-foreground">Caja de ahorro en pesos a nombre de Luciara Romero</p>
            </div>
             <div>
              <p className="font-bold text-gray-800 uppercase">Envíos</p>
              <p className="text-gray-700 text-sm">Realizamos envíos a todo el país a través de las agencias Dac, Nossar o Turismar (en caso de necesitar otra consultar).</p>
            </div>
          </div>

          <div className="text-center bg-green-100 p-6 my-8 rounded-md border border-green-300">
            <h2 className="text-xl font-semibold mb-2 text-green-800">¡Importante!</h2>
            <p className="text-green-700 mb-4">
              Para finalizar, envía el comprobante de pago por WhatsApp.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <button
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-base rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                style={{ fontSize: '1.15rem' }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="w-7 h-7 mr-2"
                  style={{ background: 'none' }}
                />
                097 358 715
              </button>
            </a>
          </div>

          {/* Detalles del cliente y envío */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-5 mb-8">
            <h3 className="font-semibold text-gray-800 text-lg mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" /> Detalles del Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> {order.customerName}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {order.customerEmail}</div>
              {order.customerPhone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {order.customerPhone}</div>}
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 text-md mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" /> Dirección de Entrega
              </h4>
              {order.shippingMethod === 'agency' ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /> Agencia: {order.agencyName}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Dirección: {order.agencyAddress}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Ciudad: {order.agencyCity}</div>
                  {order.agencyExtra && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Detalles: {order.agencyExtra}</div>}
                </div>
              ) : (
                <div className="text-sm text-gray-700">Retiro en persona</div>
              )}
            </div>
          </div>

          <div className="text-left my-8 border-t pt-6">
            <h3 className="font-bold text-lg mb-3 text-primary">Resumen del Pedido</h3>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.cartId} className="flex justify-between items-center text-sm">
                  <Link
                    to={item.id ? `/producto/${item.id}` : '#'}
                    className="text-blue-600 hover:underline truncate max-w-[160px] block"
                    title={item.name}
                  >
                    {item.name.length > 28 ? item.name.slice(0, 25) + '...' : item.name}
                  </Link>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-xl border-t pt-3 mt-3 text-green-700">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/tienda">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-base rounded-md transition-colors">
                Realizar otro pedido
              </Button>
            </Link>
          </div>

          {/* Newsletter Section */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                ¿Querés enterarte antes que nadie?
              </h3>
              <p className="text-gray-600 text-sm">
                Suscribite y recibí novedades, lanzamientos exclusivos y ofertas especiales.
              </p>
            </div>
            <div className="flex justify-center">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default OrderConfirmationPage;