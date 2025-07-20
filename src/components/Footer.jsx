import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import LogoHeader from '@/assets/LogoHeader.png';

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
    <footer className="bg-black text-white text-center px-4 pt-10 pb-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-10 md:gap-0 md:flex-row md:justify-between md:items-start">
        {/* Columna 1: Logo y descripción */}
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0 w-full md:w-1/3">
          <Link to="/" className="mb-4">
            <img
              src={LogoHeader}
              alt="Rolu Modas Logo"
              className="h-12 w-auto mx-auto md:mx-0"
            />
          </Link>
          <p className="text-gray-400 text-base leading-snug max-w-xs md:max-w-none text-center md:text-left">
            Moda femenina exclusiva para realzar tu estilo.
          </p>
        </div>
        {/* Columna 2: Ayuda */}
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0 w-full md:w-1/3">
          <h4 className="font-bold uppercase tracking-wider text-white text-base mb-3">Ayuda</h4>
          <ul className="flex flex-col gap-2">
            {footerLinks.map(link => (
              <li key={link.name}>
                <Link to={link.path} className="text-gray-400 text-base hover:text-white transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Columna 3: Contacto */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <h4 className="font-bold uppercase tracking-wider text-white text-base mb-3">Contacto</h4>
          <div className="flex gap-4 mb-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="w-6 h-6" />
            </a>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={social.name}
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-base mb-1"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
            <span>{email}</span>
          </a>
        </div>
      </div>
      {/* Línea divisoria */}
      <div className="border-t border-gray-800 my-8 w-full max-w-5xl mx-auto" />
      {/* Créditos y derechos */}
      <div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
        <p className="mb-0">© {new Date().getFullYear()} Rolu Modas. Todos los derechos reservados.</p>
        <p className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-center">
          <span>Diseño y Desarrollo por</span>
          <a
            href="https://www.linkedin.com/in/maximo-porcile-abb2b4338/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center font-semibold text-white hover:underline"
          >
            Máximo Porcile <Linkedin className="w-5 h-5 ml-2 align-middle" />
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;