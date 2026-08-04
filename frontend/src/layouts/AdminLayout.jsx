import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/AdminDashboard.css';

const usuariosTaller = [
    { id: 1, nombre: 'Laura Méndez', rol: 'Admin', iniciales: 'LM' },
    { id: 2, nombre: 'Carmen Rojas', rol: 'Secretaria', iniciales: 'CR' },
    { id: 3, nombre: 'Rosa Flores', rol: 'Costurera', iniciales: 'RF' },
    { id: 4, nombre: 'Ana Quispe', rol: 'Costurera', iniciales: 'AQ' },
];

const pedidosProximos = [
    { id: '#P-1045', cliente: 'María García', fecha: '16/08/2026' },
    { id: '#P-1046', cliente: 'Juana Pérez', fecha: '19/08/2026' },
    { id: '#P-1047', cliente: 'Rosa Quispe', fecha: '22/08/2026' },
    { id: '#P-1048', cliente: 'Elena Vargas', fecha: '25/08/2026' },
    { id: '#P-1049', cliente: 'Sofía Mamani', fecha: '28/08/2026' },
];

const AdminLayout = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            {/* ÁREA 1: Barra Lateral Izquierda */}
            <aside className="sidebar-left">
                <div className="sidebar-brand">
                    <span className="brand-icon">🧵</span>
                    <h1 className="brand-name">SIMONETTA</h1>
                    <p className="brand-subtitle">Alta Costura</p>
                </div>
                <div className="sidebar-section">
                    <h3 className="sidebar-heading">Equipo del Taller</h3>
                    <div className="usuarios-lista">
                        {usuariosTaller.map((u) => (
                            <div key={u.id} className="usuario-mini">
                                <div className="usuario-avatar">{u.iniciales}</div>
                                <div className="usuario-detalle">
                                    <span className="usuario-nombre">{u.nombre}</span>
                                    <span className="usuario-rol">{u.rol}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="sidebar-logout" onClick={handleLogout}>
                    ⏻ Cerrar sesión
                </button>
            </aside>

            {/* ÁREA 2: Barra Superior (Topbar) */}
            <header className="topbar">
                <nav className="topbar-nav">
                    <button className="nav-item active" onClick={() => navigate('/admin')}>Inicio</button>
                    <button className="nav-item">Clientes</button>
                    <button className="nav-item" onClick={() => navigate('/admin/pedidos/nuevo')}>Pedidos</button>
                    <button className="nav-item">Almacén</button>
                </nav>
                <div className="topbar-perfil">
                    <div className="perfil-avatar">
                        {usuario?.correo?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="perfil-info">
                        <span className="perfil-nombre">{usuario?.correo || 'Admin'}</span>
                        <span className="perfil-rol">{usuario?.rol || 'Administrador'}</span>
                    </div>
                </div>
            </header>

            {/* ÁREA 3: Panel Central (Main Content) */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* ÁREA 4: Barra Lateral Derecha */}
            <aside className="sidebar-right">
                <div className="sidebar-right-header">
                    <h2>📅 PEDIDOS</h2>
                    <span className="sidebar-right-sub">Próximas entregas</span>
                </div>
                <div className="mini-cards-lista">
                    {pedidosProximos.map((p) => (
                        <div key={p.id} className="mini-card">
                            <div className="mini-card-top">
                                <span className="mini-id">{p.id}</span>
                                <span className="mini-fecha">{p.fecha}</span>
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
