import React from 'react';
import { Info, Image } from 'lucide-react';
import { LIMITS } from '@/lib/validationUtils';

const ProductLimitsInfo = ({ className = "" }) => {
  return (
    <div className={`bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-200 mb-2">
            Límites del Sistema
          </h3>
          <div className="space-y-2 text-xs text-blue-300">
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Máximo {LIMITS.MAX_IMAGES} imágenes por producto (5MB cada una)</span>
            </div>
          </div>
          <p className="text-xs text-blue-400 mt-2">
            Estos límites ayudan a mantener un rendimiento óptimo del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductLimitsInfo;
