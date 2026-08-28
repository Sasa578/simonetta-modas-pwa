import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import '../pages/AdminDashboard.css';

const AdminLayout = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [personal, setPersonal] = useState([]);
    const [proximasEntregas, setProximasEntregas] = useState([]);

    const handleLogout = () => { logout(); navigate('/login'); };

    useEffect(() => {
        api.get('/usuarios').then(({ data }) => setPersonal(data.slice(0, 5))).catch(() => {});
        api.get('/pedidos').then(({ data }) => {
            const prox = (data || []).filter(p => p.estado !== 'Terminado').slice(0, 5);
            setProximasEntregas(prox);
        }).catch(() => {});
    }, []);

    return (
        <div className="admin-layout">
            {/* Sidebar Izquierdo */}
            <aside className="sidebar-left">
                <div className="sidebar-brand">
                    <span className="brand-icon">👗</span>
                    <h1 className="brand-name">SIMONETTA</h1>
                    <p className="brand-subtitle">Panel Admin</p>
                </div>
                <div className="sidebar-section">
                    <h3 className="sidebar-heading">Personal del Taller</h3>
                    <div className="usuarios-lista">
                        {personal.map((u) => (
                            <div key={u.id_usuario} className="usuario-mini">
                                <div className="usuario-avatar">{u.correo?.charAt(0).toUpperCase()}</div>
                                <div className="usuario-detalle">
                                    <span className="usuario-nombre">{u.correo?.split('@')[0]}</span>
                                    <span className="usuario-rol">{u.nombre_rol}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="sidebar-logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
            </aside>

            {/* Topbar */}
            <header className="topbar">
                <nav className="topbar-nav">
                    <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Inicio</NavLink>
                    <NavLink to="/admin/pedidos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Pedidos</NavLink>
                    <NavLink to="/admin/almacen" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Almacén</NavLink>
                    <NavLink to="/admin/clientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Clientes</NavLink>
                    <NavLink to="/admin/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Usuarios</NavLink>
                    <NavLink to="/admin/pruebas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>🧪 Pruebas</NavLink>
                </nav>
                <div className="topbar-perfil">
                    <div className="perfil-avatar">{usuario?.correo?.charAt(0).toUpperCase() || 'A'}</div>
                    <div className="perfil-info">
                        <span className="perfil-nombre">{usuario?.correo || 'Admin'}</span>
                        <span className="perfil-rol">{usuario?.rol || 'Admin'}</span>
                    </div>
                </div>
            </header>

            {/* Contenido central (Outlet) */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Sidebar Derecho: Próximas Entregas */}
            <aside className="sidebar-right">
                <div className="sidebar-right-header">
                    <h2>📅 Próximas Entregas</h2>
                </div>
                <div className="mini-cards-lista">
                    {proximasEntregas.map((p) => (
                        <div key={p.id_pedido} className="mini-card">
                            <div className="mini-card-top">
                                <span className="mini-id">#{p.id_pedido}</span>
                                <span className="mini-fecha">{new Date(p.fecha_entrega).toLocaleDateString()}</span>
                            </div>
                            <span className="mini-cliente">{p.cliente}</span>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
};

export default AdminLayout;
