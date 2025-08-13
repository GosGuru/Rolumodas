import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para cambiar el favicon dinámicamente según la ruta
 * - Admin routes: favicon-admin.svg
 * - Frontend routes: favicon.svg
 */
export const useDynamicFavicon = () => {
  const location = useLocation();

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const faviconPath = isAdminRoute ? '/favicon-admin.svg' : '/favicon.svg';
    const title = isAdminRoute ? 'Admin - Rolu Modas' : 'Rolu Modas';
    
    // Cambiar favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconPath;
    
    // Cambiar título
    document.title = title;
  }, [location.pathname]);
};

export default useDynamicFavicon;
