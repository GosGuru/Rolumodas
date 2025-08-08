import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const SiteManagement = () => {
  const { 
    heroImage, 
    mpInstallments, 
    loading, 
    updateHeroImage, 
    updateMpInstallments, 
    fetchSiteContent 
  } = useSiteContent();
  
  const [newHeroImageFile, setNewHeroImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingInstallments, setSavingInstallments] = useState(false);
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
      await updateMpInstallments(mpInstallments);
    } catch (error) {
      // El manejo de errores ya está en la función updateMpInstallments
      console.error('Error en handleSaveInstallments:', error);
    } finally {
      setSavingInstallments(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-gray-900 border border-gray-700 shadow-sm lg:col-span-3"
    >
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Personalización del Sitio</h2>
      </div>
      <div className="p-6 space-y-4">
        <h3 className="text-white font-bold">Imagen de Fondo Principal</h3>
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
    </motion.div>
  );
};

export default SiteManagement;
