/**
 * Utilidades de validación para productos
 */

export const LIMITS = {
  MAX_IMAGES: 8,
  MAX_VARIANTS: 7,
  MAX_OPTIONS_PER_VARIANT: 15,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  VALID_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

export const VALIDATION_MESSAGES = {
  MAX_IMAGES_EXCEEDED: `Solo puedes subir un máximo de ${LIMITS.MAX_IMAGES} imágenes por producto.`,
  MAX_VARIANTS_EXCEEDED: `Solo puedes crear un máximo de ${LIMITS.MAX_VARIANTS} variantes por producto.`,
  MAX_OPTIONS_EXCEEDED: `Solo puedes crear un máximo de ${LIMITS.MAX_OPTIONS_PER_VARIANT} opciones por variante.`,
  FILE_TOO_LARGE: 'El archivo es muy grande. Tamaño máximo permitido: 5MB.',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WEBP.',
  NO_FILE_PROVIDED: 'No se proporcionó un archivo válido.',
  UPLOAD_SUCCESS: 'Archivo subido exitosamente.',
  PRODUCT_SAVE_SUCCESS: 'Producto guardado correctamente.',
  PRODUCT_SAVE_ERROR: 'No se pudo guardar el producto.'
};

/**
 * Valida un archivo antes de subirlo
 * @param {File} file - Archivo a validar
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: VALIDATION_MESSAGES.NO_FILE_PROVIDED };
  }

  if (file.size > LIMITS.MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return { 
      isValid: false, 
      error: `El archivo "${file.name}" es muy grande (${sizeMB}MB). ${VALIDATION_MESSAGES.FILE_TOO_LARGE}` 
    };
  }

  if (!LIMITS.VALID_IMAGE_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: `${VALIDATION_MESSAGES.INVALID_FILE_TYPE} Archivo: "${file.name}"` 
    };
  }

  return { isValid: true };
};

/**
 * Valida un conjunto de archivos
 * @param {File[]} files - Archivos a validar
 * @param {number} currentImageCount - Número de imágenes ya existentes
 * @returns {Object} - { isValid: boolean, error?: string, validFiles?: File[] }
 */
export const validateFiles = (files, currentImageCount = 0) => {
  if (!files || files.length === 0) {
    return { isValid: false, error: 'No se seleccionaron archivos.' };
  }

  // Verificar límite total de imágenes
  if (currentImageCount + files.length > LIMITS.MAX_IMAGES) {
    return { 
      isValid: false, 
      error: `${VALIDATION_MESSAGES.MAX_IMAGES_EXCEEDED} Actualmente tienes ${currentImageCount} imágenes.` 
    };
  }

  // Validar cada archivo individualmente
  const validFiles = [];
  for (const file of files) {
    const validation = validateFile(file);
    if (!validation.isValid) {
      return { isValid: false, error: validation.error };
    }
    validFiles.push(file);
  }

  return { isValid: true, validFiles };
};

/**
 * Valida los datos de un producto antes de guardarlo
 * @param {Object} productData - Datos del producto
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateProductData = (productData) => {
  // Validar imágenes
  if (productData.images && productData.images.length > LIMITS.MAX_IMAGES) {
    return { 
      isValid: false, 
      error: `${VALIDATION_MESSAGES.MAX_IMAGES_EXCEEDED} Cantidad actual: ${productData.images.length}` 
    };
  }

  // Validar variantes
  if (productData.variants && productData.variants.length > LIMITS.MAX_VARIANTS) {
    return { 
      isValid: false, 
      error: `${VALIDATION_MESSAGES.MAX_VARIANTS_EXCEEDED} Cantidad actual: ${productData.variants.length}` 
    };
  }

  // Validar opciones por variante
  if (productData.variants) {
    for (let i = 0; i < productData.variants.length; i++) {
      const variant = productData.variants[i];
      const options = Array.isArray(variant.options) ? variant.options : Object.values(variant.options || {});
      if (options.length > LIMITS.MAX_OPTIONS_PER_VARIANT) {
        return { 
          isValid: false, 
          error: `${VALIDATION_MESSAGES.MAX_OPTIONS_EXCEEDED} Variante "${variant.name}" tiene ${options.length} opciones.` 
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Calcula el tamaño total estimado de un producto en bytes
 * @param {Object} productData - Datos del producto
 * @returns {number} - Tamaño estimado en bytes
 */
export const calculateProductSize = (productData) => {
  const jsonString = JSON.stringify(productData);
  // Estimación del tamaño en bytes (cada caracter UTF-8 ≈ 1 byte para ASCII)
  return new TextEncoder().encode(jsonString).length;
};

/**
 * Formatea un tamaño en bytes a una unidad legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado (ej: "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
