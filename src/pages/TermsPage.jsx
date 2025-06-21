
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Términos y Condiciones - Rolu Modas</title>
        <meta name="description" content="Lea nuestros términos y condiciones de servicio." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50"
      >
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Términos y Condiciones</h1>
            <div className="prose max-w-none text-gray-700 space-y-6">
              <p>Bienvenido a Rolu Modas. Al acceder y utilizar nuestro sitio web, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso, que junto con nuestra política de privacidad rigen la relación de Rolu Modas con usted en relación con este sitio web. Si no está de acuerdo con alguna parte de estos términos y condiciones, por favor no utilice nuestro sitio web.</p>
              
              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">1. Uso del Sitio Web</h2>
                <p>El contenido de las páginas de este sitio web es para su información y uso general. Está sujeto a cambios sin previo aviso. Ni nosotros ni terceros ofrecemos ninguna garantía en cuanto a la exactitud, puntualidad, rendimiento, integridad o idoneidad de la información y los materiales que se encuentran u ofrecen en este sitio web para un propósito particular.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">2. Compras y Pagos</h2>
                <p>Todos los precios están expresados en Pesos Uruguayos (UYU) y no incluyen el costo de envío. Nos reservamos el derecho de modificar los precios en cualquier momento. El pago se realiza a través de los métodos especificados en nuestra sección de Preguntas Frecuentes. Los pedidos no pagados dentro de las 48 horas serán cancelados automáticamente.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">3. Envíos y Entregas</h2>
                <p>Realizamos envíos a todo el Uruguay. El costo del envío corre por cuenta del cliente y se abona al recibir el paquete. Los plazos de entrega son estimados y pueden variar según la agencia de transporte seleccionada.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">4. Propiedad Intelectual</h2>
                <p>Este sitio web contiene material que es de nuestra propiedad o que tenemos licencia para usar. Este material incluye, entre otros, el diseño, la maquetación, el aspecto, la apariencia y los gráficos. La reproducción está prohibida salvo de conformidad con el aviso de derechos de autor, que forma parte de estos términos y condiciones.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">5. Limitación de Responsabilidad</h2>
                <p>El uso de cualquier información o material en este sitio web es bajo su propio riesgo, para lo cual no seremos responsables. Será su propia responsabilidad asegurarse de que cualquier producto, servicio o información disponible a través de este sitio web cumpla con sus requisitos específicos.</p>
              </div>

              <p className="mt-10 text-sm text-gray-500 border-t pt-4">Última actualización: 20 de junio de 2025</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default TermsPage;
