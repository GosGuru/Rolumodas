
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
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
    name: '', price: '', description: '', category_id: '', images: [], stock: '', visible: true, is_trending: false, variants: []
  });

  const resetProductForm = () => {
    setProductFormData({ name: '', price: '', description: '', category_id: '', images: [], stock: '', visible: true, is_trending: false, variants: [] });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const onEdit = (product) => {
    setProductFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      category_id: product.categories.id.toString(),
      images: product.images || [],
      stock: product.stock.toString(),
      visible: product.visible,
      is_trending: product.is_trending || false,
      variants: product.variants ? product.variants.map(v => ({...v, options: v.options.join(', ')})) : []
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const onSubmit = (e) => {
    handleProductFormSubmit(e, productFormData, editingProduct, resetProductForm);
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
                className="w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white text-sm"
              />
            </div>
            <Button
              onClick={() => { resetProductForm(); setShowProductForm(true); }}
              className="bg-white text-black hover:bg-gray-300 flex items-center justify-center space-x-2 text-sm px-3 py-2 sm:px-4"
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
            handleSubmit={onSubmit}
            resetForm={resetProductForm}
            editingProduct={editingProduct}
            categories={categories}
          />
        )}
      </AnimatePresence>

      <ProductTable
        products={filteredProducts}
        handleEdit={onEdit}
        handleDelete={handleDeleteProduct}
        toggleVisibility={toggleProductVisibility}
        formatPrice={formatPrice}
      />
    </motion.div>
  );
};

export default ProductManagement;
