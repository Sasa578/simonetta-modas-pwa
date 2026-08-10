import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './ClienteDashboard.css';
import ModalCita from '../components/ModalCita';

const ClienteDashboard = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [msg, setMsg] = useState('');

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [resPedidos, resCitas] = await Promise.all([
                api.get('/pedidos'),
                api.get('/citas/mis-citas')
            ]);
            setPedidos(resPedidos.data || []);
            setCitas(resCitas.data || []);
        } catch (err) {
            console.error('Error cargando datos:', err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    const getProgreso = (estado) => {
        const mapa = { Pendiente: 10, Corte: 30, Armado: 60, Acabados: 85, 'Listo para Prueba': 95, Terminado: 100 };
        return mapa[estado] || 0;
    };

    return (
        <div className="cliente-container">
            <header className="cliente-header">
                <span className="cliente-logo">🧵 Simonetta</span>
                <button className="cliente-logout" onClick={handleLogout}>Salir</button>
            </header>

            <main className="cliente-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="cliente-titulo" style={{ margin: 0 }}>👋 Hola, {usuario?.correo?.split('@')[0] || 'Cliente'}</h2>
                        <p className="cliente-subtitulo" style={{ margin: 0 }}>Tu panel de control</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} style={{
                        background: 'var(--color-azul-oscuro)', color: '#fff', border: 'none',
                        padding: '0.8rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(69, 94, 139, 0.2)'
                    }}>
                        📅 Solicitar Cita
                    </button>
                </div>

                {msg && <div style={{ padding: '0.8rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500 }}>{msg}</div>}

                {cargando ? (
                    <p className="cliente-cargando">Cargando tu información...</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* SECCIÓN CITAS PENDIENTES */}
                        {citas.length > 0 && (
                            <section>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-texto-principal)', marginBottom: '1rem' }}>Tus Citas Programadas</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {citas.map(c => (
                                        <div key={c.id_cita} style={{
                                            background: '#fff', border: '1px solid var(--color-borde)', borderRadius: '12px', padding: '1.25rem',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>Cita #{c.id_cita}</span>
                                                <span style={{ 
                                                    background: c.estado === 'Pendiente' ? '#fef08a' : (c.estado === 'Cancelada' ? '#fecaca' : '#bbf7d0'), 
                                                    color: c.estado === 'Pendiente' ? '#854d0e' : (c.estado === 'Cancelada' ? '#991b1b' : '#166534'),
                                                    padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600
                                                }}>{c.estado}</span>
                                            </div>
                                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>📅 Fecha: {new Date(c.fecha_cita).toLocaleDateString()}</p>
                                            {c.detalles && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-texto-secundario)', fontStyle: 'italic' }}>"{c.detalles}"</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* SECCIÓN PEDIDOS */}
                        <section>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-texto-principal)', marginBottom: '1rem' }}>Tus Pedidos en Curso</h3>
                            {pedidos.length === 0 ? (
                                <div className="cliente-vacio" style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px dashed var(--color-borde)' }}>
                                    <span className="cliente-vacio-icon" style={{ fontSize: '2.5rem' }}>📭</span>
                                    <p style={{ color: 'var(--color-texto-secundario)' }}>No tienes pedidos activos en este momento.</p>
                                </div>
                            ) : (
                                <div className="cliente-pedidos" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                    {pedidos.map((p) => (
                                        <div key={p.id_pedido} className="cliente-pedido-card">
                                            <div className="cliente-pedido-top">
                                                <span className="cliente-pedido-id">Pedido #{p.id_pedido}</span>
                                                <span className={`cliente-estado estado-${(p.estado || '').toLowerCase().replace(/ /g, '-')}`}>
                                                    {p.estado}
                                                </span>
                                            </div>
                                            <p className="cliente-prenda">{p.prenda || 'Prenda en confección'}</p>

                                            <div className="cliente-progreso">
                                                <div className="cliente-progreso-bar">
                                                    <div className="cliente-progreso-fill" style={{ width: `${getProgreso(p.estado)}%` }} />
                                                </div>
                                                <span>{getProgreso(p.estado)}%</span>
                                            </div>

                                            <div className="cliente-fechas">
                                                <span>📅 Pedido: {new Date(p.fecha_pedido).toLocaleDateString()}</span>
                                                {p.fecha_prueba && <span>✂️ Prueba: {new Date(p.fecha_prueba).toLocaleDateString()}</span>}
                                                <span>🏁 Entrega: {new Date(p.fecha_entrega).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>

            <ModalCita 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    setMsg('✅ Tu cita ha sido solicitada correctamente. Te esperamos en el taller.');
                    cargarDatos();
                    setTimeout(() => setMsg(''), 5000);
                }}
            />
        </div>
    );
};

export default ClienteDashboard;
