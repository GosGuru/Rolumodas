import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Grid, Home, ShoppingBag, HelpCircle, Wrench, LogOut, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = ({ openSearchModal }) => {
  const { toggleDrawer, getTotalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const totalCartItems = getTotalItems();
  const totalWishlistItems = wishlistItems.length;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  
  const mobileMenuRef = useRef(null);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const menuButton = document.getElementById('mobile-menu-button');
        if (menuButton && menuButton.contains(event.target)) return;
        closeMobileMenu();
      }
    };
    if (isMobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const navLinkStyle = {
    color: '#FFF',
    textDecoration: 'none',
    transition: 'color 0.3s'
  };

  const activeNavLinkStyle = {
    ...navLinkStyle,
    fontWeight: '600',
  };
  
  const mobileNavLinkClasses = "block py-3 px-4 text-base text-white hover:bg-white/20 rounded-md";


  return (
    <motion.header
      className="sticky top-0 z-50 border-b shadow-lg bg-black/95 backdrop-blur-sm border-white/10"
    >
      <div className="container px-4 py-3 mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/51b3ed79-9556-4473-9300-b6672a6c2c9e/bcaac9251c06448f37208b48ec5f52f4.png" 
              alt="Rolu Modas Logo" 
              className="object-cover w-auto h-10"
            />
          </Link>

          <nav className="items-center hidden space-x-8 text-sm font-medium md:flex">
            <NavLink to="/" style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}>INICIO</NavLink>
            <NavLink to="/tienda" style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}>TIENDA</NavLink>
            <NavLink to="/faq" style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}>PREGUNTAS FRECUENTES</NavLink>
          </nav>

          <div className="flex items-center space-x-2 text-white">
            {/* Iconos solo visibles en mobile */}
            <div className="flex md:hidden items-center space-x-2">
              <Link to="/favoritos">
                <Button variant="ghost" size="icon" className="relative hover:bg-white/20 hover:text-white">
                  <Heart className="w-5 h-5" />
                  {totalWishlistItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-white text-black text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold"
                    >
                      {totalWishlistItems}
                    </motion.span>
                  )}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDrawer}
                className="relative hover:bg-white/20 hover:text-white"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-white text-black text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold"
                  >
                    {totalCartItems}
                  </motion.span>
                )}
              </Button>
            </div>
            {/* Iconos solo visibles en desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={openSearchModal} className="hover:bg-white/20 hover:text-white">
                <Search className="w-5 h-5" />
              </Button>
              <Link to="/favoritos">
                <Button variant="ghost" size="icon" className="relative hover:bg-white/20 hover:text-white">
                  <Heart className="w-5 h-5" />
                  {totalWishlistItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-white text-black text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold"
                    >
                      {totalWishlistItems}
                    </motion.span>
                  )}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDrawer}
                className="relative hover:bg-white/20 hover:text-white"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-white text-black text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold"
                  >
                    {totalCartItems}
                  </motion.span>
                )}
              </Button>
              {/* Botón de dashboard/admin siempre visible en desktop */}
              <Link to={isAuthenticated && user ? "/admin/dashboard" : "/admin/login"}>
                <Button variant="ghost" size="icon" className="hover:bg-white/20 hover:text-white" aria-label="Dashboard Admin">
                  <Grid className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            {/* Botón de cerrar sesión solo si está autenticado y en desktop */}
            {isAuthenticated && user && (
              <Button variant="ghost" size="icon" onClick={logout} className="hidden md:inline-flex hover:bg-white/20 hover:text-white" aria-label="Cerrar sesión">
                <LogOut className="w-5 h-5" />
              </Button>
            )}
            <Button 
              id="mobile-menu-button"
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-white/20 hover:text-white" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menú móvil"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t md:hidden bg-black/95 backdrop-blur-sm border-white/10"
          >
            <nav className="flex flex-col p-4 pt-1  pb-1 space-y-[5px]">
              <Link to="/" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                <span className="flex items-center gap-3"><Home className="w-5 h-5" />Inicio</span>
              </Link>
              <Link to="/tienda" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                <span className="flex items-center gap-3"><ShoppingBag className="w-5 h-5" />Tienda</span>
              </Link>
              <Link to="/faq" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                <span className="flex items-center gap-3"><HelpCircle className="w-5 h-5" />Preguntas Frecuentes</span>
              </Link>
              {/* Herramientas/Admin solo si es admin */}
              {isAuthenticated && user && (
                <Link to="/admin/dashboard" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                  <span className="flex items-center gap-3"><Wrench className="w-5 h-5" />Herramientas</span>
                </Link>
              )}
              {/* Cerrar sesión solo si es admin */}
              {isAuthenticated && user && (
                <button onClick={() => { logout(); closeMobileMenu(); }} className={mobileNavLinkClasses + ' flex items-center gap-3 text-left'}>
                  <LogOut className="w-5 h-5" />Cerrar sesión
                </button>
              )}
              {/* Login solo si NO está autenticado */}
              {!(isAuthenticated && user) && (
                <Link to="/admin/login" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                  <span className="flex items-center gap-3"><LogIn className="w-5 h-5" />Iniciar sesión</span>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
