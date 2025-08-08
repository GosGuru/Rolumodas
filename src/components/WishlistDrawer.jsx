
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/components/ui/use-toast';

const WishlistDrawer = () => {
  const { isWishlistDrawerOpen, closeWishlistDrawer, wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
    toast({
      title: "¡Movido al carrito!",
      description: `${product.name} se agregó a tu carrito.`,
      className: "bg-black text-white border-gray-700 font-negro",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isWishlistDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-[99]"
            onClick={closeWishlistDrawer}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 text-white shadow-2xl z-[100] flex flex-col"
          >
            <header className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-negro">Favoritos</h2>
              <Button variant="ghost" size="icon" onClick={closeWishlistDrawer}>
                <X className="h-6 w-6" />
              </Button>
            </header>

            {wishlistItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <p className="text-gray-400 font-negro">Tu lista de favoritos está vacía.</p>
                <p className="text-sm text-gray-500 mt-2">Agrega productos que te gusten para verlos aquí.</p>
                <Button onClick={closeWishlistDrawer} className="mt-6 bg-white text-black hover:bg-gray-300 font-negro">
                  Seguir Comprando
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {wishlistItems.map(item => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex items-center space-x-4 bg-gray-800 p-3"
                  >
                    <Link to={`/producto/${item.id}`} onClick={closeWishlistDrawer} className="flex-shrink-0">
                      <img
                        src={item.images?.[0] || 'https://placehold.co/100x100/000000/FFFFFF?text=Rolu'}
                        alt={item.name}
                        className="w-20 h-20 object-cover"
                        onError={(e) => {
                          console.error('Error cargando imagen en wishlist:', e.target.src);
                          e.target.src = 'https://placehold.co/100x100/000000/FFFFFF?text=Rolu';
                          e.target.onerror = null; // Prevenir bucle infinito
                        }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/producto/${item.id}`} onClick={closeWishlistDrawer}>
                        <h3 className="font-negro text-sm truncate hover:text-gray-300">{item.name}</h3>
                      </Link>
                      <p className="text-gray-400 font-negro text-sm">{formatPrice(item.price)}</p>
                      <div className="mt-2 flex space-x-2">
                        <Button size="sm" className="h-8 text-xs bg-white text-black hover:bg-gray-300" onClick={() => handleMoveToCart(item)}>
                          <ShoppingBag className="h-3 w-3 mr-1" /> Mover al Carrito
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeFromWishlist(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
