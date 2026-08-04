import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/MobileDashboard.css';

const MobileLayout = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('home');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const esCosturera = usuario?.rol === 'Costurera';

    return (
        <div className="mobile-container">
            {/* === Header fijo === */}
            <header className="mobile-header">
                <div className="mobile-header-left">
                    <span className="mobile-logo">🧵 Simonetta</span>
                </div>
                <div className="mobile-header-right">
                    <span className="mobile-rol-badge">{usuario?.rol || 'Usuario'}</span>
                    <button className="btn-mobile-logout" onClick={handleLogout} title="Cerrar sesión" style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                        🚪
                    </button>
                </div>
            </header>

            {/* === Panel central scrollable === */}
            <main className="mobile-main">
                <Outlet />
                {/* Spacer para bottom nav */}
                <div className="mobile-spacer" />
            </main>

            {/* === Bottom Nav Bar === */}
            <nav className="bottom-nav">
                <button
                    className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('home'); navigate('/mobile'); }}
                >
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Inicio</span>
                </button>
                <button
                    className={`bottom-nav-item ${activeTab === 'add' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('add');
                        navigate('/mobile/pedidos/nuevo');
                    }}
                >
                    <span className="nav-icon nav-icon-plus">＋</span>
                    <span className="nav-label">{esCosturera ? 'Actualizar' : 'Nueva orden'}</span>
                </button>
                <button
                    className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">Perfil</span>
                </button>
            </nav>
        </div>
    );
};

export default MobileLayout;
