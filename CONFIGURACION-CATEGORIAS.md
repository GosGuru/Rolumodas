# Configuración de Visualización de Categorías

## 📋 Descripción

Se implementó una nueva funcionalidad que permite controlar cuántas categorías se muestran en la página de inicio (Home) y en la página de tienda (Shop) de forma independiente.

## 🚀 Características Implementadas

### Configuraciones Disponibles

**Para la Página Principal (Home):**
- ✅ **Mostrar todas las categorías**: Switch para mostrar todas las categorías disponibles
- ✅ **Límite numérico**: Control del número máximo de categorías a mostrar (1-20)
- ✅ **Valor por defecto**: 6 categorías máximo

**Para la Página de Tienda (Shop):**
- ✅ **Mostrar todas las categorías**: Switch para mostrar todas las categorías disponibles
- ✅ **Límite numérico**: Control del número máximo de categorías a mostrar (1-20)
- ✅ **Valor por defecto**: Mostrar todas las categorías

### Interfaz de Usuario

- 🎨 **Diseño moderno**: Interfaz consistente con el admin panel
- 🔄 **Feedback visual**: Indicadores de cambios sin guardar
- ⚡ **Tiempo real**: Los cambios se reflejan inmediatamente tras guardar
- 📱 **Responsive**: Interfaz adaptativa para móviles y desktop

## 🛠️ Componentes Creados

### 1. `CategoryDisplaySettings.jsx`
**Ubicación**: `src/components/admin/CategoryDisplaySettings.jsx`

Componente principal de configuración que incluye:
- Switches para "Mostrar todas las categorías"
- Inputs numéricos para límites específicos
- Botones de guardar/cancelar
- Indicadores visuales de estado

### 2. Hook `useCategoryDisplaySettings`
**Ubicación**: `src/hooks/useCategoryDisplaySettings.js`

Hook personalizado que maneja:
- Carga de configuraciones desde la base de datos
- Función `getCategoriesToShow()` para filtrar categorías
- Estados de carga y actualización

### 3. Extensiones en `siteUtils.js`
**Ubicación**: `src/lib/siteUtils.js`

Nuevas funciones añadidas:
- `fetchCategoryDisplaySettings()`: Obtiene configuraciones
- `updateCategoryDisplaySettings()`: Actualiza configuraciones

## 📊 Base de Datos

Se utilizan las siguientes claves en la tabla `site_content`:

| Clave | Descripción | Valor por defecto |
|-------|-------------|-------------------|
| `categories_home_limit` | Límite de categorías en Home | 6 |
| `categories_shop_limit` | Límite de categorías en Shop | null (sin límite) |
| `categories_home_show_all` | Mostrar todas en Home | false |
| `categories_shop_show_all` | Mostrar todas en Shop | true |

## 🔧 Ubicación en el Admin Panel

La nueva configuración se encuentra en:
**Admin Panel → Gestión → Personalización del Sitio → Configuración de Categorías**

## 💡 Cómo Funciona

### Flujo de la Configuración

1. **Administrador accede** al panel de configuración
2. **Modifica configuraciones** usando los switches y inputs
3. **Guarda cambios** que se almacenan en `site_content`
4. **Las páginas Home y Shop** cargan automáticamente las nuevas configuraciones
5. **Se aplican los límites** según la configuración guardada

### Lógica de Filtrado

```javascript
// En HomePage y ShopPage
const categoriesToShow = getCategoriesToShow(allCategories, 'home'); // o 'shop'

// La función getCategoriesToShow:
// 1. Si "Mostrar todas" = true → Retorna todas las categorías
// 2. Si "Mostrar todas" = false → Aplica el límite numérico
// 3. Si no hay límite específico → Retorna todas las categorías
```

## 🎯 Beneficios

### Para el Administrador
- ✅ **Control total** sobre la visualización de categorías
- ✅ **Configuración independiente** para Home y Shop
- ✅ **Interfaz intuitiva** con feedback visual
- ✅ **Cambios inmediatos** sin necesidad de reiniciar

### Para los Usuarios
- ✅ **Experiencia optimizada** con categorías relevantes
- ✅ **Carga más rápida** al limitar categorías mostradas
- ✅ **Navegación mejorada** con menos opciones pero más enfocadas

## 🔄 Estados de la Configuración

### Estado Inicial (Primera vez)
- **Home**: Muestra máximo 6 categorías
- **Shop**: Muestra todas las categorías

### Estados Posibles
1. **Mostrar Todas Activado**: Ignora límites numéricos
2. **Mostrar Todas Desactivado**: Usa límite específico
3. **Sin Límite**: Comportamiento como "mostrar todas"

## ⚙️ Archivos Modificados

### Nuevos Archivos
- `src/components/admin/CategoryDisplaySettings.jsx`
- `src/hooks/useCategoryDisplaySettings.js`

### Archivos Modificados
- `src/lib/siteUtils.js` - Nuevas funciones de configuración
- `src/hooks/useSiteContent.js` - Soporte para configuración de categorías
- `src/components/admin/SiteManagement.jsx` - Integración del nuevo componente
- `src/pages/HomePage.jsx` - Uso de configuración para filtrar categorías
- `src/pages/ShopPage.jsx` - Uso de configuración para filtrar categorías

## 🧪 Testing

Para probar la funcionalidad:

1. **Acceder al admin panel**: `/admin/login`
2. **Ir a Gestión**: Sección de administración
3. **Buscar "Configuración de Categorías"**: En Personalización del Sitio
4. **Modificar configuraciones**: Cambiar switches y límites
5. **Guardar cambios**: Usar botón "Guardar Cambios"
6. **Verificar en frontend**: Visitar `/` (Home) y `/tienda` (Shop)

## 🎨 UI/UX Features

- **Iconos informativos**: Home, Store, Eye, Hash para mejor comprensión
- **Colores diferenciados**: Verde para Home, Púrpura para Shop
- **Estados visuales**: Disabled, loading, changes indicators
- **Tooltips descriptivos**: Explicaciones claras de cada función
- **Transiciones suaves**: Animaciones con Framer Motion

## 📈 Rendimiento

- **Carga optimizada**: Solo se cargan las categorías necesarias
- **Cache inteligente**: Las configuraciones se mantienen en memoria
- **Actualizaciones selectivas**: Solo se actualizan las configuraciones modificadas
- **Error handling**: Manejo robusto de errores con fallbacks
