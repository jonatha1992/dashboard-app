/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';

const AUTH_USER_KEY = 'auth_user';
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const persistUser = (incomingUser) => {
        if (!incomingUser) return;
        try {
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(incomingUser));
        } catch (storageError) {
            console.warn('AuthContext: no se pudo guardar el usuario en localStorage', storageError);
        }
    };

    const loadPersistedUser = () => {
        try {
            const stored = localStorage.getItem(AUTH_USER_KEY);
            if (!stored) return null;
            return JSON.parse(stored);
        } catch (storageError) {
            console.warn('AuthContext: no se pudo leer el usuario en localStorage', storageError);
            localStorage.removeItem(AUTH_USER_KEY);
            return null;
        }
    };

    const clearPersistedUser = () => {
        localStorage.removeItem(AUTH_USER_KEY);
    };

    useEffect(() => {
        let isMounted = true;

        const bootstrapAuth = async () => {
            const storedUser = loadPersistedUser();
            if (storedUser && isMounted) {
                setUser(storedUser);
                setAuthenticated(true);
            }

            if (!apiService.isAuthenticated()) {
                if (isMounted) {
                    setLoading(false);
                }
                return;
            }

            try {
                const userData = await apiService.getCurrentUser();
                if (!isMounted) return;
                const resolvedUser = userData?.user || userData || storedUser;
                if (resolvedUser) {
                    setUser(resolvedUser);
                    setAuthenticated(true);
                    persistUser(resolvedUser);
                }
            } catch (err) {
                console.error('AuthContext: auth check failed', err);
                const message = (err?.message || '').toLowerCase();
                if (message.includes('401') || message.includes('unauthorized')) {
                    apiService.logout();
                    clearPersistedUser();
                    if (isMounted) {
                        setAuthenticated(false);
                        setUser(null);
                    }
                } else if (storedUser && isMounted) {
                    setUser(storedUser);
                    setAuthenticated(true);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        bootstrapAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = async (username, password) => {
        try {
            setError('');
            const response = await apiService.login(username, password);
            const resolvedUser = response?.user || null;
            if (resolvedUser) {
                setUser(resolvedUser);
                persistUser(resolvedUser);
            }
            setAuthenticated(true);
            return true;
        } catch (err) {
            setError(err?.message || 'Error al iniciar sesion');
            return false;
        }
    };

    const logout = () => {
        apiService.logout();
        setAuthenticated(false);
        setUser(null);
        setError('');
        clearPersistedUser();
    };

    const value = {
        authenticated,
        user,
        error,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

