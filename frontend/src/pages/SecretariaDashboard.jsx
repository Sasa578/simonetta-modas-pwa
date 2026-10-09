import { useState, useEffect } from 'react';
import ModalPedido from '../components/ModalPedido';
import ModalEditarPedido from '../components/ModalEditarPedido';
import api from '../api/axios';
import { io } from 'socket.io-client';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const toLocalDateStr = (d) => {
    if (!d) return '';
    const dateObj = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dateObj.getTime())) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const calendarioDias = (fechaBase = new Date()) => {
    const base = (fechaBase instanceof Date && !isNaN(fechaBase.getTime())) ? fechaBase : new Date();
    const año = base.getFullYear();
    const mes = base.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    const dias = [];
    for (let i = 0; i < primerDia; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) dias.push(new Date(año, mes, d));
    return dias;
};

const SecretariaDashboard = () => {
    const [fechaCalendario, setFechaCalendario] = useState(new Date());

    const handleMesAnterior = () => {
        setFechaCalendario(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleMesSiguiente = () => {
        setFechaCalendario(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleMesHoy = () => {
        setFechaCalendario(new Date());
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Estados para el Modal Pedido
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [clientePreseleccionado, setClientePreseleccionado] = useState(null);
    const [citaAtenderId, setCitaAtenderId] = useState(null);

    // Estados para Editar Pedido
    const [editarPedidoId, setEditarPedidoId] = useState(null);

    // Datos
    const [pedidos, setPedidos] = useState([]);
    const [citas, setCitas] = useState([]);
    const [almacen, setAlmacen] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarDatos = async () => {
        try {
            const [resPedidos, resCitas, resAlmacen] = await Promise.all([
                api.get('/pedidos'),
                api.get('/citas/pendientes'),
                api.get('/almacen')
            ]);
            setPedidos(resPedidos.data || []);
            setCitas(resCitas.data || []);
            setAlmacen(resAlmacen.data || []);
        } catch (error) {
            console.error('Error cargando datos para secretaría:', error);
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

    const handleDiaClick = (diaFecha) => {
        const fechaFormat = toLocalDateStr(diaFecha);
        setFechaSeleccionada(fechaFormat);
        setClientePreseleccionado(null);
        setCitaAtenderId(null);
        setIsModalOpen(true);
    };

    const handleAtenderCita = (cita) => {
        const fechaFormat = toLocalDateStr(cita.fecha_cita);
        setFechaSeleccionada(fechaFormat);
        setClientePreseleccionado(cita.id_cliente);
        setCitaAtenderId(cita.id_cita);
        setIsModalOpen(true);
    };

    const handlePedidoSuccess = async () => {
        // Si el pedido se creó desde una cita, la marcamos como atendida
        if (citaAtenderId) {
            try {
                await api.put(`/citas/${citaAtenderId}/estado`, { estado: 'Atendida' });
            } catch (error) {
                console.error('Error marcando cita como atendida', error);
            }
        }
        setIsModalOpen(false);
        cargarDatos();
    };

    const handleEditarSuccess = () => {
        setEditarPedidoId(null);
        cargarDatos();
    };

    const getIndicadores = (diaFecha) => {
        if (!diaFecha) return [];
        const fStr = toLocalDateStr(diaFecha);
        const indicadores = [];

        if (citas.some(c => toLocalDateStr(c.fecha_cita) === fStr)) {
            indicadores.push({ icono: '📌', title: 'Citas programadas' });
        }
        if (pedidos.some(p => p.fecha_prueba && toLocalDateStr(p.fecha_prueba) === fStr)) {
            indicadores.push({ icono: '✂️', title: 'Pruebas de vestuario' });
        }
        if (pedidos.some(p => p.fecha_entrega && toLocalDateStr(p.fecha_entrega) === fStr)) {
            indicadores.push({ icono: '🏁', title: 'Entregas' });
        }
        return indicadores;
    };

    const dias = calendarioDias(fechaCalendario);
    const mesActual = fechaCalendario.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const hoyStr = toLocalDateStr(new Date());

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
            {/* Fila 1: Calendario a Ancho Completo */}
            <section className="card card-calendario" style={{ width: '100%' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            📅 {mesActual.charAt(0).toUpperCase() + mesActual.slice(1)}
                        </h2>
                        <span className="card-subtitle">Haz clic en un día para agendar un nuevo pedido</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={handleMesAnterior}
                            style={{
                                padding: '0.45rem 0.85rem', background: '#F1F5F9', border: '1px solid #CBD5E1',
                                borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#334155',
                                display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem'
                            }}
                            title="Ver mes anterior"
                        >
                            ◀ Anterior
                        </button>
                        <button
                            type="button"
                            onClick={handleMesHoy}
                            style={{
                                padding: '0.45rem 0.85rem', background: '#EEF2FF', border: '1px solid #C7D2FE',
                                borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#3730A3', fontSize: '0.85rem'
                            }}
                            title="Ir al mes actual"
                        >
                            Hoy
                        </button>
                        <button
                            type="button"
                            onClick={handleMesSiguiente}
                            style={{
                                padding: '0.45rem 0.85rem', background: '#F1F5F9', border: '1px solid #CBD5E1',
                                borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#334155',
                                display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem'
                            }}
                            title="Ver mes siguiente"
                        >
                            Siguiente ▶
                        </button>
                    </div>
                </div>
                <div className="calendario-grid-wrapper">
                    <div className="calendario-dias-semana">
                        {diasSemana.map((d) => <span key={d} className="dia-semana">{d}</span>)}
                    </div>
                    <div className="calendario-grid">
                        {dias.map((diaFecha, i) => {
                            const isHoy = diaFecha && toLocalDateStr(diaFecha) === hoyStr;
                            const indicadores = getIndicadores(diaFecha);
                            return (
                                <div
                                    key={i}
                                    className={`calendario-dia ${diaFecha ? 'activo' : 'vacio'} ${isHoy ? 'hoy' : ''}`}
                                    onClick={() => diaFecha && handleDiaClick(diaFecha)}
                                    style={{ position: 'relative' }}
                                >
                                    <span>{diaFecha ? diaFecha.getDate() : ''}</span>
                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {indicadores.map((ind, idx) => (
                                            <span key={idx} title={ind.title} style={{ fontSize: '0.8rem' }}>{ind.icono}</span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-texto-secundario)', justifyContent: 'center' }}>
                        <span>📌 Cita programada</span>
                        <span>✂️ Prueba de vestuario</span>
                        <span>🏁 Entrega de pedido</span>
                    </div>
                </div>
            </section>

            {/* Fila 2: 3 Paneles Secundarios (Citas, Almacén, Entregas Próximas) */}
            <div className="secretaria-columnas">
                {/* Citas Pendientes */}
                <section className="card card-citas-sec" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header">
                        <h2>📌 Citas Pendientes</h2>
                        <span className="card-badge">{citas.length} por atender</span>
                    </div>
                    <div className="card-body" style={{ flex: 1, maxHeight: '320px', overflowY: 'auto' }}>
                        {citas.length === 0 ? (
                            <p style={{ color: 'var(--color-texto-secundario)', textAlign: 'center', marginTop: '2rem' }}>No hay citas pendientes.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {citas.map(c => (
                                    <div key={c.id_cita} style={{ border: '1px solid var(--color-borde)', borderRadius: '8px', padding: '0.9rem', background: '#f8fafc' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <strong style={{ color: 'var(--color-azul-oscuro)' }}>{c.cliente}</strong>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-texto-secundario)' }}>{new Date(c.fecha_cita).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem' }}>📞 {c.telefono_whatsapp}</p>
                                        {c.detalles && <p style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--color-texto-secundario)' }}>"{c.detalles}"</p>}
                                        
                                        <button onClick={() => handleAtenderCita(c)} style={{
                                            width: '100%', padding: '0.5rem', background: 'var(--color-azul-oscuro)',
                                            color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer'
                                        }}>
                                            Crear Pedido
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Vistazo de Almacén */}
                <section className="card card-almacen-sec">
                    <div className="card-header">
                        <h2> Vistazo de Almacén</h2>
                    </div>
                    <div className="card-body" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {almacen.length === 0 ? <p>Cargando almacén...</p> : almacen.map((item, i) => {
                            const stockActual = parseFloat(item.cantidad_actual ?? item.cantidad_stock) || 0;
                            const stockMin = parseFloat(item.stock_minimo) || 0;
                            const bajo = stockMin > 0 && stockActual <= stockMin;
                            return (
                                <div key={i} className={`fila-stock ${bajo ? 'alerta-bajo' : ''}`}>
                                    <span className="stock-producto">{item.nombre_material}</span>
                                    <span className="stock-cantidad">{stockActual} {item.unidad_medida}</span>
                                    {bajo && <span className="stock-alerta">⚠ Bajo</span>}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Entregas Próximas */}
                <section className="card card-pedidos-importantes">
                    <div className="card-header">
                        <h2>⭐ Entregas Próximas</h2>
                    </div>
                    <div className="card-body" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {pedidos.filter(p => p.estado !== 'Entregado' && p.estado !== 'Cancelado').slice(0, 10).map((p) => (
                            <div key={p.id_pedido} className="fila-pedido-importante" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div style={{display:'flex', gap:'0.6rem', flex:1, alignItems: 'center'}}>
                                    <span className="importante-id">#{p.id_pedido}</span>
                                    <span className="importante-cliente">{p.cliente}</span>
                                    <span className="importante-fecha">{new Date(p.fecha_entrega).toLocaleDateString()}</span>
                                    <span className="importante-prioridad" style={{ background: '#e0e7ff', color: '#3730a3' }}>{p.estado}</span>
                                </div>
                                <button onClick={() => setEditarPedidoId(p.id_pedido)} style={{
                                    background: 'transparent', border: '1px solid var(--color-borde)', padding: '0.25rem 0.5rem', 
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>
                                    ✏️ Editar
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <ModalPedido 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialFecha={fechaSeleccionada}
                initialCliente={clientePreseleccionado}
                onSuccess={handlePedidoSuccess}
            />
            
            <ModalEditarPedido
                isOpen={!!editarPedidoId}
                onClose={() => setEditarPedidoId(null)}
                onSuccess={handleEditarSuccess}
                idPedido={editarPedidoId}
            />
        </div>
    );
};

export default SecretariaDashboard;
