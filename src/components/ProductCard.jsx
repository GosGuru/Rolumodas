import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/components/ui/use-toast';
import { Heart } from 'lucide-react';

const ProductCard = ({ product, index }) => {
  const { addToWishlist, isInWishlist } = useWishlist();

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05 }}
      className="group"
    >
      <Link to={`/producto/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-secondary">
          <img
            src={product.images?.[0] || 'https://placehold.co/400x500/e0e0e0/000000?text=Rolu'}
            alt={product.name}
            className="w-full h-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleWishlist}
              className="text-foreground bg-white/60 hover:bg-white w-9 h-9 rounded-full backdrop-blur-sm"
              aria-label="Agregar a favoritos"
            >
              <Heart className={`h-4 w-4 transition-all ${isProductInWishlist ? 'text-red-500 fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="pt-3 text-left">
          <h3 className="text-sm font-normal text-foreground">
            {product.name}
          </h3>
          <p className="text-base font-semibold text-foreground mt-0.5">
            UYU {formatPrice(product.price)}
          </p>
          {product.price > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Hasta 5 cuotas de $ {formatInstallment(product.price / 5)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;