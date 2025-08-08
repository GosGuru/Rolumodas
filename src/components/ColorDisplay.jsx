import React from 'react';

const ColorDisplay = ({ colors = [], size = 'md', showNames = false, className = '' }) => {
  if (!colors || colors.length === 0) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const containerClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-2',
    xl: 'gap-3'
  };

  // Normalizar los datos de colores para manejar diferentes formatos
  const normalizedColors = colors.map(color => {
    // Si es un string, convertirlo a objeto
    if (typeof color === 'string') {
      return { value: color, name: color };
    }
    // Si es un objeto con hex en lugar de value
    if (color && typeof color === 'object') {
      if (color.hex && !color.value) {
        return { value: color.hex, name: color.name || color.label || 'Color' };
      }
    }
    return color;
  }).filter(color => color && (color.value || color.hex)); // Filtrar colores inválidos

  return (
    <div className={`flex items-center ${containerClasses[size]} ${className}`}>
      {normalizedColors.map((color, index) => {
        const colorValue = color.value || color.hex || '#CCCCCC';
        const colorName = color.name || color.label || 'Color';
        
        return (
          <div
            key={`${colorValue}-${colorName}-${index}`}
            className="flex items-center gap-1"
            title={colorName}
          >
            <div
              className={`${sizeClasses[size]} rounded-full border-2 border-gray-300 shadow-sm`}
              style={{ backgroundColor: colorValue }}
            />
            {showNames && (
              <span className="text-xs text-gray-600 whitespace-nowrap">
                {colorName}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ColorDisplay;