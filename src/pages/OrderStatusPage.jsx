
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

const OrderStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart, items: cartItems, getTotalPrice } = useCart();
  const query = new URLSearchParams(location.search);

  const status = query.get('status');
  const paymentId = query.get('payment_id');
  const preferenceId = query.get('preference_id');
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderSaved, setOrderSaved] = useState(false);

  useEffect(() => {
    const saveOrder = async () => {
      if (status === 'approved' && !orderSaved && cartItems.length > 0) {
        setIsProcessing(true);
        const orderDetails = {
          order_number: `MP-${paymentId}`,
          items: cartItems,
          total_amount: getTotalPrice(),
          shipping_method: 'agency', // Asumimos agencia, se puede mejorar
          payment_method: 'mercadopago',
          payment_id: paymentId,
          payment_status: status,
          status: 'processing',
        };

        const { error } = await supabase.from('orders').insert([orderDetails]);

        if (error) {
          console.error("Error saving MP order:", error);
          toast({
            title: "Error",
            description: "Hubo un problema al guardar tu pedido. Por favor, contacta a soporte con tu ID de pago.",
            variant: "destructive",
          });
        } else {
          setOrderSaved(true);
          clearCart();
        }
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
      }
    };

    saveOrder();
  }, [status, paymentId, preferenceId, cartItems, getTotalPrice, clearCart, orderSaved]);

  const statusConfig = {
    approved: {
      icon: <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />,
      title: '¡Pago aprobado!',
      message: 'Tu pedido ha sido confirmado y está siendo preparado. ¡Gracias por tu compra!',
    },
    pending: {
      icon: <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />,
      title: 'Pago pendiente',
      message: 'Tu pago está siendo procesado. Te notificaremos cuando se apruebe.',
    },
    failure: {
      icon: <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />,
      title: 'Pago rechazado',
      message: 'Hubo un problema con tu pago. Por favor, intenta de nuevo o contacta a tu banco.',
    },
    default: {
      icon: <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-6" />,
      title: 'Estado del pago',
      message: 'Revisando el estado de tu pago.',
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.default;

  useEffect(() => {
    if (!status) {
      navigate('/');
    }
  }, [status, navigate]);
  
  if (!status) return null;

  if (isProcessing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-bold">Procesando tu pedido...</h1>
        <p className="text-muted-foreground mt-2">Por favor, espera un momento.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Estado del Pedido - Rolu Modas</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 shadow-lg rounded-lg border text-center">
          {currentStatus.icon}
          <h1 className="text-3xl font-bold text-gray-900">{currentStatus.title}</h1>
          <p className="text-muted-foreground mt-2 text-lg">{currentStatus.message}</p>
          
          {paymentId && (
            <p className="text-sm text-muted-foreground mt-4">
              ID de Pago: {paymentId}
            </p>
          )}

          <div className="mt-8">
            <Link to="/">
              <Button>Volver a la tienda</Button>
            </Link>
            {status === 'failure' && (
              <Link to="/checkout">
                <Button variant="outline" className="ml-4">Intentar de nuevo</Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default OrderStatusPage;
