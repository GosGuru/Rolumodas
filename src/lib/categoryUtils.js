import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { uploadFile } from './fetchProducts';

/**
 * Maneja errores de API mostrando un toast con el mensaje de error
 * @param {Error} error - El error capturado
 * @param {string} defaultMessage - Mensaje por defecto si no hay mensaje de error
 */
const handleApiError = (error, defaultMessage = 'Ocurrió un error.') => {
  if (typeof window !== 'undefined' && window.__DEV__) {
    // eslint-disable-next-line no-console
    console.error('Error API:', error);
  }
  toast({
    title: "Error",
    description: error?.message || defaultMessage,
    variant: "destructive"
  });
};

/**
 * Obtiene todas las categorías con validación robusta de imágenes
 * @param {Object} options - Opciones de consulta
 * @param {string} options.orderBy - Campo por el cual ordenar
 * @param {boolean} options.ascending - Dirección del ordenamiento
 * @param {string} options.slug - Slug específico para buscar una categoría
 * @returns {Promise<Array>} - Array de categorías validadas
 */
export const fetchCategories = async (options = {}) => {
  const {
    orderBy = 'sort_order',
    ascending = true,
    limit = null,
    onlyVisible = false, // nuevo parámetro para filtrar solo categorías visibles
    slug = null // nuevo parámetro para buscar por slug específico
  } = options;

  try {
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Obteniendo categorías con opciones:', options);
    }
    
    let query = supabase.from('categories').select('*');
    
    // Filtrar por slug específico si se proporciona
    if (slug) {
      query = query.eq('slug', slug);
    }
    
    // Filtrar solo categorías visibles si se especifica
    if (onlyVisible) {
      query = query.eq('visible', true);
    }
    
    // Intentar ordenar primero por sort_order si existe
    if (orderBy === 'sort_order') {
      try {
        query = query.order('sort_order', { ascending }).order('name', { ascending: true });
      } catch {
        // fallback a name
        query = query.order('name', { ascending: true });
      }
    } else {
      query = query.order(orderBy, { ascending });
    }
    
    // Aplicar límite si se especifica
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      if (typeof window !== 'undefined' && window.__DEV__) {
        // eslint-disable-next-line no-console
        console.error('Error al obtener categorías:', error);
      }
      throw error;
    }
    
    if (!data || data.length === 0) {
      if (typeof window !== 'undefined' && window.__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('No se encontraron categorías');
      }
      return [];
    }
    
    // Validar y corregir datos de cada categoría
    // Normalizar sort_order si hay nulos para que el frontend tenga consistencia
    let maxOrder = data.reduce((m, c) => c.sort_order != null && c.sort_order > m ? c.sort_order : m, -1);
    const needsUpdate = [];
    const validatedCategories = data.map(category => {
      const validatedCategory = { ...category };
      if (validatedCategory.sort_order == null) {
        maxOrder += 1;
        validatedCategory.sort_order = maxOrder;
        needsUpdate.push({ id: validatedCategory.id, sort_order: validatedCategory.sort_order });
      }
      
      // Validar imagen
      if (!validatedCategory.image) {
        if (typeof window !== 'undefined' && window.__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(`Categoría ${validatedCategory.id} (${validatedCategory.name}) no tiene imagen`);
        }
        validatedCategory.image = 'https://placehold.co/600x400/e0e0e0/000000?text=Categoría';
      } else if (typeof validatedCategory.image !== 'string') {
        if (typeof window !== 'undefined' && window.__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(`Categoría ${validatedCategory.id} (${validatedCategory.name}) tiene imagen en formato inválido:`, validatedCategory.image);
        }
        validatedCategory.image = 'https://placehold.co/600x400/e0e0e0/000000?text=Categoría';
      }
      
      return validatedCategory;
    });
    if (needsUpdate.length) {
      // Upsert quiet para rellenar sort_order faltantes
      await supabase.from('categories').upsert(needsUpdate, { onConflict: 'id' });
    }
    // Orden final en memoria
    validatedCategories.sort((a,b) => {
      if (a.sort_order == null && b.sort_order == null) return a.name.localeCompare(b.name);
      if (a.sort_order == null) return 1;
      if (b.sort_order == null) return -1;
      if (a.sort_order === b.sort_order) return a.name.localeCompare(b.name);
      return a.sort_order - b.sort_order;
    });
    
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`Se obtuvieron ${validatedCategories.length} categorías correctamente`);
    }
    return validatedCategories;
  } catch (error) {
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.error('Error al obtener categorías:', error);
    }
    handleApiError(error, 'No se pudieron cargar las categorías.');
    return [];
  }
};

/**
 * Crea una nueva categoría
 * @param {string} name - Nombre de la categoría
 * @param {File|null} imageFile - Archivo de imagen (opcional)
 * @returns {Promise<boolean>} - true si la operación fue exitosa, false en caso contrario
 */
export const createCategory = async (name, imageFile = null) => {
  try {
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" });
      return false;
    }
    
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`Creando categoría: ${trimmedName}`);
    }
    
    // Generar slug a partir del nombre
    const slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    // Procesar imagen si existe
    let imageUrl = null;
    if (imageFile) {
      try {
        if (typeof window !== 'undefined' && window.__DEV__) {
          // eslint-disable-next-line no-console
          console.log(`Subiendo imagen para categoría: ${imageFile.name}`);
        }
        imageUrl = await uploadFile(imageFile, 'category-images');
      } catch (uploadError) {
        if (typeof window !== 'undefined' && window.__DEV__) {
          // eslint-disable-next-line no-console
          console.error('Error al subir imagen de categoría:', uploadError);
        }
        imageUrl = 'https://placehold.co/600x400/e0e0e0/000000?text=Categoría';
      }
    } else {
      if (typeof window !== 'undefined' && window.__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('No se proporcionó imagen para la categoría');
      }
      imageUrl = 'https://placehold.co/600x400/e0e0e0/000000?text=Categoría';
    }
    
    // Guardar en Supabase
    const { error } = await supabase.from('categories').insert([{ 
      name: trimmedName, 
      slug, 
      image: imageUrl 
    }]);
    
    if (error) throw error;
    
    toast({ title: "Éxito", description: "Categoría creada correctamente." });
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Categoría creada exitosamente');
    }
    return true;
  } catch (error) {
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.error('Error en createCategory:', error);
    }
    handleApiError(error, 'No se pudo crear la categoría.');
    return false;
  }
};

/**
 * Actualiza una categoría existente
 * @param {number|string} id - ID de la categoría
 * @param {string} name - Nuevo nombre de la categoría
 * @param {File|null} imageFile - Nuevo archivo de imagen (opcional)
 * @returns {Promise<boolean>} - true si la operación fue exitosa, false en caso contrario
 */
export const updateCategory = async (id, name, imageFile = null) => {
  try {
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" });
      return false;
    }
    
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`Actualizando categoría ID: ${id}, Nombre: ${trimmedName}`);
    }
    
    // Preparar datos para actualizar
    const updateData = { name: trimmedName };
    
    // Procesar imagen si existe
    if (imageFile) {
      try {
        if (typeof window !== 'undefined' && window.__DEV__) {
          // eslint-disable-next-line no-console
          console.log(`Subiendo nueva imagen para categoría: ${imageFile.name}`);
        }
        updateData.image = await uploadFile(imageFile, 'category-images');
      } catch (uploadError) {
        if (typeof window !== 'undefined' && window.__DEV__) {
          // eslint-disable-next-line no-console
          console.error('Error al subir imagen de categoría:', uploadError);
        }
        // No actualizamos la imagen si hay error, mantenemos la existente
      }
    }
    
    // Actualizar en Supabase
    const { error } = await supabase.from('categories').update(updateData).eq('id', id);
    
    if (error) throw error;
    
    toast({ title: "Éxito", description: "Categoría actualizada correctamente." });
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Categoría actualizada exitosamente');
    }
    return true;
  } catch (error) {
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.error('Error en updateCategory:', error);
    }
    handleApiError(error, 'No se pudo actualizar la categoría.');
    return false;
  }
};

/**
 * Elimina una categoría
 * @param {number|string} id - ID de la categoría a eliminar
 * @returns {Promise<boolean>} - true si la operación fue exitosa, false en caso contrario
 */
export const deleteCategory = async (id) => {
  try {
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`Eliminando categoría ID: ${id}`);
    }
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    
    if (error) {
      // Si hay error, probablemente sea porque hay productos asociados
      if (typeof window !== 'undefined' && window.__DEV__) {
        // eslint-disable-next-line no-console
        console.error(`Error al eliminar categoría ID ${id}:`, error);
      }
      toast({ 
        title: "Error", 
        description: "No se pudo eliminar la categoría. Asegúrate de que no tenga productos asociados.", 
        variant: "destructive" 
      });
      return false;
    }
    
    toast({ title: "Éxito", description: "Categoría eliminada correctamente." });
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Categoría eliminada exitosamente');
    }
    return true;
  } catch (error) {
    if (typeof window !== 'undefined' && window.__DEV__) {
      // eslint-disable-next-line no-console
      console.error(`Error al eliminar categoría ID ${id}:`, error);
    }
    handleApiError(error, 'No se pudo eliminar la categoría.');
    return false;
  }
};