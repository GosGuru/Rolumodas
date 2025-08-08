/* eslint-disable no-console */
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { uploadFile } from './fetchProducts';

/**
 * Maneja la creación o actualización de un producto con validación robusta de imágenes
 * @param {Object} productFormData - Datos del formulario del producto
 * @param {Object|null} editingProduct - Producto existente si es una edición, null si es creación
 * @returns {Promise<boolean>} - true si la operación fue exitosa, false en caso contrario
 */
export const submitProduct = async (productFormData, editingProduct = null) => {
  try {
    console.log(`${editingProduct ? 'Actualizando' : 'Creando'} producto:`, 
      editingProduct ? `ID: ${editingProduct.id}, Nombre: ${productFormData.name}` : productFormData.name);
    
    // Procesar imágenes: subir nuevas y mantener existentes
    console.log('Procesando imágenes del producto...');
    let imageUrls = [];
    
    if (productFormData.images && productFormData.images.length > 0) {
      // Mapear cada imagen: subir si es File, mantener si es URL
      const imagePromises = productFormData.images.map(async (image, index) => {
        try {
          // Si es un objeto File, subir a Supabase
          if (image instanceof File) {
            console.log(`Subiendo imagen ${index + 1}/${productFormData.images.length}: ${image.name}`);
            return await uploadFile(image, 'product-images');
          } 
          // Si es una URL existente, verificar que sea válida
          else if (typeof image === 'string') {
            console.log(`Manteniendo URL de imagen existente ${index + 1}/${productFormData.images.length}`);
            return image;
          } 
          // Si no es ni File ni string, usar imagen placeholder
          else {
            console.warn(`Imagen ${index + 1} en formato inválido:`, image);
            return 'https://placehold.co/600x800/e0e0e0/000000?text=Rolu';
          }
        } catch (error) {
          console.error(`Error procesando imagen ${index + 1}:`, error);
          return 'https://placehold.co/600x800/e0e0e0/000000?text=Rolu';
        }
      });
      
      // Esperar a que todas las imágenes se procesen
      imageUrls = await Promise.all(imagePromises);
      console.log('Imágenes procesadas:', imageUrls);
    } else {
      console.warn('No se proporcionaron imágenes para el producto');
      imageUrls = ['https://placehold.co/600x800/e0e0e0/000000?text=Rolu'];
    }
    
    // Preparar datos del producto para guardar
    // Normalizar variantes (si existen): asegurar que options sea siempre array simple
    const normalizedVariants = (productFormData.variants || []).map(v => ({
      ...v,
      options: Array.isArray(v.options) ? v.options : Object.values(v.options || {}),
    }));

    const productData = {
      name: productFormData.name,
      price: parseFloat(productFormData.price) || 0,
      description: productFormData.description,
      category_id: parseInt(productFormData.category_id, 10),
      stock: parseInt(productFormData.stock, 10) || 0,
      visible: productFormData.visible,
      is_trending: productFormData.is_trending,
      images: imageUrls,
      // Incluir otros campos si existen en el formulario
      ...(productFormData.variants && { variants: normalizedVariants }),
      ...(productFormData.colors && { colors: productFormData.colors }),
      ...(productFormData.short_description && { short_description: productFormData.short_description }),
      ...(productFormData.long_description && { long_description: productFormData.long_description }),
    };
    
    // Guardar en Supabase: actualizar o crear según corresponda
    if (editingProduct) {
      console.log(`Actualizando producto ID: ${editingProduct.id}`);
      const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
      if (error) throw error;
      toast({ title: "Éxito", description: "Producto actualizado correctamente." });
    } else {
      console.log('Creando nuevo producto');
      const { error } = await supabase.from('products').insert([productData]);
      if (error) throw error;
      toast({ title: "Éxito", description: "Producto creado correctamente." });
    }
    
    console.log('Operación completada exitosamente');
    return true;
  } catch (error) {
    console.error('Error en submitProduct:', error);
    toast({ 
      title: "Error", 
      description: error.message || "No se pudo guardar el producto.", 
      variant: "destructive" 
    });
    return false;
  }
};

/**
 * Elimina un producto
 * @param {number|string} id - ID del producto a eliminar
 * @returns {Promise<boolean>} - true si la operación fue exitosa, false en caso contrario
 */
export const deleteProduct = async (id) => {
  try {
    console.log(`Eliminando producto ID: ${id}`);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    toast({ title: "Éxito", description: "Producto eliminado correctamente." });
    return true;
  } catch (error) {
    console.error(`Error al eliminar producto ID ${id}:`, error);
    toast({ 
      title: "Error", 
      description: "No se pudo eliminar el producto.", 
      variant: "destructive" 
    });
    return false;
  }
};

/**
 * Cambia la visibilidad de un producto
 * @param {number|string} id - ID del producto
 * @param {boolean} currentVisibility - Visibilidad actual del producto
 * @returns {Promise<boolean>} - true si la operación fue exitosa, false en caso contrario
 */
export const toggleProductVisibility = async (id, currentVisibility) => {
  try {
    console.log(`Cambiando visibilidad del producto ID: ${id} de ${currentVisibility} a ${!currentVisibility}`);
    const { error } = await supabase.from('products').update({ visible: !currentVisibility }).eq('id', id);
    if (error) throw error;
    toast({ 
      title: "Éxito", 
      description: `Producto ${!currentVisibility ? 'visible' : 'oculto'}.` 
    });
    return true;
  } catch (error) {
    console.error(`Error al cambiar visibilidad del producto ID ${id}:`, error);
    toast({ 
      title: "Error", 
      description: `No se pudo cambiar la visibilidad: ${error.message}`, 
      variant: "destructive" 
    });
    return false;
  }
};