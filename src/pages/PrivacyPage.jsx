
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Políticas de Privacidad - Rolu Modas</title>
        <meta name="description" content="Conozca cómo manejamos su información personal." />
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Políticas de Privacidad</h1>
            <div className="prose max-w-none text-gray-700 space-y-6">
              <p>En Rolu Modas, respetamos su privacidad y nos comprometemos a proteger su información personal. Esta política de privacidad explica cómo recopilamos, usamos y protegemos la información que nos proporciona.</p>
              
              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">1. Información que Recopilamos</h2>
                <p>Recopilamos información personal que usted nos proporciona directamente al realizar una compra o registrarse en nuestro sitio. Esto puede incluir su nombre, dirección de correo electrónico, dirección de envío y número de teléfono. No recopilamos ni almacenamos información de tarjetas de crédito.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">2. Cómo Usamos su Información</h2>
                <p>Utilizamos la información que recopilamos para procesar sus pedidos, comunicarnos con usted sobre su compra, y mejorar nuestros servicios. Ocasionalmente, podemos enviarle correos electrónicos sobre nuevos productos, ofertas especiales u otra información que creemos que puede resultarle interesante, siempre que haya dado su consentimiento.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">3. Seguridad de la Información</h2>
                <p>Estamos comprometidos a garantizar que su información esté segura. Para evitar el acceso o la divulgación no autorizados, hemos implementado procedimientos físicos, electrónicos y administrativos adecuados para salvaguardar y proteger la información que recopilamos en línea.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">4. Cookies</h2>
                <p>Nuestro sitio web puede utilizar "cookies" para mejorar la experiencia del usuario. Una cookie es un pequeño archivo que pide permiso para ser colocado en el disco duro de su computadora. Puede optar por aceptar o rechazar las cookies. La mayoría de los navegadores web aceptan automáticamente las cookies, pero generalmente puede modificar la configuración de su navegador para rechazarlas si lo prefiere.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">5. Enlaces a Otros Sitios Web</h2>
                <p>Nuestro sitio web puede contener enlaces a otros sitios de interés. Sin embargo, una vez que haya utilizado estos enlaces para salir de nuestro sitio, debe tener en cuenta que no tenemos ningún control sobre ese otro sitio web. Por lo tanto, no podemos ser responsables de la protección y privacidad de cualquier información que proporcione mientras visita dichos sitios.</p>
              </div>

              <p className="mt-10 text-sm text-gray-500 border-t pt-4">Última actualización: 20 de junio de 2025</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PrivacyPage;
