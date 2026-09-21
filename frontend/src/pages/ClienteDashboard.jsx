import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { io } from 'socket.io-client';
import './ClienteDashboard.css';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ClienteDashboard = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    // Navegación de 5 opciones (Mobile First)
    // 'inicio' | 'catalogo' | 'citas' (+) | 'historial' | 'perfil'
    const [activeTab, setActiveTab] = useState('inicio');

    // Datos principales
    const [pedidos, setPedidos] = useState([]);
    const [citas, setCitas] = useState([]);
    const [citasOcupadas, setCitasOcupadas] = useState([]);
    const [catalogo, setCatalogo] = useState([]);
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [msg, setMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Calendario interactivo de citas (Mes actual)
    const [fechaCal, setFechaCal] = useState(new Date());
    const [fechaSeleccionadaCita, setFechaSeleccionadaCita] = useState('');
    const [horaCita, setHoraCita] = useState('10:00');
    const [motivoCita, setMotivoCita] = useState('');
    const [enviandoCita, setEnviandoCita] = useState(false);

    // Filtro de catálogo
    const [filtroCatalogo, setFiltroCatalogo] = useState('Todos');

    const cargarDatos = async () => {
        try {
            const [resPedidos, resCitas, resDisp, resCat, resPerfil] = await Promise.all([
                api.get('/pedidos'),
                api.get('/citas/mis-citas'),
                api.get('/citas/disponibilidad').catch(() => ({ data: [] })),
                api.get('/pedidos/catalogo-prendas').catch(() => ({ data: [] })),
                api.get('/clientes/mi-perfil').catch(() => ({ data: { cliente: null } }))
            ]);

            setPedidos(resPedidos.data || []);
            setCitas(resCitas.data || []);
            setCitasOcupadas(resDisp.data || []);
            setCatalogo(resCat.data || []);
            setPerfil(resPerfil.data?.cliente || null);
        } catch (err) {
            console.error('Error cargando datos del cliente:', err);
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Separación de pedidos: En producción vs Historial completado
    const pedidosEnProduccion = pedidos.filter(p => p.estado !== 'Entregado' && p.estado !== 'Cancelado');
    const pedidosHistorial = pedidos.filter(p => p.estado === 'Entregado' || p.estado === 'Terminado');

    const getProgreso = (estado) => {
        const mapa = { Pendiente: 15, Corte: 35, Armado: 60, Acabados: 80, 'Listo para Prueba': 90, Terminado: 95, Entregado: 100 };
        return mapa[estado] || 20;
    };

    // Cálculo del calendario para el mes actual
    const año = fechaCal.getFullYear();
    const mes = fechaCal.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    const diasCalendario = [];
    for (let i = 0; i < primerDia; i++) diasCalendario.push(null);
    for (let d = 1; d <= diasEnMes; d++) diasCalendario.push(new Date(año, mes, d));

    const mesNombre = fechaCal.toLocaleString('es', { month: 'long', year: 'numeric' });
    const hoyStr = new Date().toISOString().split('T')[0];

    // Verificar si un día tiene citas programadas en el taller
    const diaTieneCitas = (dia) => {
        if (!dia) return false;
        const fStr = dia.toISOString().split('T')[0];
        return citasOcupadas.some(c => c.fecha_cita && c.fecha_cita.split('T')[0] === fStr);
    };

    // Al hacer clic en un día del calendario
    const handleSeleccionarDia = (dia) => {
        if (!dia) return;
        const fStr = dia.toISOString().split('T')[0];
        setFechaSeleccionadaCita(fStr);
    };

    // Enviar solicitud de cita
    const handleAgendarCita = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setMsg('');

        if (!fechaSeleccionadaCita) {
            setErrorMsg('Seleccione un día en el calendario para su cita.');
            return;
        }

        setEnviandoCita(true);
        try {
            const fechaCompleta = `${fechaSeleccionadaCita}T${horaCita}:00`;
            await api.post('/citas', {
                fecha_cita: fechaCompleta,
                motivo_cita: motivoCita || 'Toma de medidas y consulta de diseño'
            });

            setMsg('¡Cita solicitada exitosamente! Te esperamos en el taller.');
            setMotivoCita('');
            setFechaSeleccionadaCita('');
            cargarDatos();
            setTimeout(() => setMsg(''), 5000);
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'No se pudo agendar la cita.');
        } finally {
            setEnviandoCita(false);
        }
    };

    // Categorías del catálogo
    const colecciones = ['Todos', ...new Set(catalogo.map(c => c.coleccion || 'Alta Costura'))];
    const catalogoFiltrado = filtroCatalogo === 'Todos' 
        ? catalogo 
        : catalogo.filter(c => c.coleccion === filtroCatalogo);

    // Función auxiliar para color de badge de cita
    const getCitaBadgeStyle = (estado) => {
        const est = (estado || '').toLowerCase();
        if (est === 'realizada' || est === 'atendida') {
            return { bg: '#ECFDF5', border: '#6EE7B7', text: '#047857', icono: '✅' };
        }
        if (est === 'confirmada') {
            return { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8', icono: '📅' };
        }
        if (est === 'cancelada') {
            return { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C', icono: '❌' };
        }
        // Por defecto: Programada o Pendiente
        return { bg: '#FFFBEB', border: '#FCD34D', text: '#B45309', icono: '⏳' };
    };

    return (
        <div className="cliente-dashboard-container">
            {/* CABECERA MINIMALISTA ELEGANTE */}
            <header className="cliente-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'var(--color-azul-oscuro)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.95rem', fontFamily: 'serif'
                    }}>
                        S
                    </div>
                    <div>
                        <h1 className="cliente-brand-title">SIMONETTA MODAS</h1>
                        <span className="cliente-brand-sub">Alta Costura a Medida</span>
                    </div>
                </div>
                <div className="cliente-header-user">
                    <span>{perfil?.nombre_completo?.split(' ')[0] || 'Cliente'}</span>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="cliente-main">
                {msg && (
                    <div className="cliente-alerta alerta-exito fade-in">
                        <span>✨ {msg}</span>
                    </div>
                )}
                {errorMsg && (
                    <div className="cliente-alerta alerta-error fade-in">
                        <span>⚠️ {errorMsg}</span>
                    </div>
                )}

                {cargando ? (
                    <div className="cliente-cargando">
                        <div className="spinner"></div>
                        <p>Preparando tu atelier personal...</p>
                    </div>
                ) : (
                    <>
                        {/* ======================================================== */}
                        {/* TAB 1: INICIO (Bienvenida, Citas, Pedidos en Producción) */}
                        {/* ======================================================== */}
                        {activeTab === 'inicio' && (
                            <div className="tab-content fade-in">
                                {/* Bienvenida (Sin botón de agendar cita) */}
                                <section className="cliente-welcome-card">
                                    <h2>Hola, {perfil?.nombre_completo?.split(' ')[0] || 'Estimada Cliente'} 👋</h2>
                                    <p>Bienvenida a tu espacio exclusivo de confección en Simonetta Modas.</p>
                                </section>

                                {/* BLOQUE 1: Citas del Cliente con colores e información enriquecida */}
                                <section className="seccion-bloque">
                                    <div className="seccion-header">
                                        <h3 className="seccion-titulo">Tus Citas</h3>
                                        <span className="seccion-contador">{citas.length}</span>
                                    </div>

                                    {citas.length === 0 ? (
                                        <div className="card-vacia">
                                            <span>📅</span>
                                            <p>No tienes citas agendadas por el momento.</p>
                                            <button 
                                                onClick={() => setActiveTab('citas')} 
                                                className="btn-link-accion"
                                            >
                                                Toca el botón + para consultar fechas y agendar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="citas-cards-grid">
                                            {citas.map((c) => {
                                                const badge = getCitaBadgeStyle(c.estado);
                                                const fechaObj = new Date(c.fecha_cita);
                                                const fechaLegible = fechaObj.toLocaleDateString('es', {
                                                    weekday: 'short', day: 'numeric', month: 'short'
                                                });
                                                const horaLegible = fechaObj.toLocaleTimeString('es', {
                                                    hour: '2-digit', minute: '2-digit'
                                                });

                                                return (
                                                    <div key={c.id_cita} className="cita-tarjeta" style={{ borderLeft: `5px solid ${badge.text}` }}>
                                                        <div className="cita-tarjeta-top">
                                                            <div className="cita-fecha-tag">
                                                                <span className="cita-fecha-icono">🗓️</span>
                                                                <span className="cita-fecha-texto">{fechaLegible} - {horaLegible}</span>
                                                            </div>
                                                            <span className="cita-badge" style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text }}>
                                                                {badge.icono} {c.estado || 'Programada'}
                                                            </span>
                                                        </div>
                                                        <h4 className="cita-motivo">{c.motivo_cita || c.detalles || 'Toma de medidas y prueba'}</h4>
                                                        <span className="cita-id-ref">Cita #{c.id_cita}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>

                                {/* BLOQUE 2: Pedidos en Producción Activa */}
                                <section className="seccion-bloque">
                                    <div className="seccion-header">
                                        <h3 className="seccion-titulo">Pedidos en Confección</h3>
                                        <span className="seccion-contador">{pedidosEnProduccion.length}</span>
                                    </div>

                                    {pedidosEnProduccion.length === 0 ? (
                                        <div className="card-vacia">
                                            <span>🪡</span>
                                            <p>No tienes pedidos en confección activa actualmente.</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                                                Explora el catálogo o agenda una cita para comenzar tu nueva prenda.
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="pedidos-cards-grid">
                                            {pedidosEnProduccion.map((p) => {
                                                const progreso = getProgreso(p.estado);
                                                return (
                                                    <div key={p.id_pedido} className="pedido-tarjeta-produccion">
                                                        <div className="pedido-tarjeta-top">
                                                            <span className="pedido-id">Pedido #{p.id_pedido}</span>
                                                            <span className={`estado-chip estado-${(p.estado || '').toLowerCase().replace(/ /g, '-')}`}>
                                                                {p.estado}
                                                            </span>
                                                        </div>

                                                        <h4 className="pedido-prenda-nombre">{p.prenda || 'Prenda a Medida'}</h4>
                                                        {p.color && <p className="pedido-prenda-color">Color: {p.color}</p>}

                                                        {/* Barra de progreso */}
                                                        <div className="progreso-container">
                                                            <div className="progreso-barra">
                                                                <div className="progreso-fill" style={{ width: `${progreso}%` }} />
                                                            </div>
                                                            <span className="progreso-texto">{progreso}% confección</span>
                                                        </div>

                                                        {/* Fechas clave */}
                                                        <div className="pedido-fechas-grid">
                                                            <div className="pedido-fecha-item">
                                                                <span>📅 Pedido</span>
                                                                <strong>{new Date(p.fecha_pedido).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</strong>
                                                            </div>
                                                            {p.fecha_prueba && (
                                                                <div className="pedido-fecha-item">
                                                                    <span>✂️ Prueba</span>
                                                                    <strong>{new Date(p.fecha_prueba).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</strong>
                                                                </div>
                                                            )}
                                                            <div className="pedido-fecha-item">
                                                                <span>🏁 Entrega</span>
                                                                <strong>{new Date(p.fecha_entrega).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* TAB 2: CATÁLOGO (Prendas de Alta Costura realizadas)     */}
                        {/* ======================================================== */}
                        {activeTab === 'catalogo' && (
                            <div className="tab-content fade-in">
                                <section className="catalogo-intro">
                                    <h2>Catálogo de Alta Costura</h2>
                                    <p>Descubre el arte de la confección a medida de Simonetta Modas para inspirar tu próximo diseño.</p>
                                </section>

                                {/* Filtros de Colección */}
                                <div className="catalogo-filtros-scroll">
                                    {colecciones.map(col => (
                                        <button
                                            key={col}
                                            onClick={() => setFiltroCatalogo(col)}
                                            className={`chip-filtro ${filtroCatalogo === col ? 'activo' : ''}`}
                                        >
                                            {col}
                                        </button>
                                    ))}
                                </div>

                                {/* Grilla de Prendas */}
                                <div className="catalogo-grid">
                                    {catalogoFiltrado.map((item, idx) => (
                                        <div key={item.id_prenda || idx} className="catalogo-card">
                                            <div className="catalogo-img-wrapper">
                                                <img 
                                                    src={item.imagen_url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'} 
                                                    alt={item.nombre_prenda}
                                                    className="catalogo-img" 
                                                    loading="lazy"
                                                />
                                                <span className="catalogo-badge-coleccion">{item.coleccion || 'Exclusivo'}</span>
                                            </div>
                                            <div className="catalogo-info">
                                                <h4 className="catalogo-nombre-prenda">{item.nombre_prenda}</h4>
                                                {item.color && <span className="catalogo-color">Tono: {item.color}</span>}
                                                <p className="catalogo-desc">{item.descripcion || item.descripcion_coleccion || 'Diseño exclusivo confeccionado en nuestro taller.'}</p>
                                                
                                                <button
                                                    onClick={() => {
                                                        setMotivoCita(`Diseño inspirado en: ${item.nombre_prenda} (${item.coleccion || ''})`);
                                                        setActiveTab('citas');
                                                    }}
                                                    className="btn-solicitar-modelo"
                                                >
                                                    ✨ Solicitar cita para este diseño
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* TAB 3: AGENDAR CITA CON CALENDARIO INTERACTIVO (+)       */}
                        {/* ======================================================== */}
                        {activeTab === 'citas' && (
                            <div className="tab-content fade-in">
                                <section className="citas-agendar-header">
                                    <h2>Agendar Cita</h2>
                                    <p>Consulta en el calendario los días ya ocupados y elige tu fecha disponible.</p>
                                </section>

                                {/* Mini Calendario Mensual */}
                                <div className="calendario-box">
                                    <div className="calendario-nav">
                                        <button 
                                            type="button" 
                                            onClick={() => setFechaCal(new Date(año, mes - 1, 1))}
                                            className="cal-btn-nav"
                                        >
                                            ◀
                                        </button>
                                        <span className="cal-mes-titulo">{mesNombre.toUpperCase()}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setFechaCal(new Date(año, mes + 1, 1))}
                                            className="cal-btn-nav"
                                        >
                                            ▶
                                        </button>
                                    </div>

                                    <div className="cal-grid-header">
                                        {diasSemana.map(d => <span key={d} className="cal-header-dia">{d}</span>)}
                                    </div>

                                    <div className="cal-grid-dias">
                                        {diasCalendario.map((dia, idx) => {
                                            if (!dia) return <div key={idx} className="cal-celda vacia" />;
                                            const fStr = dia.toISOString().split('T')[0];
                                            const isHoy = fStr === hoyStr;
                                            const isSeleccionado = fStr === fechaSeleccionadaCita;
                                            const ocupado = diaTieneCitas(dia);
                                            const pasado = dia < new Date(new Date().setHours(0,0,0,0));

                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    disabled={pasado}
                                                    onClick={() => handleSeleccionarDia(dia)}
                                                    className={`cal-celda ${isHoy ? 'hoy' : ''} ${isSeleccionado ? 'seleccionado' : ''} ${ocupado ? 'ocupado' : ''} ${pasado ? 'pasado' : ''}`}
                                                >
                                                    <span className="cal-dia-num">{dia.getDate()}</span>
                                                    {ocupado && <span className="cal-punto-ocupado" title="Día con citas programadas" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Leyenda */}
                                    <div className="cal-leyenda">
                                        <span><span className="dot dot-hoy"></span> Hoy</span>
                                        <span><span className="dot dot-ocupado"></span> Día con citas</span>
                                        <span><span className="dot dot-seleccionado"></span> Tu selección</span>
                                    </div>
                                </div>

                                {/* Formulario para confirmar la cita */}
                                <form onSubmit={handleAgendarCita} className="form-agendar-cita">
                                    <h3 style={{ fontSize: '1.05rem', color: 'var(--color-azul-oscuro)', margin: '0 0 1rem' }}>
                                        {fechaSeleccionadaCita 
                                            ? `Día seleccionado: ${new Date(fechaSeleccionadaCita + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}` 
                                            : 'Toca un día en el calendario de arriba'}
                                    </h3>

                                    <div className="form-group-cita">
                                        <label>Hora preferida</label>
                                        <select 
                                            value={horaCita} 
                                            onChange={(e) => setHoraCita(e.target.value)}
                                            className="input-select-cita"
                                        >
                                            <option value="09:00">09:00 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="11:30">11:30 AM</option>
                                            <option value="14:30">02:30 PM</option>
                                            <option value="16:00">04:00 PM</option>
                                            <option value="17:30">05:30 PM</option>
                                        </select>
                                    </div>

                                    <div className="form-group-cita">
                                        <label>Motivo de la cita</label>
                                        <textarea
                                            value={motivoCita}
                                            onChange={(e) => setMotivoCita(e.target.value)}
                                            placeholder="Ej: Toma de medidas para vestido de graduación, prueba de calce..."
                                            rows={3}
                                            className="textarea-cita"
                                            required
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={enviandoCita || !fechaSeleccionadaCita} 
                                        className="btn-confirmar-cita"
                                    >
                                        {enviandoCita ? 'Solicitando...' : 'Confirmar Solicitud de Cita'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* TAB 4: HISTORIAL DE PEDIDOS COMPLETADOS                  */}
                        {/* ======================================================== */}
                        {activeTab === 'historial' && (
                            <div className="tab-content fade-in">
                                <section className="historial-intro">
                                    <h2>Historial de Confección</h2>
                                    <p>Registro histórico detallado de tus prendas finalizadas, medidas tomadas y pagos.</p>
                                </section>

                                {pedidosHistorial.length === 0 ? (
                                    <div className="card-vacia">
                                        <span>📜</span>
                                        <p>Aún no tienes pedidos completados en tu historial.</p>
                                        <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                                            Tus pedidos entregados aparecerán aquí con todas sus especificaciones.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="historial-grid">
                                        {pedidosHistorial.map((p) => {
                                            const tieneMedidas = p.busto || p.cintura || p.cadera || p.espalda;
                                            return (
                                                <div key={p.id_pedido} className="historial-card">
                                                    <div className="historial-card-header">
                                                        <div>
                                                            <span className="historial-id">Pedido #{p.id_pedido}</span>
                                                            <h4 className="historial-prenda">{p.prenda || 'Prenda a Medida'}</h4>
                                                        </div>
                                                        <span className="badge-entregado">✓ Entregado</span>
                                                    </div>

                                                    {/* Costurera y Color */}
                                                    <div className="historial-meta-fila">
                                                        <span><strong>Operaria:</strong> {p.costurera || 'Taller Simonetta Modas'}</span>
                                                        {p.color && <span><strong>Color:</strong> {p.color}</span>}
                                                    </div>

                                                    {/* Medidas o Talla utilizadas */}
                                                    <div className="historial-medidas-box">
                                                        <span className="historial-medidas-titulo">
                                                            📐 Patronaje del Pedido: {p.talla && p.talla !== 'A Medida' ? `Talla ${p.talla}` : 'A Medida Anatómica'}
                                                        </span>
                                                        {tieneMedidas ? (
                                                            <div className="historial-medidas-grid">
                                                                {p.busto && <span>Busto: {p.busto} cm</span>}
                                                                {p.cintura && <span>Cintura: {p.cintura} cm</span>}
                                                                {p.cadera && <span>Cadera: {p.cadera} cm</span>}
                                                                {p.espalda && <span>Espalda: {p.espalda} cm</span>}
                                                                {p.hombro && <span>Hombro: {p.hombro} cm</span>}
                                                                {p.cortas && <span>Largo: {p.cortas} cm</span>}
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                                                                Confeccionado bajo talla estándar {p.talla || 'convencional'}.
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Detalle Financiero */}
                                                    <div className="historial-financiero">
                                                        <div>
                                                            <span>Monto Total</span>
                                                            <strong>Bs. {parseFloat(p.costo_total || 0).toFixed(2)}</strong>
                                                        </div>
                                                        <div>
                                                            <span>Total Abonado</span>
                                                            <strong style={{ color: '#166534' }}>Bs. {parseFloat(p.total_pagado || p.adelanto || 0).toFixed(2)}</strong>
                                                        </div>
                                                        <div>
                                                            <span>Saldo</span>
                                                            <strong>Bs. {parseFloat(p.saldo || 0).toFixed(2)}</strong>
                                                        </div>
                                                    </div>

                                                    {/* Cronograma de Fechas */}
                                                    <div className="historial-cronograma">
                                                        <span>📅 Registro: {new Date(p.fecha_pedido).toLocaleDateString()}</span>
                                                        {p.fecha_prueba && <span>✂️ Prueba: {new Date(p.fecha_prueba).toLocaleDateString()}</span>}
                                                        <span>🏁 Entrega: {new Date(p.fecha_entrega).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* TAB 5: PERFIL                                            */}
                        {/* ======================================================== */}
                        {activeTab === 'perfil' && (
                            <div className="tab-content fade-in">
                                <section className="perfil-card">
                                    <div className="perfil-avatar">
                                        {(perfil?.nombre_completo || 'Cliente').charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="perfil-nombre">{perfil?.nombre_completo || 'Cliente Registrado'}</h3>
                                    <span className="perfil-rol">Cliente Exclusivo Simonetta</span>

                                    <div className="perfil-datos-list">
                                        <div className="perfil-dato-item">
                                            <span>Correo</span>
                                            <strong>{perfil?.correo || usuario?.correo}</strong>
                                        </div>
                                        <div className="perfil-dato-item">
                                            <span>WhatsApp</span>
                                            <strong>{perfil?.telefono_whatsapp || 'No registrado'}</strong>
                                        </div>
                                        <div className="perfil-dato-item">
                                            <span>Carnet de Identidad</span>
                                            <strong>{perfil?.carnet_identidad || 'No registrado'}</strong>
                                        </div>
                                    </div>
                                </section>

                                <button onClick={handleLogout} className="btn-logout-cliente">
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* BARRA INFERIOR DE 5 ICONOS (MOBILE FIRST) */}
            <nav className="cliente-bottom-nav">
                <button 
                    type="button"
                    className={`nav-item ${activeTab === 'inicio' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inicio')}
                    title="Inicio"
                >
                    <span className="nav-icon">🏠</span>
                    <span className="nav-text">Inicio</span>
                </button>

                <button 
                    type="button"
                    className={`nav-item ${activeTab === 'catalogo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('catalogo')}
                    title="Catálogo"
                >
                    <span className="nav-icon">👗</span>
                    <span className="nav-text">Catálogo</span>
                </button>

                {/* Botón Central Destacado (+) */}
                <button 
                    type="button"
                    className={`nav-item nav-item-plus ${activeTab === 'citas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('citas')}
                    title="Agendar Cita"
                >
                    <div className="plus-btn-circle">
                        <span>➕</span>
                    </div>
                </button>

                <button 
                    type="button"
                    className={`nav-item ${activeTab === 'historial' ? 'active' : ''}`}
                    onClick={() => setActiveTab('historial')}
                    title="Historial"
                >
                    <span className="nav-icon">📜</span>
                    <span className="nav-text">Historial</span>
                </button>

                <button 
                    type="button"
                    className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('perfil')}
                    title="Perfil"
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-text">Perfil</span>
                </button>
            </nav>
        </div>
    );
};

export default ClienteDashboard;
