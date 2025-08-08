/* eslint-disable no-console */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Minus, Plus, Loader2, ShoppingCart } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductVariants from '@/components/ProductVariants';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import ProductCard from '@/components/ProductCard';
import MainHeader from '@/components/MainHeader';
import DashboardMobileNav from '@/components/admin/DashboardMobileNav';
import { useAuth } from '@/contexts/AuthContext';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const fromAdmin = location.state && location.state.fromAdmin;

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const imgContainerRef = useRef(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedTitle, setRelatedTitle] = useState('Productos relacionados');

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
        
        // Inicializar variantes seleccionadas con la primera opción de cada variante
        if (data.variants && data.variants.length > 0) {
          const initialVariants = {};
          data.variants.forEach(variant => {
            if (variant.options && variant.options.length > 0) {
              // Asegurarse de que la opción sea un valor primitivo o un objeto válido
              const firstOption = variant.options[0];
              if (firstOption !== null && firstOption !== undefined) {
                initialVariants[variant.name] = firstOption;
              }
            }
          });
          setSelectedVariants(initialVariants);
        }

        // Inicializar el color seleccionado con el primer color disponible
        if (data.colors && data.colors.length > 0) {
          // Asegurarse de que el color sea un objeto válido
          const firstColor = data.colors[0];
          if (firstColor !== null && firstColor !== undefined) {
            // Si es un string, convertirlo a objeto
            if (typeof firstColor === 'string') {
              setSelectedColor({ value: firstColor, name: firstColor });
            } else {
              setSelectedColor(firstColor);
            }
          }
        }

        // --- Productos relacionados ---
        const normalizeList = (list = []) =>
          (list || []).map(p => ({
            ...p,
            images: Array.isArray(p?.images) && p.images.length > 0
              ? p.images.map(img => (typeof img === 'string' ? img : 'https://placehold.co/600x800/e0e0e0/000000?text=Rolu'))
              : ['https://placehold.co/600x800/e0e0e0/000000?text=Rolu']
          }));

        let relatedList = [];
        let title = 'Productos relacionados';

        if (data.category_id) {
          const { data: related, error: relatedError } = await supabase
            .from('products')
            .select('*, categories(name, slug)')
            .eq('category_id', data.category_id)
            .eq('visible', true)
            .neq('id', data.id)
            .limit(4);
          if (!relatedError && related && related.length > 0) {
            relatedList = related;
          }
        }

        // Fallback a destacados (is_trending)
        if (!relatedList || relatedList.length === 0) {
          const { data: trending, error: trendingError } = await supabase
            .from('products')
            .select('*, categories(name, slug)')
            .eq('visible', true)
            .eq('is_trending', true)
            .neq('id', data.id)
            .limit(4);
          if (!trendingError && trending && trending.length > 0) {
            relatedList = trending;
            title = 'Destacados';
          }
        }

        // Fallback final: últimos visibles
        if (!relatedList || relatedList.length === 0) {
          const { data: latest, error: latestError } = await supabase
            .from('products')
            .select('*, categories(name, slug)')
            .eq('visible', true)
            .neq('id', data.id)
            .order('created_at', { ascending: false })
            .limit(4);
          if (!latestError && latest && latest.length > 0) {
            relatedList = latest;
            title = 'Te puede interesar';
          }
        }

        setRelatedTitle(title);
        setRelatedProducts(normalizeList(relatedList));
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
    
    // Crear un objeto de producto con las variantes y color seleccionados
    const productWithSelections = {
      ...product,
      selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : null,
      selectedColor: selectedColor
    };
    
    addToCart(productWithSelections, quantity);
    toast({
      title: "¡Producto agregado!",
      description: `${product.name} se agregó a tu carrito.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Crear un objeto de producto con las variantes y color seleccionados
    const productWithSelections = {
      ...product,
      selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : null,
      selectedColor: selectedColor
    };
    
    clearCart();
    addToCart(productWithSelections, quantity);
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

  const handleVariantChange = (newSelectedVariants) => {
    // Asegurarse de que las variantes sean válidas antes de actualizar el estado
    if (newSelectedVariants && typeof newSelectedVariants === 'object') {
      setSelectedVariants(newSelectedVariants);
    }
  };

  const handleColorSelect = (color) => {
    // Asegurarse de que el color sea un objeto válido
    if (color !== null && color !== undefined) {
      // Si es un string, convertirlo a objeto
      if (typeof color === 'string') {
        setSelectedColor({ value: color, name: color });
      } else {
        setSelectedColor(color);
      }
    }
  };
  
  // Compartir en redes (no usado actualmente)

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
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
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
      {(isAuthenticated || fromAdmin) && <MainHeader />}
      <Helmet>
        <title>{product.name} - Rolu Modas</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <Breadcrumbs product={product} />

      <div className="container px-4 pt-1 pb-8 mx-auto">
        <div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12, delay: 0 }}
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
                  {/* Imagen principal del producto con manejo de errores */}
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
                    onError={(e) => {
                      console.error('Error cargando imagen principal:', e.target.src);
                      e.target.src = 'https://placehold.co/600x800/e0e0e0/000000?text=Rolu';
                      e.target.onerror = null; // Prevenir bucle infinito
                    }}
                  />
                  {/* No se muestra información de depuración de URL */}
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
                          onError={(e) => {
                            console.error('Error cargando miniatura:', e.target.src);
                            e.target.src = 'https://placehold.co/100x100/e0e0e0/000000?text=Rolu';
                            e.target.onerror = null; // Prevenir bucle infinito
                          }}
                        />
                        {/* No se muestra número de imagen para depuración */}
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
                      slides={Array.isArray(safeImages) && safeImages.length > 0 ? 
                        safeImages.map((img) => ({
                          src: img || 'https://placehold.co/800x1200/e0e0e0/000000?text=Rolu',
                          alt: product?.name || 'Imagen del producto',
                          // Agregar un manejador de errores para las imágenes del lightbox
                          srcSet: '',
                          loading: 'lazy',
                          onError: (e) => {
                            console.error('Error cargando imagen en lightbox:', e.target.src);
                            e.target.src = 'https://placehold.co/800x1200/e0e0e0/000000?text=Rolu';
                            e.target.onerror = null;
                          }
                        })) : 
                        [{
                          src: 'https://placehold.co/800x1200/e0e0e0/000000?text=Rolu',
                          alt: product?.name || 'Imagen del producto'
                        }]}
                      index={selectedImage}
                      on={{
                        view: ({ index }) => setSelectedImage(index),
                      }}
                      render={{
                        // Elimina overlay opaco por defecto
                        backdrop: () => null,
                        iconPrev: () => <Button size="icon" variant="ghost" className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 text-white hover:bg-black/70">←</Button>,
                        iconNext: () => <Button size="icon" variant="ghost" className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 text-white hover:bg-black/70">→</Button>,
                      }}
                    />
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12, delay: 0.01 }}
                className="space-y-4 md:space-y-6"
              >
                <div>
                  <h1 className="mb-1 text-lg font-bold md:text-2xl text-foreground leading-tight">{product?.name}</h1>
                  {/* Descripción corta */}
                  {product?.short_description && (
                    <p className="mb-1 text-sm md:text-base text-gray-500 dark:text-gray-300 leading-snug">{product.short_description}</p>
                  )}
                  <div className="mt-2 text-xl md:text-2xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </div>
                </div>

                <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{product.description}</p>
                
                {/* Opciones disponibles: Color y variantes */}
                <div className="space-y-4">
                  {/* Selector de color como variante */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <span className="block mb-1 text-xs md:text-sm font-medium text-foreground">Color:</span>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color, index) => (
                          <button
                            key={`${color.value}-${color.name}-${index}`}
                            onClick={() => handleColorSelect(color)}
                            className={`flex items-center justify-center p-0 rounded-full border border-black transition-all focus:outline-none focus:ring-2 focus:ring-black
                              ${selectedColor && selectedColor.value === color.value
                                ? 'ring-2 ring-black scale-110 shadow'
                                : ''}
                            `}
                            style={{ width: '28px', height: '28px', minWidth: '28px', minHeight: '28px', background: color.value, position: 'relative', boxShadow: 'none' }}
                            type="button"
                            title={color.name}
                            tabIndex={0}
                          >
                            {selectedColor && selectedColor.value === color.value && (
                              <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute inset-0 m-auto w-4 h-4 text-white pointer-events-none"
                                style={{ zIndex: 2 }}
                              >
                                <path d="M6 10.5L9 13.5L15 7.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Variantes normales */}
                  <ProductVariants 
                    variants={product.variants} 
                    onVariantChange={handleVariantChange}
                    selectedVariants={selectedVariants}
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-4 md:mt-6">
                  <h3 className="text-xs md:text-sm font-medium text-foreground">CANTIDAD:</h3>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 md:w-10 md:h-10"
                    >
                      <Minus className="w-4 h-4"/>
                    </Button>
                    <span className="w-8 md:w-12 text-base md:text-lg font-semibold text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 md:w-10 md:h-10"
                    >
                      <Plus className="w-4 h-4"/>
                    </Button>
                  </div>
                </div>

                <div className="pt-2 space-y-2 md:space-y-3">
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleBuyNow}
                      size="lg"
                      className="w-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 py-2 md:py-3 text-sm md:text-base"
                      disabled={!product.inStock}
                    >
                      {product.inStock ? 'COMPRAR AHORA' : 'AGOTADO'}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 md:h-11 md:w-11"
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full py-2 md:py-3 text-xs md:text-base flex items-center justify-center"
                    onClick={handleToggleWishlist}
                  >
                    <Heart className={`h-4 w-4 mr-2 transition-colors ${isProductInWishlist ? 'fill-current text-red-500' : ''}`} />
                    {isProductInWishlist ? 'EN FAVORITOS' : 'AÑADIR A FAVORITOS'}
                  </Button>
                </div>

                {/* Descripción larga */}
                {product?.long_description && (
                  <div className="p-3 md:p-4 mt-4 md:mt-6 prose-sm prose bg-gray-100 rounded-lg dark:prose-invert max-w-none dark:bg-gray-900/40">
                    <h2 className="mb-2 text-base md:text-lg font-semibold text-foreground">Descripción</h2>
                    <p className="text-xs md:text-base" style={{whiteSpace: 'pre-line'}}>{product.long_description}</p>
                  </div>
                )}
              </motion.div>
            </div>
        </div>
      </div>
      {/* Productos relacionados */}
    {relatedProducts && relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 pb-12">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-center uppercase text-foreground mb-6 mt-10">{relatedTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {relatedProducts.map((prod, idx) => (
              <ProductCard key={prod.id} product={prod} index={idx} />
            ))}
          </div>
        </div>
      )}
      {(isAuthenticated || fromAdmin) && <DashboardMobileNav />}
    </>
  );
};

export default ProductPage;