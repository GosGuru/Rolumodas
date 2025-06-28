import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, MessageCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/rolumodas.uy' },
    { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/LuMakeupUruguay' },
  ];

  const whatsappLink = 'https://wa.me/59896303934';
  const email = 'rolumodas.uy@gmail.com';

  const footerLinks = [
    { name: 'Términos y Condiciones', path: '/terminos' },
    { name: 'Políticas de Privacidad', path: '/privacidad' },
    { name: 'Preguntas Frecuentes', path: '/faq' },
  ];

  return (
    <footer className="text-white bg-black">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-3 justify-center text-left md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start mx-auto"
          >
            <Link to="/" className="mb-4">
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/51b3ed79-9556-4473-9300-b6672a6c2c9e/bcaac9251c06448f37208b48ec5f52f4.png" 
                alt="Rolu Modas Logo" 
                className="w-auto h-10"
              />
            </Link>
            <p className="text-sm text-gray-400">Moda femenina exclusiva para realzar tu estilo.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="mb-4 font-semibold tracking-wider text-white uppercase">Ayuda</h4>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-gray-400 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-start mx-auto"
          >
            <h4 className="mb-4 font-semibold tracking-wider text-white uppercase">Contacto</h4>
            <div className="flex gap-4 mb-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-white"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-white"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <a href={`mailto:${email}`} className="flex items-center text-gray-400 transition-colors hover:text-white" aria-label="Email">
                <Mail className="w-5 h-5 mr-1" />
                <span className="text-sm">{email}</span>
              </a>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 md:text-left text-left border-t border-gray-800 pt-6 text-gray-500">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="mb-0 text-center text-gray-500">
              © {new Date().getFullYear()} Rolu Modas. Todos los derechos reservados.
            </p>
            <div className="flex flex-col items-center justify-center">
              <p className="flex items-center justify-center text-center">
                Diseño y Desarrollo por{' '}
                <a 
                  href="https://www.linkedin.com/in/maximo-porcile-abb2b4338/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center ml-1 font-semibold text-white transition-colors hover:underline"
                >
                  Máximo Porcile <Linkedin className="w-6 h-6 ml-2 align-middle" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;