import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
import { fetchProducts } from "@/lib/fetchProducts";
import { fetchCategories } from "@/lib/categoryUtils";
import { fetchHeroImage } from "@/lib/siteUtils";
import { useCategoryDisplaySettings } from "@/hooks/useCategoryDisplaySettings";
import ProductCard from "@/components/ProductCard";
import HeroImage from '../assets/Heroimage.png';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);
  
  // Hook para configuración de categorías
  const { getCategoriesToShow } = useCategoryDisplaySettings();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Usar funciones centralizadas con manejo de errores incorporado
        const [categoriesData, productsData, heroImageUrl] = await Promise.all([
          fetchCategories({ orderBy: 'sort_order', ascending: true, onlyVisible: true }),
          fetchProducts({ 
            includeTrending: true, 
            onlyVisible: true, 
            limit: 4 
          }),
          fetchHeroImage()
        ]);
        
        setCategories(categoriesData);
        setTrendingProducts(productsData);
        setHeroImage(heroImageUrl);
      } catch (error) {
        if (typeof window !== 'undefined' && window?.__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('Error al cargar datos de la página principal:', error);
        }
        // El manejo de errores ya está en las funciones individuales
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Rolu Modas - Inicio</title>
        <meta
          name="description"
          content="Explora nuestras categorías y productos tendencia en Rolu Modas."
        />
      </Helmet>

            <section className="relative h-[100vh] mt-[-80px] min-h-[600px] flex items-center justify-center text-center text-white bg-gray-400">
        {!isHeroLoaded && (
          <div className="absolute inset-0 z-0 w-full h-full bg-gray-400 animate-pulse" />
        )}
        {heroImage && (
          <img
            className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-300 ${isHeroLoaded ? 'opacity-100' : 'opacity-0'}`}
            alt="Hero background showing a fashion product"
            src={heroImage}
            onLoad={() => setIsHeroLoaded(true)}
            draggable={false}
          />
        )}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 flex flex-col items-center justify-center px-4">
          <img
            src={HeroImage}
            alt="Estilo que Inspira"
            className="w-64 sm:w-[60%] max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-auto rounded-lg object-cover"
            style={{ marginTop: '40px' }}
          />
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-24 bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Solo mostrar sección de categorías si hay categorías visibles */}
          {getCategoriesToShow(categories, 'home').length > 0 && (
            <section
              id="categories-section"
              className="mt-[-30px] md:mt-[-40px] sm:py-12 bg-secondary py-8 -mb-8"
            >
              <div className="w-full max-w-6xl px-6 mx-auto sm:px-8">
                <h2 className="px-0 pt-0 mb-2 text-lg font-bold tracking-tight text-center uppercase sm:text-xl md:text-3xl text-foreground">CATEGORÍAS</h2>
                <div className="grid max-w-4xl grid-cols-2 mx-auto md:grid-cols-3 gap-x-3 gap-y-4 justify-items-center">
                  {getCategoriesToShow(categories, 'home').map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative flex items-center justify-center w-full max-w-xs overflow-hidden transition-shadow duration-300 shadow-lg aspect-square hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center w-full h-full overflow-hidden aspect-square">
                        <img
                          src={category.image || 'https://placehold.co/400x400/e0e0e0/000000?text=Rolu'}
                          alt={category.name}
                          className="object-cover w-full h-full max-w-full max-h-full"
                          style={{ aspectRatio: '1/1' }}
                        />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black/30">
                        <h3 className="text-sm font-bold tracking-wider text-white uppercase font-poppins sm:text-base md:text-lg">
                          {category.name}
                        </h3>
                      </div>
                      <Link
                        to={`/categoria/${category.slug}`}
                        className="absolute inset-0 z-10"
                      >
                        <span className="sr-only">Ver {category.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <h2 className="px-0 pt-2 mb-2 text-xl font-bold tracking-tight text-center uppercase sm:text-2xl md:text-3xl font-poppins text-foreground">
            PRODUCTOS TENDENCIA
          </h2>

          <section className="py-8 -mt-8 sm:py-12 bg-background">
            <div className="w-full max-w-6xl px-6 mx-auto sm:px-8">
              <div className="grid max-w-4xl grid-cols-2 mx-auto md:grid-cols-3 gap-x-3 gap-y-4 justify-items-center">
                {trendingProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default HomePage;