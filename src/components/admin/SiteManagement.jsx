import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";

const SiteManagement = () => {
  const [heroImage, setHeroImage] = useState("");
  const [newHeroImageFile, setNewHeroImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mpInstallments, setMpInstallments] = useState(5);
  const [savingInstallments, setSavingInstallments] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const heroPromise = supabase
        .from("site_content")
        .select("content_value")
        .eq("content_key", "hero_image")
        .single();

      const installmentsPromise = supabase
        .from("site_content")
        .select("content_value")
        .eq("content_key", "mp_max_installments")
        .single();

      const [heroRes, instRes] = await Promise.all([
        heroPromise,
        installmentsPromise,
      ]);

      if (!heroRes.error && heroRes.data) {
        setHeroImage(heroRes.data.content_value.url);
        setPreview(heroRes.data.content_value.url);
      }

      if (!instRes.error && instRes.data) {
        const value = parseInt(instRes.data.content_value.value, 10);
        if (!isNaN(value)) setMpInstallments(value);
      }

      if (heroRes.error || !heroRes.data) {
        toast({
          title: "Error",
          description: "No se pudo cargar la imagen de fondo.",
          variant: "destructive",
        });
      }

      setLoading(false);
    };
    fetchData();
  }, []);

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
      const fileExt = newHeroImageFile.name.split(".").pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, newHeroImageFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);
      const newUrl = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from("site_content")
        .update({ content_value: { url: newUrl } })
        .eq("content_key", "hero_image");

      if (dbError) throw dbError;

      setHeroImage(newUrl);
      setNewHeroImageFile(null);
      toast({ title: "Éxito", description: "Imagen de fondo actualizada." });
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo guardar la imagen: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInstallments = async () => {
    setSavingInstallments(true);
    try {
      const { error } = await supabase
        .from("site_content")
        .upsert(
          {
            content_key: "mp_max_installments",
            content_value: { value: mpInstallments },
          },
          { onConflict: "content_key" }
        );
      if (error) throw error;
      toast({ title: "Éxito", description: "Configuración actualizada." });
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo guardar: ${error.message}`,
        variant: "destructive",
      });
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
                className="w-full text-black bg-white hover:bg-gray-300"
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
