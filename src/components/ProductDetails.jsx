import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductVariants from '@/components/ProductVariants';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

/**
 * @description Formats a price into the UYU currency format.
 * @param {number} price - The price to format.
 * @returns {string} The formatted price string.
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU'
  }).format(price);
};

const isLight = (hex) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return false;
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 200; // detecta colores muy claros como blanco
};

/**
 * @description A component to display the details of a product, including its name, price, description, and options.
 */
const ProductDetails = ({
  product,
  selectedVariants,
  onVariantChange,
  selectedColor,
  onColorSelect
}) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, clearCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const isProductInWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    const productWithSelections = { ...product, selectedVariants, selectedColor };
    addToCart(productWithSelections, quantity);
    toast({
      title: "¡Producto agregado!",
      description: `${product.name} se agregó a tu carrito.`,
    });
  };

  const handleBuyNow = () => {
    const productWithSelections = { ...product, selectedVariants, selectedColor };
    clearCart();
    addToCart(productWithSelections, quantity);
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    addToWishlist(product);
    toast({
      title: isProductInWishlist ? "Eliminado de Favoritos" : "Agregado a Favoritos",
      description: `${product.name} se ${isProductInWishlist ? 'eliminó de' : 'agregó a'} tus favoritos.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.12, delay: 0.01 }}
      className="space-y-4 md:space-y-6"
    >
      {/* Nombre y precio */}
      <div>
        <h1 className="mb-1 text-lg font-bold leading-tight md:text-2xl text-foreground">{product.name}</h1>
        {product.short_description && (
          <p className="mb-1 text-sm leading-snug text-gray-500 md:text-base dark:text-gray-300">{product.short_description}</p>
        )}
        <div className="mt-2 text-xl font-bold md:text-2xl text-foreground">
          {formatPrice(product.price)}
        </div>
      </div>

      {/* Descripción corta */}
      <p className="text-sm leading-relaxed md:text-base text-muted-foreground">{product.description}</p>

      <div className="py-4 space-y-6 border-t border-b">
        {/* Selector de colores */}
        {product.colors?.length > 0 && (
          <div>
            <span className="block mb-2 text-sm font-medium text-foreground">Colores:</span>
            <div className="flex flex-wrap gap-3">
              {(product.colors || []).map((color, index) => {
                const colorValue = typeof color === 'object' ? color.value || color.hex : color;
                const colorName = typeof color === 'object' ? color.name : color;
                const isSelected = selectedColor?.value === colorValue;

                return (
                  <div key={`${colorValue}-${index}`} className="relative group">
                    <button
                      onClick={() => onColorSelect({ name: colorName, value: colorValue })}
                      type="button"
                      aria-label={`Seleccionar color ${colorName}`}
                      className={`
                        relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                        ${isSelected ? 'ring-2 ring-black ring-offset-2' : ''}
                        ${isLight(colorValue) ? 'border border-gray-300' : 'border border-transparent'}
                      `}
                      style={{ backgroundColor: colorValue }}
                    >
                      {isSelected && (
                        <Check className="absolute w-4 h-4 text-white" />
                      )}
                    </button>
                    <div className="absolute px-2 py-1 mb-2 text-xs text-white transition-opacity bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full w-max group-hover:opacity-100">
                      {colorName}
                      <svg className="absolute left-0 w-full h-2 text-gray-800 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                        <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Variantes */}
        <ProductVariants
          variants={product.variants}
          onVariantChange={onVariantChange}
          selectedVariants={selectedVariants}
        />
      </div>

      {/* Cantidad */}
      <div className="flex items-center pt-4 space-x-4">
        <h3 className="text-sm font-medium text-foreground">CANTIDAD:</h3>
        <div className="flex items-center border rounded-md">
          <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 md:w-10 md:h-10">
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-base font-semibold text-center md:w-12 md:text-lg">{quantity}</span>
          <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 md:w-10 md:h-10">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Botones de compra */}
      <div className="pt-2 space-y-2 md:space-y-3">
        <div className="flex space-x-2">
          <Button onClick={handleBuyNow} size="lg" className="w-full py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 md:py-3 md:text-base" disabled={!product.inStock}>
            {product.inStock ? 'COMPRAR AHORA' : 'AGOTADO'}
          </Button>
          <Button variant="outline" size="icon" className="w-10 h-10 md:h-11 md:w-11" onClick={handleAddToCart} disabled={!product.inStock}>
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="flex items-center justify-center w-full py-2 text-xs md:py-3 md:text-base" onClick={handleToggleWishlist}>
          <Heart className={`h-4 w-4 mr-2 transition-colors ${isProductInWishlist ? 'fill-current text-red-500' : ''}`} />
          {isProductInWishlist ? 'EN FAVORITOS' : 'AÑADIR A FAVORITOS'}
        </Button>
      </div>

      {/* Descripción larga */}
      {product.long_description && (
        <div className="p-3 mt-4 prose-sm prose bg-gray-100 rounded-lg md:p-4 md:mt-6 dark:prose-invert max-w-none dark:bg-gray-900/40">
          <h2 className="mb-2 text-base font-semibold md:text-lg text-foreground">Descripción</h2>
          <p className="text-xs md:text-base" style={{ whiteSpace: 'pre-line' }}>{product.long_description}</p>
        </div>
      )}
    </motion.div>
  );
};

export default ProductDetails;
