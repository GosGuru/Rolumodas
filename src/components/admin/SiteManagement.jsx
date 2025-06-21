
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { UploadCloud, Loader2 } from 'lucide-react';

const SiteManagement = () => {
  const [heroImage, setHeroImage] = useState('');
  const [newHeroImageFile, setNewHeroImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchHeroImage = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_content')
        .select('content_value')
        .eq('content_key', 'hero_image')
        .single();

      if (error || !data) {
        toast({ title: "Error", description: "No se pudo cargar la imagen de fondo.", variant: "destructive" });
      } else {
        setHeroImage(data.content_value.url);
        setPreview(data.content_value.url);
      }
      setLoading(false);
    };
    fetchHeroImage();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewHeroImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!newHeroImageFile) {
      toast({ title: "Sin cambios", description: "No has seleccionado una nueva imagen." });
      return;
    }
    setUploading(true);
    try {
      const fileExt = newHeroImageFile.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('site-assets').upload(filePath, newHeroImageFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(filePath);
      const newUrl = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from('site_content')
        .update({ content_value: { url: newUrl } })
        .eq('content_key', 'hero_image');
      
      if (dbError) throw dbError;

      setHeroImage(newUrl);
      setNewHeroImageFile(null);
      toast({ title: "Éxito", description: "Imagen de fondo actualizada." });

    } catch (error) {
      toast({ title: "Error", description: `No se pudo guardar la imagen: ${error.message}`, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="lg:col-span-3 bg-gray-900 shadow-sm border border-gray-700"
    >
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-negro">Personalización del Sitio</h2>
      </div>
      <div className="p-6 space-y-4">
        <h3 className="font-negro text-white">Imagen de Fondo Principal</h3>
        {loading ? (
          <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin"/></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-sm text-gray-400 mb-2">Vista Previa Actual</p>
              <div className="aspect-video bg-gray-800 border border-gray-700">
                {preview && <img src={preview} alt="Vista previa de la imagen de fondo" className="w-full h-full object-cover"/>}
              </div>
            </div>
            <div className="space-y-4">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
              <Button variant="outline" className="w-full border-gray-600" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud className="h-4 w-4 mr-2"/>
                Seleccionar Nueva Imagen
              </Button>
              <Button className="w-full bg-white text-black hover:bg-gray-300" onClick={handleSave} disabled={uploading || !newHeroImageFile}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                {uploading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SiteManagement;
