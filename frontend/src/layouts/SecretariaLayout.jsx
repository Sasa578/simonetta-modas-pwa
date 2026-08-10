import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/AdminDashboard.css';
import '../pages/SecretariaDashboard.css';

const SecretariaLayout = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="admin-layout">
            <aside className="sidebar-left">
                <div className="sidebar-brand">
                    <span className="brand-icon">🧵</span>
                    <h1 className="brand-name">SIMONETTA</h1>
                    <p className="brand-subtitle">Panel Secretaría</p>
                </div>
                <div className="sidebar-section">
                    <h3 className="sidebar-heading">Accesos rápidos</h3>
                    <div className="accesos-lista">
                        <NavLink to="/secretaria" end className={({ isActive }) => `acceso-item ${isActive ? 'active' : ''}`}>📅 Calendario</NavLink>
                        <NavLink to="/secretaria/pedidos" className={({ isActive }) => `acceso-item ${isActive ? 'active' : ''}`}>📦 Pedidos</NavLink>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={handleLogout}>⏻ Cerrar sesión</button>
            </aside>

            <header className="topbar">
                <nav className="topbar-nav">
                    <NavLink to="/secretaria" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Agenda</NavLink>
                    <NavLink to="/secretaria/pedidos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Pedidos</NavLink>
                    <NavLink to="/secretaria/clientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Clientes</NavLink>
                    <NavLink to="/secretaria/almacen" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Almacén</NavLink>
                </nav>
                <div className="topbar-perfil">
                    <div className="perfil-avatar">{usuario?.correo?.charAt(0).toUpperCase() || 'S'}</div>
                    <div className="perfil-info">
                        <span className="perfil-nombre">{usuario?.correo || 'Secretaria'}</span>
                        <span className="perfil-rol">{usuario?.rol || 'Secretaria'}</span>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <aside className="sidebar-right" style={{ padding: '1rem' }}>
                <p style={{ color: 'var(--color-texto-secundario)', fontSize: '0.8rem', textAlign: 'center' }}>Panel de Secretaría</p>
            </aside>
        </div>
    );
};

export default SecretariaLayout;
