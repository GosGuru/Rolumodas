import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import ColorDisplay from './ColorDisplay';

const CartDrawer = () => {
  const { isDrawerOpen, closeDrawer, items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderVariants = (selectedVariants) => {
    if (!selectedVariants || Object.keys(selectedVariants).length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(selectedVariants).map(([variantName, option]) => (
          <span
            key={variantName}
            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md"
          >
            {variantName}: {option}
          </span>
        ))}
      </div>
    );
  };

  const renderSelectedColor = (selectedColor) => {
    if (!selectedColor) return null;

    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-muted-foreground">Color:</span>
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: selectedColor.value }}
          />
          <span className="text-xs font-medium">{selectedColor.name}</span>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-[99]"
            onClick={closeDrawer}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background text-foreground shadow-2xl z-[100] flex flex-col"
          >
            <header className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Tu Carrito ({getTotalItems()})</h2>
              <Button variant="ghost" size="icon" onClick={closeDrawer} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </Button>
            </header>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <p className="text-muted-foreground font-medium">Tu carrito está vacío.</p>
                <Link to="/tienda" onClick={closeDrawer}>
                  <Button className="mt-6" variant="outline">
                    Ir a la Tienda
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.map(item => (
                    <motion.div
                      layout
                      key={item.cartId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex items-start space-x-4 p-3 rounded-md border border-border"
                    >
                      <Link to={`/producto/${item.id}`} onClick={closeDrawer} className="flex-shrink-0">
                        <img
                          src={item.images?.[0] || 'https://placehold.co/100x100/e0e0e0/000000?text=Rolu'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/producto/${item.id}`} onClick={closeDrawer}>
                          <h3 className="font-medium text-sm truncate hover:underline">{item.name}</h3>
                        </Link>
                        <p className="text-muted-foreground text-sm">{formatPrice(item.price)}</p>
                        
                        {/* Mostrar color seleccionado */}
                        {renderSelectedColor(item.selectedColor)}
                        
                        {/* Mostrar variantes seleccionadas */}
                        {renderVariants(item.selectedVariants)}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded-md">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.cartId, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-2 text-sm font-medium">{item.quantity}</span>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.cartId, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.cartId)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <footer className="p-4 border-t border-border space-y-3 bg-secondary">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Subtotal</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Los gastos de envío se calculan en la pantalla de pago.</p>
                  <Link to="/checkout" onClick={closeDrawer} className="block">
                     <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold py-3">
                      FINALIZAR COMPRA
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={closeDrawer}>
                    SEGUIR COMPRANDO
                  </Button>
                </footer>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
