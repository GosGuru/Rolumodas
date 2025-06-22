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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm text-gray-300 font-negro">
              Nombre del Producto
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="price" className="block mb-1 text-sm text-gray-300 font-negro">
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
              className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="category_id" className="block mb-1 text-sm text-gray-300 font-negro">
              Categoría
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="stock" className="block mb-1 text-sm text-gray-300 font-negro">
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
              className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
        
        {/* NUEVO: Descripción corta */}
        <div>
          <label htmlFor="short_description" className="block mb-1 text-sm text-gray-300 font-negro">
            Descripción corta <span className="text-gray-400">(máx. 160 caracteres)</span>
          </label>
          <textarea
            id="short_description"
            name="short_description"
            rows={2}
            maxLength={160}
            value={formData.short_description || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Ej: Remera oversize de algodón premium. Ideal para el día a día."
          />
          <div className="mt-1 text-xs text-right text-gray-400">
            {formData.short_description?.length || 0}/160
          </div>
        </div>

        {/* NUEVO: Descripción larga */}
        <div>
          <label htmlFor="long_description" className="block mb-1 text-sm text-gray-300 font-negro">
            Descripción larga <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            id="long_description"
            name="long_description"
            rows={5}
            value={formData.long_description || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Agrega detalles, materiales, cuidados, inspiración, etc."
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300 font-negro">
            Imágenes del Producto
          </label>
          <div className="mt-1">
            <div className="grid grid-cols-3 gap-4 mb-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group aspect-square">
                  <img 
                    src={preview}
                    alt={`Vista previa ${index + 1}`}
                    className="object-cover w-full h-full border border-gray-600"
                  />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="absolute w-6 h-6 transition-opacity opacity-0 top-1 right-1 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <label
              htmlFor="images"
              className="flex flex-col items-center justify-center w-full px-6 pt-5 pb-6 transition-colors bg-gray-800 border-2 border-gray-600 border-dashed cursor-pointer hover:border-gray-500 hover:bg-gray-700/80"
            >
              <UploadCloud className="w-12 h-12 mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">
                <span className="text-gray-300 font-negro">Haz clic para subir</span> o arrastra y suelta
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

        <div className="pt-4 space-y-4 border-t border-gray-700">
          <h3 className="text-gray-200 text-md font-negro">Variantes del Producto (Talla, Color, etc.)</h3>
          {formData.variants && formData.variants.map((variant, index) => (
            <div key={index} className="flex items-end gap-4 p-3 border border-gray-700 bg-gray-800/50">
              <div className="flex-grow">
                <label className="block mb-1 text-xs text-gray-400 font-negro">Nombre de la Variante (ej. Talla)</label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                  placeholder="Talla"
                  className="w-full px-3 py-2 text-sm text-white placeholder-gray-400 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <div className="flex-grow">
                <label className="block mb-1 text-xs text-gray-400 font-negro">Opciones (separadas por comas)</label>
                <input
                  type="text"
                  value={variant.options}
                  onChange={(e) => handleVariantChange(index, 'options', e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full px-3 py-2 text-sm text-white placeholder-gray-400 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => removeVariant(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addVariant} className="text-sm text-white border-gray-500 hover:bg-gray-700">
            <Plus className="w-4 h-4 mr-2" />
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
              className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 focus:ring-indigo-600"
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
              className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-600"
            />
            <label htmlFor="is_trending" className="flex items-center text-sm text-gray-300 font-negro">
              <Star className="w-4 h-4 mr-1 text-yellow-500"/>
              Producto Tendencia
            </label>
          </div>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button type="submit" className="w-full text-black bg-white hover:bg-gray-300 font-negro sm:w-auto">
            {editingProduct ? 'Actualizar' : 'Crear'} Producto
          </Button>
          <Button type="button" variant="outline" onClick={resetForm} className="w-full text-white border-gray-500 font-negro hover:bg-gray-700 sm:w-auto">
            Cancelar
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;
