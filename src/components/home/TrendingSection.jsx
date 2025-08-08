import React from 'react';
import ProductCard from '@/components/ProductCard';

const TrendingSection = ({ products }) => {
  return (
    <section className="py-8 -mt-8 sm:py-12 bg-background">
      <div className="w-full max-w-6xl px-6 mx-auto sm:px-8">
        <h2 className="px-0 pt-2 mb-2 text-xl font-bold tracking-tight text-center uppercase sm:text-2xl md:text-3xl font-poppins text-foreground">
          PRODUCTOS TENDENCIA
        </h2>
        <div className="grid max-w-4xl grid-cols-2 mx-auto md:grid-cols-3 gap-x-3 gap-y-4 justify-items-center">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
