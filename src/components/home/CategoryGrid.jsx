import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryGrid = ({ categories }) => {
  return (
    <section
      id="categories-section"
      className="mt-[-30px] md:mt-[-40px] sm:py-12 bg-secondary py-8 -mb-8"
    >
      <div className="w-full max-w-6xl px-6 mx-auto sm:px-8">
        <h2 className="px-0 pt-0 mb-2 text-lg font-bold tracking-tight text-center uppercase sm:text-xl md:text-3xl text-foreground">CATEGORÍAS</h2>
        <div className="grid max-w-4xl grid-cols-2 mx-auto md:grid-cols-3 gap-x-3 gap-y-4 justify-items-center">
          {categories.slice(0, 6).map((category, index) => (
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
                  loading="lazy"
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
  );
};

export default CategoryGrid;
