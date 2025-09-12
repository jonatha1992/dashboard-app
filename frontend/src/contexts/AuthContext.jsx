// Contexto de autenticación para manejar el inicio de sesión
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (apiService.isAuthenticated()) {
                    const userData = await apiService.getCurrentUser();
                    setUser(userData.user);
                    setAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                apiService.logout();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Función para iniciar sesión
    const login = async (username, password) => {
        try {
            setError('');
            const response = await apiService.login(username, password);
            setUser(response.user);
            setAuthenticated(true);
            return true;
        } catch (error) {
            setError(error.message || 'Error al iniciar sesión');
            return false;
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        apiService.logout();
        setAuthenticated(false);
        setUser(null);
        setError('');
    };

    const value = {
        authenticated,
        user,
        error,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}