import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Loader2, Frown, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', slug)
        .single();

      if (categoryError || !categoryData) {
        toast({ title: "Error", description: "Categoría no encontrada.", variant: "destructive" });
        setCategory(null);
        setLoading(false);
        return;
      }
      
      setCategory(categoryData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('category_id', categoryData.id)
        .eq('visible', true)
        .order('created_at', { ascending: false });

      if (productsError) {
        toast({ title: "Error", description: "No se pudieron cargar los productos.", variant: "destructive" });
      } else {
        setProducts(productsData);
      }

      setLoading(false);
    };

    fetchCategoryData();
  }, [slug]);

  return (
    <>
      <Helmet>
        <title>{category ? `${category.name} - Rolu Modas` : 'Categoría'}</title>
        <meta name="description" content={`Explora los productos de la categoría ${category?.name} en Rolu Modas.`} />
      </Helmet>
      
      {category && <Breadcrumbs category={category} />}
      
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : category ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8 sm:mb-12"
              >
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">{category.name}</h1>
              </motion.div>

              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <Frown className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h2 className="mt-4 text-2xl font-semibold">¡Ups! No hay productos aquí</h2>
                  <p className="mt-2 text-muted-foreground">Aún no hemos agregado productos a esta categoría.</p>
                  <div className="mt-6 flex justify-center gap-4">
                    <Link to="/tienda">
                      <Button variant="outline">Ver otras categorías</Button>
                    </Link>
                    <Link to="/">
                      <Button>Volver al Inicio</Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Frown className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-semibold">Categoría no encontrada</h2>
                <p className="mt-2 text-muted-foreground">La categoría que buscas no existe.</p>
                <div className="mt-6">
                  <Link to="/tienda">
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver a la tienda
                    </Button>
                  </Link>
                </div>
              </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;