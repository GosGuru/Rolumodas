import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import HeroImage from '../assets/Heroimage.png';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const fetchCategories = supabase
        .from("categories")
        .select("*")
        .order("name")
        .limit(6);
      const fetchTrendingProducts = supabase
        .from("products")
        .select("*, categories(name)")
        .eq("is_trending", true)
        .eq("visible", true)
        .limit(4);
      const fetchHeroImage = supabase
        .from("site_content")
        .select("content_value")
        .eq("content_key", "hero_image")
        .single();

      const [categoriesRes, productsRes, heroImageRes] = await Promise.all([
        fetchCategories,
        fetchTrendingProducts,
        fetchHeroImage,
      ]);

      if (categoriesRes.error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías.",
          variant: "destructive",
        });
      } else {
        setCategories(categoriesRes.data);
      }

      if (productsRes.error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos.",
          variant: "destructive",
        });
      } else {
        setTrendingProducts(productsRes.data);
      }

      if (heroImageRes.error || !heroImageRes.data) {
        setHeroImage(
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
        );
      } else {
        setHeroImage(heroImageRes.data.content_value.url);
      }

      setLoading(false);
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

      <section className="relative h-screen min-h-[600px] flex items-center justify-center text-center text-white bg-gray-400">
        {heroImage && (
          <img
            className="absolute inset-0 object-cover w-full h-full"
            alt="Hero background showing a fashion product"
            src={heroImage}
          />
        )}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 px-4 flex flex-col items-center justify-center">
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            src={HeroImage}
            alt="Estilo que Inspira"
            className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl h-auto rounded-lg shadow-lg object-cover"
          />
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-24 bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <section
            id="categories-section"
            className="py-8  mt-[-30px] md:mt-[-40px] sm:py-12 bg-secondary"
          >
            <div className="w-full max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-3 gap-y-3 md:gap-x-3 md:gap-y-3">
                {categories.slice(0, 6).map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative w-full aspect-[1.2/1] overflow-hidden"
                  >
                    <img
                      src={category.image || "https://placehold.co/400x400/e0e0e0/000000?text=Rolu"}
                      alt={category.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black/30">
                      <h3 className="text-base sm:text-lg md:text-2xl font-bold tracking-wider uppercase drop-shadow">
                        {category.name}
                      </h3>
                      <Link
                        to={`/categoria/${category.slug}`}
                        className="inline-flex items-center mt-2 text-base font-semibold hover:underline"
                      >
                        Ver más <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
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

          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold tracking-tight text-center uppercase text-foreground">
            PRODUCTOS TENDENCIA
          </h2>

          <section className="py-8 sm:py-12 bg-background">
            <div className="container px-4 mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
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