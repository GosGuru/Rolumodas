import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Heart, Search, LogOut, LogIn, Menu, X, Settings, Home, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LogoHeader from '@/assets/LogoHeader.png';

const LOGO_HEIGHT = 64; // px
const HEADER_HEIGHT = 72; // px
const HEADER_MARGIN_TOP = 0; // Sin separación de TopNav
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
    height: '58px',
    background: 'rgba(0,0,0,0.650)',
    backdropFilter: 'blur(7px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    transition: 'margin-top 0.12s cubic-bezier(0.4,0,0.2,1), background 0.12s',
    zIndex: 50,
    padding: '0 18px', // Menos padding en mobile
  };

  const logoStyle = {
    height: '76px',
    objectFit: 'contain',
    display: 'block',
    marginLeft: '9px',
    marginRight: '18px',
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 w-full bg-black/80 backdrop-blur-md"
      style={{
        background: 'rgba(0, 0, 0, 0.1)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 50,
        borderBottom: 'none',
        boxShadow: 'none',
      }}
      animate={{ marginTop: atTop ? HEADER_MARGIN_TOP : 0 }}
      transition={{ duration: ANIMATION_DURATION, ease: "easeOut" }}
      role="banner"
    >
      <div
        style={headerStyle}
        className="main-header-inner flex w-full items-center px-2 py-1 md:px-4 md:py-0 md:w-full ml-[-1px] md:ml-0"
      >
        {/* Layout flexible: logo | iconos mobile | enlaces desktop | iconos desktop | menu mobile */}
        <Link to="/" aria-label="Ir al inicio" className="flex items-center h-full min-w-[45px] md:min-w-[44px]">
          <img
            src={LogoHeader}
            alt="Rolu Modas Logo"
            style={logoStyle}
            className="block  md:h-[44px]"
          />
        </Link>
        
        {/* Iconos para móvil - entre logo y menú hamburguesa */}
        <div className="flex items-center gap-0 ml-[90px] md:hidden">
          <Link to="/favoritos" aria-label="Ver favoritos">
            <Button variant="ghost" size="icon" className="relative p-0 header-button-hover header-anim-icon w-7 h-7">
              <Heart className="w-5 h-5" />
              {totalWishlistItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-white text-black text-[9px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold"
                  aria-label={`${totalWishlistItems} productos en favoritos`}
                  transition={{ duration: ANIMATION_DURATION }}
                >
                  {totalWishlistItems}
                </motion.span>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleDrawer} className="relative p-0 header-button-hover header-anim-icon w-7 h-7" aria-label="Abrir carrito de compras">
            <ShoppingCart className="w-5 h-5" />
            {totalCartItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-white text-black text-[9px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold border border-gray-200 shadow-sm"
                aria-label={`${totalCartItems} productos en el carrito`}
                transition={{ duration: ANIMATION_DURATION }}
              >
                {totalCartItems}
              </motion.span>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={openSearchModal} className="p-0 header-button-hover header-anim-icon w-7 h-7" aria-label="Buscar productos">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Enlaces y iconos para desktop */}
        <div className="items-center justify-end flex-1 hidden md:flex">
          <div className="flex gap-6 mr-8" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '18px' }}>
            <NavLink to="/" className="header-nav-link">INICIO</NavLink>
            <NavLink to="/tienda" className="header-nav-link">TIENDA</NavLink>
            <NavLink to="/faq" className="header-nav-link">PREGUNTAS FRECUENTES</NavLink>
          </div>
          <div className="flex items-center gap-5">
            <Button variant="ghost" size="icon" onClick={openSearchModal} className="mx-0 header-button-hover header-anim-icon md:inline-flex" aria-label="Buscar productos">
              <Search className="w-5 h-5" />
            </Button>
            <Link to="/favoritos" aria-label="Ver favoritos">
              <Button variant="ghost" size="icon" className="relative mx-0 header-button-hover header-anim-icon md:inline-flex">
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
            <Button variant="ghost" size="icon" onClick={toggleDrawer} className="relative mx-0 header-button-hover header-anim-icon md:inline-flex" aria-label="Abrir carrito de compras">
              <ShoppingCart className="w-5 h-5" />
              {totalCartItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-[1.2px] right-[-1px] bg-white text-black text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold border border-gray-200 shadow-sm"
                  style={{ transform: 'translate(30%, -30%)' }}
                  aria-label={`${totalCartItems} productos en el carrito`}
                  transition={{ duration: ANIMATION_DURATION }}
                >
                  {totalCartItems}
                </motion.span>
              )}
            </Button>
            {/* Login/Logout y Herramientas solo en desktop */}
            <div className="items-center hidden gap-4 ml-2 md:inline-flex">
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
                  <Button variant="ghost" size="icon" onClick={async () => { await logout(); window.location.href = '/'; }} className="header-button-hover header-anim-icon" aria-label="Cerrar sesión">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Botón de menú móvil */}
        <div className="flex items-center md:hidden">
          <Button
            id="mobile-menu-button"
            variant="ghost"
            size="icon"
            className="p-0 header-button-hover header-anim-icon w-7 h-7"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menú móvil"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 " />}
          </Button>
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
              className="absolute top-[58px] left-0 w-full bg-black/90 backdrop-blur-md border-t border-white/10 flex flex-col md:hidden z-50"
            >
              <nav className="flex flex-col gap-2 p-4 text-white bg-[#140e10]" aria-label="Menú móvil" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px' }}>
                <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 transition-all rounded hover:bg-white hover:text-black">
                  <Home className="w-5 h-5" /> INICIO
                </NavLink>
                <NavLink to="/tienda" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 transition-all rounded hover:bg-white hover:text-black">
                  <ShoppingCart className="w-5 h-5" /> TIENDA
                </NavLink>
                <NavLink to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 transition-all rounded hover:bg-white hover:text-black">
                  <HelpCircle className="w-5 h-5" /> PREGUNTAS FRECUENTES
                </NavLink>
                {!isAuthenticated && (
                  <NavLink to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 transition-all rounded hover:bg-white hover:text-black">
                    <LogIn className="w-5 h-5" /> INICIAR SESIÓN
                  </NavLink>
                )}
                {isAuthenticated && user && (
                  <>
                    <NavLink to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 transition-all rounded hover:bg-white hover:text-black">
                      <Settings className="w-5 h-5" /> HERRAMIENTAS
                    </NavLink>
                    <button onClick={async () => { setIsMobileMenuOpen(false); await logout(); window.location.href = '/'; }} className="flex items-center gap-2 px-2 py-2 text-left transition-all rounded hover:bg-white hover:text-black">
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