import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

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
 * Obtiene todos los productos con validación robusta de imágenes
 * @param {Object} options - Opciones de consulta
 * @param {boolean} options.includeTrending - Si es true, filtra solo productos trending
 * @param {boolean} options.onlyVisible - Si es true, filtra solo productos visibles
 * @param {number} options.limit - Límite de productos a obtener
 * @param {string} options.orderBy - Campo por el cual ordenar
 * @param {boolean} options.ascending - Dirección del ordenamiento
 * @returns {Promise<Array>} - Array de productos validados
 */
export const fetchProducts = async (options = {}) => {
  const {
    includeTrending = false,
    onlyVisible = false,
    limit = null,
    orderBy = 'created_at',
    ascending = false,
    categoryId = null
  } = options;

  try {
    console.log('Obteniendo productos con opciones:', options);
    
    let query = supabase
      .from('products')
      .select('*, categories(id, name)');
    
    // Aplicar filtros según opciones
    if (includeTrending) {
      query = query.eq('is_trending', true);
    }
    
    if (onlyVisible) {
      query = query.eq('visible', true);
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    // Aplicar ordenamiento
    query = query.order(orderBy, { ascending });
    
    // Aplicar límite si se especifica
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('No se encontraron productos');
      return [];
    }
    
    // Validar y corregir datos de cada producto
    const validatedProducts = data.map(product => {
      const validatedProduct = { ...product };
      
      // Asegurar que images sea siempre un array
      if (!validatedProduct.images || !Array.isArray(validatedProduct.images)) {
        console.warn(`Producto ${validatedProduct.id} (${validatedProduct.name}) tiene imágenes en formato inválido:`, validatedProduct.images);
        validatedProduct.images = ['https://placehold.co/600x800/e0e0e0/000000?text=Rolu'];
      } else if (validatedProduct.images.length === 0) {
        console.warn(`Producto ${validatedProduct.id} (${validatedProduct.name}) no tiene imágenes`);
        validatedProduct.images = ['https://placehold.co/600x800/e0e0e0/000000?text=Rolu'];
      }
      
      // Validar que las URLs de imágenes sean strings
      validatedProduct.images = validatedProduct.images.map((img, index) => {
        if (typeof img !== 'string') {
          console.warn(`Producto ${validatedProduct.id} (${validatedProduct.name}) tiene imagen ${index} en formato inválido:`, img);
          return 'https://placehold.co/600x800/e0e0e0/000000?text=Rolu';
        }
        return img;
      });
      
      return validatedProduct;
    });
    
    console.log(`Se obtuvieron ${validatedProducts.length} productos correctamente`);
    return validatedProducts;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    handleApiError(error, 'No se pudieron cargar los productos.');
    return [];
  }
};

/**
 * Sube un archivo a Supabase Storage con validación y manejo de errores mejorado
 * @param {File} file - Archivo a subir
 * @param {string} bucket - Nombre del bucket de Supabase Storage
 * @returns {Promise<string>} - URL pública del archivo subido
 */
export const uploadFile = async (file, bucket = 'product-images') => {
  try {
    // Validar que el archivo exista
    if (!file) {
      console.error('Se intentó subir un archivo nulo o indefinido');
      throw new Error('No se proporcionó un archivo válido');
    }
    
    // Validar tamaño del archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`El archivo "${file.name}" es muy grande. Tamaño máximo permitido: 5MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Validar tipo de archivo (opcional, puedes personalizar según tus necesidades)
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      console.warn(`Tipo de archivo no recomendado: ${file.type}`);
      // Aquí podrías lanzar un error o continuar, según tu política
    }
    
    // Generar nombre de archivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `public/${fileName}`;
    
    console.log(`Subiendo archivo ${file.name} (${file.size} bytes) a ${bucket}/${filePath}`);
    
    // Subir archivo a Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error(`Error al subir archivo a ${bucket}:`, uploadError);
      throw uploadError;
    }
    
    // Obtener URL pública
    const { data: urlData, error: urlError } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    if (urlError) {
      console.error('Error al obtener URL pública:', urlError);
      throw urlError;
    }
    
    if (!urlData || !urlData.publicUrl) {
      console.error('No se pudo obtener la URL pública del archivo');
      throw new Error('No se pudo obtener la URL pública del archivo');
    }
    
    console.log(`Archivo subido exitosamente. URL: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error en uploadFile:', error);
    throw error; // Re-lanzar para manejo en la función que llama
  }
};