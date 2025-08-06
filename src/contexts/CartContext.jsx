import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Extraer valor hex del color en distintos formatos
const getColorValue = (color) => {
  if (!color) return null;
  if (typeof color === 'string') return color;
  if (typeof color === 'object') return color.value || color.hex || null;
  return null;
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
      };
    case 'ADD_ITEM':
      // Crear una clave única basada en el ID del producto, variantes y color seleccionados
      const variantKey = action.payload.selectedVariants 
        ? Object.entries(action.payload.selectedVariants)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}:${value}`)
            .join('|')
        : 'no-variants';
      
      const colorVal = getColorValue(action.payload.selectedColor);
      const colorKey = colorVal ? `color:${colorVal}` : 'no-color';
      
      const fullKey = `${variantKey}-${colorKey}`;
      
      const existingItem = state.items.find(item => {
        if (item.id !== action.payload.id) return false;
        
        const itemVariantKey = item.selectedVariants 
          ? Object.entries(item.selectedVariants)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, value]) => `${key}:${value}`)
              .join('|')
          : 'no-variants';
        
        const itemColorVal = getColorValue(item.selectedColor);
        const itemColorKey = itemColorVal ? `color:${itemColorVal}` : 'no-color';
        
        const itemFullKey = `${itemVariantKey}-${itemColorKey}`;
        
        return itemFullKey === fullKey;
      });
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item => {
            const itemVariantKey = item.selectedVariants 
              ? Object.entries(item.selectedVariants)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => `${key}:${value}`)
                  .join('|')
              : 'no-variants';
            
            const itemColorVal = getColorValue(item.selectedColor);
            const itemColorKey = itemColorVal ? `color:${itemColorVal}` : 'no-color';
            
            const itemFullKey = `${itemVariantKey}-${itemColorKey}`;
            
            if (item.id === action.payload.id && itemFullKey === fullKey) {
              return { ...item, quantity: item.quantity + action.payload.quantity };
            }
            return item;
          }),
        };
      }
      
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.cartId !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.cartId === action.payload.cartId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    case 'TOGGLE_DRAWER':
      return {
        ...state,
        isDrawerOpen: !state.isDrawerOpen,
      };
    case 'CLOSE_DRAWER':
      return {
        ...state,
        isDrawerOpen: false,
      };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  isDrawerOpen: false,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('rolu-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rolu-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, quantity = 1) => {
    // Crear una clave única para el carrito basada en el ID, variantes y color
    const variantKey = product.selectedVariants 
      ? Object.entries(product.selectedVariants)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}:${value}`)
          .join('|')
      : 'no-variants';
    
    const colorVal = getColorValue(product.selectedColor);
    const colorKey = colorVal ? `color:${colorVal}` : 'no-color';
    
    const fullKey = `${variantKey}-${colorKey}`;
    const cartId = `${product.id}-${fullKey}-${Date.now()}`;
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...product,
        cartId,
        quantity,
      },
    });
  };

  const removeFromCart = (cartId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartId });
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleDrawer = () => {
    dispatch({ type: 'TOGGLE_DRAWER' });
  };

  const closeDrawer = () => {
    dispatch({ type: 'CLOSE_DRAWER' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleDrawer,
    closeDrawer,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
