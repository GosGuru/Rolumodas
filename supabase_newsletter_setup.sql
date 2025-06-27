-- Script para crear la tabla newsletter en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear la tabla newsletter si no existe
CREATE TABLE IF NOT EXISTS newsletter (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);

-- Crear índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir inserciones desde el cliente
CREATE POLICY "Allow public insert" ON newsletter
    FOR INSERT
    WITH CHECK (true);

-- Crear política para permitir lectura solo a usuarios autenticados (opcional)
CREATE POLICY "Allow authenticated read" ON newsletter
    FOR SELECT
    TO authenticated
    USING (true);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_newsletter_updated_at
    BEFORE UPDATE ON newsletter
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'newsletter'
ORDER BY ordinal_position; 