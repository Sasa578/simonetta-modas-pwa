import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importación de Vistas y Layouts
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './pages/AdminHome';
import AdminUsuarios from './pages/AdminUsuarios';
import ClientesView from './pages/ClientesView';
import AlmacenView from './pages/AlmacenView';
import KardexView from './pages/KardexView';
import AdminPedidos from './pages/AdminPedidos';
import AdminTestDashboard from './pages/AdminTestDashboard';

import SecretariaLayout from './layouts/SecretariaLayout';
import SecretariaDashboard from './pages/SecretariaDashboard';

import MobileDashboard from './pages/MobileDashboard';
import ClienteDashboard from './pages/ClienteDashboard';

// Ruta protegida por roles
const RutaProtegida = ({ children, rolesPermitidos }) => {
    const { usuario, token, cargando } = useAuth();

    if (cargando) return <div className="cargando-fullscreen">Cargando Simonetta Modas...</div>;
    if (!token || !usuario) return <Navigate to="/login" replace />;
    
    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* ADMINISTRACIÓN (Panel Web Desktop) */}
                    <Route path="/admin" element={
                        <RutaProtegida rolesPermitidos={['Administradora', 'Administrador']}>
                            <AdminLayout />
                        </RutaProtegida>
                    }>
                        <Route index element={<AdminHome />} />
                        <Route path="usuarios" element={<AdminUsuarios />} />
                        <Route path="clientes" element={<ClientesView />} />
                        <Route path="almacen" element={<AlmacenView />} />
                        <Route path="kardex" element={<KardexView />} />
                        <Route path="pedidos" element={<AdminPedidos />} />
                        <Route path="pruebas" element={<AdminTestDashboard />} />
                    </Route>

                    {/* SECRETARÍA */}
                    <Route path="/secretaria" element={
                        <RutaProtegida rolesPermitidos={['Secretaria', 'Administradora']}>
                            <SecretariaLayout />
                        </RutaProtegida>
                    }>
                        <Route index element={<SecretariaDashboard />} />
                    </Route>

                    {/* VISTA MÓVIL (Costurera) */}
                    <Route path="/taller" element={
                        <RutaProtegida rolesPermitidos={['Costurera', 'Administradora']}>
                            <MobileDashboard />
                        </RutaProtegida>
                    } />

                    {/* CLIENTES PWA */}
                    <Route path="/cliente" element={
                        <RutaProtegida rolesPermitidos={['Cliente']}>
                            <ClienteDashboard />
                        </RutaProtegida>
                    } />

                    {/* Redirección por defecto */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
