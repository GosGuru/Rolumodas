import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { calculateTotalVariantStock } from '@/lib/variantUtils';

const VariantStockSummary = ({ variants, className = '' }) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const totalStock = calculateTotalVariantStock(variants);
  const hasLowStock = totalStock > 0 && totalStock <= 5;
  const isOutOfStock = totalStock === 0;

  // Obtener todas las opciones con su stock
  const allStockOptions = [];
  const lowStockOptions = [];
  const outOfStockOptions = [];

  variants.forEach(variant => {
    if (variant.options && Array.isArray(variant.options)) {
      variant.options.forEach(option => {
        const stock = parseInt(option.stock) || 0;
        const optionInfo = {
          variantName: variant.name,
          optionLabel: option.label || option.value || 'Sin nombre',
          stock
        };

        // Agregar a la lista completa
        allStockOptions.push(optionInfo);

        if (stock === 0) {
          outOfStockOptions.push(optionInfo);
        } else if (stock <= 5) {
          lowStockOptions.push(optionInfo);
        }
      });
    }
  });

  return (
    <motion.div 
      className={`p-4 border rounded-lg ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">
          Resumen de Stock de Variantes
        </h3>
      </div>

      {/* Stock total */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-800/50 rounded-lg">
        <div className={`p-2 rounded-full ${
          isOutOfStock 
            ? 'bg-red-100 dark:bg-red-900/20' 
            : hasLowStock 
              ? 'bg-yellow-100 dark:bg-yellow-900/20' 
              : 'bg-green-100 dark:bg-green-900/20'
        }`}>
          {isOutOfStock ? (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          ) : hasLowStock ? (
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          )}
        </div>
        <div>
          <p className="text-sm text-gray-400">Stock Total</p>
          <p className={`text-lg font-bold ${
            isOutOfStock 
              ? 'text-red-400' 
              : hasLowStock 
                ? 'text-yellow-400' 
                : 'text-green-400'
          }`}>
            {totalStock} unidad{totalStock !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      {/* Detalle de stock por opciones */}
      {allStockOptions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-3">
            Detalle por Variante
          </h4>
          <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="flex flex-wrap gap-3">
              {allStockOptions.map((option, index) => (
                <span 
                  key={index} 
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold border ${
                    option.stock === 0 
                      ? 'bg-red-500/20 text-red-200 border-red-500/30'
                      : option.stock <= 5
                        ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
                        : 'bg-green-500/20 text-green-200 border-green-500/30'
                  }`}
                >
                  {option.optionLabel}: {option.stock}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alertas de stock bajo */}
      {lowStockOptions.length > 0 && (
        <div className="mb-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-yellow-300 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Stock Bajo (≤ 5 unidades)
          </h4>
          <div className="space-y-2">
            {lowStockOptions.map((option, index) => (
              <div key={index} className="flex justify-between items-center text-sm p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <span className="text-white font-medium">
                  {option.variantName}: {option.optionLabel}
                </span>
                <span className="font-bold text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded">
                  {option.stock} unid.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertas de stock agotado */}
      {outOfStockOptions.length > 0 && (
        <div className="mb-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-red-300 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Sin Stock
          </h4>
          <div className="space-y-2">
            {outOfStockOptions.map((option, index) => (
              <div key={index} className="flex justify-between items-center text-sm p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <span className="text-white font-medium">
                  {option.variantName}: {option.optionLabel}
                </span>
                <span className="font-bold text-red-300 bg-red-500/20 px-2 py-1 rounded">
                  Agotado
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje de estado */}
      {isOutOfStock && (
        <div className="p-4 bg-red-500/15 border border-red-500/40 rounded-lg">
          <p className="text-sm text-red-200 font-semibold">
            ⚠️ Todas las variantes están agotadas
          </p>
        </div>
      )}

      {/* Mensaje específico de stock bajo */}
      {!isOutOfStock && lowStockOptions.length > 0 && (
        <div className="p-4 bg-yellow-500/15 border border-yellow-500/40 rounded-lg">
          <p className="text-sm text-yellow-200 font-semibold">
            ⚠️ {lowStockOptions.length === 1 
              ? `${lowStockOptions[0].variantName}: ${lowStockOptions[0].optionLabel} tiene solo ${lowStockOptions[0].stock} unidad${lowStockOptions[0].stock !== 1 ? 'es' : ''}`
              : `${lowStockOptions.length} opciones tienen stock bajo`
            }
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default VariantStockSummary;
