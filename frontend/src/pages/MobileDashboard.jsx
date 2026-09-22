import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitarPermisoNotificaciones, registrarTokenFCM } from '../utils/notificaciones';
import api from '../api/axios';
import { io } from 'socket.io-client';
import './MobileDashboard.css';

const ETIQUETAS_MEDIDAS = {
    busto: 'Busto',
    cintura: 'Cintura',
    cadera: 'Cadera',
    espalda: 'Espalda',
    hombro: 'Hombro',
    cortas: 'Largo / Talle'
};

const MobileDashboard = () => {
    const { token, usuario } = useAuth();
    const esCosturera = (usuario?.rol || '').toLowerCase() === 'costurera';
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [modalMedidas, setModalMedidas] = useState(null); // { abierto: true, pedido: {} }
    const [actualizandoId, setActualizandoId] = useState(null);

    const fetchPedidos = async () => {
        try {
            setCargando(true);
            const endpoint = (esCosturera && usuario?.id_usuario)
                ? `/pedidos/costurera/${usuario.id_usuario}`
                : `/pedidos`;
            const res = await api.get(endpoint);
            // Mostrar pedidos en confección activa
            setPedidos(res.data || []);
        } catch (error) {
            console.error("Error cargando pedidos asignados:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (token) fetchPedidos();

        const socket = io(`http://${window.location.hostname}:3000`);
        socket.on('actualizacion_datos', () => {
            fetchPedidos();
        });

        const configurarNotificaciones = async () => {
            const fcmToken = await solicitarPermisoNotificaciones();
            if (fcmToken) await registrarTokenFCM(fcmToken, api);
        };
        configurarNotificaciones();

        return () => {
            socket.disconnect();
        };
    }, [token, usuario?.id_usuario]);

    const actualizarEstado = async (id_pedido, nuevoEstado) => {
        setActualizandoId(id_pedido);
        try {
            await api.put(`/pedidos/${id_pedido}/estado`, { estado: nuevoEstado });
            fetchPedidos();
        } catch (error) {
            console.error("Error al actualizar estado del pedido:", error);
        } finally {
            setActualizandoId(null);
        }
    };

    const getProgreso = (estado) => {
        switch (estado) {
            case 'Pendiente': return 15;
            case 'Corte': return 35;
            case 'Armado': return 60;
            case 'Acabados': return 85;
            case 'Listo para Prueba': return 92;
            case 'Terminado': return 98;
            case 'Entregado': return 100;
            default: return 10;
        }
    };

    const getEstadoClass = (estado) => {
        return (estado || '').toLowerCase().replace(/ /g, '-');
    };

    // Filtros de estado para el panel superior
    const pedidosFiltrados = pedidos.filter(p => {
        if (filtroEstado === 'todos') return p.estado !== 'Entregado' && p.estado !== 'Cancelado';
        return (p.estado || '').toLowerCase() === filtroEstado.toLowerCase();
    });

    const nombreUsuario = usuario?.nombre_completo?.split(' ')[0] || 'Costurera';

    return (
        <div className="costurera-dashboard fade-in">
            {/* Tarjeta de Bienvenida Atelier */}
            <section className="costurera-welcome-card">
                <div className="welcome-header-fila">
                    <div>
                        <h2>Hola, {nombreUsuario} ✂️</h2>
                        <p>Atelier de Confección — Tus tareas de patronaje y armado</p>
                    </div>
                    <div className="badge-total-tareas">
                        <span>{pedidosFiltrados.length}</span>
                        <small>Tareas</small>
                    </div>
                </div>
            </section>

            {/* Chips de filtro por etapa */}
            <div className="costurera-filtros-scroll">
                {[
                    { id: 'todos', label: 'Todos los activos' },
                    { id: 'pendiente', label: 'Pendiente' },
                    { id: 'corte', label: 'En Corte' },
                    { id: 'armado', label: 'En Armado' },
                    { id: 'acabados', label: 'En Acabados' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFiltroEstado(tab.id)}
                        className={`chip-filtro-costurera ${filtroEstado === tab.id ? 'activo' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Listado de Pedidos Asignados */}
            <div className="costurera-pedidos-lista">
                {cargando ? (
                    <div className="costurera-cargando">
                        <div className="spinner"></div>
                        <p>Cargando órdenes de confección...</p>
                    </div>
                ) : pedidosFiltrados.length === 0 ? (
                    <div className="card-vacia-costurera">
                        <span className="icono-vacio">🧵</span>
                        <h4>No hay prendas pendientes en esta etapa</h4>
                        <p>Las prendas asignadas a tu taller aparecerán aquí organizadas por prioridad.</p>
                    </div>
                ) : (
                    pedidosFiltrados.map((p) => {
                        const progreso = getProgreso(p.estado);
                        const tieneMedidas = p.busto || p.cintura || p.cadera || p.espalda;
                        const esActualizando = actualizandoId === p.id_pedido;

                        return (
                            <article key={p.id_pedido} className="costurera-card-pedido">
                                {/* Cabecera de la orden */}
                                <div className="card-pedido-top">
                                    <div className="pedido-id-tag">
                                        <span className="id-circulo">#{p.id_pedido}</span>
                                        <span className="pedido-cliente-nombre">{p.cliente || 'Cliente'}</span>
                                    </div>
                                    <span className={`estado-pill estado-${getEstadoClass(p.estado)}`}>
                                        {p.estado}
                                    </span>
                                </div>

                                {/* Prenda y especificaciones */}
                                <div className="card-prenda-info">
                                    <h3 className="prenda-titulo">{p.prenda || 'Prenda a Medida'}</h3>
                                    {p.color && <span className="prenda-color-chip">Color: {p.color}</span>}
                                </div>

                                {/* Notas de diseño del atelier */}
                                {p.notas_diseno && (
                                    <div className="notas-diseno-box">
                                        <span className="notas-icono">✂️</span>
                                        <p>{p.notas_diseno}</p>
                                    </div>
                                )}

                                {/* Patronaje: Talla o Medidas Anatómicas de este pedido */}
                                <div className="patronaje-resumen-box">
                                    <div className="patronaje-titulo-fila">
                                        <span className="patronaje-label">
                                            📐 Patronaje: {p.talla && p.talla !== 'A Medida' ? `Talla Convencional ${p.talla}` : 'Medidas Anatómicas'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setModalMedidas({ abierto: true, pedido: p })}
                                            className="btn-ver-medidas-chip"
                                        >
                                            Ver Medidas
                                        </button>
                                    </div>

                                    {tieneMedidas ? (
                                        <div className="medidas-mini-grid">
                                            {p.busto && <span>Busto: <strong>{p.busto}</strong></span>}
                                            {p.cintura && <span>Cint: <strong>{p.cintura}</strong></span>}
                                            {p.cadera && <span>Cad: <strong>{p.cadera}</strong></span>}
                                            {p.espalda && <span>Esp: <strong>{p.espalda}</strong></span>}
                                        </div>
                                    ) : (
                                        <p className="patronaje-convencional-texto">
                                            Confeccionar según la tabla estándar de la talla <strong>{p.talla || 'M'}</strong>.
                                        </p>
                                    )}
                                </div>

                                {/* Barra de Progreso */}
                                <div className="progreso-wrapper">
                                    <div className="progreso-track">
                                        <div className="progreso-fill" style={{ width: `${progreso}%` }} />
                                    </div>
                                    <span className="progreso-label">{progreso}% confección</span>
                                </div>

                                {/* Fechas Clave */}
                                <div className="fechas-cronograma-grid">
                                    <div className="fecha-item">
                                        <small>Registro</small>
                                        <strong>{new Date(p.fecha_pedido).toLocaleDateString()}</strong>
                                    </div>
                                    {p.fecha_prueba && (
                                        <div className="fecha-item">
                                            <small>✂️ Prueba</small>
                                            <strong>{new Date(p.fecha_prueba).toLocaleDateString()}</strong>
                                        </div>
                                    )}
                                    <div className="fecha-item fecha-entrega-item">
                                        <small>🏁 Entrega</small>
                                        <strong>{new Date(p.fecha_entrega).toLocaleDateString()}</strong>
                                    </div>
                                </div>

                                {/* Botones de Transición de Etapa de Confección (Touch >= 44px) */}
                                <div className="acciones-etapa-fila">
                                    {p.estado === 'Pendiente' && (
                                        <button
                                            type="button"
                                            disabled={esActualizando}
                                            onClick={() => actualizarEstado(p.id_pedido, 'Corte')}
                                            className="btn-etapa btn-pasar-corte"
                                        >
                                            {esActualizando ? 'Actualizando...' : '✂️ Iniciar Corte'}
                                        </button>
                                    )}

                                    {p.estado === 'Corte' && (
                                        <button
                                            type="button"
                                            disabled={esActualizando}
                                            onClick={() => actualizarEstado(p.id_pedido, 'Armado')}
                                            className="btn-etapa btn-pasar-armado"
                                        >
                                            {esActualizando ? 'Actualizando...' : '🧵 Iniciar Armado'}
                                        </button>
                                    )}

                                    {p.estado === 'Armado' && (
                                        <button
                                            type="button"
                                            disabled={esActualizando}
                                            onClick={() => actualizarEstado(p.id_pedido, 'Acabados')}
                                            className="btn-etapa btn-pasar-acabados"
                                        >
                                            {esActualizando ? 'Actualizando...' : '✨ Pasar a Acabados'}
                                        </button>
                                    )}

                                    {p.estado === 'Acabados' && (
                                        <button
                                            type="button"
                                            disabled={esActualizando}
                                            onClick={() => actualizarEstado(p.id_pedido, 'Listo para Prueba')}
                                            className="btn-etapa btn-pasar-terminado"
                                        >
                                            {esActualizando ? 'Actualizando...' : '🎉 Listo para Prueba'}
                                        </button>
                                    )}

                                    {p.estado === 'Listo para Prueba' && (
                                        <button
                                            type="button"
                                            disabled={esActualizando}
                                            onClick={() => actualizarEstado(p.id_pedido, 'Terminado')}
                                            className="btn-etapa btn-pasar-terminado"
                                        >
                                            {esActualizando ? 'Actualizando...' : '✓ Marcar Terminado'}
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })
                )}
            </div>

            {/* Modal de Medidas Anatómicas Completas */}
            {modalMedidas?.abierto && (
                <div className="modal-overlay-costurera" onClick={() => setModalMedidas(null)}>
                    <div className="modal-contenido-costurera" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-costurera-header">
                            <div>
                                <h3>Medidas de Confección</h3>
                                <span className="modal-sub">
                                    Pedido #{modalMedidas.pedido.id_pedido} — {modalMedidas.pedido.cliente}
                                </span>
                            </div>
                            <button className="btn-modal-cerrar" onClick={() => setModalMedidas(null)}>✕</button>
                        </div>

                        <div className="modal-body-medidas">
                            <div className="info-prenda-modal">
                                <strong>{modalMedidas.pedido.prenda}</strong>
                                {modalMedidas.pedido.color && <span>({modalMedidas.pedido.color})</span>}
                            </div>

                            {modalMedidas.pedido.talla && modalMedidas.pedido.talla !== 'A Medida' ? (
                                <div className="talla-grande-box">
                                    <span className="talla-badge-big">Talla {modalMedidas.pedido.talla}</span>
                                    <p>Prenda confeccionada bajo tabla de medidas convencional industrial.</p>
                                </div>
                            ) : null}

                            <h4 style={{ fontSize: '0.85rem', color: '#475569', margin: '0.8rem 0 0.4rem' }}>
                                Medidas Anatómicas Registradas (cm):
                            </h4>

                            <div className="modal-grid-medidas-costurera">
                                {Object.entries(ETIQUETAS_MEDIDAS).map(([campo, etiqueta]) => (
                                    <div key={campo} className="medida-costurera-item">
                                        <span className="medida-nombre">{etiqueta}</span>
                                        <strong className="medida-valor">
                                            {modalMedidas.pedido[campo] ? `${modalMedidas.pedido[campo]} cm` : '—'}
                                        </strong>
                                    </div>
                                ))}
                            </div>

                            {modalMedidas.pedido.notas_diseno && (
                                <div className="modal-notas-diseno">
                                    <label>Detalles de Diseño y Confección:</label>
                                    <p>{modalMedidas.pedido.notas_diseno}</p>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setModalMedidas(null)}
                            className="btn-cerrar-modal-completo"
                        >
                            Volver al Taller
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileDashboard;
