import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Opciones disponibles:</h3>
      {variants.map((variant, index) => (
        <div key={index} className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground capitalize">
            {variant.name}:
          </label>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(variant.options)
              ? variant.options
              : (variant.options ? variant.options.split(',').map(opt => opt.trim()).filter(Boolean) : []))
            .map((option, optionIndex) => {
              const colorValue = resolveColor(option);
              const selectedValue = resolveColor(localSelectedVariants[variant.name]) || localSelectedVariants[variant.name];
              const isSelected = colorValue
                ? selectedValue === colorValue
                : selectedValue === option;
              return (
                <motion.button
                  key={optionIndex}
                  type="button"
                  onClick={() => handleVariantSelect(variant.name, option)}
                  className={`relative text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    colorValue
                      ? `w-7 h-7 p-0 rounded-full ${isSelected ? 'border-primary shadow-md' : 'border-gray-300 bg-white'}`
                      : `px-4 py-2 ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary dark:hover:bg-primary/10'
                        }`
                  }`}
                  style={colorValue ? { backgroundColor: colorValue } : {}}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {!colorValue && getOptionLabel(option)}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Mostrar selección actual */}
      {Object.keys(localSelectedVariants).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-2">Selección actual:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(localSelectedVariants).map(([variantName, option]) => (
              <span
                key={variantName}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md"
              >
                {variantName}: {getOptionLabel(option)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariants;

