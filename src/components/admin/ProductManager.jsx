import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductForm from '@/components/admin/ProductForm';
import ProductTable from '@/components/admin/ProductTable';

const ProductManager = ({ products, categories, formatPrice, submitProduct, deleteProduct, toggleProductVisibility }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '', 
    price: '', 
    description: '', 
    category_id: '', 
    images: [], 
    stock: '', 
    visible: true,
    variants: [],
    short_description: '',
    long_description: '',
    is_trending: false
  });

  const resetProductForm = () => {
    setProductFormData({ name: '', price: '', description: '', category_id: '', images: [], stock: '', visible: true, variants: [], short_description: '', long_description: '', is_trending: false });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    const success = await submitProduct(productFormData, editingProduct);
    if (success) {
      resetProductForm();
    }
  };

  const handleEditProduct = (product) => {
    setProductFormData({
      name: product.name || '',
      price: product.price?.toString() || '',
      description: product.description || '',
      category_id: product.categories?.id?.toString() || '',
      images: product.images || [],
      stock: product.stock?.toString() || '',
      visible: product.visible ?? true,
      variants: product.variants || [],
      short_description: product.short_description || '',
      long_description: product.long_description || '',
      is_trending: product.is_trending || false
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const filteredProducts = products.filter(product =>
    (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (product.categories?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="lg:col-span-2 bg-gray-900 shadow-sm border border-gray-700"
    >
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-negro">Gestión de Productos</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-700 bg-[#23272f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <Button
              onClick={() => { resetProductForm(); setShowProductForm(true); }}
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm px-3 py-2 sm:px-4"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Producto</span>
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showProductForm && (
          <ProductForm
            formData={productFormData}
            setFormData={setProductFormData}
            handleSubmit={handleProductFormSubmit}
            resetForm={resetProductForm}
            editingProduct={editingProduct}
            categories={categories}
          />
        )}
      </AnimatePresence>

      <ProductTable
        products={filteredProducts}
        handleEdit={handleEditProduct}
        handleDelete={deleteProduct}
        toggleVisibility={toggleProductVisibility}
        formatPrice={formatPrice}
      />
    </motion.div>
  );
};

export default ProductManager;