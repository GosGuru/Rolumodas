import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Tooltip from '@/components/ui/tooltip';
import { useVariantStock } from '@/hooks/useVariantStock';

const COLOR_MAP = {
  rojo: '#ff0000',
  violeta: '#8f00ff',
  azul: '#0000ff',
  verde: '#008000',
  negro: '#000000',
  blanco: '#ffffff',
  amarillo: '#ffff00',
  naranja: '#ffa500',
  rosa: '#ffc0cb',
  marron: '#8b4513',
  gris: '#808080'
};

const ProductVariants = ({ variants, onVariantChange, selectedVariants = {} }) => {
  const [localSelectedVariants, setLocalSelectedVariants] = useState(selectedVariants);
  
  // Usar el hook de stock de variantes
  const { 
    isVariantCombinationAvailable, 
    getVariantCombinationStock,
    getAvailableOptionsForVariant 
  } = useVariantStock(variants);

  // Mantener sincronizado cuando cambia desde el padre
  useEffect(() => {
    setLocalSelectedVariants(selectedVariants || {});
  }, [selectedVariants]);

  if (!variants || variants.length === 0) {
    return null;
  }

  const getOptionLabel = (option) => {
    if (typeof option === 'object') {
      if (typeof option.label === 'string') return option.label;
      if (typeof option.value === 'string') return option.value;
      if (typeof option.size === 'string') return option.size;
      return '';
    }
    return option;
  };

  const resolveColor = (option) => {
    if (typeof option === 'string') {
      const lower = option.toLowerCase();
      return COLOR_MAP[lower] || (lower.startsWith('#') ? option : null);
    }
    if (typeof option === 'object') {
      if (typeof option.hex === 'string') return option.hex;
      if (typeof option.value === 'string') {
        const val = option.value.toLowerCase();
        return COLOR_MAP[val] || (val.startsWith('#') ? option.value : null);
      }
    }
    return null;
  };

  const handleVariantSelect = (variantName, option) => {
    const newSelectedVariants = {
      ...localSelectedVariants,
      [variantName]: option
    };
    setLocalSelectedVariants(newSelectedVariants);
    if (onVariantChange) {
      onVariantChange(newSelectedVariants);
    }
  };

  // Función para renderizar el valor de la opción
  const renderOptionValue = (option) => {
    // Si la opción es null o undefined
    if (option === null || option === undefined) {
      return '';
    }
    
    // Si la opción es un objeto
    if (typeof option === 'object') {
      // Si es un objeto de color con propiedad hex
      if (option.hex) {
        return option.label || option.name || 'Color';
      }
      // Para otros objetos, intentar obtener una propiedad legible
      if (option.label) return option.label;
      if (option.name) return option.name;
      if (typeof option.value === 'string') return option.value;
      
      // Último recurso: convertir a string de forma segura
      try {
        return JSON.stringify(option);
  } catch {
        return 'Opción';
      }
    }
    
    // Si no es un objeto, devolver directamente
    return String(option);
  };

  // Función para renderizar un color visualmente
  const renderColorOption = (option) => {
    if (option && typeof option === 'object') {
      // Si tiene propiedad hex directa
      if (option.hex) {
        return (
          <div 
            className="block w-[26px] h-[26px] rounded-full" 
            style={{ backgroundColor: option.hex }}
          />
        );
      }
      // Si tiene propiedad value que podría ser un color
      if (option.value && typeof option.value === 'string' && 
          (option.value.startsWith('#') || option.value.startsWith('rgb'))) {
        return (
          <div 
            className="block w-[26px] h-[26px] rounded-full" 
            style={{ backgroundColor: option.value }}
          />
        );
      }
    }
    return null;
  };

  const isColorVariant = (variant) => {
    if (!variant) return false;
    if (typeof variant.name === 'string' && variant.name.toLowerCase().includes('color')) return true;
    // fallback: detect if first option looks like a color
    const first = Array.isArray(variant.options) ? variant.options[0] : undefined;
    return !!(first && typeof first === 'object' && (first.hex || (typeof first.value === 'string' && (first.value.startsWith('#') || first.value.startsWith('rgb')))));
  };

  return (
  <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Opciones disponibles:</h3>
      {variants.map((variant, index) => {
        const colorMode = isColorVariant(variant);
        const optionsArray = (Array.isArray(variant.options)
          ? variant.options
          : (variant.options ? variant.options.split(',').map(opt => opt.trim()).filter(Boolean) : [])
        );
        return (
          <div key={index} className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground capitalize">
              {variant.name}:
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {optionsArray.map((option, optionIndex) => {
                const isSelected = localSelectedVariants[variant.name] === option;
                const optionStock = parseInt(option.stock) || 0;
                const isOutOfStock = optionStock === 0;
                
                if (colorMode) {
                  return (
                    <Tooltip 
                      key={optionIndex} 
                      content={
                        <div className="text-center">
                          <div>{renderOptionValue(option)}</div>
                          <div className="text-xs mt-1">
                            {isOutOfStock ? (
                              <span className="text-red-400">Sin stock</span>
                            ) : (
                              <span className="text-green-400">{optionStock} disponible{optionStock !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                      }
                    >
                      <motion.button
                        type="button"
                        aria-label={`${variant.name}: ${renderOptionValue(option)}`}
                        onClick={() => !isOutOfStock && handleVariantSelect(variant.name, option)}
                        disabled={isOutOfStock}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-150 select-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                          isOutOfStock 
                            ? 'border-gray-400 opacity-50 cursor-not-allowed' 
                            : isSelected 
                              ? 'border-black' 
                              : 'border-gray-300 hover:border-black'
                        }`}
                        whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
                        whileTap={!isOutOfStock ? { scale: 0.96 } : {}}
                      >
                        {renderColorOption(option)}
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                          </div>
                        )}
                        <span className="sr-only">{renderOptionValue(option)}</span>
                      </motion.button>
                    </Tooltip>
                  );
                }
                // default (no color): text pill as antes
                return (
                  <Tooltip 
                    key={optionIndex}
                    content={
                      <div className="text-center">
                        <div>{renderOptionValue(option)}</div>
                        <div className="text-xs mt-1">
                          {isOutOfStock ? (
                            <span className="text-red-400">Sin stock</span>
                          ) : (
                            <span className="text-green-400">{optionStock} disponible{optionStock !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    }
                  >
                    <motion.button
                      type="button"
                      onClick={() => !isOutOfStock && handleVariantSelect(variant.name, option)}
                      disabled={isOutOfStock}
                      className={`relative px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                        isOutOfStock
                          ? 'border-gray-400 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500'
                          : isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary dark:hover:bg-primary/10'
                      }`}
                      whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
                      whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
                    >
                      <span>{renderOptionValue(option)}</span>
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-500 rotate-12"></div>
                        </div>
                      )}
                    </motion.button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {/* Mostrar información de stock para la selección actual */}
      {Object.keys(localSelectedVariants).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Stock disponible:</strong>
            <span className={`ml-2 font-semibold ${
              getVariantCombinationStock(localSelectedVariants) > 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {getVariantCombinationStock(localSelectedVariants) > 0 
                ? `${getVariantCombinationStock(localSelectedVariants)} unidad${getVariantCombinationStock(localSelectedVariants) !== 1 ? 'es' : ''}`
                : 'Sin stock'
              }
            </span>
          </div>
        </div>
      )}
      
      {/* Se eliminó la sección "Selección actual" según pedido */}
    </div>
  );
};

export default ProductVariants;