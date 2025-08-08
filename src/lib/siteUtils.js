import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { uploadFile } from './fetchProducts';

/**
 * Maneja errores de API mostrando un toast con el mensaje de error
 * @param {Error} error - El error capturado
 * @param {string} defaultMessage - Mensaje por defecto si no hay mensaje de error
 */
const handleApiError = (error, defaultMessage = 'Ocurrió un error.') => {
  console.error('Error API:', error);
  toast({
    title: "Error",
    description: error?.message || defaultMessage,
    variant: "destructive"
  });
};

/**
 * Obtiene la imagen de héroe del sitio
 * @returns {Promise<string>} - URL de la imagen de héroe o imagen por defecto
 */
export const fetchHeroImage = async () => {
  try {
    console.log('Obteniendo imagen de héroe');
    
    const { data, error } = await supabase
      .from("site_content")
      .select("content_value")
      .eq("content_key", "hero_image")
      .single();
    
    if (error) {
      console.error('Error al obtener imagen de héroe:', error);
      throw error;
    }
    
    if (!data || !data.content_value || !data.content_value.url) {
      console.warn('No se encontró imagen de héroe o formato inválido');
      return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop";
    }
    
    console.log('Imagen de héroe obtenida correctamente');
    return data.content_value.url;
  } catch (error) {
    console.error('Error al obtener imagen de héroe:', error);
    handleApiError(error, 'No se pudo cargar la imagen de fondo.');
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop";
  }
};

/**
 * Actualiza la imagen de héroe del sitio
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<boolean>} - true si la operación fue exitosa, false en caso contrario
 */
export const updateHeroImage = async (imageFile) => {
  try {
    if (!imageFile) {
      console.error('Se intentó actualizar la imagen de héroe sin proporcionar un archivo');
      toast({ title: "Error", description: "No se proporcionó una imagen válida.", variant: "destructive" });
      return false;
    }
    
    console.log(`Actualizando imagen de héroe: ${imageFile.name}`);
    
    // Subir imagen a Supabase Storage
    const imageUrl = await uploadFile(imageFile, 'site-assets');
    
    // Actualizar referencia en la tabla site_content
    const { error } = await supabase
      .from("site_content")
      .upsert({
        content_key: "hero_image",
        content_value: { url: imageUrl }
      });
    
    if (error) {
      console.error('Error al actualizar imagen de héroe en base de datos:', error);
      throw error;
    }
    
    toast({ title: "Éxito", description: "Imagen de fondo actualizada correctamente." });
    console.log('Imagen de héroe actualizada exitosamente');
    return true;
  } catch (error) {
    console.error('Error al actualizar imagen de héroe:', error);
    handleApiError(error, 'No se pudo actualizar la imagen de fondo.');
    return false;
  }
};

/**
 * Obtiene el número máximo de cuotas de Mercado Pago
 * @returns {Promise<number>} - Número máximo de cuotas o valor por defecto (3)
 */
export const fetchMpMaxInstallments = async () => {
  try {
    console.log('Obteniendo número máximo de cuotas de Mercado Pago');
    
    const { data, error } = await supabase
      .from("site_content")
      .select("content_value")
      .eq("content_key", "mp_max_installments")
      .single();
    
    if (error) {
      console.error('Error al obtener número máximo de cuotas:', error);
      throw error;
    }
    
    if (!data || !data.content_value || !data.content_value.value) {
      console.warn('No se encontró configuración de cuotas o formato inválido');
      return 3; // Valor por defecto
    }
    
    const value = parseInt(data.content_value.value, 10);
    if (isNaN(value)) {
      console.warn('Valor de cuotas en formato inválido:', data.content_value.value);
      return 3; // Valor por defecto
    }
    
    console.log(`Número máximo de cuotas obtenido: ${value}`);
    return value;
  } catch (error) {
    console.error('Error al obtener número máximo de cuotas:', error);
    handleApiError(error, 'No se pudo cargar la configuración de cuotas.');
    return 3; // Valor por defecto
  }
};

/**
 * Actualiza el número máximo de cuotas de Mercado Pago
 * @param {number} value - Número máximo de cuotas
 * @returns {Promise<boolean>} - true si la operación fue exitosa, false en caso contrario
 */
export const updateMpMaxInstallments = async (value) => {
  try {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      console.error('Se intentó actualizar el número de cuotas con un valor inválido:', value);
      toast({ title: "Error", description: "El número de cuotas debe ser un número positivo.", variant: "destructive" });
      return false;
    }
    
    console.log(`Actualizando número máximo de cuotas a: ${numValue}`);
    
    // Actualizar en la tabla site_content
    const { error } = await supabase
      .from("site_content")
      .upsert({
        content_key: "mp_max_installments",
        content_value: { value: numValue.toString() }
      });
    
    if (error) {
      console.error('Error al actualizar número máximo de cuotas:', error);
      throw error;
    }
    
    toast({ title: "Éxito", description: "Número de cuotas actualizado correctamente." });
    console.log('Número máximo de cuotas actualizado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al actualizar número máximo de cuotas:', error);
    handleApiError(error, 'No se pudo actualizar el número de cuotas.');
    return false;
  }
};