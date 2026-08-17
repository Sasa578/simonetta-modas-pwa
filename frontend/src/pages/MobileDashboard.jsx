import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solicitarPermisoNotificaciones, registrarTokenFCM } from '../utils/notificaciones';
import api from '../api/axios';
import './MobileDashboard.css';

const ETIQUETAS_MEDIDAS = {
    cortas: 'Cortas', cintura: 'Cintura', frente: 'Frente', alto_cadera: 'Alto de cadera',
    cadera: 'Cadera', entre_busto: 'Entre busto', busto: 'Busto', espalda: 'Espalda', hombro: 'Hombro',
};

const MobileDashboard = () => {
    const { token, usuario } = useAuth();
    const esCosturera = usuario?.rol === 'Costurera';
    const [pedidosActivos, setPedidosActivos] = useState([]);
    const [modalMedidas, setModalMedidas] = useState(null);

    const fetchPedidos = async () => {
        try {
            const url = esCosturera 
                ? `http://localhost:3000/api/pedidos/costurera/${usuario.id_usuario}`
                : `http://localhost:3000/api/pedidos`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const filtrados = data.filter(p => p.estado !== 'Terminado' && p.estado !== 'Listo para Prueba');
                setPedidosActivos(filtrados);
            }
        } catch (error) { console.error('Error cargando pedidos:', error); }
    };

    useEffect(() => {
        if (token) fetchPedidos();
        const configurarNotificaciones = async () => {
            const fcmToken = await solicitarPermisoNotificaciones();
            if (fcmToken) await registrarTokenFCM(fcmToken, api);
        };
        configurarNotificaciones();
    }, [token]);

    const actualizarEstado = async (id_pedido, nuevoEstado) => {
        try {
            const res = await fetch(`http://localhost:3000/api/pedidos/${id_pedido}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (res.ok) fetchPedidos();
        } catch (error) { console.error('Error al actualizar estado', error); }
    };

    const verMedidas = async (pedido) => {
        try {
            const res = await fetch(`http://localhost:3000/api/medidas/cliente/${pedido.id_cliente}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setModalMedidas({ abierto: true, medidas: data, cliente: pedido.cliente, caducadas: data[0]?.medidas_caducadas });
            }
        } catch (err) { console.error('Error cargando medidas:', err); }
    };

    const cerrarModal = () => setModalMedidas(null);

    const getProgreso = (estado) => {
        switch(estado) {
            case 'Pendiente': return 10; case 'Corte': return 30; case 'Armado': return 60; case 'Acabados': return 85;
            default: return 0;
        }
    };
    const getColorEstado = (estado) => {
        switch(estado) {
            case 'Pendiente': return 'pendiente'; case 'Corte': return 'corte'; case 'Armado': return 'confeccion'; case 'Acabados': return 'acabados';
            default: return 'default';
        }
    };

    return (
        <>
            <section className="mobile-section">
                <h2 className="mobile-section-title">📋 Tareas Pendientes</h2>
                <div className="pedidos-cards">
                    {pedidosActivos.length === 0 ? (
                        <p style={{textAlign:'center',color:'#666'}}>No hay tareas pendientes.</p>
                    ) : pedidosActivos.map((p) => (
                        <div key={p.id_pedido} className="pedido-card">
                            <div className="pedido-card-top">
                                <span className="pedido-card-id">#{p.id_pedido}</span>
                                <span className={`pedido-estado-badge estado-${getColorEstado(p.estado)}`}>{p.estado}</span>
                            </div>
                            <h3 className="pedido-card-cliente">{p.cliente}</h3>
                            <p className="pedido-card-prenda">{p.prenda}</p>

                            <div className="progreso-bar-wrapper">
                                <div className="progreso-bar"><div className={`progreso-fill fill-${getColorEstado(p.estado)}`} style={{width:`${getProgreso(p.estado)}%`}}/></div>
                                <span className="progreso-texto">{getProgreso(p.estado)}%</span>
                            </div>

                            <div className="pedido-card-fechas">
                                <span>📅 Inicio: {new Date(p.fecha_pedido).toLocaleDateString()}</span>
                                <span>🚚 Entrega: {new Date(p.fecha_entrega).toLocaleDateString()}</span>
                            </div>

                            <div style={{display:'flex',gap:'10px',marginTop:'15px',flexWrap:'wrap'}}>
                                {esCosturera && (
                                    <>
                                        {p.estado === 'Pendiente' && <button onClick={() => actualizarEstado(p.id_pedido, 'Corte')} style={{flex:1,padding:'12px',background:'#455E8B',color:'white',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'bold'}}>Pasar a Corte</button>}
                                        {p.estado === 'Corte' && <button onClick={() => actualizarEstado(p.id_pedido, 'Armado')} style={{flex:1,padding:'12px',background:'#A3FC9A',color:'#333',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'bold'}}>Pasar a Armado</button>}
                                        {p.estado === 'Armado' && <button onClick={() => actualizarEstado(p.id_pedido, 'Acabados')} style={{flex:1,padding:'12px',background:'#E1F0FE',color:'#333',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'bold'}}>A Acabados</button>}
                                        {p.estado === 'Acabados' && <button onClick={() => actualizarEstado(p.id_pedido, 'Para Entregar')} style={{flex:1,padding:'12px',background:'#8290B0',color:'white',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'bold'}}>Pasar a Secretaría</button>}
                                    </>
                                )}
                                <button onClick={() => verMedidas(p)} style={{minWidth:'44px',minHeight:'44px',padding:'10px 14px',background:'#455E8B',color:'white',border:'none',borderRadius:'8px',fontSize:'15px',cursor:'pointer',whiteSpace:'nowrap'}} title="Ver medidas anatómicas">
                                    📏 Ver Medidas
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {modalMedidas?.abierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📏 Medidas de {modalMedidas.cliente}</h3>
                            <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
                        </div>
                        {modalMedidas.caducadas && (
                            <div className="alerta-caducada" style={{margin:'0 0 1rem'}}>
                                ⚠️ Medidas desactualizadas (Más de 6 meses). Se sugiere retomar.
                            </div>
                        )}
                        {modalMedidas.medidas.length > 0 ? (
                            <div className="modal-medidas-grid">
                                {Object.entries(ETIQUETAS_MEDIDAS).map(([key, label]) => (
                                    <div key={key} className="modal-medida-item">
                                        <span className="modal-medida-label">{label}</span>
                                        <span className="modal-medida-valor">{modalMedidas.medidas[0][key] ?? '—'} cm</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{textAlign:'center',color:'#666'}}>No hay medidas registradas para este cliente.</p>
                        )}
                        <button onClick={cerrarModal} style={{marginTop:'1rem',width:'100%',padding:'12px',background:'var(--color-azul-oscuro)',color:'#fff',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>Cerrar</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileDashboard;
