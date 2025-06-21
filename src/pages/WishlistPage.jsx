import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

const WishlistPage = () => {
  const { wishlistItems } = useWishlist();

  return (
    <>
      <Helmet>
        <title>Mis Favoritos - Rolu Modas</title>
        <meta name="description" content="Tu lista de productos favoritos en Rolu Modas." />
      </Helmet>
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">Mis Favoritos</h1>
          </motion.div>

          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
              {wishlistItems.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-2xl font-semibold">Tu lista de favoritos está vacía</h2>
              <p className="mt-2 text-muted-foreground">Agrega productos que te gusten para verlos aquí.</p>
              <div className="mt-6">
                <Link to="/tienda">
                  <Button>Ir a la Tienda</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistPage;