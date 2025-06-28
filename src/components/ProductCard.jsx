import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/components/ui/use-toast';
import { Heart, ShoppingCart, Share2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import './product-lightbox.css';
import ColorDisplay from './ColorDisplay';

const ProductCard = ({ product, index, listMode }) => {
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCart, toggleDrawer } = useCart();
  const [hovered, setHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxClosing, setLightboxClosing] = useState(false);
  const [lightboxAnimProps, setLightboxAnimProps] = useState(null);
  const thumbRef = useRef(null);
  const lightboxImgRef = useRef(null);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlyInWishlist = isInWishlist(product.id);
    addToWishlist(product);
    toast({
      title: isCurrentlyInWishlist ? "Eliminado de Favoritos" : "Agregado a Favoritos",
      description: `${product.name} se ${isCurrentlyInWishlist ? 'eliminó de' : 'agregó a'} tus favoritos.`,
    });
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const formatInstallment = (price) => {
    return Math.round(price).toString();
  };

  const isProductInWishlist = isInWishlist(product.id);

  // Función para manejar cambio de imagen con teclado y swipe
  React.useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % (product.images?.length || 1));
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, product.images]);

  // Animación de cierre del lightbox
  const handleLightboxClose = () => {
    if (!lightboxOpen || lightboxClosing) return;
    setLightboxClosing(true);
    // Obtener posición y tamaño de la miniatura
    const thumb = thumbRef.current;
    const lightboxImg = document.querySelector('.ylb__slide_current img');
    if (thumb && lightboxImg) {
      const thumbRect = thumb.getBoundingClientRect();
      const imgRect = lightboxImg.getBoundingClientRect();
      // Calcular transformaciones
      const scaleX = thumbRect.width / imgRect.width;
      const scaleY = thumbRect.height / imgRect.height;
      const translateX = thumbRect.left + thumbRect.width / 2 - (imgRect.left + imgRect.width / 2);
      const translateY = thumbRect.top + thumbRect.height / 2 - (imgRect.top + imgRect.height / 2);
      setLightboxAnimProps({ scaleX, scaleY, translateX, translateY });
      // Lanzar animación
      setTimeout(() => {
        setLightboxOpen(false);
        setLightboxClosing(false);
        setLightboxAnimProps(null);
      }, 400); // Duración de la animación
    } else {
      setLightboxOpen(false);
      setLightboxClosing(false);
      setLightboxAnimProps(null);
    }
  };

  if (listMode) {
    // Vista lista: imagen a la izquierda, info a la derecha, compacto
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: (index % 4) * 0.05 }}
        className="flex items-center w-full max-w-md gap-4 p-3 mx-auto bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-900 dark:border-gray-800"
        tabIndex={0}
      >
        <div
          ref={thumbRef}
          className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md cursor-pointer bg-secondary"
          onClick={() => { setLightboxOpen(true); setLightboxIndex(0); }}
        >
          <img
            src={product.images?.[0] || 'https://placehold.co/400x500/e0e0e0/000000?text=Rolu'}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/producto/${product.id}`} className="block focus:outline-none">
            <h3 className="text-base font-semibold truncate text-foreground">{product.name}</h3>
            {/* Descripción corta */}
            {product.short_description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{product.short_description}</p>
            )}
            {/* Colores */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-1">
                <ColorDisplay colors={product.colors} size="sm" />
              </div>
            )}
            <p className="text-sm text-gray-500 truncate dark:text-gray-300">UYU {formatPrice(product.price)}</p>
          </Link>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleToggleWishlist}
            className="w-8 h-8 rounded-full text-foreground bg-white/60 hover:bg-white backdrop-blur-sm"
            aria-label="Agregar a favoritos"
          >
            <Heart className={`h-4 w-4 transition-all ${isProductInWishlist ? 'text-red-500 fill-current' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1);
              toast({ title: 'Agregado al carrito', description: `${product.name} se agregó a tu carrito.` });
              toggleDrawer();
            }}
            className="w-8 h-8 rounded-full shadow text-primary bg-white/80 hover:bg-primary hover:text-white"
            aria-label="Agregar al carrito"
            title="Agregar al carrito"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
        {lightboxOpen && (
          <Lightbox
            open={lightboxOpen}
            close={handleLightboxClose}
            slides={(product.images || [product.image]).map((img) => ({ src: img }))}
            index={lightboxIndex}
            on={{
              view: ({ index }) => setLightboxIndex(index),
              swipe: ({ direction }) => {
                if (direction === 'left') setLightboxIndex((prev) => (prev + 1) % (product.images?.length || 1));
                if (direction === 'right') setLightboxIndex((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
              },
            }}
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05 }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          setLightboxOpen(true);
          setLightboxIndex(0);
        }
      }}
    >
      <Link to={`/producto/${product.id}`} className="block" tabIndex={-1}>
        <div
          className="relative overflow-hidden cursor-pointer bg-secondary"
          ref={thumbRef}
          onClick={() => { setLightboxOpen(true); setLightboxIndex(0); }}
        >
          <img
            src={hovered && product.images?.[1] ? product.images[1] : product.images?.[0] || 'https://placehold.co/400x400/e0e0e0/000000?text=Rolu'}
            alt={product.name}
            className={`w-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105 ${hovered && product.images?.[1] ? 'scale-105 blur-[1px]' : ''}`}
          />
          <div className="absolute flex flex-col items-end gap-2 transition-opacity duration-300 opacity-0 top-2 right-2 group-hover:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleWishlist}
              className="rounded-full text-foreground bg-white/60 hover:bg-white w-9 h-9 backdrop-blur-sm"
              aria-label="Agregar a favoritos"
            >
              <Heart className={`h-4 w-4 transition-all ${isProductInWishlist ? 'text-red-500 fill-current' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  await navigator.clipboard.writeText(`${window.location.origin}/producto/${product.id}`);
                  toast({ title: '¡Enlace copiado!', description: 'El enlace del producto ha sido copiado al portapapeles.' });
                } catch {
                  toast({ title: 'Error', description: 'No se pudo copiar el enlace.' });
                }
              }}
              className="rounded-full text-foreground bg-white/60 hover:bg-white w-9 h-9 backdrop-blur-sm"
              aria-label="Compartir producto"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="pt-1 text-left">
          <h3 className="text-sm font-normal text-foreground">
            {product.name}
          </h3>
          {/* Descripción corta */}
          {product.short_description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{product.short_description}</p>
          )}
          {/* Colores */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-1">
              <ColorDisplay colors={product.colors} size="sm" />
            </div>
          )}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="m-0 text-base font-semibold text-foreground">
              UYU {formatPrice(product.price)}
            </p>
            <Button
              size="icon"
              variant="ghost"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1);
                toast({ title: 'Agregado al carrito', description: `${product.name} se agregó a tu carrito.` });
                toggleDrawer();
              }}
              className="rounded-full shadow text-primary bg-white/80 hover:bg-primary hover:text-white w-9 h-9"
              aria-label="Agregar al carrito"
              title="Agregar al carrito"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>
      {lightboxOpen && (
        <div style={{zIndex: 50}}>
          <Lightbox
            open={lightboxOpen}
            close={handleLightboxClose}
            render={{
              backdrop: ({ children, ...props }) => (
                <div
                  {...props}
                  style={{
                    background: 'rgba(30,30,30,0.25)',
                    backdropFilter: 'blur(8px)',
                    cursor: 'pointer',
                    position: 'fixed',
                    inset: 0,
                    zIndex: 50,
                  }}
                  onClick={e => {
                    if (e.target === e.currentTarget) handleLightboxClose();
                  }}
                >
                  {children}
                  {/* Animación de cierre */}
                  {lightboxClosing && lightboxAnimProps && (
                    <motion.img
                      src={product.images?.[lightboxIndex] || product.images?.[0] || product.image}
                      alt={product.name}
                      initial={{
                        scale: 1,
                        opacity: 1,
                        x: 0,
                        y: 0,
                      }}
                      animate={{
                        scaleX: lightboxAnimProps.scaleX,
                        scaleY: lightboxAnimProps.scaleY,
                        x: lightboxAnimProps.translateX,
                        y: lightboxAnimProps.translateY,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      style={{
                        position: 'fixed',
                        left: '50%',
                        top: '50%',
                        width: 'auto',
                        height: '80vh',
                        maxWidth: '90vw',
                        zIndex: 100,
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                </div>
              )
            }}
            slides={(product.images || [product.image]).map((img) => ({ src: img }))}
            index={lightboxIndex}
            on={{
              view: ({ index }) => setLightboxIndex(index),
              swipe: ({ direction }) => {
                if (direction === 'left') setLightboxIndex((prev) => (prev + 1) % (product.images?.length || 1));
                if (direction === 'right') setLightboxIndex((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
              },
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default ProductCard;