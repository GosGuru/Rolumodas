import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Eye, Home, Store, Hash, Settings, Loader2, RotateCcw, Save } from 'lucide-react';
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
    } catch (error) {
      // Si el error es de autenticación, mostrar mensaje específico
      const errorMessage = error?.message || 'No se pudo guardar la configuración.';
      const isAuthError = errorMessage.includes('autenticado') || errorMessage.includes('permisos');
      
      toast({
        title: "Error",
        description: isAuthError 
          ? "Error de permisos. Verifica que estés autenticado como administrador e intenta recargar la página."
          : errorMessage,
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
  className="relative bg-gray-900 border border-gray-700 shadow-sm max-w-full pb-28 sm:pb-0"
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
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Home className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-semibold text-lg">Página Principal (Home)</h4>
          </div>
          
          <div className="space-y-3 ml-2">
            {/* Toggle Mostrar Todas */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-white">
                    Mostrar todas las categorías
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Si está activado, se muestran todas las categorías disponibles
                  </p>
                </div>
              </div>
              <Switch
                checked={localSettings.homeShowAll}
                onCheckedChange={() => handleToggle('homeShowAll')}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Límite numérico */}
            {!localSettings.homeShowAll && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                <Hash className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-white">
                    Número máximo de categorías
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
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
                  className="w-20 px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Configuración Shop */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Store className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-semibold text-lg">Página de Tienda</h4>
          </div>
          
          <div className="space-y-3 ml-2">
            {/* Toggle Mostrar Todas */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-white">
                    Mostrar todas las categorías
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Si está activado, se muestran todas las categorías disponibles
                  </p>
                </div>
              </div>
              <Switch
                checked={localSettings.shopShowAll}
                onCheckedChange={() => handleToggle('shopShowAll')}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>

            {/* Límite numérico */}
            {!localSettings.shopShowAll && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                <Hash className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-white">
                    Número máximo de categorías
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
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
                  className="w-20 px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="∞"
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            {hasChanges && (
              <>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Tienes cambios sin guardar</span>
              </>
            )}
            {!hasChanges && !saving && (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Todo guardado</span>
              </>
            )}
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || saving}
                className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2"
                    >
                      <Loader2 className="w-4 h-4" />
                    </motion.div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryDisplaySettings;
