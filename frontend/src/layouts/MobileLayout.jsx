import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import ModalPedido from '../components/ModalPedido';
import '../pages/MobileDashboard.css';

const MobileLayout = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="mobile-container">
            {/* Header fijo */}
            <header className="mobile-header">
                <span className="mobile-logo">🧵 Simonetta</span>
                <span className="mobile-rol-badge">{usuario?.rol || 'Usuario'}</span>
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
                
                {/* Fab / Botón Central */}
                <button onClick={() => setIsModalOpen(true)} style={{
                    position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                    width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-azul-oscuro)',
                    color: '#fff', fontSize: '2rem', border: '4px solid #fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                    +
                </button>

                <button className={`bottom-nav-item ${isActive('/mobile/perfil') ? 'active' : ''}`} onClick={() => navigate('/mobile/perfil')}>
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">Mi Perfil</span>
                </button>
            </nav>

            <ModalPedido 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { window.location.reload(); }}
            />
        </div>
    );
};

export default MobileLayout;
