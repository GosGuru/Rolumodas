# Guía de Prueba - Sistema de Colores

## Pasos para Probar el Sistema

### 1. Configuración de Base de Datos
✅ **Ya completado:** Campo `colors` agregado a la tabla `products`

### 2. Crear Producto de Prueba
Ejecutar en Supabase SQL Editor:
```sql
-- Ejecutar el archivo: test_colors_product.sql
```

### 3. Probar en el Admin Dashboard

#### 3.1 Crear Producto con Colores
1. Ir a `/admin/dashboard`
2. Hacer clic en "Nuevo Producto"
3. Llenar información básica del producto
4. En la sección "Colores Disponibles":
   - Hacer clic en colores predefinidos (ej: Negro, Blanco, Azul)
   - Usar "Agregar Color Personalizado" para crear colores específicos
5. Guardar el producto

#### 3.2 Verificar en la Lista de Productos
- Los colores deben aparecer como círculos pequeños en las tarjetas
- Debe mostrar "Colores: [círculos de colores]"

#### 3.3 Editar Producto Existente
1. Hacer clic en "Editar" en un producto
2. Verificar que los colores se cargan correctamente
3. Agregar/quitar colores
4. Guardar cambios

### 4. Probar en el Frontend

#### 4.1 Página de Producto
1. Ir a `/producto/[id]` de un producto con colores
2. Verificar que aparece la sección "COLOR:"
3. Hacer clic en diferentes colores
4. Verificar que se selecciona correctamente
5. Agregar al carrito

#### 4.2 ProductCard
1. Ir a `/tienda`
2. Verificar que los productos con colores muestran círculos pequeños
3. Hover sobre los productos para ver efectos

#### 4.3 Carrito
1. Agregar productos con diferentes colores al carrito
2. Verificar que aparecen como items separados
3. Verificar que se muestra el color seleccionado
4. Cambiar cantidades y eliminar items

### 5. Verificaciones Técnicas

#### 5.1 Consola del Navegador
- No debe haber errores JavaScript
- Verificar que los datos se envían correctamente

#### 5.2 Base de Datos
```sql
-- Verificar productos con colores
SELECT id, name, colors FROM products WHERE colors IS NOT NULL;

-- Verificar formato JSON
SELECT id, name, jsonb_typeof(colors) as colors_type FROM products WHERE colors IS NOT NULL;
```

#### 5.3 LocalStorage
- Abrir DevTools > Application > Local Storage
- Verificar que el carrito guarda los colores correctamente

### 6. Casos de Prueba Específicos

#### 6.1 Colores Predefinidos
- [ ] Seleccionar todos los colores predefinidos
- [ ] Deseleccionar colores
- [ ] Verificar límites (máximo colores)

#### 6.2 Colores Personalizados
- [ ] Crear color con nombre y código hexadecimal
- [ ] Crear color usando el color picker
- [ ] Validar formato de código hexadecimal
- [ ] Verificar que no se duplican colores

#### 6.3 Integración con Variantes
- [ ] Producto con colores + variantes (talla)
- [ ] Verificar que se combinan correctamente en el carrito
- [ ] Probar diferentes combinaciones

#### 6.4 Responsive Design
- [ ] Probar en móvil
- [ ] Probar en tablet
- [ ] Probar en desktop
- [ ] Verificar que los círculos de colores se ven bien en todos los tamaños

### 7. Posibles Problemas y Soluciones

#### 7.1 Los colores no se muestran
**Causa:** Campo `colors` no existe en la base de datos
**Solución:** Ejecutar `supabase_colors_setup.sql`

#### 7.2 Error al guardar producto
**Causa:** Formato JSON inválido
**Solución:** Verificar que cada color tiene `name` y `value`

#### 7.3 Colores no se mantienen en el carrito
**Causa:** Contexto del carrito no actualizado
**Solución:** Verificar que `CartContext` incluye colores en la clave única

#### 7.4 Círculos de colores no se ven
**Causa:** Componente `ColorDisplay` no importado
**Solución:** Verificar importaciones en los componentes

### 8. Métricas de Éxito

✅ **Funcional:** Sistema completo de colores implementado
✅ **UI/UX:** Interfaz intuitiva y visualmente atractiva
✅ **Integración:** Funciona con variantes y carrito existente
✅ **Responsive:** Se adapta a todos los dispositivos
✅ **Persistencia:** Los datos se guardan correctamente
✅ **Validación:** Previene errores de formato

### 9. Próximos Pasos

1. **Probar con datos reales** de productos
2. **Optimizar rendimiento** si es necesario
3. **Agregar filtros por color** en la tienda
4. **Implementar imágenes por color** si se requiere
5. **Agregar métricas** de colores más populares

---

**Nota:** Si encuentras algún problema, revisa la consola del navegador y los logs de Supabase para obtener más información sobre el error. 