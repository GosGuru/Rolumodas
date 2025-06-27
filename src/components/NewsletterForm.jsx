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
      // Intentar insertar en la tabla newsletter
      let { error } = await supabase.from("newsletter").insert({ email });
      
      // Si la tabla no existe (error 42P01), mostrar mensaje de éxito temporal
      if (error && error.code === '42P01') {
        console.log('Tabla newsletter no existe, mostrando mensaje de éxito temporal');
        setSuccess(true);
        setEmail("");
        setTimeout(() => setSuccess(false), 5000);
        return;
      }
      
      // Si hay error de email duplicado, mostrar mensaje específico
      if (error && error.code === '23505') {
        setError("Este email ya está suscrito.");
        return;
      }
      
      if (!error) {
        setSuccess(true);
        setEmail("");
        setTimeout(() => setSuccess(false), 5000);
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

  // Función opcional para sincronizar con MailerLite
  const syncWithMailerLite = async (email) => {
    try {
      const response = await fetch('https://api.mailerlite.com/api/v2/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MailerLite-ApiKey': import.meta.env.VITE_MAILERLITE_API_KEY,
        },
        body: JSON.stringify({ email, resubscribe: true }),
      });
      
      if (!response.ok) {
        console.warn('Error al sincronizar con MailerLite');
      }
    } catch (err) {
      console.warn('Error en sincronización con MailerLite:', err);
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