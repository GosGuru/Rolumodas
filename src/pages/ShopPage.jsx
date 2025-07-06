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

      <div className="min-h-screen bg-background text-foreground">
        <div className="container px-4 py-6 !pt-[15px] mx-auto sm:py-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid justify-center grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
              {categories.map((category, index) => (
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
          )}
        </div>
      </div>
    </>
  );
};

export default ShopPage;