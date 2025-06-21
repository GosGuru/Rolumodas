import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Truck, CreditCard, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Wallet } from '@mercadopago/sdk-react';
import { supabase } from '@/lib/supabaseClient';

const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('manual');
  const [preferenceId, setPreferenceId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mpInstallments, setMpInstallments] = useState(5);

  useEffect(() => {
    if (paymentMethod === 'mp' && !preferenceId && items.length > 0) {
      createPreference();
    }
  }, [paymentMethod, items, mpInstallments]);

  useEffect(() => {
    const savedShip = localStorage.getItem('rolu-checkout-shipping');
    const savedPay = localStorage.getItem('rolu-checkout-payment');
    if (savedShip) setShippingMethod(savedShip);
    if (savedPay) setPaymentMethod(savedPay);

    const fetchInstallments = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('content_value')
        .eq('content_key', 'mp_max_installments')
        .single();
      if (data) {
        const val = parseInt(data.content_value.value, 10);
        if (!isNaN(val)) setMpInstallments(val);
      }
    };
    fetchInstallments();
  }, []);

  useEffect(() => {
    localStorage.setItem('rolu-checkout-shipping', shippingMethod);
  }, [shippingMethod]);

  useEffect(() => {
    localStorage.setItem('rolu-checkout-payment', paymentMethod);
  }, [paymentMethod]);

  const createPreference = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-mercadopago-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          shipping_method: shippingMethod,
          max_installments: mpInstallments,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo crear la preferencia de pago.');
      }

      const data = await response.json();

      if (!data.preferenceId) {
        throw new Error('No se pudo crear la preferencia de pago.');
      }

      setPreferenceId(data.preferenceId);
      toast({
        title: '¡Listo para pagar!',
        description: 'Se ha generado tu link de Mercado Pago.',
      });

    } catch (error) {
      toast({
        title: "Error con Mercado Pago",
        description: error.message,
        variant: "destructive"
      });
      setPaymentMethod('manual');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mt-2">Agrega productos para poder finalizar la compra.</p>
        <Link to="/tienda">
          <Button className="mt-6">Ir a la Tienda</Button>
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePlaceOrder = () => {
    const orderDetails = {
      items,
      total: getTotalPrice(),
      shipping: shippingMethod,
      orderNumber: `ROLU-${Date.now()}`
    };
    clearCart();
    navigate('/orden-confirmada', { state: { order: orderDetails } });
  };

  return (
    <>
      <Helmet>
        <title>Finalizar Compra - Rolu Modas</title>
        <meta name="description" content="Completa tu pedido en Rolu Modas." />
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">Finalizar Compra</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center"><Truck className="mr-3 h-6 w-6"/>Método de Envío</h2>
              <RadioGroup defaultValue="pickup" value={shippingMethod} onValueChange={setShippingMethod} className="space-y-3">
                <Label htmlFor="pickup" className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <span>Retiro en persona (Durazno)</span>
                </Label>
                <Label htmlFor="agency" className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="agency" id="agency" />
                  <span>Agencia (con costo a cuenta del cliente)</span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center"><CreditCard className="mr-3 h-6 w-6"/>Método de Pago</h2>
              <RadioGroup defaultValue="manual" value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <Label htmlFor="manual" className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="manual" id="manual" />
                  <span>Pago manual</span>
                </Label>
                <Label htmlFor="mp" className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="mp" id="mp" />
                  <span>Mercado Pago</span>
                </Label>
              </RadioGroup>
              
              <AnimatePresence>
                {paymentMethod === 'manual' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle className="font-semibold">Instrucciones para el pago</AlertTitle>
                      <AlertDescription>
                       Al finalizar, te daremos los datos para que puedas abonar. Tu pedido no se procesará hasta recibir el importe.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-secondary/50 border rounded-lg p-6 lg:p-8 self-start sticky top-28">
            <h2 className="text-2xl font-semibold mb-6">Resumen del Pedido</h2>
            <div className="space-y-3 border-b pb-4">
              {items.map(item => (
                <div key={item.cartId} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-3">
                    <img src={item.images?.[0]} alt={item.name} className="w-12 h-12 object-cover rounded-md"/>
                    <div>
                      <p className="font-medium">{item.name} x {item.quantity}</p>
                      <p className="text-muted-foreground">{formatPrice(item.price)} c/u</p>
                    </div>
                  </div>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 py-4">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-medium">{shippingMethod === 'pickup' ? 'Gratis' : 'A coordinar'}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-4 mt-2">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>
            {paymentMethod === 'manual' && (
                <Button onClick={handlePlaceOrder} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base py-3 mt-4">
                    Realizar Pedido
                </Button>
            )}
             {paymentMethod === 'mp' && (
              <div className="mt-4">
                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Generando link de pago...</span>
                  </div>
                )}
                {preferenceId && !isProcessing && (
                  <Wallet 
                    initialization={{ preferenceId: preferenceId }} 
                    customization={{ texts: { valueProp: 'smart_option' } }}
                    onSubmit={() => clearCart()}
                  />
                )}
                 {!preferenceId && !isProcessing && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>No se pudo generar el link de Mercado Pago. Por favor, intente con pago manual o recargue la página.</AlertDescription>
                    </Alert>
                 )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;