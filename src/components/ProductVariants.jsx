import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Tooltip from '@/components/ui/tooltip';

const ProductVariants = ({ variants, onVariantChange, selectedVariants = {} }) => {
  const [localSelectedVariants, setLocalSelectedVariants] = useState(selectedVariants);

  // Mantener sincronizado cuando cambia desde el padre
  useEffect(() => {
    setLocalSelectedVariants(selectedVariants || {});
  }, [selectedVariants]);

  if (!variants || variants.length === 0) {
    return null;
  }

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
                if (colorMode) {
                  return (
                    <Tooltip key={optionIndex} content={renderOptionValue(option)}>
                      <motion.button
                        type="button"
                        aria-label={`${variant.name}: ${renderOptionValue(option)}`}
                        onClick={() => handleVariantSelect(variant.name, option)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-150 select-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                          isSelected ? 'border-black' : 'border-gray-300 hover:border-black'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {renderColorOption(option)}
                        <span className="sr-only">{renderOptionValue(option)}</span>
                      </motion.button>
                    </Tooltip>
                  );
                }
                // default (no color): text pill as antes
                return (
                  <motion.button
                    key={optionIndex}
                    type="button"
                    onClick={() => handleVariantSelect(variant.name, option)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-md'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary dark:hover:bg-primary/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{renderOptionValue(option)}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* Se eliminó la sección "Selección actual" según pedido */}
    </div>
  );
};

export default ProductVariants;