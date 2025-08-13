import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, Home, Store, Eye, Hash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const CategoryDisplaySettings = ({ 
  categorySettings, 
  updateCategorySettings, 
  loading = false 
}) => {
  const [localSettings, setLocalSettings] = useState({
    homeLimit: 6,
    shopLimit: null,
    homeShowAll: false,
    shopShowAll: true
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar con props cuando cambien
  useEffect(() => {
    if (categorySettings && typeof categorySettings === 'object') {
      const validSettings = {
        homeLimit: Number(categorySettings.homeLimit) || 6,
        shopLimit: categorySettings.shopLimit === null ? null : (Number(categorySettings.shopLimit) || null),
        homeShowAll: Boolean(categorySettings.homeShowAll),
        shopShowAll: Boolean(categorySettings.shopShowAll)
      };
      setLocalSettings(validSettings);
      setHasChanges(false);
    }
  }, [categorySettings]);

  // Detectar cambios
  useEffect(() => {
    if (categorySettings && typeof categorySettings === 'object') {
      const changed = JSON.stringify(localSettings) !== JSON.stringify(categorySettings);
      setHasChanges(changed);
    }
  }, [localSettings, categorySettings]);

  const handleInputChange = (key, value) => {
    // Validar entrada
    if (key === 'homeLimit' || key === 'shopLimit') {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 1) {
        return; // No actualizar si es inválido
      }
      setLocalSettings(prev => ({
        ...prev,
        [key]: numValue
      }));
    } else {
      setLocalSettings(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleToggle = (key) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!updateCategorySettings || typeof updateCategorySettings !== 'function') {
      toast({
        title: "Error",
        description: "Función de actualización no disponible.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Validar datos antes de enviar
      const validatedSettings = {
        homeLimit: Math.max(1, Math.min(20, localSettings.homeLimit)),
        shopLimit: localSettings.shopLimit === null ? null : Math.max(1, Math.min(20, localSettings.shopLimit)),
        homeShowAll: Boolean(localSettings.homeShowAll),
        shopShowAll: Boolean(localSettings.shopShowAll)
      };

      const success = await updateCategorySettings(validatedSettings);
      if (success) {
        setHasChanges(false);
        toast({
          title: "Éxito",
          description: "Configuración guardada correctamente."
        });
      } else {
        throw new Error('No se pudo guardar la configuración');
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (categorySettings && typeof categorySettings === 'object') {
      const validSettings = {
        homeLimit: Number(categorySettings.homeLimit) || 6,
        shopLimit: categorySettings.shopLimit === null ? null : (Number(categorySettings.shopLimit) || null),
        homeShowAll: Boolean(categorySettings.homeShowAll),
        shopShowAll: Boolean(categorySettings.shopShowAll)
      };
      setLocalSettings(validSettings);
      setHasChanges(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-gray-900 border border-gray-700 shadow-sm"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Configuración de Categorías</h3>
          </div>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <p className="text-sm text-gray-400">Cargando configuración...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Verificar que tenemos datos válidos
  if (!categorySettings || typeof categorySettings !== 'object') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-gray-900 border border-gray-700 shadow-sm"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Configuración de Categorías</h3>
          </div>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-sm">!</span>
            </div>
            <p className="text-sm text-gray-400">Error al cargar la configuración</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Recargar página
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="bg-gray-900 border border-gray-700 shadow-sm"
    >
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Configuración de Categorías</h3>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Controla cuántas categorías se muestran en cada sección del sitio
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Configuración Home */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Home className="w-4 h-4 text-green-400" />
            <h4 className="font-semibold">Página Principal (Home)</h4>
          </div>
          
          <div className="space-y-3 pl-6">
            {/* Toggle Mostrar Todas */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-white">
                    Mostrar todas las categorías
                  </label>
                  <p className="text-xs text-gray-400">
                    Si está activado, se muestran todas las categorías disponibles
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('homeShowAll')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.homeShowAll ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.homeShowAll ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Límite numérico */}
            {!localSettings.homeShowAll && (
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <Hash className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-white">
                    Número máximo de categorías
                  </label>
                  <p className="text-xs text-gray-400">
                    Cantidad límite a mostrar en la página principal
                  </p>
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={localSettings.homeLimit || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 1 && value <= 20) {
                      handleInputChange('homeLimit', value);
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (isNaN(value) || value < 1) {
                      handleInputChange('homeLimit', 1);
                    } else if (value > 20) {
                      handleInputChange('homeLimit', 20);
                    }
                  }}
                  className="w-20 px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Configuración Tienda */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Store className="w-4 h-4 text-purple-400" />
            <h4 className="font-semibold">Página de Tienda</h4>
          </div>
          
          <div className="space-y-3 pl-6">
            {/* Toggle Mostrar Todas */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-white">
                    Mostrar todas las categorías
                  </label>
                  <p className="text-xs text-gray-400">
                    Si está activado, se muestran todas las categorías disponibles
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('shopShowAll')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.shopShowAll ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.shopShowAll ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Límite numérico */}
            {!localSettings.shopShowAll && (
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <Hash className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-white">
                    Número máximo de categorías
                  </label>
                  <p className="text-xs text-gray-400">
                    Cantidad límite a mostrar en la página de tienda
                  </p>
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={localSettings.shopLimit || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 1 && value <= 20) {
                      handleInputChange('shopLimit', value);
                    } else if (e.target.value === '') {
                      handleInputChange('shopLimit', null);
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (e.target.value === '' || isNaN(value)) {
                      handleInputChange('shopLimit', null);
                    } else if (value < 1) {
                      handleInputChange('shopLimit', 1);
                    } else if (value > 20) {
                      handleInputChange('shopLimit', 20);
                    }
                  }}
                  className="w-20 px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="∞"
                />
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            {hasChanges && (
              <>
                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Tienes cambios sin guardar</span>
              </>
            )}
            {!hasChanges && !saving && (
              <>
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Todo guardado</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || saving}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryDisplaySettings;
