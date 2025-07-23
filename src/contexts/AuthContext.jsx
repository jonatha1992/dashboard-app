// Contexto de autenticación para manejar el inicio de sesión
import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    // Bypass authentication - always return authenticated=true for testing
    const [authenticated, setAuthenticated] = useState(true);
    const [error, setError] = useState('');

    // Función para iniciar sesión (mantenida para compatibilidad)
    const login = () => {
        // Always return true since authentication is bypassed
        setAuthenticated(true);
        setError('');
        return true;
    };

    // Función para cerrar sesión (mantenida para compatibilidad)
    const logout = () => {
        // No action needed since authentication is bypassed
        setAuthenticated(true);
    };

    const value = {
        authenticated,
        login,
        logout,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
