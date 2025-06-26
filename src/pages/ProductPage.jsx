import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Minus, Plus, Loader2, Facebook, MessageCircle, ShoppingCart } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Breadcrumbs from '@/components/Breadcrumbs';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgContainerRef = useRef(null);

  // Validación defensiva para las imágenes
  const safeImages = product?.images || [];
  const currentImage = safeImages[selectedImage] || safeImages[0] || 'https://placehold.co/400x500/e0e0e0/000000?text=Rolu';

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast({ title: "Error", description: "No se pudo encontrar el producto.", variant: "destructive" });
        setProduct(null);
      } else {
        const productData = {
          ...data,
          images: data.images && data.images.length > 0 ? data.images : ["https://placehold.co/600x800/e0e0e0/000000?text=Rolu"],
          inStock: data.stock > 0,
        };
        setProduct(productData);
      }
      setLoading(false);
      setSelectedImage(0);
      setQuantity(1);
    };

    fetchProduct();
  }, [id]);

  // Nuevo: Scroll animado hacia arriba al cargar producto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast({
      title: "¡Producto agregado!",
      description: `${product.name} se agregó a tu carrito.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    clearCart();
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const isCurrentlyInWishlist = isInWishlist(product.id);
    addToWishlist(product);
    toast({
      title: isCurrentlyInWishlist ? "Eliminado de Favoritos" : "Agregado a Favoritos",
      description: `${product.name} se ${isCurrentlyInWishlist ? 'eliminó de' : 'agregó a'} tus favoritos.`,
    });
  };
  
  const shareOn = (platform) => {
    const shareUrl = window.location.href;
    const shareText = `¡Mira este producto de Rolu Modas: ${product.name}!`;
    let url = '';

    if(platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    }
    
    if(url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(price);
  };

  // Navegación con flechas de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') setSelectedImage((prev) => (prev + 1) % (product?.images?.length || 1));
      if (e.key === 'ArrowLeft') setSelectedImage((prev) => (prev - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product]);

  // Swipe para móvil
  useEffect(() => {
    const container = imgContainerRef.current;
    if (!container) return;
    let startX = null;
    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
      if (startX === null) return;
      const endX = e.changedTouches[0].clientX;
      if (endX - startX > 50) setSelectedImage((prev) => (prev - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));
      if (startX - endX > 50) setSelectedImage((prev) => (prev + 1) % (product?.images?.length || 1));
      startX = null;
    };
    container.addEventListener('touchstart', onTouchStart);
    container.addEventListener('touchend', onTouchEnd);
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [product]);

  // Zoom handlers
  const handleMouseMove = (e) => {
    if (!zoomed || !imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleTouchMove = (e) => {
    if (!zoomed || !imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <Breadcrumbs />
        <div className="container px-4 py-8 mx-auto text-center">
          <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
          <p className="mt-2 text-muted-foreground">El producto que buscas no existe o no está disponible.</p>
          <Link to="/">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const isProductInWishlist = isInWishlist(product.id);

  return (
    <>
      <Helmet>
        <title>{product.name} - Rolu Modas</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <Breadcrumbs product={product} />

      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div
              ref={imgContainerRef}
              className="relative w-full overflow-hidden aspect-square bg-secondary group"
              tabIndex={0}
              style={{ cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
              onClick={() => setLightboxOpen(true)}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setZoomed(true)}
              onTouchEnd={() => setZoomed(false)}
              onTouchMove={handleTouchMove}
            >
              <img
                src={currentImage}
                alt={product.name}
                className={`w-full h-full object-cover transition duration-300 ${zoomed ? 'pointer-events-none' : ''}`}
                style={zoomed ? {
                  transform: `scale(2)`,
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transition: 'transform 0.2s cubic-bezier(.4,2,.6,1)',
                  zIndex: 20,
                } : {}}
                draggable={false}
              />
              {/* Flechas navegación */}
              {safeImages.length > 1 && (
                <>
                  <button
                    className="absolute z-30 p-2 -translate-y-1/2 rounded-full shadow left-2 top-1/2 bg-white/70 hover:bg-white"
                    onClick={e => { e.stopPropagation(); setSelectedImage((prev) => (prev - 1 + safeImages.length) % safeImages.length); }}
                    aria-label="Imagen anterior"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <button
                    className="absolute z-30 p-2 -translate-y-1/2 rounded-full shadow right-2 top-1/2 bg-white/70 hover:bg-white"
                    onClick={e => { e.stopPropagation(); setSelectedImage((prev) => (prev + 1) % safeImages.length); }}
                    aria-label="Imagen siguiente"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                  </button>
                </>
              )}
            </div>
            {/* Miniaturas */}
            {safeImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {safeImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-full overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
            {/* Lightbox con fondo blur discreto */}
            {lightboxOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.15)'}}>
                <Lightbox
                  open={lightboxOpen}
                  close={() => setLightboxOpen(false)}
                  slides={safeImages.map((img) => ({ src: img }))}
                  index={selectedImage}
                  on={{
                    view: ({ index }) => setSelectedImage(index),
                  }}
                  render={{
                    // Elimina overlay opaco por defecto
                    backdrop: () => null,
                  }}
                />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl text-foreground">{product?.name}</h1>
              {/* Descripción corta */}
              {product?.short_description && (
                <p className="mb-2 text-base text-gray-500 dark:text-gray-300">{product.short_description}</p>
              )}
              <div className="mt-4 text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </div>
            </div>

            <p className="text-base leading-relaxed text-muted-foreground">{product.description}</p>
            
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-foreground">CANTIDAD:</h3>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10"
                >
                  <Minus className="w-4 h-4"/>
                </Button>
                <span className="w-12 text-lg font-semibold text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10"
                >
                  <Plus className="w-4 h-4"/>
                </Button>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex space-x-2">
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="w-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'COMPRAR AHORA' : 'AGOTADO'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </div>
              <Button 
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-5 w-5 mr-2 transition-colors ${isProductInWishlist ? 'fill-current text-red-500' : ''}`} />
                {isProductInWishlist ? 'EN FAVORITOS' : 'AÑADIR A FAVORITOS'}
              </Button>
            </div>

            <div className="pt-6 border-t">
              <h3 className="mb-3 text-sm font-medium uppercase text-foreground">Compartir</h3>
              <div className="flex space-x-2">
                 <Button variant="outline" size="icon" onClick={() => shareOn('whatsapp')}>
                   <MessageCircle className="w-5 h-5"/>
                 </Button>
                 <Button variant="outline" size="icon" onClick={() => shareOn('facebook')}>
                   <Facebook className="w-5 h-5"/>
                 </Button>
              </div>
            </div>

            {/* Descripción larga */}
            {product?.long_description && (
              <div className="p-4 mt-6 prose-sm prose bg-gray-100 rounded-lg dark:prose-invert max-w-none dark:bg-gray-900/40">
                <h2 className="mb-2 text-lg font-semibold text-foreground">Descripción</h2>
                <p style={{whiteSpace: 'pre-line'}}>{product.long_description}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;