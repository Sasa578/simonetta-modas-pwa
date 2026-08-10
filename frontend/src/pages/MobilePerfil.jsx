import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MobilePerfil = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <section className="mobile-section" style={{ padding: '1rem' }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'var(--color-azul-claro)', color: 'var(--color-azul-oscuro)',
                    fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem', fontWeight: 'bold'
                }}>
                    {usuario?.correo?.charAt(0).toUpperCase()}
                </div>
                <h2 style={{ margin: '0 0 0.5rem', color: 'var(--color-texto-principal)' }}>{usuario?.correo}</h2>
                <span className="mobile-rol-badge" style={{ display: 'inline-block' }}>{usuario?.rol}</span>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--color-azul-oscuro)' }}>Preferencias de Cuenta</h3>
                <button 
                    onClick={handleLogout} 
                    style={{
                        width: '100%', padding: '1rem', background: 'var(--color-rojo-suave)',
                        color: 'var(--color-rojo-texto)', border: 'none', borderRadius: '8px',
                        fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                        display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center'
                    }}
                >
                    ⏻ Cerrar Sesión
                </button>
            </div>
        </section>
    );
};

export default MobilePerfil;
