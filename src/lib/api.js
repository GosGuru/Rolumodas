import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

/**
 * Maneja errores de API mostrando un toast con el mensaje de error
 * @param {Error} error - El error capturado
 * @param {string} defaultMessage - Mensaje por defecto si no hay mensaje de error
 */
export const handleApiError = (error, defaultMessage = 'Ocurrió un error.') => {
  console.error('Error API:', error);
  toast({
    title: "Error",
    description: error?.message || defaultMessage,
    variant: "destructive"
  });
};

/**
 * Obtiene un producto por su ID con validación robusta de imágenes
 * @param {number|string} id - ID del producto a obtener
 * @returns {Promise<Object|null>} - Producto validado o null si no existe
 */
export const fetchProductById = async (id) => {
  try {
    console.log(`Obteniendo producto con ID: ${id}`);
    
    if (!id) {
      console.error('Se intentó obtener un producto sin proporcionar un ID');
      return null;
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name)')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error);
      throw error;
    }
    
    if (!data) {
      console.warn(`No se encontró producto con ID ${id}`);
      return null;
    }
    
    // Validar y corregir datos del producto
    const validatedProduct = { ...data };
    
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
    
    console.log(`Producto ${id} obtenido correctamente:`, validatedProduct.name);
    return validatedProduct;
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error);
    handleApiError(error, 'No se pudo cargar el producto.');
    return null;
  }
};