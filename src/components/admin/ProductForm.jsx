
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Star, Plus, Trash2 } from 'lucide-react';

const ProductForm = ({ formData, setFormData, handleSubmit, resetForm, editingProduct, categories }) => {
  const [imagePreviews, setImagePreviews] = useState([]);

  const updatePreviews = useCallback(() => {
    if (!formData.images || formData.images.length === 0) {
      setImagePreviews([]);
      return;
    }

    const newPreviews = formData.images.map(image => {
      if (typeof image === 'string') {
        return image;
      }
      if (image instanceof File) {
        return URL.createObjectURL(image);
      }
      return null;
    }).filter(Boolean);

    setImagePreviews(newPreviews);

    return () => {
      newPreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [formData.images]);

  useEffect(() => {
    const cleanup = updatePreviews();
    return cleanup;
  }, [updatePreviews]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...files]
      }));
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleVariantChange = (variantIndex, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex][field] = value;
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', options: '' }]
    }));
  };

  const removeVariant = (variantIndex) => {
    const newVariants = formData.variants.filter((_, index) => index !== variantIndex);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-gray-700 bg-gray-900/50"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-negro text-gray-300 mb-1">
              Nombre del Producto
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-negro text-gray-300 mb-1">
              Precio (UYU)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="category_id" className="block text-sm font-negro text-gray-300 mb-1">
              Categoría
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-negro text-gray-300 mb-1">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              required
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-negro text-gray-300 mb-1">
            Imágenes del Producto
          </label>
          <div className="mt-1">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group aspect-square">
                  <img 
                    src={preview}
                    alt={`Vista previa ${index + 1}`}
                    className="w-full h-full object-cover border border-gray-600"
                  />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <label
              htmlFor="images"
              className="w-full flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed hover:border-gray-500 cursor-pointer bg-gray-800 hover:bg-gray-700/80 transition-colors"
            >
              <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">
                <span className="font-negro text-gray-300">Haz clic para subir</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF. Puedes seleccionar varias.</p>
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-negro text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        <div className="space-y-4 border-t border-gray-700 pt-4">
          <h3 className="text-md font-negro text-gray-200">Variantes del Producto (Talla, Color, etc.)</h3>
          {formData.variants && formData.variants.map((variant, index) => (
            <div key={index} className="flex items-end gap-4 p-3 bg-gray-800/50 border border-gray-700">
              <div className="flex-grow">
                <label className="block text-xs font-negro text-gray-400 mb-1">Nombre de la Variante (ej. Talla)</label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                  placeholder="Talla"
                  className="w-full px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <div className="flex-grow">
                <label className="block text-xs font-negro text-gray-400 mb-1">Opciones (separadas por comas)</label>
                <input
                  type="text"
                  value={variant.options}
                  onChange={(e) => handleVariantChange(index, 'options', e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => removeVariant(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addVariant} className="text-sm text-white border-gray-500 hover:bg-gray-700">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Variante
          </Button>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visible"
              name="visible"
              checked={formData.visible}
              onChange={handleInputChange}
              className="h-4 w-4 border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-600"
            />
            <label htmlFor="visible" className="text-sm text-gray-300 font-negro">
              Visible en tienda
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_trending"
              name="is_trending"
              checked={formData.is_trending}
              onChange={handleInputChange}
              className="h-4 w-4 border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-600"
            />
            <label htmlFor="is_trending" className="text-sm text-gray-300 font-negro flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500"/>
              Producto Tendencia
            </label>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button type="submit" className="bg-white text-black hover:bg-gray-300 font-negro w-full sm:w-auto">
            {editingProduct ? 'Actualizar' : 'Crear'} Producto
          </Button>
          <Button type="button" variant="outline" onClick={resetForm} className="font-negro text-white border-gray-500 hover:bg-gray-700 w-full sm:w-auto">
            Cancelar
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;
