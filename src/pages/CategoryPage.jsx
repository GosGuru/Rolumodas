import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Loader2, Frown, ArrowLeft } from "lucide-react";
import { fetchProducts } from "@/lib/fetchProducts";
import { fetchCategories } from "@/lib/categoryUtils";
import { toast } from "@/components/ui/use-toast";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        // Buscar la categoría por slug usando la función centralizada
        const categories = await fetchCategories({ slug });
        
        // Si no hay categorías o está vacío, mostrar error
        if (!categories || categories.length === 0) {
          toast({
            title: "Error",
            description: "Categoría no encontrada.",
            variant: "destructive",
          });
          setCategory(null);
          return;
        }
        
        const categoryData = categories[0];
        setCategory(categoryData);
        
        // Buscar productos de esta categoría usando la función centralizada
        const productsData = await fetchProducts({
          categoryId: categoryData.id,
          onlyVisible: true,
          orderBy: 'created_at',
          ascending: false
        });
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error al cargar datos de categoría:', error);
        // El manejo de errores ya está en las funciones individuales
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category?.id, slug]);

  return (
    <>
      <Helmet>
        <title>
          {category ? `${category.name} - Rolu Modas` : "Categoría"}
        </title>
        <meta
          name="description"
          content={`Explora los productos de la categoría ${category?.name} en Rolu Modas.`}
        />
      </Helmet>

      {category && <Breadcrumbs category={category} />}

      <div className="min-h-screen bg-background text-foreground">
        <div className="container px-4 py-8 sm:py-0 mt-[-48px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : category ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4 text-center sm:mb-12"
              >
                {/* <h1 className="text-3xl font-bold tracking-tight uppercase md:text-4xl">
                  {category.name}
                </h1> */}
              </motion.div>

              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-10">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16 text-center"
                >
                  <Frown className="w-16 h-16 mx-auto text-muted-foreground" />
                  <h2 className="mt-4 text-2xl font-semibold">
                    ¡Ups! No hay productos aquí
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Aún no hemos agregado productos a esta categoría.
                  </p>
                  <div className="flex justify-center gap-4 mt-6">
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
              className="py-16 text-center"
            >
              <Frown className="w-16 h-16 mx-auto text-muted-foreground" />
              <h2 className="mt-4 text-2xl font-semibold">
                Categoría no encontrada
              </h2>
              <p className="mt-2 text-muted-foreground">
                La categoría que buscas no existe.
              </p>
              <div className="mt-6">
                <Link to="/tienda">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
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
