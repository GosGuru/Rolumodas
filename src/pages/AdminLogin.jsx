import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { success, error: authError } = await login(email, password);

    if (success) {
      toast({
        title: "¡Inicio de sesión exitoso!",
        description: "Redirigiendo al dashboard...",
        className: "bg-black text-white border-gray-700 font-negro",
      });
      navigate('/admin/dashboard');
    } else {
      setError('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Rolu Modas</title>
      </Helmet>
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 admin-login-page">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block">
               <h1 className="text-3xl text-gray-900 font-negro">ROLU MODAS</h1>
            </Link>
            <h2 className="mt-2 text-xl text-gray-700 font-header-nav">Acceso de Administrador</h2>
          </div>
          
          <div className="p-8 bg-white shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 font-negro">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-gray-700 font-negro">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center p-3 space-x-2 text-sm text-red-600 bg-red-100">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <Button type="submit" className="flex justify-center w-full px-4 py-2 text-sm text-white bg-black border border-transparent font-negro hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
           <p className="mt-6 text-xs text-center text-gray-600">
            <Link to="/" className="text-black font-negro hover:underline">
              Volver a la tienda
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;