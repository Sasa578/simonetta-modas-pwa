import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { io } from 'socket.io-client';
import './ClienteDashboard.css';
import ModalCita from '../components/ModalCita';

const ClienteDashboard = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [citas, setCitas] = useState([]);
    const [perfil, setPerfil] = useState(null);
    const [medidas, setMedidas] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [activeTab, setActiveTab] = useState('panel');

    const cargarDatos = async () => {
        try {
            const [resPedidos, resCitas, resPerfil] = await Promise.all([
                api.get('/pedidos'),
                api.get('/citas/mis-citas'),
                api.get('/clientes/mi-perfil')
            ]);
            setPedidos(resPedidos.data || []);
            setCitas(resCitas.data || []);
            setPerfil(resPerfil.data?.cliente || null);
            setMedidas(resPerfil.data?.medidas || null);
        } catch (err) {
            console.error('Error cargando datos:', err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        
        const socket = io(`http://${window.location.hostname}:3000`);
        socket.on('actualizacion_datos', () => {
            cargarDatos();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    const getProgreso = (estado) => {
        const mapa = { Pendiente: 10, Corte: 30, Armado: 60, Acabados: 85, 'Listo para Prueba': 95, Terminado: 100 };
        return mapa[estado] || 0;
    };

    return (
        <div className="cliente-dashboard-container">
            <header className="cliente-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="cliente-logo">🧵 Simonetta Modas</div>
            </header>

            <main className="cliente-main" style={{ paddingBottom: '80px' }}>
                {msg && <div className="cliente-msg">{msg}</div>}

                {cargando ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-texto-secundario)' }}>Cargando información...</div>
                ) : (
                    <>
                        {/* TAB PANEL PRINCIPAL */}
                        {activeTab === 'panel' && (
                            <div className="tab-content fade-in">
                                <div className="cliente-welcome">
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-texto-principal)' }}>
                                        Hola, {perfil?.nombre_completo?.split(' ')[0] || 'Cliente'} 👋
                                    </h2>
                                    <p style={{ color: 'var(--color-texto-secundario)', margin: 0 }}>
                                        Bienvenida a tu panel personal de Simonetta Modas.
                                    </p>
                                </div>

                                <section style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-texto-principal)', margin: 0 }}>Tus Citas Programadas</h3>
                                        <button onClick={() => setIsModalOpen(true)} className="btn-agendar-cita">
                                            + Agendar Cita
                                        </button>
                                    </div>

                                    {citas.length === 0 ? (
                                        <p style={{ color: 'var(--color-texto-secundario)', fontStyle: 'italic' }}>No tienes citas programadas próximamente.</p>
                                    ) : (
                                        <div className="cliente-citas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                            {citas.map((c) => (
                                                <div key={c.id_cita} className="cliente-cita-card" style={{ background: '#fff', border: '1px solid var(--color-borde)', borderRadius: '12px', padding: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>Cita #{c.id_cita}</span>
                                                        <span style={{ 
                                                            background: c.estado === 'Pendiente' ? '#fef08a' : (c.estado === 'Cancelada' ? '#fecaca' : '#bbf7d0'), 
                                                            color: c.estado === 'Pendiente' ? '#854d0e' : (c.estado === 'Cancelada' ? '#991b1b' : '#166534'),
                                                            padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600
                                                        }}>{c.estado}</span>
                                                    </div>
                                                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>📅 Fecha reunión: {new Date(c.fecha_cita).toLocaleDateString()}</p>
                                                    {c.detalles && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-texto-secundario)', fontStyle: 'italic' }}>"{c.detalles}"</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-texto-principal)', marginBottom: '1rem' }}>Tus Pedidos en Curso</h3>
                                    {pedidos.length === 0 ? (
                                        <div className="cliente-vacio" style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px dashed var(--color-borde)' }}>
                                            <span className="cliente-vacio-icon" style={{ fontSize: '2.5rem' }}>📭</span>
                                            <p style={{ color: 'var(--color-texto-secundario)', margin: '0.5rem 0 1rem' }}>No tienes pedidos activos en confección en este momento.</p>
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

                        {/* TAB PERFIL */}
                        {activeTab === 'perfil' && (
                            <div className="tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <section style={{ background: '#fff', border: '1px solid var(--color-borde)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        👤 Datos Personales
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--color-texto-secundario)', display: 'block', fontSize: '0.8rem' }}>Nombre Completo</span>
                                            <strong style={{ color: 'var(--color-texto-principal)' }}>{perfil?.nombre_completo || 'No registrado'}</strong>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--color-texto-secundario)', display: 'block', fontSize: '0.8rem' }}>Carnet de Identidad</span>
                                            <strong style={{ color: 'var(--color-texto-principal)' }}>{perfil?.carnet_identidad || 'No registrado'}</strong>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--color-texto-secundario)', display: 'block', fontSize: '0.8rem' }}>Teléfono / WhatsApp</span>
                                            <strong style={{ color: 'var(--color-texto-principal)' }}>{perfil?.telefono_whatsapp || 'No registrado'}</strong>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--color-texto-secundario)', display: 'block', fontSize: '0.8rem' }}>Correo Electrónico</span>
                                            <strong style={{ color: 'var(--color-texto-principal)' }}>{perfil?.correo || 'No registrado'}</strong>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <span style={{ color: 'var(--color-texto-secundario)', display: 'block', fontSize: '0.8rem' }}>Cliente desde</span>
                                            <strong style={{ color: 'var(--color-texto-principal)' }}>{perfil?.fecha_registro ? new Date(perfil.fecha_registro).toLocaleDateString() : 'N/A'}</strong>
                                        </div>
                                    </div>
                                </section>

                                <section style={{ background: '#fff', border: '1px solid var(--color-borde)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        📏 Mis Medidas Anatómicas Registradas
                                    </h3>

                                    {medidas ? (
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                                <div className="medida-item">
                                                    <span className="medida-label">Busto</span>
                                                    <strong className="medida-valor">{medidas.busto || '-'} cm</strong>
                                                </div>
                                                <div className="medida-item">
                                                    <span className="medida-label">Cintura</span>
                                                    <strong className="medida-valor">{medidas.cintura || '-'} cm</strong>
                                                </div>
                                                <div className="medida-item">
                                                    <span className="medida-label">Cadera</span>
                                                    <strong className="medida-valor">{medidas.cadera || '-'} cm</strong>
                                                </div>
                                                <div className="medida-item">
                                                    <span className="medida-label">Alto Cadera</span>
                                                    <strong className="medida-valor">{medidas.alto_cadera || '-'} cm</strong>
                                                </div>
                                                <div className="medida-item">
                                                    <span className="medida-label">Espalda</span>
                                                    <strong className="medida-valor">{medidas.espalda || '-'} cm</strong>
                                                </div>
                                                <div className="medida-item">
                                                    <span className="medida-label">Hombro</span>
                                                    <strong className="medida-valor">{medidas.hombro || '-'} cm</strong>
                                                </div>
                                                <div className="medida-item">
                                                    <span className="medida-label">Frente</span>
                                                    <strong className="medida-valor">{medidas.frente || '-'} cm</strong>
                                                </div>
                                                <div className="medida-item">
                                                    <span className="medida-label">Entre Busto</span>
                                                    <strong className="medida-valor">{medidas.entre_busto || '-'} cm</strong>
                                                </div>
                                            </div>
                                            {medidas.fecha_toma && (
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-texto-secundario)', textAlign: 'right', fontStyle: 'italic' }}>
                                                    📅 Última actualización: {new Date(medidas.fecha_toma).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--color-texto-secundario)', fontStyle: 'italic', margin: 0 }}>
                                            Aún no tienes un registro de medidas anatómicas cargado en el sistema.
                                        </p>
                                    )}
                                </section>

                                <button onClick={handleLogout} className="btn-logout" style={{ marginTop: '1rem', width: '100%', background: 'var(--color-rojo-texto)', color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* BOTTOM NAVIGATION BAR */}
            <nav className="cliente-bottom-nav">
                <button 
                    className={`nav-item ${activeTab === 'panel' ? 'active' : ''}`}
                    onClick={() => setActiveTab('panel')}
                >
                    <span className="nav-icon">🏠</span>
                    <span className="nav-text">Panel</span>
                </button>
                <button 
                    className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('perfil')}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-text">Perfil</span>
                </button>
            </nav>

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
