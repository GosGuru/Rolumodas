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
      <div className="admin-login-page min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
               <h1 className="text-3xl font-negro text-gray-900">ROLU MODAS</h1>
            </Link>
            <h2 className="mt-2 text-xl text-gray-700 font-header-nav">Acceso de Administrador</h2>
          </div>
          
          <div className="bg-white shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-negro text-gray-700">
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-negro text-gray-700">
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-100 p-3">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <Button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-negro text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
           <p className="mt-6 text-center text-xs text-gray-600">
            <Link to="/" className="font-negro text-black hover:underline">
              Volver a la tienda
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;