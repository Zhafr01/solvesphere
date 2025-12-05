import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext({
    user: null,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    isLoading: true,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const { data } = await api.get('/user');
            setUser(data);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async ({ email, password }) => {
        // CSRF cookie is not strictly needed for token auth, but good practice if mixed
        // await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
        const { data } = await api.post('/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        // await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
        const { data } = await api.post('/register', userData);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
