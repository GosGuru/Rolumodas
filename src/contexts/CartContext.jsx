import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Función de utilidad para extraer el valor del color de manera consistente
const getColorValue = (color) => {
  if (!color) return null;
  if (typeof color === 'string') return color; // Ya es un valor simple
  if (typeof color === 'object' && color !== null) return color.value || color.hex || null; // Extraer de un objeto
  return null;
};

// Función de utilidad para normalizar el color en un item del carrito
const normalizeCartItemColor = (item) => {
  if (item.selectedColor) {
    return {
      ...item,
      selectedColor: getColorValue(item.selectedColor),
    };
  }
  return item;
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      // Normaliza el color de cada item al cargar desde localStorage
      const sanitizedPayload = action.payload.map(normalizeCartItemColor);
      return {
        ...state,
        items: sanitizedPayload,
      };

    case 'ADD_ITEM':
      // Normaliza el color del nuevo item antes de cualquier lógica
      const newItem = normalizeCartItemColor(action.payload);

      const variantKey = newItem.selectedVariants 
        ? Object.entries(newItem.selectedVariants)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}:${value}`)
            .join('|')
        : 'no-variants';
      
      const colorKey = newItem.selectedColor ? `color:${newItem.selectedColor}` : 'no-color';
      
      const fullKey = `${variantKey}-${colorKey}`;
      
      const existingItem = state.items.find(item => {
        if (item.id !== newItem.id) return false;
        
        const itemVariantKey = item.selectedVariants 
          ? Object.entries(item.selectedVariants)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, value]) => `${key}:${value}`)
              .join('|')
          : 'no-variants';
        
        const itemColorKey = item.selectedColor ? `color:${item.selectedColor}` : 'no-color';
        
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
            
            const itemColorKey = item.selectedColor ? `color:${item.selectedColor}` : 'no-color';
            
            const itemFullKey = `${itemVariantKey}-${itemColorKey}`;
            
            if (item.id === newItem.id && itemFullKey === fullKey) {
              return { ...item, quantity: item.quantity + newItem.quantity };
            }
            return item;
          }),
        };
      }
      
      return {
        ...state,
        items: [...state.items, newItem], // Añade el nuevo item ya normalizado
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
    const variantKey = product.selectedVariants 
      ? Object.entries(product.selectedVariants)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}:${value}`)
          .join('|')
      : 'no-variants';
    
    // Aquí usamos la función de utilidad antes de despachar la acción
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
