import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Button } from '@/components/ui/button';

/**
 * @description A component to display a product's image gallery with zoom, swipe, and lightbox features.
 * @param {{images: string[], productName: string}} props
 * @returns {JSX.Element} The product image gallery component.
 */
const ProductImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgContainerRef = useRef(null);

  const safeImages = images?.length > 0 ? images : ['https://placehold.co/600x800/e0e0e0/000000?text=Rolu'];
  const currentImage = safeImages[selectedImage] || safeImages[0];

  // Zoom handlers
  const handleMouseMove = (e) => {
    if (!zoomed || !imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleTouchMove = (e) => {
    if (!zoomed || !imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.12, delay: 0 }}
      className="space-y-4"
    >
      <div
        ref={imgContainerRef}
        className="relative w-full overflow-hidden aspect-square bg-secondary group"
        tabIndex={0}
        style={{ cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
        onClick={() => setLightboxOpen(true)}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setZoomed(true)}
        onTouchEnd={() => setZoomed(false)}
        onTouchMove={handleTouchMove}
      >
        <img
          src={currentImage}
          alt={productName}
          className={`w-full h-full object-cover transition duration-300 ${zoomed ? 'pointer-events-none' : ''}`}
          style={zoomed ? {
            transform: `scale(2)`,
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transition: 'transform 0.2s cubic-bezier(.4,2,.6,1)',
            zIndex: 20,
          } : {}}
          draggable={false}
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x800/e0e0e0/000000?text=Rolu';
            e.target.onerror = null;
          }}
        />
        {safeImages.length > 1 && (
          <>
            <button
              className="absolute z-30 p-2 -translate-y-1/2 rounded-full shadow left-2 top-1/2 bg-white/70 hover:bg-white"
              onClick={e => { e.stopPropagation(); setSelectedImage((prev) => (prev - 1 + safeImages.length) % safeImages.length); }}
              aria-label="Imagen anterior"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button
              className="absolute z-30 p-2 -translate-y-1/2 rounded-full shadow right-2 top-1/2 bg-white/70 hover:bg-white"
              onClick={e => { e.stopPropagation(); setSelectedImage((prev) => (prev + 1) % safeImages.length); }}
              aria-label="Imagen siguiente"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </>
        )}
      </div>
      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square w-full overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'}`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/100x100/e0e0e0/000000?text=Rolu';
                  e.target.onerror = null;
                }}
              />
            </button>
          ))}
        </div>
      )}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={safeImages.map((img) => ({ src: img }))}
          index={selectedImage}
          on={{ view: ({ index }) => setSelectedImage(index) }}
          styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.8)" } }}
          closeOnBackdropClick
          render={{
            iconPrev: () => <Button size="icon" variant="ghost" className="absolute z-50 text-white -translate-y-1/2 left-4 top-1/2 bg-black/50 hover:bg-black/70">←</Button>,
            iconNext: () => <Button size="icon" variant="ghost" className="absolute z-50 text-white -translate-y-1/2 right-4 top-1/2 bg-black/50 hover:bg-black/70">→</Button>,
          }}
        />
      )}
    </motion.div>
  );
};

export default ProductImageGallery;
