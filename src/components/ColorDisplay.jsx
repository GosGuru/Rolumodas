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

  return (
    <div className={`flex items-center ${containerClasses[size]} ${className}`}>
      {colors.map((color, index) => (
        <div
          key={`${color.value}-${color.name}-${index}`}
          className="flex items-center gap-1"
          title={showNames ? color.name : undefined}
        >
          <div
            className={`${sizeClasses[size]} rounded-full border-2 border-gray-300 shadow-sm`}
            style={{ backgroundColor: color.value }}
          />
          {showNames && (
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {color.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ColorDisplay; 