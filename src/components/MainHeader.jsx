import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Heart, Search, LogOut, LogIn, Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LogoHeader from '@/assets/LogoHeader.png';

const LOGO_HEIGHT = 64; // px
const HEADER_HEIGHT = 72; // px
const HEADER_MARGIN_TOP = 24; // px separación del TopNav
const TOPNAV_HEIGHT = 40; // px
const ANIMATION_DURATION = 0.2;

const MainHeader = ({ openSearchModal, atTop }) => {
  const { toggleDrawer, getTotalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const totalCartItems = getTotalItems();
  const totalWishlistItems = wishlistItems.length;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Cerrar menú mobile al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const menuButton = document.getElementById('mobile-menu-button');
        if (menuButton && menuButton.contains(event.target)) return;
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Estilos dinámicos para el header y logo
  const headerStyle = {
    width: '100%',
    height: `${HEADER_HEIGHT}px`,
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 25%, rgb(0, 0, 0) 80%)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    transition: 'margin-top 0.12s cubic-bezier(0.4,0,0.2,1), background 0.12s',
    zIndex: 50,
    padding: '0 16px',
    marginTop: atTop ? HEADER_MARGIN_TOP : 0,
  };

  const logoStyle = {
    height: `${LOGO_HEIGHT}px`,
    objectFit: 'contain',
    display: 'block',
  };

  return (
    <motion.header
      className="fixed top-[-18px] pt-[15px] md:pt-[15px] bg-black/90 left-0 right-0 w-[102vw] md:w-full "
      style={{
        background: 'black',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 50,
      }}
      animate={{ marginTop: atTop ? HEADER_MARGIN_TOP : 0 }}
      transition={{ duration: ANIMATION_DURATION, ease: "easeOut" }}
      role="banner"
    >
      <div
        style={headerStyle}
        className="main-header-inner flex w-full items-center px-2 py-1 md:px-4 md:py-0 md:w-full ml-[-1px] md:ml-0"
      >
        {/* Logo más grande y mejor proporción en mobile */}
        <Link to="/" aria-label="Ir al inicio" className="flex items-center h-full min-w-[56px] md:min-w-[64px]">
          <img
            src={LogoHeader}
            alt="Rolu Modas Logo"
            style={{ height: '68px', maxWidth: '110px', width: 'auto' }}
            className="block  md:h-[64px]"
          />
        </Link>
        {/* Nav principal centrado y visible en desktop */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-8 items-center" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '18px' }}>
          <NavLink to="/" className="header-nav-link">INICIO</NavLink>
          <NavLink to="/tienda" className="header-nav-link">TIENDA</NavLink>
          <NavLink to="/faq" className="header-nav-link">PREGUNTAS FRECUENTES</NavLink>
        </div>
        {/* Nav e iconos pegados y compactos en mobile */}
        <div className="flex flex-1 items-center justify-end gap-1 md:gap-4">
          {/* Iconos de nav pegados al menú hamburguesa */}
          <Button variant="ghost" size="icon" onClick={openSearchModal} className="header-button-hover header-anim-icon md:inline-flex mx-0" aria-label="Buscar productos">
            <Search className="w-5 h-5" />
          </Button>
          <Link to="/favoritos" aria-label="Ver favoritos">
            <Button variant="ghost" size="icon" className="relative header-button-hover header-anim-icon md:inline-flex mx-0">
              <Heart className="w-5 h-5" />
              {totalWishlistItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 right-0 bg-white text-black text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold"
                  style={{ transform: 'translate(40%, -40%)' }}
                  aria-label={`${totalWishlistItems} productos en favoritos`}
                  transition={{ duration: ANIMATION_DURATION }}
                >
                  {totalWishlistItems}
                </motion.span>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleDrawer} className="relative header-button-hover header-anim-icon md:inline-flex mx-0" aria-label="Abrir carrito de compras">
            <ShoppingCart className="w-5 h-5" />
            {totalCartItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-white text-black text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold"
                aria-label={`${totalCartItems} productos en el carrito`}
                transition={{ duration: ANIMATION_DURATION }}
              >
                {totalCartItems}
              </motion.span>
            )}
          </Button>
          {/* Menú hamburguesa a la derecha del todo en mobile */}
          <div className="flex md:hidden items-center ml-1">
            <Button
              id="mobile-menu-button"
              variant="ghost"
              size="icon"
              className="header-button-hover header-anim-icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menú móvil"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
          {/* Login/Logout y Herramientas solo en desktop */}
          <div className="hidden md:inline-flex items-center gap-1">
            {!isAuthenticated && (
              <Link to="/admin/login">
                <Button variant="ghost" size="icon" className="header-button-hover header-anim-icon" aria-label="Iniciar sesión">
                  <LogIn className="w-5 h-5" />
                </Button>
              </Link>
            )}
            {isAuthenticated && user && (
              <>
                <Link to="/admin/dashboard">
                  <Button variant="ghost" size="icon" className="header-button-hover header-anim-icon" aria-label="Panel de administración">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} className="header-button-hover header-anim-icon" aria-label="Cerrar sesión">
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Menú mobile desplegable */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: ANIMATION_DURATION }}
              className="absolute top-[71px] left-0 w-full  bg-black/90 backdrop-blur-md border-t border-white/10 flex flex-col md:hidden z-50"
            >

              <nav className="flex flex-col p-4 gap-2 text-white" aria-label="Menú móvil" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px' }}>
                <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-2 rounded flex items-center gap-2 hover:bg-white hover:text-black transition-all">
                  <Search className="w-5 h-5" /> INICIO
                </NavLink>
                <NavLink to="/tienda" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-2 rounded flex items-center gap-2 hover:bg-white hover:text-black transition-all">
                  <ShoppingCart className="w-5 h-5" /> TIENDA
                </NavLink>
                <NavLink to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-2 rounded flex items-center gap-2 hover:bg-white hover:text-black transition-all">
                  <Heart className="w-5 h-5" /> PREGUNTAS FRECUENTES
                </NavLink>
                {!isAuthenticated && (
                  <NavLink to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-2 rounded flex items-center gap-2 hover:bg-white hover:text-black transition-all">
                    <LogIn className="w-5 h-5" /> INICIAR SESIÓN
                  </NavLink>
                )}
                {isAuthenticated && user && (
                  <>
                    <NavLink to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-2 rounded flex items-center gap-2 hover:bg-white hover:text-black transition-all">
                      <Settings className="w-5 h-5" /> HERRAMIENTAS
                    </NavLink>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="py-2 px-2 rounded flex items-center gap-2 hover:bg-white hover:text-black transition-all text-left">
                      <LogOut className="w-5 h-5 " /> CERRAR SESIÓN
                    </button>
                  </>
                )}
              </nav>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default MainHeader; 