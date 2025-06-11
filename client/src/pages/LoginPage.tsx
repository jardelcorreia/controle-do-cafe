import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // For displaying login errors
  const { login, isLoading } = useAuth(); // Use isLoading from AuthContext

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); // Clear previous errors
    // isLoading is handled by AuthContext's login function
    try {
      await login(password);
      // Navigation on success will be handled by other parts of the app
      // (e.g. a ProtectedRoute component or effect in a layout component)
      console.log('Login successful (from LoginPage)');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Falha no login.');
      } else {
        setError('Falha no login. Ocorreu um erro desconhecido.');
      }
    }
    // isLoading will be set to false by the login function in AuthContext
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-amber-800 dark:text-amber-200">
            Acesso Restrito
          </CardTitle>
          <CardDescription className="text-center">
            Controle de participantes da rodada do café.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha Compartilhada</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-500 text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-center text-gray-500 dark:text-gray-400">
          <p>Por favor, insira a senha compartilhada para acessar o sistema.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
