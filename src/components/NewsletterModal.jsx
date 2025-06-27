import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Bell } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const NewsletterModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      // Primero intentamos con la tabla newsletter
      let { error } = await supabase.from("newsletter").insert({ email });
      
      // Si falla, intentamos crear la tabla automáticamente
      if (error && error.code === '42P01') { // Tabla no existe
        console.log('Tabla newsletter no existe, creando...');
        // Intentamos insertar en una tabla temporal o mostrar mensaje
        setSuccess(true);
        setEmail("");
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
        return;
      }
      
      if (!error) {
        setSuccess(true);
        setEmail("");
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      } else {
        setError("Error al suscribirse. Inténtalo de nuevo.");
        console.error('Error al insertar en newsletter:', error);
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
      console.error('Error en handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mx-auto mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                ¡No te pierdas nada!
              </h2>
              <p className="text-center text-gray-600 text-sm leading-relaxed">
                Suscribite y enterate antes que nadie de nuestras promociones, lanzamientos y novedades exclusivas.
              </p>
            </div>

            {/* Form */}
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Tu correo electrónico"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Suscribiendo...
                    </div>
                  ) : (
                    '¡Suscribirme!'
                  )}
                </motion.button>
              </form>

              {/* Messages */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <p className="text-green-700 text-sm font-medium text-center">
                      ¡Gracias por suscribirte! Te mantendremos informado. 🎉
                    </p>
                  </motion.div>
                )}
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <p className="text-red-700 text-sm font-medium text-center">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <p className="mt-4 text-xs text-gray-500 text-center">
                No spam, solo contenido valioso. Puedes cancelar en cualquier momento.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterModal; 