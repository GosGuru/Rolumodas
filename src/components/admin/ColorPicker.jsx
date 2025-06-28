import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, Check } from 'lucide-react';

// Colores predefinidos comunes
const predefinedColors = [
  { name: 'Negro', value: '#000000' },
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Rojo', value: '#FF0000' },
  { name: 'Azul', value: '#0000FF' },
  { name: 'Verde', value: '#00FF00' },
  { name: 'Amarillo', value: '#FFFF00' },
  { name: 'Rosa', value: '#FFC0CB' },
  { name: 'Naranja', value: '#FFA500' },
  { name: 'Púrpura', value: '#800080' },
  { name: 'Gris', value: '#808080' },
  { name: 'Marrón', value: '#A52A2A' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Lima', value: '#32CD32' },
  { name: 'Azul Marino', value: '#000080' },
  { name: 'Verde Oliva', value: '#808000' },
  { name: 'Teal', value: '#008080' },
  { name: 'Violeta', value: '#8A2BE2' },
  { name: 'Coral', value: '#FF7F50' },
  { name: 'Dorado', value: '#FFD700' },
];

const ColorPicker = ({ selectedColors = [], onColorsChange }) => {
  const [customColor, setCustomColor] = useState('#000000');
  const [showColorInput, setShowColorInput] = useState(false);
  const [customColorName, setCustomColorName] = useState('');

  const handleColorToggle = (color) => {
    const isSelected = selectedColors.some(c => c.value === color.value);
    
    if (isSelected) {
      // Remover color
      const newColors = selectedColors.filter(c => c.value !== color.value);
      onColorsChange(newColors);
    } else {
      // Agregar color
      const newColors = [...selectedColors, color];
      onColorsChange(newColors);
    }
  };

  const handleAddCustomColor = () => {
    if (customColor && customColorName.trim()) {
      const newColor = {
        name: customColorName.trim(),
        value: customColor
      };
      
      // Verificar que no exista ya
      const exists = selectedColors.some(c => c.value === customColor);
      if (!exists) {
        const newColors = [...selectedColors, newColor];
        onColorsChange(newColors);
      }
      
      // Resetear formulario
      setCustomColorName('');
      setCustomColor('#000000');
      setShowColorInput(false);
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    const newColors = selectedColors.filter(c => c.value !== colorToRemove.value);
    onColorsChange(newColors);
  };

  const isColorSelected = (color) => {
    return selectedColors.some(c => c.value === color.value);
  };

  return (
    <div className="space-y-4">
      {/* Colores seleccionados */}
      {selectedColors.length > 0 && (
        <div>
          <label className="block mb-2 text-sm text-gray-300 font-negro">
            Colores Seleccionados ({selectedColors.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color, index) => (
              <div
                key={`${color.value}-${index}`}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg"
              >
                <div
                  className="w-4 h-4 rounded-full border border-gray-400"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-sm text-white">{color.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveColor(color)}
                  className="w-5 h-5 text-gray-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Colores predefinidos */}
      <div>
        <label className="block mb-2 text-sm text-gray-300 font-negro">
          Colores Predefinidos
        </label>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {predefinedColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => handleColorToggle(color)}
              className={`relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                isColorSelected(color) 
                  ? 'border-white shadow-lg' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {isColorSelected(color) && (
                <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Agregar color personalizado */}
      <div>
        <Button
          type="button"
          onClick={() => setShowColorInput(!showColorInput)}
          className="flex items-center gap-2 text-sm bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
        >
          <Plus className="w-4 h-4" />
          Agregar Color Personalizado
        </Button>

        {showColorInput && (
          <div className="mt-3 p-4 bg-gray-800 border border-gray-600 rounded-lg">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-xs text-gray-400 font-negro">
                  Nombre del Color
                </label>
                <input
                  type="text"
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  placeholder="Ej: Azul Marino"
                  className="bg-[#23272f] text-white border border-gray-700 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 rounded-lg px-3 py-2 w-full text-sm"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs text-gray-400 font-negro">
                  Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-12 h-10 border border-gray-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 bg-[#23272f] text-white border border-gray-700 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                onClick={handleAddCustomColor}
                disabled={!customColorName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Agregar Color
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowColorInput(false);
                  setCustomColorName('');
                  setCustomColor('#000000');
                }}
                variant="outline"
                className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 text-sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker; 