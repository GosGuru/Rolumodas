import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import CategoryDisplaySettings from "./CategoryDisplaySettings";

const SiteManagement = () => {
  const { 
    heroImage, 
    mpInstallments, 
    categorySettings,
    loading, 
    updateHeroImage, 
    updateMpInstallments,
    updateCategorySettings,
    fetchSiteContent 
  } = useSiteContent();
  
  const [newHeroImageFile, setNewHeroImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingInstallments, setSavingInstallments] = useState(false);
  const [localMpInstallments, setLocalMpInstallments] = useState(3);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Cargar datos del sitio al montar el componente
    fetchSiteContent();
  }, [fetchSiteContent]);
  
  // Actualizar la vista previa cuando cambia heroImage
  useEffect(() => {
    if (heroImage) {
      setPreview(heroImage);
    }
  }, [heroImage]);

  // Sincronizar installments locales con los del hook
  useEffect(() => {
    setLocalMpInstallments(mpInstallments);
  }, [mpInstallments]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewHeroImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveHero = async () => {
    if (!newHeroImageFile) {
      toast({
        title: "Sin cambios",
        description: "No has seleccionado una nueva imagen.",
      });
      return;
    }
    setUploading(true);
    try {
      // Usar la función centralizada para actualizar la imagen de héroe
      await updateHeroImage(newHeroImageFile);
      setNewHeroImageFile(null);
    } catch (error) {
      // El manejo de errores ya está en la función updateHeroImage
      console.error('Error en handleSaveHero:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInstallments = async () => {
    setSavingInstallments(true);
    try {
      // Usar la función centralizada para actualizar el número máximo de cuotas
      await updateMpInstallments(localMpInstallments);
    } catch (error) {
      // El manejo de errores ya está en la función updateMpInstallments
      console.error('Error en handleSaveInstallments:', error);
    } finally {
      setSavingInstallments(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Imagen de Fondo Principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gray-900 border border-gray-700 shadow-sm"
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Personalización del Sitio</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-white font-bold mb-4">Imagen de Fondo Principal</h3>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid items-center grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm text-gray-400">Vista Previa Actual</p>
                  <div className="bg-gray-800 border border-gray-700 aspect-video">
                    {preview && (
                      <img
                        src={preview}
                        alt="Vista previa de la imagen de fondo"
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Seleccionar Nueva Imagen
                  </Button>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSaveHero}
                    disabled={uploading || !newHeroImageFile}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {uploading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Configuración de MercadoPago */}
          <div className="pt-6 border-t border-gray-700">
            <h3 className="text-white font-bold mb-4">Configuración de Pagos</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número máximo de cuotas (MercadoPago)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={localMpInstallments}
                  onChange={(e) => setLocalMpInstallments(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={handleSaveInstallments}
                disabled={savingInstallments}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {savingInstallments ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {savingInstallments ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Configuración de Categorías */}
      <CategoryDisplaySettings
        categorySettings={categorySettings}
        updateCategorySettings={updateCategorySettings}
        loading={loading}
      />
    </div>
  );
};

export default SiteManagement;
