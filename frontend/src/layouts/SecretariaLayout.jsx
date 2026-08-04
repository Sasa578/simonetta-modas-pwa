import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/AdminDashboard.css';
import '../pages/SecretariaDashboard.css';

const clientesActivos = [
    { id: 1, nombre: 'María García', pedido: '#P-1042', entrega: '15/08/2026' },
    { id: 2, nombre: 'Juana Pérez', pedido: '#P-1043', entrega: '18/08/2026' },
    { id: 3, nombre: 'Rosa Quispe', pedido: '#P-1045', entrega: '20/08/2026' },
    { id: 4, nombre: 'Elena Vargas', pedido: '#P-1046', entrega: '22/08/2026' },
];

const SecretariaLayout = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="admin-layout">
            {/* === Sidebar Izquierdo (mismo que Admin) === */}
            <aside className="sidebar-left">
                <div className="sidebar-brand">
                    <span className="brand-icon">🧵</span>
                    <h1 className="brand-name">SIMONETTA</h1>
                    <p className="brand-subtitle">Panel Secretaría</p>
                </div>
                <div className="sidebar-section">
                    <h3 className="sidebar-heading">Accesos rápidos</h3>
                    <div className="accesos-lista">
                        <button className="acceso-item" onClick={() => navigate('/secretaria/pedidos/nuevo')}>+ Nuevo Pedido</button>
                        <button className="acceso-item" onClick={() => navigate('/dashboard')}>👥 Clientes</button>
                        <button className="acceso-item" disabled>📊 Reportes</button>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={handleLogout}>⏻ Cerrar sesión</button>
            </aside>

            {/* === Topbar === */}
            <header className="topbar">
                <nav className="topbar-nav">
                    <button className="nav-item" disabled>Usuarios</button>
                    <button className="nav-item active" onClick={() => navigate('/dashboard')}>Clientes</button>
                    <button className="nav-item" onClick={() => navigate('/secretaria/pedidos/nuevo')}>Pedidos</button>
                    <button className="nav-item" disabled>Almacén</button>
                </nav>
                <div className="topbar-perfil">
                    <div className="perfil-avatar">{usuario?.correo?.charAt(0).toUpperCase() || 'S'}</div>
                    <div className="perfil-info">
                        <span className="perfil-nombre">{usuario?.correo || 'Secretaria'}</span>
                        <span className="perfil-rol">{usuario?.rol || 'Secretaria'}</span>
                    </div>
                </div>
            </header>

            {/* === Panel Central === */}
            <main className="main-content secretaria-main">
                <Outlet />
            </main>

            {/* === Sidebar Derecho: Clientes Activos === */}
            <aside className="sidebar-right">
                <div className="sidebar-right-header">
                    <h2>👤 Registro de clientes activos</h2>
                </div>
                <div className="mini-cards-lista">
                    {clientesActivos.map((c) => (
                        <div key={c.id} className="mini-card">
                            <div className="mini-card-top">
                                <span className="mini-id">{c.pedido}</span>
                                <span className="mini-fecha">{c.entrega}</span>
                            </div>
                            <span className="mini-cliente">{c.nombre}</span>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
};

export default SecretariaLayout;
