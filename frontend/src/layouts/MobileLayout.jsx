import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/MobileDashboard.css';

const MobileLayout = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="mobile-container">
            {/* Header fijo */}
            <header className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'var(--color-azul-oscuro, #455E8B)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.95rem', fontFamily: 'serif'
                    }}>
                        S
                    </div>
                    <span className="mobile-logo">SIMONETTA ATELIER</span>
                </div>
                <span className="mobile-rol-badge">{usuario?.rol || 'Costurera'}</span>
            </header>

            {/* Contenido scrollable */}
            <main className="mobile-main">
                <Outlet />
                <div className="mobile-spacer" />
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="bottom-nav" style={{ position: 'relative' }}>
                <button className={`bottom-nav-item ${isActive('/mobile') ? 'active' : ''}`} onClick={() => navigate('/mobile')}>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Tareas</span>
                </button>
                
                <button className={`bottom-nav-item ${isActive('/mobile/perfil') ? 'active' : ''}`} onClick={() => navigate('/mobile/perfil')}>
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">Mi Perfil</span>
                </button>
            </nav>
        </div>
    );
};

export default MobileLayout;
