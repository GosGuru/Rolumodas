import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { fetchCategories } from '@/lib/categoryUtils';
import { useCategoryDisplaySettings } from '@/hooks/useCategoryDisplaySettings';
import Breadcrumbs from '@/components/Breadcrumbs';

const ShopPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hook para configuración de categorías
  const { getCategoriesToShow } = useCategoryDisplaySettings();

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const categories = await fetchCategories({ 
          orderBy: 'sort_order', 
          ascending: true,
          onlyVisible: true // Activado: solo categorías visibles
        });
        setCategories(categories);
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar las categorías.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <>
      <Helmet>
        <title>Tienda - Rolu Modas</title>
        <meta name="description" content="Explora todas nuestras categorías de productos en Rolu Modas." />
      </Helmet>
      
      <Breadcrumbs />

      <div className="min-h-screen bg-background text-foreground">
        <div className="container px-4 py-6 !pt-[15px] mx-auto sm:py-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : getCategoriesToShow(categories, 'shop').length > 0 ? (
            <div className="grid justify-center grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
              {getCategoriesToShow(categories, 'shop').map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.12, delay: index * 0.01 }}
                  className="relative overflow-hidden aspect-square group"
                >
                  <img
                    src={category.image || 'https://placehold.co/400x400/e0e0e0/000000?text=Rolu'}
                    alt={category.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-40 group-hover:bg-opacity-50">
                    <h3 className="px-2 text-xl font-bold tracking-wider text-center text-white uppercase">
                      {category.name}
                    </h3>
                  </div>
                  <Link to={`/categoria/${category.slug}`} className="absolute inset-0 z-10">
                    <span className="sr-only">Ver {category.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            // Estado cuando no hay categorías visibles
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="max-w-md px-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Próximamente nuevas categorías
                </h3>
                <p className="text-muted-foreground text-sm">
                  Estamos preparando una increíble selección de productos para ti. ¡Vuelve pronto!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopPage;