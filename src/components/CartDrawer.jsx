/* eslint-disable no-console */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
// import ColorDisplay from './ColorDisplay';
import { getOptionText } from '@/lib/variantUtils';

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
    if (!selectedVariants || Object.keys(selectedVariants).length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(selectedVariants).map(([variantName, option]) => (
          <span
            key={variantName}
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary"
          >
            {variantName}: {getOptionText(option)}
          </span>
        ))}
      </div>
    );
  };

  const renderSelectedColor = (selectedColor) => {
    if (!selectedColor) return null;
    const value = selectedColor.value || selectedColor.hex || (typeof selectedColor === 'string' ? selectedColor : null);
    const name = selectedColor.name || selectedColor.label || (typeof selectedColor === 'string' ? selectedColor : null);
    if (!value && !name) return null;

    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-muted-foreground">Color:</span>
        <div className="flex items-center gap-1">
          {value && (
            <div
              className="w-4 h-4 border border-gray-300 rounded-full"
              style={{ backgroundColor: value }}
            />
          )}
          {name && <span className="text-xs font-medium">{name}</span>}
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
                <X className="w-6 h-6" />
              </Button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
                <p className="font-medium text-muted-foreground">Tu carrito está vacío.</p>
                <Link to="/tienda" onClick={closeDrawer}>
                  <Button className="mt-6" variant="outline">
                    Ir a la Tienda
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {items.map(item => (
                    <motion.div
                      layout
                      key={item.cartId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex items-start p-3 space-x-4 border rounded-md border-border"
                    >
                      <Link to={`/producto/${item.id}`} onClick={closeDrawer} className="flex-shrink-0">
                        <img
                          src={item.images?.[0] || 'https://placehold.co/100x100/e0e0e0/000000?text=Rolu'}
                          alt={item.name}
                          className="object-cover w-20 h-20 rounded-md"
                          onError={(e) => {
                            console.error('Error cargando imagen en carrito:', e.target.src);
                            e.target.src = 'https://placehold.co/100x100/e0e0e0/000000?text=Rolu';
                            e.target.onerror = null; // Prevenir bucle infinito
                          }}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/producto/${item.id}`} onClick={closeDrawer}>
                          <h3 className="text-sm font-medium truncate hover:underline">{item.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                        
                        {/* Mostrar color seleccionado */}
                        {renderSelectedColor(item.selectedColor)}
                        
                        {/* Mostrar variantes seleccionadas */}
                        {renderVariants(item.selectedVariants)}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-md border-border">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.cartId, item.quantity - 1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="px-2 text-sm font-medium">{item.quantity}</span>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.cartId, item.quantity + 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.cartId)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <footer className="p-4 space-y-3 border-t border-border bg-secondary">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Subtotal</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Los gastos de envío se calculan en la pantalla de pago.</p>
                  <Link to="/checkout" onClick={closeDrawer} className="block">
                     <Button className="w-full py-3 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90">
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
