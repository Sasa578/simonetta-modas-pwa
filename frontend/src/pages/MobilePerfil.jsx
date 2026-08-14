import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MobilePerfil = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [medidas, setMedidas] = useState(null);
    const [cargando, setCargando] = useState(usuario?.rol === 'Cliente');

    useEffect(() => {
        if (usuario?.rol === 'Cliente') {
            cargarPerfilCliente();
        }
    }, [usuario]);

    const cargarPerfilCliente = async () => {
        try {
            const { data } = await api.get('/clientes/mi-perfil');
            setPerfil(data.cliente);
            setMedidas(data.medidas);
        } catch (err) {
            console.error('Error al cargar perfil de cliente:', err);
        } finally {
            setCargando(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const esCliente = usuario?.rol === 'Cliente';

    return (
        <section className="mobile-section" style={{ padding: '1rem', paddingBottom: '3rem' }}>
            {/* CARD DE DATOS PERSONALES */}
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: 'var(--color-azul-claro)', color: 'var(--color-azul-oscuro)',
                    fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.8rem', fontWeight: 'bold'
                }}>
                    {(perfil?.nombre_completo || usuario?.correo)?.charAt(0).toUpperCase()}
                </div>
                
                {esCliente && perfil?.nombre_completo ? (
                    <h2 style={{ margin: '0 0 0.2rem', color: 'var(--color-texto-principal)', fontSize: '1.2rem' }}>
                        {perfil.nombre_completo}
                    </h2>
                ) : null}

                <p style={{ margin: '0 0 0.5rem', color: 'var(--color-texto-secundario)', fontSize: '0.9rem' }}>
                    ✉️ {usuario?.correo}
                </p>

                {esCliente && perfil?.telefono_whatsapp && (
                    <p style={{ margin: '0 0 0.8rem', color: 'var(--color-texto-secundario)', fontSize: '0.9rem' }}>
                        📞 WhatsApp: {perfil.telefono_whatsapp}
                    </p>
                )}

                <span className="mobile-rol-badge" style={{ display: 'inline-block' }}>{usuario?.rol}</span>
            </div>

            {/* SECCIÓN EXCLUSIVA PARA CLIENTES: MIS MEDIDAS */}
            {esCliente && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: 'var(--color-azul-oscuro)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📏 Mis Medidas Anatómicas
                    </h3>

                    {cargando ? (
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-texto-secundario)', textAlign: 'center' }}>Cargando medidas...</p>
                    ) : medidas ? (
                        <div>
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1rem'
                            }}>
                                <div style={{ background: '#f8fafc', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', display: 'block' }}>Busto</span>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)' }}>{medidas.busto || '-'} cm</strong>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', display: 'block' }}>Cintura</span>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)' }}>{medidas.cintura || '-'} cm</strong>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', display: 'block' }}>Cadera</span>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)' }}>{medidas.cadera || '-'} cm</strong>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', display: 'block' }}>Alto Cadera</span>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)' }}>{medidas.alto_cadera || '-'} cm</strong>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', display: 'block' }}>Espalda</span>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)' }}>{medidas.espalda || '-'} cm</strong>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', display: 'block' }}>Hombro</span>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)' }}>{medidas.hombro || '-'} cm</strong>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', display: 'block' }}>Frente</span>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)' }}>{medidas.frente || '-'} cm</strong>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', display: 'block' }}>Entre Busto</span>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-azul-oscuro)' }}>{medidas.entre_busto || '-'} cm</strong>
                                </div>
                            </div>
                            {medidas.fecha_toma && (
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-texto-secundario)', textAlign: 'right', fontStyle: 'italic' }}>
                                    📅 Última actualización: {new Date(medidas.fecha_toma).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)', fontStyle: 'italic', textAlign: 'center' }}>
                            Aún no tienes medidas registradas en el taller.
                        </p>
                    )}
                </div>
            )}

            {/* CERRAR SESIÓN */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <button 
                    onClick={handleLogout} 
                    style={{
                        width: '100%', padding: '0.9rem', background: 'var(--color-rojo-suave)',
                        color: 'var(--color-rojo-texto)', border: 'none', borderRadius: '8px',
                        fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer',
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
