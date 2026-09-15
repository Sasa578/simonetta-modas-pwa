import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-container">
            {/* Barra lateral / Navegación */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <h2>Simonetta</h2>
                    <span>Alta Costura</span>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="icon">📊</span> Panel General
                    </NavLink>
                    <NavLink to="/admin/pedidos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="icon">🧵</span> Pedidos y Citas
                    </NavLink>
                    <NavLink to="/admin/almacen" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="icon">📦</span> Almacén e Insumos
                    </NavLink>
                    <NavLink to="/admin/kardex" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="icon">📋</span> Kardex y Ventas
                    </NavLink>
                    <NavLink to="/admin/clientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="icon">👥</span> Clientes
                    </NavLink>
                    <NavLink to="/admin/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="icon">👤</span> Personal / Usuarios
                    </NavLink>
                    <NavLink to="/admin/pruebas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="icon">🧪</span> Pruebas del Sistema
                    </NavLink>
                </nav>
            </aside>

            {/* Contenido Principal */}
            <div className="admin-main">
                {/* Cabecera Superior */}
                <header className="admin-topbar">
                    <nav className="topbar-nav">
                        <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Inicio</NavLink>
                        <NavLink to="/admin/pedidos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Pedidos</NavLink>
                        <NavLink to="/admin/almacen" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Almacén</NavLink>
                        <NavLink to="/admin/kardex" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Kardex</NavLink>
                        <NavLink to="/admin/clientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Clientes</NavLink>
                        <NavLink to="/admin/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Usuarios</NavLink>
                        <NavLink to="/admin/pruebas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>🧪 Pruebas</NavLink>
                    </nav>
                    <div className="topbar-perfil">
                        <div className="perfil-avatar">{usuario?.correo?.charAt(0).toUpperCase() || 'A'}</div>
                        <div className="perfil-info">
                            <span className="perfil-nombre">{usuario?.nombre_completo || 'Administradora'}</span>
                            <span className="perfil-rol">{usuario?.rol || 'Administradora'}</span>
                        </div>
                        <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">Salir</button>
                    </div>
                </header>

                {/* Vista Dinámica */}
                <main className="admin-body">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
