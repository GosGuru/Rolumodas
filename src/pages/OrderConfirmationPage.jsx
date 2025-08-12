import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, Mail, Phone, MapPin, Building2, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { WHATSAPP_NUMBER } from '@/config/contact';

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
          // Log suppressed (lint rule). Could integrate with monitoring service.
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
            // Log suppressed (lint rule). Could integrate with monitoring service.
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
      <div className="container px-4 py-12 mx-auto text-center">
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
  
  // Use central WHATSAPP_NUMBER (already contains country code without +)
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${generateWhatsAppMessage()}`;

  // Componente reutilizable para mostrar un valor copiabile con feedback visual
  const CopyableValue = ({ value, mono = false }) => {
    const [copied, setCopied] = React.useState(false);
    const timeoutRef = React.useRef(null);
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setCopied(true);
        // Sólo toast en desktop; en mobile el tooltip ya informa
        if (window.innerWidth > 640) {
          toast({ title: 'Copiado', description: value });
        }
        timeoutRef.current = setTimeout(() => setCopied(false), 1600);
      } catch {
        toast({ title: 'Error', description: 'No se pudo copiar.', variant: 'destructive' });
      }
    };
    React.useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);
    return (
      <div className="relative inline-flex w-full justify-center items-center gap-2 group py-0.5 text-center">
        <span className={`${mono ? 'font-mono text-lg' : ''} text-gray-700 whitespace-nowrap select-all`}>{value}</span>
        <button
          type="button"
          onClick={handleCopy}
            aria-label={copied ? 'Copiado' : 'Copiar'}
          className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border rounded-md w-7 h-7 border-gray-300/60 hover:text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium bg-green-600 text-white px-2 py-1 rounded shadow-md animate-fade-in-up pointer-events-none">
              Copiado
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Pedido Confirmado - Rolu Modas</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="container px-4 py-12 mx-auto"
      >
        <div className="max-w-2xl mx-auto bg-white p-8 pt-2 px-[20px] md:p-12 shadow-lg rounded-lg border">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-900">¡Muchas gracias por tu compra!</h1>
            <p className="mt-2 text-lg text-muted-foreground">Tu pedido <span className="font-semibold text-primary">{order.orderNumber}</span> ha sido recibido.</p>
          </div>

          <div className="p-6 pt-2 my-8 space-y-4 text-left border rounded-md bg-secondary/50">
            <h2 className="text-xl font-semibold text-gray-800">Métodos de Pago</h2>
            <p className="text-sm text-gray-700">Dentro de Durazno podes utilizar estos métodos de pagos, o abonar en el Punto de Retiro cuando pases por tu pedido.</p>
            <div className="space-y-1">
              <p className="font-bold text-gray-800 uppercase">Transferencias a BROU</p>
              <CopyableValue value="11059236100001" mono />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-gray-800 uppercase">Depósitos por Redes de Cobranza</p>
              <CopyableValue value="600-8676866" mono />
              <p className="text-xs text-muted-foreground">Caja de ahorro en pesos a nombre de Luciara Romero</p>
            </div>
             <div>
              <p className="font-bold text-gray-800 uppercase">Envíos</p>
              <p className="text-sm text-gray-700">Realizamos envíos a todo el país a través de las agencias Dac, Nossar o Turismar (en caso de necesitar otra consultar).</p>
            </div>
          </div>

          <div className="p-6 my-8 text-center bg-green-100 border border-green-300 rounded-md">
            <h2 className="mb-2 text-xl font-semibold text-green-800">¡Importante!</h2>
            <p className="mb-4 text-green-700">
              Para finalizar, envía el comprobante de pago por WhatsApp.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <button
                className="flex items-center justify-center w-full gap-2 py-3 text-base font-bold text-white transition-colors bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                style={{ fontSize: '1.15rem' }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="mr-2 w-7 h-7"
                  style={{ background: 'none' }}
                />
                097 358 715
              </button>
            </a>
          </div>

          {/* Detalles del cliente y envío */}
          <div className="p-5 mb-8 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-800">
              <User className="w-5 h-5 text-gray-500" /> Detalles del Cliente
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> {order.customerName}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {order.customerEmail}</div>
              {order.customerPhone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {order.customerPhone}</div>}
            </div>
            <div className="mt-4">
              <h4 className="flex items-center gap-2 mb-1 font-semibold text-gray-800 text-md">
                <MapPin className="w-4 h-4 text-gray-500" /> Dirección de Entrega
              </h4>
              {order.shippingMethod === 'agency' ? (
                <div className="space-y-1 text-sm text-gray-700">
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

          <div className="pt-6 my-8 text-left border-t">
            <h3 className="mb-3 text-lg font-bold text-primary">Resumen del Pedido</h3>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.cartId} className="flex items-center justify-between text-sm">
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
            <div className="flex justify-between pt-3 mt-3 text-xl font-bold text-green-700 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/tienda">
              <Button className="w-full py-3 text-base font-bold text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700">
                Realizar otro pedido
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default OrderConfirmationPage;