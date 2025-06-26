import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import ProductTable from '@/components/admin/ProductTable';

const ProductManagement = ({
  products,
  categories,
  handleProductFormSubmit,
  handleDeleteProduct,
  toggleProductVisibility,
  formatPrice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '', price: '', description: '', category_id: '', images: [], stock: '', visible: true
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const resetProductForm = () => {
    setProductFormData({ name: '', price: '', description: '', category_id: '', images: [], stock: '', visible: true });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleProductFormSubmitLocal = async (e) => {
    await handleProductFormSubmit(e, productFormData, editingProduct, resetProductForm);
  };

  const handleEditProduct = (product) => {
    setProductFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      category_id: product.category_id?.toString() || '',
      images: product.images || [],
      stock: product.stock?.toString() || '',
      visible: product.visible ?? true
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (categories.find(cat => cat.id === product.category_id)?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category_id?.toString() === categoryFilter;
    let matchesStock = true;
    if (stockFilter === 'with') matchesStock = Number(product.stock) > 0;
    if (stockFilter === 'without') matchesStock = Number(product.stock) === 0;
    if (stockFilter === 'low') matchesStock = Number(product.stock) > 0 && Number(product.stock) <= 5;
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 rounded-xl p-4 shadow-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h2 className="text-lg font-bold text-white mb-2 sm:mb-0">Gestión de Productos</h2>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center">
          <div className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={() => { setShowProductForm(true); setEditingProduct(null); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="">Todo el stock</option>
              <option value="with">Con stock</option>
              <option value="without">Sin stock</option>
              <option value="low">Stock bajo (≤5)</option>
            </select>
          </div>
        </div>
      </div>
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={handleProductFormSubmitLocal}
          onCancel={resetProductForm}
        />
      )}
      <div className="grid gap-4 mt-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-400 py-8 col-span-full">No hay productos para mostrar.</div>
        )}
        {filteredProducts.map(product => {
          const category = categories.find(cat => cat.id === product.category_id)?.name || 'Sin categoría';
          const stockLow = Number(product.stock) <= 5;
          return (
            <div
              key={product.id}
              className="rounded-xl bg-gray-900 border border-gray-800 shadow-sm p-4 flex flex-col gap-2 min-w-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xs text-gray-400">IMG</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-white truncate">{product.name}</span>
                    {product.visible && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Visible</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-200 truncate">{category}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold ${stockLow ? 'text-red-500 bg-red-100' : 'text-green-600 bg-green-100'} px-2 py-0.5 rounded-full`}>Stock: {product.stock}</span>
                    <span className="text-xs text-gray-200">{formatPrice(product.price)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditProduct(product)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleProductVisibility(product.id, product.visible)}
                  className={product.visible ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}
                  title={product.visible ? 'Ocultar' : 'Mostrar'}
                >
                  {product.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ProductManagement;
