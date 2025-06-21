// src/lib/loadMpSdk.js
export async function loadMpSdk(publicKey) {
  if (window.MercadoPago) return window.MercadoPago;   // ya cargado

  const url = 'https://sdk.mercadopago.com/js/v2';

  // — ① intentamos “probar conexión” (opcional)
  try {
    await fetch(url, { mode: 'no-cors' });
  } catch {
    console.warn('MP SDK bloqueado — intenta modo jsonp');
  }

  // — ② inyectamos el <script>
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () =>
      window.MercadoPago ? resolve(window.MercadoPago) : reject('SDK vacío');
    script.onerror = () => reject('No se pudo cargar MP SDK');
    document.body.appendChild(script);
  });
}
