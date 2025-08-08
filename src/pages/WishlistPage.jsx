import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
// import { toast } from '@/components/ui/use-toast';

const WishlistPage = () => {
  const { wishlistItems } = useWishlist();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  return (
    <>
      <Helmet>
        <title>Mis Favoritos - Rolu Modas</title>
        <meta name="description" content="Tu lista de productos favoritos en Rolu Modas." />
      </Helmet>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container px-4 py-8 mx-auto sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center sm:mb-12"
          >
            <h1 className="text-3xl font-bold tracking-tight uppercase md:text-4xl">Favoritos</h1>
          </motion.div>

          {/* Botón para alternar vista */}
          <div className="flex justify-end items-center gap-2 mb-6">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              aria-label="Vista de cuadrícula"
              className="w-10 h-10 p-0 flex items-center justify-center rounded-lg border border-gray-300 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              aria-label="Vista de lista"
              className="w-10 h-10 p-0 flex items-center justify-center rounded-lg border border-gray-300 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="4" cy="18" r="2"/></svg>
            </Button>
          </div>

          {wishlistItems.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-10">
                {wishlistItems.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3 md:gap-4">
                {wishlistItems.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} listMode />
                ))}
              </div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center"
            >
              <Heart className="w-16 h-16 mx-auto text-muted-foreground" />
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