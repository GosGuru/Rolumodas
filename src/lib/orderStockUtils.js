import { supabase } from '@/lib/supabaseClient';
import { reduceVariantStock } from '@/lib/variantUtils';
import { toast } from '@/components/ui/use-toast';

/**
 * Reduce el stock de un producto cuando se procesa una orden
 * @param {Object} orderItem - Item de la orden con producto y cantidad
 * @param {string} orderItem.productId - ID del producto
 * @param {number} orderItem.quantity - Cantidad ordenada
 * @param {Object} orderItem.selectedVariants - Variantes seleccionadas
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
export const reduceProductStock = async (orderItem) => {
  try {
    const { productId, quantity, selectedVariants } = orderItem;
    
    // Obtener el producto actual
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
      
    if (fetchError || !product) {
      throw new Error(`No se pudo encontrar el producto ${productId}`);
    }
    
    // Si el producto tiene variantes, reducir stock de las variantes
    if (product.variants && selectedVariants) {
      const updatedVariants = reduceVariantStock(
        product.variants, 
        selectedVariants, 
        quantity
      );
      
      // Actualizar el producto con las variantes actualizadas
      const { error: updateError } = await supabase
        .from('products')
        .update({ variants: updatedVariants })
        .eq('id', productId);
        
      if (updateError) {
        throw new Error(`Error al actualizar stock de variantes: ${updateError.message}`);
      }
      
      console.log(`Stock de variantes reducido para producto ${productId}:`, {
        quantity,
        selectedVariants,
        updatedVariants
      });
    } 
    // Si no tiene variantes, reducir el stock base
    else {
      const newStock = Math.max(0, product.stock - quantity);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);
        
      if (updateError) {
        throw new Error(`Error al actualizar stock base: ${updateError.message}`);
      }
      
      console.log(`Stock base reducido para producto ${productId}: ${product.stock} → ${newStock}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error en reduceProductStock:', error);
    toast({
      title: "Error en gestión de stock",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Procesa una orden completa reduciendo el stock de todos los productos
 * @param {Array} orderItems - Array de items de la orden
 * @returns {Promise<boolean>} - true si todos los stocks se actualizaron correctamente
 */
export const processOrderStock = async (orderItems) => {
  try {
    console.log('Procesando stock para orden:', orderItems);
    
    const results = await Promise.all(
      orderItems.map(item => reduceProductStock(item))
    );
    
    const allSuccessful = results.every(result => result === true);
    
    if (allSuccessful) {
      toast({
        title: "Stock actualizado",
        description: "El inventario se ha actualizado correctamente.",
      });
    } else {
      throw new Error("Algunos productos no pudieron actualizar su stock");
    }
    
    return allSuccessful;
  } catch (error) {
    console.error('Error en processOrderStock:', error);
    toast({
      title: "Error procesando orden",
      description: "Hubo un problema actualizando el inventario.",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Verifica si hay suficiente stock para una orden antes de procesarla
 * @param {Array} orderItems - Array de items de la orden
 * @returns {Promise<Object>} - Resultado de la verificación
 */
export const verifyOrderStock = async (orderItems) => {
  try {
    const verification = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    for (const item of orderItems) {
      const { productId, quantity, selectedVariants } = item;
      
      // Obtener el producto actual
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
        
      if (fetchError || !product) {
        verification.isValid = false;
        verification.errors.push(`Producto ${productId} no encontrado`);
        continue;
      }
      
      // Verificar stock
      let availableStock = 0;
      
      if (product.variants && selectedVariants) {
        // Calcular stock disponible para las variantes seleccionadas
        for (const variant of product.variants) {
          const selectedOption = selectedVariants[variant.name];
          if (selectedOption) {
            const option = variant.options?.find(opt => 
              opt.value === selectedOption.value || 
              opt.label === selectedOption.label ||
              opt === selectedOption
            );
            
            if (option) {
              const optionStock = parseInt(option.stock) || 0;
              availableStock = availableStock === 0 ? optionStock : Math.min(availableStock, optionStock);
            }
          }
        }
      } else {
        availableStock = product.stock || 0;
      }
      
      if (quantity > availableStock) {
        verification.isValid = false;
        verification.errors.push(
          `${product.name}: Solicitado ${quantity}, disponible ${availableStock}`
        );
      } else if (availableStock <= 5) {
        verification.warnings.push(
          `${product.name}: Stock bajo (${availableStock} unidades)`
        );
      }
    }
    
    return verification;
  } catch (error) {
    console.error('Error en verifyOrderStock:', error);
    return {
      isValid: false,
      errors: [`Error verificando stock: ${error.message}`],
      warnings: []
    };
  }
};
