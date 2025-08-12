/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Truck, CreditCard, Loader2, User   } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import MPButton from "../components/MPButton";
import { fetchMpMaxInstallments } from "@/lib/siteUtils";
import { toVariantLabel } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

const CheckoutPage = () => {  
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("manual");
  const [preferenceId, setPreferenceId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mpInstallments, setMpInstallments] = useState(5);

  // NUEVO: Estado para datos personales y agencia
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agencyAddress, setAgencyAddress] = useState("");
  const [agencyCity, setAgencyCity] = useState("");
  const [agencyExtra, setAgencyExtra] = useState("");

  // Scroll al inicio cuando se entra a la página de checkout
  useEffect(() => {
    // Pequeño timeout para asegurar que el layout esté montado (especialmente al venir desde drawer/modal)
    const t = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (paymentMethod === "mp" && !preferenceId && items.length > 0) {
      createPreference();
    }
  }, [paymentMethod, items, mpInstallments]);

  useEffect(() => {
    const savedShip = localStorage.getItem("rolu-checkout-shipping");
    const savedPay = localStorage.getItem("rolu-checkout-payment");
    if (savedShip) setShippingMethod(savedShip);
    if (savedPay) setPaymentMethod(savedPay);

    const fetchInstallments = async () => {
      try {
        // Usar la función centralizada para obtener las cuotas máximas
        const installments = await fetchMpMaxInstallments();
        // Si hay un valor válido, actualizamos el estado
        if (installments) {
          setMpInstallments(installments);
        }
      } catch (error) {
        console.error("Error al obtener cuotas máximas:", error);
        // Si hay error, se mantiene el valor por defecto (5)
      }
    };
    fetchInstallments();
  }, []);

  useEffect(() => {
    localStorage.setItem("rolu-checkout-shipping", shippingMethod);
  }, [shippingMethod]);

  useEffect(() => {
    localStorage.setItem("rolu-checkout-payment", paymentMethod);
  }, [paymentMethod]);

  const createPreference = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-mercadopago-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
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
        throw new Error("No se pudo crear la preferencia de pago.");
      }

      const data = await response.json();

      if (!data.preferenceId) {
        throw new Error("No se pudo crear la preferencia de pago.");
      }

      setPreferenceId(data.preferenceId);
      toast({
        title: "¡Listo para pagar!",
        description: "Se ha generado tu link de Mercado Pago.",
      });
    } catch (error) {
      toast({
        title: "Error con Mercado Pago",
        description: error.message,
        variant: "destructive",
      });
      setPaymentMethod("manual");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted-foreground">
          Agrega productos para poder finalizar la compra.
        </p>
        <Link to="/tienda">
          <Button className="mt-6">Ir a la Tienda</Button>
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Función para renderizar variantes y color
  const renderItemSelections = (item) => {
    const { selectedVariants, selectedColor } = item;
    const hasVariants =
      selectedVariants && Object.keys(selectedVariants).length > 0;
    const hasColor = selectedColor && typeof selectedColor === "object";

    if (!hasVariants && !hasColor) {
      return null;
    }

    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        {hasVariants &&
          Object.entries(selectedVariants).map(([variantName, option]) => (
            <span
              key={variantName}
              className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded"
            >
              {variantName}: {toVariantLabel(option)}
            </span>
          ))}
        {hasColor && (
          <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
            Color: {selectedColor.name}
            <span
              className="w-3 h-3 ml-1.5 border border-gray-400 rounded-full"
              style={{ backgroundColor: selectedColor.value }}
            ></span>
          </span>
        )}
      </div>
    );
  };

  // Función para generar un UUID si crypto.randomUUID no está disponible
  function generateOrderNumber() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // Fallback simple
    return "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  const handlePlaceOrder = async () => {
    // Validación básica
    if (!customerName || !customerEmail) {
      toast({
        title: "Completa tus datos",
        description: "Nombre y email son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    if (
      shippingMethod === "agency" &&
      (!agencyName || !agencyAddress || !agencyCity)
    ) {
      toast({
        title: "Completa los datos de agencia",
        description: "Agencia, dirección y ciudad son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    const orderNumber = generateOrderNumber();

    // Guardar pedido en Supabase (ajusta según tu lógica)
    const { error } = await supabase.from("orders").insert([
      {
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_method: shippingMethod,
        agency_name: shippingMethod === "agency" ? agencyName : null,
        agency_address: shippingMethod === "agency" ? agencyAddress : null,
        agency_city: shippingMethod === "agency" ? agencyCity : null,
        agency_extra: shippingMethod === "agency" ? agencyExtra : null,
        items,
        total_amount: getTotalPrice(),
        payment_method: paymentMethod,
      },
    ]);

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Error al guardar el pedido",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/orden-confirmada", {
      state: {
        order: {
          orderNumber,
          customerName,
          customerEmail,
          customerPhone,
          shippingMethod,
          agencyName,
          agencyAddress,
          agencyCity,
          agencyExtra,
          items,
          total: getTotalPrice(),
        },
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>Finalizar Compra - Rolu Modas</title>
        <meta name="description" content="Completa tu pedido en Rolu Modas." />
      </Helmet>
      <div className="container px-4 py-12 pt-2 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-0 text-3xl font-bold tracking-tight uppercase md:text-4xl">
            Finalizar Compra
          </h1>
        </motion.div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Datos personales */}

            <div
              className="p-6 md:p-7 mb-6 space-y-4 bg-gray-50 rounded-2xl border border-neutral-200/70 shadow-[0_1px_0_rgba(0,0,0,0.03)] 
                dark:bg-gray-900/40 dark:border-white/10"
            >
              <div className="flex items-center gap-2">
                <User  className="w-6 h-6" aria-hidden="true" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  Datos personales
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="customerName"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Nombre y Apellido *
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/70 bg-gray-50 text-gray-900
                   placeholder:text-gray-400 shadow-sm
                   focus:bg-white focus:border-primary/70 focus:ring-2 focus:ring-primary/40 focus:outline-none
                   transition-colors duration-200
                   dark:bg-gray-800/70 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-white/10
                   dark:focus:bg-gray-900 dark:focus:border-primary/50 dark:focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customerEmail"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Email *
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/70 bg-gray-50 text-gray-900
                   placeholder:text-gray-400 shadow-sm
                   focus:bg-white focus:border-primary/70 focus:ring-2 focus:ring-primary/40 focus:outline-none
                   transition-colors duration-200
                   dark:bg-gray-800/70 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-white/10
                   dark:focus:bg-gray-900 dark:focus:border-primary/50 dark:focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customerPhone"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Teléfono
                  </label>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/70 bg-gray-50 text-gray-900
                   placeholder:text-gray-400 shadow-sm
                   focus:bg-white focus:border-primary/70 focus:ring-2 focus:ring-primary/40 focus:outline-none
                   transition-colors duration-200
                   dark:bg-gray-800/70 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-white/10
                   dark:focus:bg-gray-900 dark:focus:border-primary/50 dark:focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>

            {/* Método de Envío */}
            <div className="space-y-4">
              <h2 className="flex items-center text-2xl font-semibold">
                <Truck className="w-6 h-6 mr-3" />
                Método de Envío
              </h2>
              <RadioGroup
                defaultValue="pickup"
                value={shippingMethod}
                onValueChange={setShippingMethod}
                className="space-y-3"
              >
                <Label
                  htmlFor="pickup"
                  className="flex flex-col items-start p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <span>Retiro en persona (Durazno)</span>
                  </div>
                </Label>
                <Label
                  htmlFor="agency"
                  className="flex flex-col items-start p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="agency" id="agency" />
                    <span>Agencia (con costo a cuenta del cliente)</span>
                  </div>
                </Label>
              </RadioGroup>
            </div>
            {/* Método de Pago */}
            <div className="space-y-4">
              <h2 className="flex items-center text-2xl font-semibold">
                <CreditCard className="w-6 h-6 mr-3" />
                Método de Pago
              </h2>
              <RadioGroup
                defaultValue="manual"
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <Label
                  htmlFor="manual"
                  className="flex flex-col items-start p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <span>Pago Manual</span>
                  </div>
                </Label>
                <Label
                  htmlFor="mp"
                  className="flex flex-col items-start p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="mp" id="mp" />
                    <span>Mercado Pago</span>
                  </div>
                </Label>
              </RadioGroup>
              <AnimatePresence>
                {paymentMethod === "manual" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertTitle className="font-semibold">
                        Instrucciones para el pago
                      </AlertTitle>
                      <AlertDescription>
                        Al finalizar la compra te daremos los datos para poder
                        abonar. Si eres de Durazno podrás usar esos datos o
                        abonar en efectivo cuando pases por tu pedido.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Inputs de agencia */}
            {shippingMethod === "agency" && (
              <div className="p-6 mb-4 space-y-4 bg-gray-100 rounded-lg dark:bg-gray-900/40">
                <h2 className="mb-2 text-xl font-semibold">
                  Datos de la Agencia
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="agencyName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Agencia *
                    </label>
                    <input
                      id="agencyName"
                      type="text"
                      required={shippingMethod === "agency"}
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="agencyAddress"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Dirección *
                    </label>
                    <input
                      id="agencyAddress"
                      type="text"
                      required={shippingMethod === "agency"}
                      value={agencyAddress}
                      onChange={(e) => setAgencyAddress(e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="agencyCity"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Ciudad *
                    </label>
                    <input
                      id="agencyCity"
                      type="text"
                      required={shippingMethod === "agency"}
                      value={agencyCity}
                      onChange={(e) => setAgencyCity(e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="agencyExtra"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Detalles adicionales
                    </label>
                    <input
                      id="agencyExtra"
                      type="text"
                      value={agencyExtra}
                      onChange={(e) => setAgencyExtra(e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky self-start p-6 border rounded-lg bg-secondary/50 lg:p-8 top-28"
          >
            <h2 className="mb-6 text-2xl font-semibold">Resumen del Pedido</h2>
            <div className="pb-4 space-y-3 border-b">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        item.images?.[0] ||
                        "https://placehold.co/100x100/e0e0e0/000000?text=Rolu"
                      }
                      alt={item.name}
                      className="object-cover w-12 h-12 rounded-md"
                      onError={(e) => {
                        console.error(
                          "Error cargando imagen en checkout:",
                          e.target.src
                        );
                        e.target.src =
                          "https://placehold.co/100x100/e0e0e0/000000?text=Rolu";
                        e.target.onerror = null; // Prevenir bucle infinito
                      }}
                    />
                    <div>
                      <p className="font-medium">
                        {item.name} x {item.quantity}
                      </p>
                      <p className="text-muted-foreground">
                        {formatPrice(item.price)} c/u
                      </p>
                      {/* Mostrar variantes y color */}
                      {renderItemSelections(item)}
                    </div>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="py-4 space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-medium">
                  {shippingMethod === "pickup" ? "Gratis" : "A coordinar"}
                </span>
              </div>
              <div className="flex justify-between pt-4 mt-2 text-xl font-bold border-t">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>
            {paymentMethod === "manual" && (
              <Button
                onClick={handlePlaceOrder}
                className="w-full py-3 mt-4 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  "Realizar Pedido"
                )}
              </Button>
            )}
            {paymentMethod === "mp" && (
              <div className="mt-4">
                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generando link de pago...</span>
                  </div>
                )}
                {preferenceId && !isProcessing && (
                  <MPButton
                    preferenceId={preferenceId}
                    onSuccess={() => clearCart()}
                  />
                )}
                {!preferenceId && !isProcessing && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      No se pudo generar el link de Mercado Pago.
                    </AlertDescription>
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
