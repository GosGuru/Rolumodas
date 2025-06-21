
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchTerm('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, categories(name)')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('visible', true)
        .limit(8);
      
      if (error) {
        console.error("Search error:", error);
        setResults([]);
      } else {
        setResults(data);
      }
      setLoading(false);
    };

    const debounceTimeout = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-[10vh] md:pt-[15vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center p-3 border-b border-border">
              <SearchIcon className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-base"
              />
              {loading && <Loader2 className="h-5 w-5 text-muted-foreground animate-spin ml-3" />}
              <Button variant="ghost" size="icon" onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="overflow-y-auto">
              {searchTerm.length > 1 && !loading && results.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No se encontraron productos para "{searchTerm}".
                </div>
              )}

              {results.length > 0 && (
                <div className="p-2">
                  {results.map(product => (
                    <Link key={product.id} to={`/producto/${product.id}`} onClick={onClose}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-4 p-2 rounded-md hover:bg-accent transition-colors duration-150"
                      >
                        <img src={product.images?.[0] || 'https://placehold.co/100x100/e0e0e0/000000?text=Rolu'} alt={product.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.categories?.name}</p>
                        </div>
                        <p className="text-sm font-medium text-foreground">{formatPrice(product.price)}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
              
              {searchTerm.length < 2 && (
                   <div className="p-6 text-center text-muted-foreground">
                      Escribe para buscar en toda la tienda...
                   </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
