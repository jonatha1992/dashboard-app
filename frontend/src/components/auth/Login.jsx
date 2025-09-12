// Componente de inicio de sesión

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login, error, authenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [authenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await login(username, password);
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-primary">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4 text-lg">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-primary">
            <div className="relative w-full max-w-md">
                {/* Header con branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4 shadow-lg">
                        <span className="text-2xl text-white">🔐</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Sistema de Análisis Operativo
                    </h1>
                    <p className="text-gray-400">
                        Acceso seguro al dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-background-secondary border border-dark-600 rounded-lg p-8 shadow-card backdrop-blur-sm">
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="mb-6">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                Usuario
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-background-card border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                placeholder="Ingrese su usuario"
                                required
                                autoFocus
                                disabled={submitting}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-background-card border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                placeholder="Ingrese su contraseña"
                                required
                                disabled={submitting}
                            />
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <div className="flex items-center">
                                    <span className="text-red-400 mr-2">⚠️</span>
                                    <span className="text-red-400 text-sm font-medium">
                                        {error}
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background-secondary transition-all duration-200 ${
                                submitting ? 'opacity-50 cursor-not-allowed transform scale-95' : 'hover:transform hover:scale-105 shadow-lg hover:shadow-xl'
                            }`}
                            disabled={submitting}
                        >
                            <div className="flex items-center justify-center">
                                {submitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                )}
                                {submitting ? 'Ingresando...' : 'Iniciar Sesión'}
                            </div>
                        </button>
                    </form>

                    {/* Credentials info */}
                    <div className="mt-8 pt-6 border-t border-dark-600">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-3">Credenciales de prueba:</p>
                            <div className="space-y-2 text-xs">
                                <div className="bg-background-card rounded-lg p-3 border border-dark-600">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Administrador:</span>
                                        <span className="font-mono text-primary-400">admin / admin123</span>
                                    </div>
                                </div>
                                <div className="bg-background-card rounded-lg p-3 border border-dark-600">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Visualizador:</span>
                                        <span className="font-mono text-primary-400">viewer / viewer123</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-500">
                        Sistema seguro de gestión operativa
                    </p>
                </div>
            </div>
        </div>
    );
}
