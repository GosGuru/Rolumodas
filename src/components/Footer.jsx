import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/rolumodas.uy' },
    { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/LuMakeupUruguay' },
  ];

  const whatsappLink = 'https://wa.me/59891864016';

  const footerLinks = [
    { name: 'Términos y Condiciones', path: '/terminos' },
    { name: 'Políticas de Privacidad', path: '/privacidad' },
    { name: 'Preguntas Frecuentes', path: '/faq' },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <Link to="/" className="mb-4">
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/51b3ed79-9556-4473-9300-b6672a6c2c9e/bcaac9251c06448f37208b48ec5f52f4.png" 
                alt="Rolu Modas Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-400">Moda femenina exclusiva para realzar tu estilo.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-semibold text-white uppercase tracking-wider mb-4">Ayuda</h4>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-semibold text-white uppercase tracking-wider mb-4">Contacto</h4>
            <div className="flex space-x-4 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
            <a href="mailto:contacto@rolumodas.uy" className="text-sm text-gray-400 hover:text-white transition-colors">
              contacto@rolumodas.uy
            </a>
          </motion.div>

           <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-semibold text-white uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-3">Suscríbete para recibir novedades y ofertas especiales.</p>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
           <p className="text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} Rolu Modas. Todos los derechos reservados.
            </p>
            <div className="text-gray-500">
             <p>
              Diseño y Desarrollo por{' '}
              <a 
                href="https://www.linkedin.com/in/maximo-porcile-abb2b4338/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-white hover:underline transition-colors inline-flex items-center"
              >
                Máximo Porcile <Linkedin className="h-4 w-4 ml-1" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;