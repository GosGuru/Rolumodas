
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqData = [
  {
    question: 'Cómo realizar una compra',
    answer: (
      <ul className="list-disc list-inside space-y-2">
        <li>Elegí tus productos y agregalos al carrito.</li>
        <li>Completá tus datos al finalizar la compra.</li>
        <li>Mínimo para envíos: $350 UYU.</li>
        <li>El pago es offline (nunca te pedirán los datos de tu tarjeta).</li>
        <li>Recibirás un correo de confirmación tras realizar el pedido.</li>
        <li>Tienes 48 hs para pagar; si no, el pedido se cancela.</li>
      </ul>
    ),
  },
  {
    question: '💳 Métodos de pago',
    answer: (
      <ul className="list-disc list-inside space-y-2">
        <li>Efectivo (solo si retirás en Durazno).</li>
        <li>Depósito en RedPagos o Abitab a cuenta BROU (sin costo adicional).</li>
        <li>Transferencia bancaria a BROU.</li>
        <li>MercadoPago (hasta en 12 cuotas).</li>
        <li>Al terminar tu compra, recibirás el número de cuenta o enlace de pago. Luego enviás el comprobante por WhatsApp.</li>
      </ul>
    ),
  },
  {
    question: '📦 Envíos a todo Uruguay',
    answer: (
      <ul className="list-disc list-inside space-y-2">
        <li>Se envía a cualquier parte del país, de lunes a viernes, por la agencia que elijas.</li>
        <li>Si no elegís una agencia, se envía por Agencia Central (DAC).</li>
      </ul>
    ),
  },
  {
    question: '🕒 Plazo de entrega',
    answer: (
      <ul className="list-disc list-inside space-y-2">
        <li>Si retirás en agencia, llega en 24 a 48 hs hábiles.</li>
        <li>Horarios dependen de la agencia seleccionada.</li>
        <li>Para despachos el mismo día, el pago debe acreditarse antes de las 14:00 hs.</li>
      </ul>
    ),
  },
  {
    question: '💰 Costo de envío',
    answer: (
      <ul className="list-disc list-inside space-y-2">
        <li>El costo por agencia es aproximadamente $200 UYU (se abona al recibir).</li>
        <li>No incluye en el precio del producto.</li>
      </ul>
    ),
  },
  {
    question: '🔎 Seguimiento del pedido',
    answer: (
      <ul className="list-disc list-inside space-y-2">
        <li>ROLU MODAS enviará el comprobante de despacho al día siguiente de tu compra para que puedas rastrear el envío.</li>
        <li>En caso de demoras, comunicate con la agencia.</li>
      </ul>
    ),
  },
  {
    question: '📦 Disponibilidad de productos',
    answer: (
      <ul className="list-disc list-inside space-y-2">
        <li>Todos los productos están sujetos a disponibilidad.</li>
        <li>Se pueden modificar sin aviso previo, pero no afectará pedidos ya realizados.</li>
      </ul>
    ),
  },
  {
    question: '🏷️ Precios',
    answer: (
      <ul className="list-disc list-inside space-y-2">
        <li>Expresados en pesos uruguayos, no incluyen envío.</li>
        <li>Pueden variar según criterio de ROLU MODAS.</li>
      </ul>
    ),
  },
  {
    question: '⚠️ Política de impagos',
    answer: (
      <p>Si acumulás 2 pedidos impagos, los siguientes podrían ser cancelados automáticamente sin aviso.</p>
    ),
  },
];

const FaqPage = () => {
  return (
    <>
      <Helmet>
        <title>Preguntas Frecuentes - Rolu Modas</title>
        <meta name="description" content="Encuentra respuestas a las preguntas más comunes sobre compras, envíos y pagos en Rolu Modas." />
      </Helmet>
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">Preguntas Frecuentes</h1>
            <p className="text-muted-foreground mt-2">Resolvemos tus dudas para que compres con confianza.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default FaqPage;
