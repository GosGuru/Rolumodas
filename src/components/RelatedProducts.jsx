import React from 'react';
import ProductCard from '@/components/ProductCard';

/**
 * @description A component to display a grid of related products.
 * @param {{products: object[]}} props
 * @returns {JSX.Element | null} The related products component or null if there are no products.
 */
const RelatedProducts = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="container px-4 pb-12 mx-auto">
      <h2 className="mt-10 mb-6 text-xl font-bold tracking-tight text-center uppercase sm:text-2xl md:text-3xl text-foreground">
        Productos relacionados
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
        {products.map((prod, idx) => (
          <ProductCard key={prod.id} product={prod} index={idx} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
