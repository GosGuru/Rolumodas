import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { initMercadoPago } from '@mercadopago/sdk-react'

// Reemplaza 'YOUR_PUBLIC_KEY' con tu clave pública real de Mercado Pago
initMercadoPago('APP_USR-7c79b9c7-e645-48bb-84b4-d29f4e5eb2bf', { locale: 'es-UY' });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);