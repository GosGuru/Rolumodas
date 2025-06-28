# Sistema de Variantes de Productos - Rolu Modas

## Descripción General

El sistema de variantes permite a los administradores crear productos con múltiples opciones como talla, color, material, etc. Los usuarios pueden seleccionar estas variantes al comprar productos.

## Características Implementadas

### 1. Gestión de Variantes en el Dashboard
- **Formulario de Producto**: Sección dedicada para agregar variantes
- **Interfaz Intuitiva**: Campos para nombre de variante y opciones separadas por comas
- **Validación**: Solo se guardan variantes con nombre y opciones válidas
- **Edición**: Las variantes se pueden editar al modificar productos existentes

### 2. Visualización en el Frontend
- **Página de Producto**: Componente `ProductVariants` que muestra las opciones disponibles
- **Selección Interactiva**: Botones para seleccionar variantes con feedback visual
- **Resumen de Selección**: Muestra las variantes seleccionadas actualmente
- **Inicialización Automática**: Selecciona la primera opción de cada variante por defecto

### 3. Integración con el Carrito
- **Identificación Única**: Cada combinación de variantes se trata como un producto único
- **Persistencia**: Las variantes seleccionadas se mantienen en el carrito
- **Visualización**: Las variantes aparecen en el carrito y checkout

### 4. Base de Datos
- **Estructura JSONB**: Las variantes se almacenan como JSONB en Supabase
- **Validación**: Triggers para validar el formato de las variantes
- **Índices**: Optimización para consultas con variantes
- **Funciones**: Funciones SQL para búsqueda y estadísticas

## Estructura de Datos

### Formato de Variantes en la Base de Datos
```json
[
  {
    "name": "Talla",
    "options": ["S", "M", "L", "XL"]
  },
  {
    "name": "Color",
    "options": ["Blanco", "Negro", "Azul", "Rojo"]
  }
]
```

### Ejemplo de Producto con Variantes
```javascript
{
  id: 1,
  name: "Camiseta Básica",
  price: 1500,
  description: "Camiseta de algodón 100%",
  variants: [
    {
      name: "Talla",
      options: ["S", "M", "L", "XL"]
    },
    {
      name: "Color",
      options: ["Blanco", "Negro", "Azul", "Rojo"]
    }
  ]
}
```

## Componentes Principales

### 1. ProductVariants.jsx
```jsx
<ProductVariants 
  variants={product.variants} 
  onVariantChange={handleVariantChange}
  selectedVariants={selectedVariants}
/>
```

**Props:**
- `variants`: Array de variantes del producto
- `onVariantChange`: Función callback cuando cambian las selecciones
- `selectedVariants`: Objeto con las variantes actualmente seleccionadas

### 2. CartContext.jsx
Actualizado para manejar variantes:
- Identificación única por combinación de variantes
- Persistencia en localStorage
- Funciones de agregar/remover/actualizar

### 3. ProductForm.jsx
Sección de variantes en el formulario de administración:
- Agregar/remover variantes
- Campos para nombre y opciones
- Validación de datos

## Flujo de Usuario

### 1. Administrador Crea Producto con Variantes
1. Accede al dashboard
2. Crea nuevo producto
3. En la sección "Variantes del Producto":
   - Agrega nombre de variante (ej: "Talla")
   - Agrega opciones separadas por comas (ej: "S, M, L, XL")
   - Puede agregar múltiples variantes
4. Guarda el producto

### 2. Usuario Compra Producto con Variantes
1. Navega a la página del producto
2. Ve las opciones disponibles (ej: Talla, Color)
3. Selecciona las variantes deseadas
4. Ve un resumen de su selección
5. Agrega al carrito
6. Las variantes aparecen en el carrito y checkout

## Configuración de la Base de Datos

### 1. Ejecutar Script SQL
```sql
-- Ejecutar el archivo supabase_variants_setup.sql en el SQL Editor de Supabase
```

### 2. Verificar Configuración
```sql
-- Verificar que la columna variants existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'variants';

-- Verificar trigger de validación
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'products';
```

## Funciones SQL Útiles

### 1. Buscar Productos por Variante
```sql
SELECT * FROM search_products_by_variant('Talla', 'M');
```

### 2. Obtener Estadísticas de Variantes
```sql
SELECT * FROM get_variant_statistics();
```

### 3. Ver Productos con Variantes Expandidas
```sql
SELECT * FROM products_with_variants;
```

## Casos de Uso Comunes

### 1. Ropa con Talla y Color
```json
{
  "name": "Talla",
  "options": ["XS", "S", "M", "L", "XL", "XXL"]
},
{
  "name": "Color", 
  "options": ["Blanco", "Negro", "Azul", "Rojo", "Verde"]
}
```

### 2. Zapatos con Talla y Material
```json
{
  "name": "Talla",
  "options": ["36", "37", "38", "39", "40", "41", "42", "43", "44"]
},
{
  "name": "Material",
  "options": ["Cuero", "Gamuza", "Lona", "Sintético"]
}
```

### 3. Accesorios con Color y Tamaño
```json
{
  "name": "Color",
  "options": ["Dorado", "Plateado", "Negro", "Rosa"]
},
{
  "name": "Tamaño",
  "options": ["Pequeño", "Mediano", "Grande"]
}
```

## Consideraciones Técnicas

### 1. Rendimiento
- Índices GIN en la columna variants para consultas rápidas
- Validación a nivel de base de datos
- Caché de variantes en el frontend

### 2. Escalabilidad
- Estructura JSONB permite flexibilidad
- Funciones SQL optimizadas
- Separación de responsabilidades en componentes

### 3. Mantenimiento
- Validación automática de formato
- Triggers para integridad de datos
- Documentación completa

## Próximas Mejoras Sugeridas

### 1. Gestión de Stock por Variante
- Stock individual para cada combinación de variantes
- Alertas de stock bajo por variante
- Reserva de stock durante el checkout

### 2. Precios por Variante
- Precios diferentes según las variantes seleccionadas
- Descuentos por variantes específicas
- Cálculo dinámico de precios

### 3. Filtros Avanzados
- Filtro por variantes en la tienda
- Búsqueda por combinaciones específicas
- Sugerencias de variantes populares

### 4. Imágenes por Variante
- Imágenes específicas para cada variante
- Galería de imágenes por color/talla
- Zoom en variantes específicas

## Troubleshooting

### Problema: Las variantes no se muestran
**Solución:**
1. Verificar que la columna `variants` existe en la tabla `products`
2. Verificar que los datos están en formato JSONB válido
3. Revisar la consola del navegador para errores

### Problema: Error al guardar variantes
**Solución:**
1. Verificar que el trigger de validación está activo
2. Asegurar que el formato JSON es correcto
3. Verificar permisos de escritura en la base de datos

### Problema: Variantes no aparecen en el carrito
**Solución:**
1. Verificar que `selectedVariants` se está pasando correctamente
2. Revisar la función `addToCart` en CartContext
3. Verificar que el localStorage se está actualizando

## Conclusión

El sistema de variantes está completamente implementado y funcional. Permite a los administradores crear productos flexibles y a los usuarios seleccionar las opciones que desean. La arquitectura es escalable y mantenible, con validación robusta y una experiencia de usuario intuitiva. 