import React from 'react';
import { FiTruck } from 'react-icons/fi'; // Camión moderno
import { SiMercadopago } from 'react-icons/si'; // Logo MercadoPago

const TopNav = () => {
  return (
    <nav 
      className="w-full bg-black text-[8px]  md:text-xs font-semibold text-white "
      aria-label="Información de envíos y pagos"
      role="navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8 py-2">
          {/* Pedidos a todo el país */}
          <div className="flex items-center gap-2">
            <FiTruck className="w-4 h-4 text-white" />
            <span>Pedidos a todo el país</span>
          </div>

          {/* Separador */}
          <div className="w-px h-4 bg-white/20"></div>

          {/* Paga con Mercado Pago */}
          <div className="flex items-center gap-2">
            <SiMercadopago className="w-4 h-4 text-white" />
            <span>Paga con Mercado Pago</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav; 