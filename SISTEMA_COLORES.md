# Sistema de Colores - Rolu Modas

## Descripción General

Se ha implementado un sistema completo de colores para productos que permite:

1. **Seleccionar colores predefinidos** de una paleta común
2. **Agregar colores personalizados** con nombre y código hexadecimal
3. **Visualizar colores** como círculos en la UI
4. **Seleccionar colores** en la página de producto
5. **Gestionar colores** en el carrito y checkout

## Componentes Implementados

### 1. ColorPicker (src/components/admin/ColorPicker.jsx)
Selector de colores para el formulario de administración.

**Características:**
- 20 colores predefinidos comunes
- Opción para agregar colores personalizados
- Visualización de colores seleccionados
- Validación de formato

**Uso:**
```jsx
<ColorPicker
  selectedColors={product.colors}
  onColorsChange={handleColorsChange}
/>
```

### 2. ColorDisplay (src/components/ColorDisplay.jsx)
Componente para mostrar colores como círculos en la UI.

**Características:**
- Diferentes tamaños (sm, md, lg, xl)
- Opción para mostrar nombres
- Tooltips informativos

**Uso:**
```jsx
<ColorDisplay 
  colors={product.colors} 
  size="md" 
  showNames={false} 
/>
```

## Base de Datos

### Estructura del Campo `colors`
```sql
ALTER TABLE products ADD COLUMN colors JSONB DEFAULT NULL;
```

**Formato JSON:**
```json
[
  {
    "name": "Negro",
    "value": "#000000"
  },
  {
    "name": "Blanco", 
    "value": "#FFFFFF"
  }
]
```

### Script de Configuración
Ejecutar `supabase_colors_setup.sql` en el SQL Editor de Supabase para:
- Agregar la columna `colors`
- Crear índices para mejor rendimiento
- Agregar validaciones
- Crear funciones de búsqueda

## Integración en la UI

### 1. Formulario de Productos (Admin)
- Sección "Colores Disponibles" en el formulario
- Selector visual con colores predefinidos
- Opción para agregar colores personalizados
- Validación en tiempo real

### 2. ProductCard
- Muestra colores disponibles como círculos pequeños
- Posicionado debajo de la descripción corta
- Tamaño compacto para no interferir con el diseño

### 3. Página de Producto
- Selector de colores interactivo
- Círculos grandes con hover effects
- Indicador visual del color seleccionado
- Información del color seleccionado

### 4. Carrito
- Muestra el color seleccionado para cada producto
- Círculo de color + nombre del color
- Integrado con el sistema de variantes

## Funcionalidades

### Selección de Colores
1. **Colores Predefinidos:** 20 colores comunes (negro, blanco, rojo, azul, etc.)
2. **Colores Personalizados:** Agregar cualquier color con nombre personalizado
3. **Validación:** Verificación de formato y duplicados

### Gestión en el Carrito
- Los productos con diferentes colores se tratan como items separados
- Clave única incluye: `productId-variants-color-timestamp`
- Visualización clara del color seleccionado

### Persistencia
- Los colores se guardan en la base de datos como JSONB
- Se mantienen en localStorage del carrito
- Compatible con el sistema de variantes existente

## Colores Predefinidos

```javascript
const predefinedColors = [
  { name: 'Negro', value: '#000000' },
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Rojo', value: '#FF0000' },
  { name: 'Azul', value: '#0000FF' },
  { name: 'Verde', value: '#00FF00' },
  { name: 'Amarillo', value: '#FFFF00' },
  { name: 'Rosa', value: '#FFC0CB' },
  { name: 'Naranja', value: '#FFA500' },
  { name: 'Púrpura', value: '#800080' },
  { name: 'Gris', value: '#808080' },
  { name: 'Marrón', value: '#A52A2A' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Lima', value: '#00FF00' },
  { name: 'Azul Marino', value: '#000080' },
  { name: 'Verde Oliva', value: '#808000' },
  { name: 'Teal', value: '#008080' },
  { name: 'Violeta', value: '#800080' },
  { name: 'Coral', value: '#FF7F50' },
  { name: 'Dorado', value: '#FFD700' }
];
```

## Uso para Administradores

### Agregar Colores a un Producto
1. Ir al Dashboard de Administración
2. Crear o editar un producto
3. En la sección "Colores Disponibles":
   - Hacer clic en colores predefinidos para seleccionarlos
   - Usar "Agregar Color Personalizado" para colores específicos
4. Guardar el producto

### Agregar Color Personalizado
1. Hacer clic en "Agregar Color Personalizado"
2. Ingresar nombre del color (ej: "Azul Marino")
3. Seleccionar color con el picker o ingresar código hexadecimal
4. Hacer clic en "Agregar Color"

## Uso para Clientes

### Seleccionar Color en Producto
1. Ir a la página del producto
2. En la sección "COLOR:" ver los círculos de colores disponibles
3. Hacer clic en el color deseado
4. El color seleccionado se muestra con un indicador blanco
5. Agregar al carrito con el color seleccionado

### Ver Colores en Carrito
- Cada producto muestra el color seleccionado
- Círculo de color + nombre del color
- Los productos con diferentes colores son items separados

## Consideraciones Técnicas

### Rendimiento
- Índices GIN en la base de datos para búsquedas rápidas
- Componentes optimizados con React.memo cuando sea necesario
- Lazy loading de componentes pesados

### Accesibilidad
- Tooltips en todos los selectores de color
- Contraste adecuado en los indicadores
- Navegación por teclado soportada

### Compatibilidad
- Funciona con el sistema de variantes existente
- Compatible con el carrito actual
- No afecta productos sin colores

## Próximas Mejoras Sugeridas

1. **Filtros por Color:** Agregar filtros en la tienda por color
2. **Imágenes por Color:** Mostrar imágenes específicas según el color seleccionado
3. **Stock por Color:** Gestionar stock individual por color
4. **Búsqueda Avanzada:** Búsqueda de productos por color
5. **Paletas Temáticas:** Agrupar colores por temporada o colección

## Troubleshooting

### Problemas Comunes

**Los colores no se muestran:**
- Verificar que el campo `colors` existe en la base de datos
- Ejecutar el script SQL de configuración
- Verificar que los datos están en formato JSON válido

**Error al guardar producto con colores:**
- Verificar que el formato JSON es correcto
- Asegurar que cada color tiene `name` y `value`
- Revisar la consola del navegador para errores

**Colores no se mantienen en el carrito:**
- Verificar que el contexto del carrito está actualizado
- Limpiar localStorage y probar nuevamente
- Verificar que la clave única incluye el color

## Archivos Modificados

1. `src/components/admin/ColorPicker.jsx` - Nuevo componente
2. `src/components/admin/ProductForm.jsx` - Integración del selector
3. `src/components/ColorDisplay.jsx` - Nuevo componente
4. `src/components/ProductCard.jsx` - Visualización de colores
5. `src/pages/ProductPage.jsx` - Selector de colores
6. `src/contexts/CartContext.jsx` - Manejo de colores en carrito
7. `src/components/CartDrawer.jsx` - Visualización en carrito
8. `src/pages/AdminDashboard.jsx` - Guardado de colores
9. `supabase_colors_setup.sql` - Script de base de datos
10. `SISTEMA_COLORES.md` - Esta documentación

---

**Nota:** Este sistema es completamente funcional y está integrado con el flujo existente de la aplicación. Los colores se manejan de forma similar a las variantes, manteniendo la consistencia en la experiencia del usuario. 