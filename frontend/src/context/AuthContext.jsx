import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { requestFirebaseToken } from '../api/firebaseClient';
import ModalCambioPasswordObligatorio from '../components/ModalCambioPasswordObligatorio';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Al montar, verificar si hay sesión guardada
    useEffect(() => {
        const token = localStorage.getItem('token');
        const usuarioGuardado = localStorage.getItem('usuario');
        if (token && usuarioGuardado) {
            try {
                setUsuario(JSON.parse(usuarioGuardado));
            } catch {
                localStorage.removeItem('usuario');
            }
        }
        setCargando(false);
    }, []);

    const registrarFCMToken = async () => {
        try {
            const fcmToken = await requestFirebaseToken();
            if (fcmToken) {
                await api.put('/auth/fcm-token', { fcm_token: fcmToken });
            }
        } catch (error) {
            console.error('Error registrando FCM token en el servidor:', error);
        }
    };

    const login = async (correo, password) => {
        const { data } = await api.post('/auth/login', { correo, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        setUsuario(data.usuario);
        
        // Solicitar permisos push después de login exitoso
        setTimeout(() => {
            registrarFCMToken();
        }, 1000);

        return data;
    };

    const marcarPasswordCambiada = () => {
        if (usuario) {
            const usuarioActualizado = { ...usuario, debe_cambiar_password: false };
            localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
            setUsuario(usuarioActualizado);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{
            usuario,
            cargando,
            login,
            logout,
            marcarPasswordCambiada,
            token: localStorage.getItem('token')
        }}>
            {children}

            {/* Modal de cambio obligatorio de contraseña cuando debe_cambiar_password es true */}
            <ModalCambioPasswordObligatorio
                isOpen={Boolean(usuario && usuario.debe_cambiar_password)}
                onSuccess={marcarPasswordCambiada}
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
};
