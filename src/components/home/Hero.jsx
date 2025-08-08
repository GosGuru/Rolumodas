import React from 'react';
import { motion } from 'framer-motion';
import HeroImage from '/img/Heroimage.png';

const Hero = ({ heroImage, isHeroLoaded, setIsHeroLoaded }) => {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center text-center text-white bg-gray-400">
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
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        <img
          src={HeroImage}
          alt="Estilo que Inspira"
          className="w-64 sm:w-[60%] max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-auto rounded-lg object-cover"
          style={{ marginTop: '40px' }}
          loading="lazy"
        />
      </div>
    </section>
  );
};

export default Hero;
