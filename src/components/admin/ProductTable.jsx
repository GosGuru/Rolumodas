import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import ColorDisplay from '@/components/ColorDisplay';
import { formatVariants, calculateTotalVariantStock } from '@/lib/variantUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ProductTable = ({ products, handleEdit, handleDelete, toggleVisibility, formatPrice }) => {
  const [productToDelete, setProductToDelete] = useState(null);

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    handleDelete(productToDelete.id);
    setProductToDelete(null);
  };
  const renderVariants = (variants) => {
    if (!variants || variants.length === 0) {
      return <span className="text-xs text-gray-500">Sin variantes</span>;
    }

    const formattedVariants = formatVariants(variants);
    const totalVariantStock = calculateTotalVariantStock(variants);
    
    if (formattedVariants.length === 0) {
      return <span className="text-xs text-gray-500">Sin variantes</span>;
    }

    return (
      <div className="space-y-1">
        <div className="flex flex-wrap gap-1">
          {formattedVariants.map((variantText, index) => (
            <span
              key={index}
              className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded dark:bg-blue-900/20 dark:text-blue-400"
            >
              {variantText}
            </span>
          ))}
        </div>
        {totalVariantStock !== null && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Stock variantes: 
            <span className={`ml-1 font-semibold ${
              totalVariantStock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {totalVariantStock}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderColors = (colors) => {
    if (!colors || colors.length === 0) {
      return <span className="text-xs text-gray-500">Sin colores</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        <ColorDisplay colors={colors} size="sm" />
      </div>
    );
  };

  if (!products || products.length === 0) {
    return <p className="p-6 text-center text-gray-400 font-negro">No hay productos para mostrar.</p>;
  }
  return (
    <>
      {/* Mobile: tarjetas apiladas, Desktop: tabla */}
      <div className="block space-y-4 sm:hidden ">
        {products.map((product) => (
          <div key={product.id} className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg shadow">
            <div className="flex items-center gap-3">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover w-12 h-12 rounded"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 text-xs text-gray-500 bg-gray-700 rounded">IMG</div>
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
            {/* Mostrar colores en mobile */}
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-400">Colores:</span>
              {renderColors(product.colors)}
            </div>
            {/* Mostrar variantes en mobile */}
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-400">Variantes:</span>
              {renderVariants(product.variants)}
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(product)}
                className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                aria-label="Editar"
              >
                <Edit className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleVisibility(product.id, product.visible)}
                className={`${product.visible ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'} hover:bg-gray-700`}
                aria-label={product.visible ? 'Ocultar' : 'Mostrar'}
              >
                {product.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProductToDelete(product)}
                className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                aria-label="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block ">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-xs tracking-wider text-left text-gray-400 uppercase font-negro">
                Producto
              </th>
              <th className="px-6 py-3 text-xs tracking-wider text-left text-gray-400 uppercase font-negro">
                Categoría
              </th>
              <th className="px-6 py-3 text-xs tracking-wider text-left text-gray-400 uppercase font-negro">
                Precio
              </th>
              <th className="px-6 py-3 text-xs tracking-wider text-left text-gray-400 uppercase font-negro">
                Stock
              </th>
              <th className="px-6 py-3 text-xs tracking-wider text-left text-gray-400 uppercase font-negro">
                Colores
              </th>
              <th className="px-6 py-3 text-xs tracking-wider text-left text-gray-400 uppercase font-negro">
                Variantes
              </th>
              <th className="px-6 py-3 text-xs tracking-wider text-left text-gray-400 uppercase font-negro">
                Estado
              </th>
              <th className="px-6 py-3 text-xs tracking-wider text-left text-gray-400 uppercase font-negro">
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
                        className="object-cover w-10 h-10 mr-3"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 mr-3 text-xs text-gray-500 bg-gray-700">IMG</div>
                    )}
                    <div className="text-sm text-white font-negro">
                      {product.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap font-negro">
                  {product.categories?.name || 'Sin categoría'}
                </td>
                <td className="px-6 py-4 text-sm text-white whitespace-nowrap font-negro">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-negro ${product.stock < 10 ? 'text-red-400' : 'text-white'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderColors(product.colors)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderVariants(product.variants)}
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
                <td className="px-6 py-4 space-x-1 text-sm font-medium whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(product)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility(product.id, product.visible)}
                    className={`${product.visible ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'} hover:bg-gray-700`}
                  >
                    {product.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setProductToDelete(product)}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto
              "{productToDelete?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductTable;
