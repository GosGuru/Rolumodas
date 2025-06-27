import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
  
    setLoading(true);
    setError("");
  
    try {
      // Insertar solo el email en la tabla newsletter
      const { data, error } = await supabase
        .from('newsletter')
        .insert([{ email }])
        .select();
      console.log("Respuesta Supabase:", { data, error });
      if (error) {
        setError(error.message || JSON.stringify(error) || "Error desconocido");
        return;
      } else {
        setSuccess(true);
        setEmail("");
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
      console.error('Error en handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };
 

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
        <div className="relative">
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-white text-black px-4 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Suscribiendo...' : 'Suscribirme'}
        </button>
      </form>
      
      {success && (
        <p className="text-green-400 text-sm mt-2 font-medium">
          ¡Gracias por suscribirte! Te mantendremos informado.
        </p>
      )}
      
      {error && (
        <p className="text-red-400 text-sm mt-2 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default NewsletterForm; 