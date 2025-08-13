import { useMemo } from 'react';

/**
 * Hook para gestionar el stock de variantes
 * @param {Array} variants - Array de variantes del producto
 * @returns {Object} Objeto con métodos y datos para gestionar stock de variantes
 */
export const useVariantStock = (variants = []) => {
  // Calcular stock total de todas las variantes
  const totalVariantStock = useMemo(() => {
    if (!variants || variants.length === 0) return 0;
    
    return variants.reduce((total, variant) => {
      if (!variant.options || !Array.isArray(variant.options)) return total;
      
      const variantStock = variant.options.reduce((variantTotal, option) => {
        return variantTotal + (parseInt(option.stock) || 0);
      }, 0);
      
      return total + variantStock;
    }, 0);
  }, [variants]);

  // Obtener todas las combinaciones de variantes con su stock
  const variantCombinations = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    
    const combinations = [];
    
    variants.forEach(variant => {
      if (!variant.options || !Array.isArray(variant.options)) return;
      
      variant.options.forEach(option => {
        combinations.push({
          variantName: variant.name,
          variantType: variant.type,
          optionLabel: option.label,
          optionValue: option.value,
          stock: parseInt(option.stock) || 0,
          isInStock: (parseInt(option.stock) || 0) > 0,
          hex: option.hex, // Para colores
          image: option.image, // Para imágenes
          shape: option.shape,
          size: option.size
        });
      });
    });
    
    return combinations;
  }, [variants]);

  // Verificar si una combinación específica de variantes está disponible
  const isVariantCombinationAvailable = (selectedVariants) => {
    if (!selectedVariants || Object.keys(selectedVariants).length === 0) {
      return totalVariantStock > 0;
    }

    // Encontrar la opción específica seleccionada
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

  // Obtener stock de una combinación específica
  const getVariantCombinationStock = (selectedVariants) => {
    if (!selectedVariants || Object.keys(selectedVariants).length === 0) {
      return totalVariantStock;
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

  // Obtener opciones disponibles para un tipo de variante
  const getAvailableOptionsForVariant = (variantName) => {
    const variant = variants.find(v => v.name === variantName);
    if (!variant || !variant.options) return [];
    
    return variant.options.filter(option => (parseInt(option.stock) || 0) > 0);
  };

  // Verificar si hay stock en cualquier variante
  const hasVariantStock = totalVariantStock > 0;

  // Obtener la variante con menos stock
  const lowestStockVariant = useMemo(() => {
    if (!variantCombinations.length) return null;
    
    return variantCombinations.reduce((lowest, current) => {
      if (!lowest || current.stock < lowest.stock) {
        return current;
      }
      return lowest;
    }, null);
  }, [variantCombinations]);

  // Obtener variantes agotadas
  const outOfStockVariants = useMemo(() => {
    return variantCombinations.filter(combination => combination.stock === 0);
  }, [variantCombinations]);

  return {
    totalVariantStock,
    variantCombinations,
    hasVariantStock,
    lowestStockVariant,
    outOfStockVariants,
    isVariantCombinationAvailable,
    getVariantCombinationStock,
    getAvailableOptionsForVariant
  };
};

export default useVariantStock;
