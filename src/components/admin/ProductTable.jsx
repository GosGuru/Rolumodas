
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const ProductTable = ({ products, handleEdit, handleDelete, toggleVisibility, formatPrice }) => {
  if (!products || products.length === 0) {
    return <p className="p-6 text-center text-gray-400 font-negro">No hay productos para mostrar.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-negro text-gray-400 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-negro text-gray-400 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-left text-xs font-negro text-gray-400 uppercase tracking-wider">
              Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-negro text-gray-400 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-negro text-gray-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-negro text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-700">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-10 w-10 object-cover mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-700 mr-3 flex items-center justify-center text-gray-500 text-xs">IMG</div>
                  )}
                  <div className="text-sm font-negro text-white">
                    {product.name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-negro">
                {product.categories?.name || 'Sin categoría'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-negro">
                {formatPrice(product.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-negro ${product.stock < 10 ? 'text-red-400' : 'text-white'}`}>
                  {product.stock}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-negro ${
                  product.visible 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {product.visible ? 'Visible' : 'Oculto'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(product)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleVisibility(product.id, product.visible)}
                  className={`${product.visible ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'} hover:bg-gray-700`}
                >
                  {product.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(product.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
