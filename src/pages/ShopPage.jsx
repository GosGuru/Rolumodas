import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import Breadcrumbs from '@/components/Breadcrumbs';

const ShopPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) {
        toast({ title: "Error", description: "No se pudieron cargar las categorías.", variant: "destructive" });
      } else {
        setCategories(data);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <>
      <Helmet>
        <title>Tienda - Rolu Modas</title>
        <meta name="description" content="Explora todas nuestras categorías de productos en Rolu Modas." />
      </Helmet>
      
      <Breadcrumbs />

      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 justify-center">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="relative aspect-square group overflow-hidden"
                >
                  <img
                    src={category.image || 'https://placehold.co/400x400/e0e0e0/000000?text=Rolu'}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 group-hover:bg-opacity-50">
                    <h3 className="text-white text-xl font-bold uppercase tracking-wider text-center px-2">
                      {category.name}
                    </h3>
                  </div>
                  <Link to={`/categoria/${category.slug}`} className="absolute inset-0 z-10">
                    <span className="sr-only">Ver {category.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopPage;