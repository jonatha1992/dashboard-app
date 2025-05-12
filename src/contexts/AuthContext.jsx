// Contexto de autenticación para manejar el inicio de sesión
import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState('');

    // Función para iniciar sesión
    const login = (password) => {
        // Para simplificar, usaremos una contraseña fija
        // En un caso real, esto se verificaría contra un backend seguro
        if (password === "admin123") {
            setAuthenticated(true);
            setError('');
            return true;
        } else {
            setError('Contraseña incorrecta');
            return false;
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        setAuthenticated(false);
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
