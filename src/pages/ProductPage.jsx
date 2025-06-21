import React, { useState, useEffect } from 'react';
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

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <Breadcrumbs />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
          <p className="text-muted-foreground mt-2">El producto que buscas no existe o no está disponible.</p>
          <Link to="/">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="aspect-square w-full overflow-hidden bg-secondary">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-full overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-1">{product.name}</h1>
              <div className="text-3xl font-bold text-foreground mt-4">
                {formatPrice(product.price)}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-base">{product.description}</p>
            
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-foreground">CANTIDAD:</h3>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10"
                >
                  <Minus className="h-4 w-4"/>
                </Button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10"
                >
                  <Plus className="h-4 w-4"/>
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex space-x-2">
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
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
                  <ShoppingCart className="h-5 w-5" />
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

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-foreground mb-3 uppercase">Compartir</h3>
              <div className="flex space-x-2">
                 <Button variant="outline" size="icon" onClick={() => shareOn('whatsapp')}>
                   <MessageCircle className="h-5 w-5"/>
                 </Button>
                 <Button variant="outline" size="icon" onClick={() => shareOn('facebook')}>
                   <Facebook className="h-5 w-5"/>
                 </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;