-- Agregar columna 'visible' a la tabla categories
-- Esta columna permite ocultar categorías del frontend sin eliminarlas

-- Agregar la columna visible con valor por defecto true
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;

-- Establecer todas las categorías existentes como visibles
UPDATE categories 
SET visible = true 
WHERE visible IS NULL;

-- Agregar comentario para documentar la columna
COMMENT ON COLUMN categories.visible IS 'Indica si la categoría es visible en el frontend. false = oculta, true = visible';
