import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Credenciales inválidas. Intenta con admin@cancheroo.com / password');
    }
  };

  const fillDemoCredentials = (role: 'superadmin' | 'admin' | 'client') => {
    const credentials = {
      superadmin: { email: 'admin@cancheroo.com', password: 'password' },
      admin: { email: 'club@padelpro.com', password: 'password' },
      client: { email: 'juan@email.com', password: 'password' }
    };
    
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Cancheroo</h1>
          <p className="text-gray-600">Reserva tu cancha favorita</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">Cuentas de demostración:</p>
              <div className="grid gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fillDemoCredentials('superadmin')}
                  className="text-xs"
                >
                  Super Admin
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fillDemoCredentials('admin')}
                  className="text-xs"
                >
                  Admin Club
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fillDemoCredentials('client')}
                  className="text-xs"
                >
                  Cliente
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;