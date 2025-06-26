import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const ProductTable = ({ products, handleEdit, handleDelete, toggleVisibility, formatPrice }) => {
  if (!products || products.length === 0) {
    return <p className="p-6 text-center text-gray-400 font-negro">No hay productos para mostrar.</p>;
  }
  return (
    <>
      {/* Mobile: tarjetas apiladas, Desktop: tabla */}
      <div className="block sm:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-800 rounded-lg p-4 shadow flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-12 w-12 object-cover rounded"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-700 flex items-center justify-center text-gray-500 text-xs rounded">IMG</div>
              )}
              <div className="flex-1">
                <div className="text-base font-bold text-white">{product.name}</div>
                <div className="text-xs text-gray-400">{product.categories?.name || 'Sin categoría'}</div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.visible ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{product.visible ? 'Visible' : 'Oculto'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm font-negro">Stock: <span className={product.stock < 10 ? 'text-red-400' : 'text-white'}>{product.stock}</span></span>
              <span className="text-sm font-negro">{formatPrice(product.price)}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(product)}
                className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                aria-label="Editar"
              >
                <Edit className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleVisibility(product.id, product.visible)}
                className={`${product.visible ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'} hover:bg-gray-700`}
                aria-label={product.visible ? 'Ocultar' : 'Mostrar'}
              >
                {product.visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(product.id)}
                className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                aria-label="Eliminar"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden sm:block overflow-x-auto">
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
    </>
  );
};

export default ProductTable;
