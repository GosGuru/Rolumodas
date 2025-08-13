/**
 * Utilidades para formatear y mostrar variantes de productos
 */

/**
 * Extrae el texto legible de una opción de variante
 * @param {any} option - La opción de variante (puede ser string, objeto, etc.)
 * @returns {string} - Texto legible para mostrar
 */
export const getOptionText = (option) => {
  if (!option) return '';
  
  // Si es string, devolverlo directamente
  if (typeof option === 'string') return option;
  
  // Si es objeto, extraer la propiedad más apropiada
  if (typeof option === 'object') {
    // Priorizar label, luego value, luego name, luego size
    return option.label || option.value || option.name || option.size || 'Opción';
  }
  
  // Fallback: convertir a string
  return String(option);
};

/**
 * Formatea un array de opciones de variante para mostrar
 * @param {Array} options - Array de opciones
 * @returns {string} - Texto formateado (ej: "S, M, L")
 */
export const formatVariantOptions = (options) => {
  if (!Array.isArray(options) || options.length === 0) {
    return 'Sin opciones';
  }
  
  return options.map(getOptionText).filter(Boolean).join(', ');
};

/**
 * Formatea una variante completa para mostrar
 * @param {Object} variant - Objeto variante con name y options
 * @returns {string} - Texto formateado (ej: "Talle: S, M, L")
 */
export const formatVariant = (variant) => {
  if (!variant || !variant.name) return '';
  
  const options = Array.isArray(variant.options) 
    ? formatVariantOptions(variant.options)
    : getOptionText(variant.options);
    
  return `${variant.name}: ${options}`;
};

/**
 * Formatea un array completo de variantes para mostrar
 * @param {Array} variants - Array de variantes
 * @returns {Array} - Array de strings formateados
 */
export const formatVariants = (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [];
  }
  
  return variants.map(formatVariant).filter(Boolean);
};

/**
 * Determina si una variante es de tipo color
 * @param {Object} variant - Objeto variante
 * @returns {boolean} - true si es una variante de color
 */
export const isColorVariant = (variant) => {
  if (!variant) return false;
  
  // Verificar por nombre
  if (typeof variant.name === 'string' && 
      variant.name.toLowerCase().includes('color')) {
    return true;
  }
  
  // Verificar por tipo
  if (variant.type === 'color') {
    return true;
  }
  
  // Verificar por propiedades de las opciones
  if (Array.isArray(variant.options) && variant.options.length > 0) {
    const firstOption = variant.options[0];
    if (firstOption && typeof firstOption === 'object') {
      return !!(firstOption.hex || 
               (typeof firstOption.value === 'string' && 
                (firstOption.value.startsWith('#') || firstOption.value.startsWith('rgb'))));
    }
  }
  
  return false;
};

/**
 * Extrae el valor de color de una opción de variante
 * @param {any} option - Opción de variante
 * @returns {string|null} - Valor de color (hex, rgb, etc.) o null
 */
export const getColorValue = (option) => {
  if (!option) return null;
  
  if (typeof option === 'string') {
    // Si es un string que parece un color
    if (option.startsWith('#') || option.startsWith('rgb')) {
      return option;
    }
    return null;
  }
  
  if (typeof option === 'object') {
    // Buscar propiedades de color
    return option.hex || option.color || option.value || null;
  }
  
  return null;
};

/**
 * Calcula el stock total de todas las variantes de un producto
 * @param {Array} variants - Array de variantes del producto
 * @returns {number} - Stock total de todas las variantes
 */
export const calculateTotalVariantStock = (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) return 0;
  
  return variants.reduce((total, variant) => {
    if (!variant.options || !Array.isArray(variant.options)) return total;
    
    const variantStock = variant.options.reduce((variantTotal, option) => {
      return variantTotal + (parseInt(option.stock) || 0);
    }, 0);
    
    return total + variantStock;
  }, 0);
};

/**
 * Verifica si una combinación específica de variantes está disponible
 * @param {Array} variants - Array de variantes del producto
 * @param {Object} selectedVariants - Objeto con las variantes seleccionadas
 * @returns {boolean} - true si la combinación está disponible
 */
export const isVariantCombinationAvailable = (variants, selectedVariants) => {
  if (!Array.isArray(variants) || !selectedVariants || Object.keys(selectedVariants).length === 0) {
    return calculateTotalVariantStock(variants) > 0;
  }

  for (const variant of variants) {
    const selectedOption = selectedVariants[variant.name];
    if (selectedOption) {
      const option = variant.options?.find(opt => 
        opt.value === selectedOption.value || 
        opt.label === selectedOption.label ||
        opt === selectedOption
      );
      
      if (option && (parseInt(option.stock) || 0) <= 0) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Obtiene el stock de una combinación específica de variantes
 * @param {Array} variants - Array de variantes del producto
 * @param {Object} selectedVariants - Objeto con las variantes seleccionadas
 * @returns {number} - Stock disponible para la combinación
 */
export const getVariantCombinationStock = (variants, selectedVariants) => {
  if (!Array.isArray(variants) || !selectedVariants || Object.keys(selectedVariants).length === 0) {
    return calculateTotalVariantStock(variants);
  }

  let lowestStock = Infinity;
  
  for (const variant of variants) {
    const selectedOption = selectedVariants[variant.name];
    if (selectedOption) {
      const option = variant.options?.find(opt => 
        opt.value === selectedOption.value || 
        opt.label === selectedOption.label ||
        opt === selectedOption
      );
      
      if (option) {
        const optionStock = parseInt(option.stock) || 0;
        lowestStock = Math.min(lowestStock, optionStock);
      }
    }
  }
  
  return lowestStock === Infinity ? 0 : lowestStock;
};

/**
 * Actualiza el stock de una variante específica
 * @param {Array} variants - Array de variantes del producto
 * @param {string} variantName - Nombre de la variante
 * @param {string} optionValue - Valor de la opción
 * @param {number} newStock - Nuevo stock a establecer
 * @returns {Array} - Array de variantes actualizado
 */
export const updateVariantStock = (variants, variantName, optionValue, newStock) => {
  if (!Array.isArray(variants)) return variants;
  
  return variants.map(variant => {
    if (variant.name !== variantName) return variant;
    
    const updatedOptions = variant.options?.map(option => {
      if (option.value === optionValue || option.label === optionValue) {
        return { ...option, stock: parseInt(newStock) || 0 };
      }
      return option;
    });
    
    return { ...variant, options: updatedOptions };
  });
};

/**
 * Reduce el stock de una variante específica (para ventas)
 * @param {Array} variants - Array de variantes del producto
 * @param {Object} selectedVariants - Variantes seleccionadas para la venta
 * @param {number} quantity - Cantidad vendida
 * @returns {Array} - Array de variantes con stock actualizado
 */
export const reduceVariantStock = (variants, selectedVariants, quantity = 1) => {
  if (!Array.isArray(variants) || !selectedVariants || Object.keys(selectedVariants).length === 0) {
    return variants;
  }
  
  return variants.map(variant => {
    const selectedOption = selectedVariants[variant.name];
    if (!selectedOption) return variant;
    
    const updatedOptions = variant.options?.map(option => {
      if (option.value === selectedOption.value || 
          option.label === selectedOption.label ||
          option === selectedOption) {
        const currentStock = parseInt(option.stock) || 0;
        const newStock = Math.max(0, currentStock - quantity);
        return { ...option, stock: newStock };
      }
      return option;
    });
    
    return { ...variant, options: updatedOptions };
  });
};
