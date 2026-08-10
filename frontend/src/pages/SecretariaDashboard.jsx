import { useState, useEffect } from 'react';
import ModalPedido from '../components/ModalPedido';
import api from '../api/axios';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const calendarioDias = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = hoy.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    const dias = [];
    for (let i = 0; i < primerDia; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) dias.push(new Date(año, mes, d));
    return dias;
};

const SecretariaDashboard = () => {
    const [mesActual] = useState(new Date().toLocaleString('es', { month: 'long', year: 'numeric' }));
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Estados para el Modal Pedido
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [clientePreseleccionado, setClientePreseleccionado] = useState(null);
    const [citaAtenderId, setCitaAtenderId] = useState(null);

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
    }, []);

    const handleDiaClick = (diaFecha) => {
        const fechaFormat = diaFecha.toISOString().split('T')[0];
        setFechaSeleccionada(fechaFormat);
        setClientePreseleccionado(null);
        setCitaAtenderId(null);
        setIsModalOpen(true);
    };

    const handleAtenderCita = (cita) => {
        const fechaFormat = new Date(cita.fecha_cita).toISOString().split('T')[0];
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

    const getIndicadores = (diaFecha) => {
        if (!diaFecha) return [];
        const fStr = diaFecha.toISOString().split('T')[0];
        const indicadores = [];

        if (citas.some(c => new Date(c.fecha_cita).toISOString().split('T')[0] === fStr)) {
            indicadores.push({ icono: '📌', title: 'Citas programadas' });
        }
        if (pedidos.some(p => p.fecha_prueba && new Date(p.fecha_prueba).toISOString().split('T')[0] === fStr)) {
            indicadores.push({ icono: '✂️', title: 'Pruebas de vestuario' });
        }
        if (pedidos.some(p => p.fecha_entrega && new Date(p.fecha_entrega).toISOString().split('T')[0] === fStr)) {
            indicadores.push({ icono: '🏁', title: 'Entregas' });
        }
        return indicadores;
    };

    const dias = calendarioDias();
    const hoyStr = new Date().toISOString().split('T')[0];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
            {/* Fila Principal: Calendario + Citas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                
                {/* Calendario */}
                <section className="card card-calendario" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="card-header">
                        <h2>📅 {mesActual.charAt(0).toUpperCase() + mesActual.slice(1)}</h2>
                        <span className="card-subtitle">Click en un día para agendar</span>
                    </div>
                    <div className="calendario-grid-wrapper" style={{ padding: '1rem', flex: 1 }}>
                        <div className="calendario-dias-semana">
                            {diasSemana.map((d) => <span key={d} className="dia-semana" style={{ fontWeight: 'bold' }}>{d}</span>)}
                        </div>
                        <div className="calendario-grid">
                            {dias.map((diaFecha, i) => {
                                const isHoy = diaFecha && diaFecha.toISOString().split('T')[0] === hoyStr;
                                const indicadores = getIndicadores(diaFecha);
                                return (
                                    <div
                                        key={i}
                                        className={`calendario-dia ${diaFecha ? 'activo' : 'vacio'} ${isHoy ? 'hoy' : ''}`}
                                        onClick={() => diaFecha && handleDiaClick(diaFecha)}
                                        style={{ position: 'relative', minHeight: '60px' }}
                                    >
                                        <span>{diaFecha ? diaFecha.getDate() : ''}</span>
                                        <div style={{ position: 'absolute', bottom: '2px', display: 'flex', gap: '2px' }}>
                                            {indicadores.map((ind, idx) => (
                                                <span key={idx} title={ind.title} style={{ fontSize: '0.8rem' }}>{ind.icono}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-texto-secundario)', justifyContent: 'center' }}>
                            <span>📌 Cita</span>
                            <span>✂️ Prueba</span>
                            <span>🏁 Entrega</span>
                        </div>
                    </div>
                </section>

                {/* Citas Pendientes */}
                <section className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="card-header">
                        <h2>📌 Citas Pendientes</h2>
                        <span className="card-badge">{citas.length} clientes por atender</span>
                    </div>
                    <div className="card-body" style={{ flex: 1, overflowY: 'auto' }}>
                        {citas.length === 0 ? (
                            <p style={{ color: 'var(--color-texto-secundario)', textAlign: 'center', marginTop: '2rem' }}>No hay citas pendientes.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {citas.map(c => (
                                    <div key={c.id_cita} style={{ border: '1px solid var(--color-borde)', borderRadius: '8px', padding: '1rem', background: '#f8fafc' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <strong style={{ color: 'var(--color-azul-oscuro)' }}>{c.cliente}</strong>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>{new Date(c.fecha_cita).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>📞 {c.telefono_whatsapp}</p>
                                        {c.detalles && <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-texto-secundario)' }}>"{c.detalles}"</p>}
                                        
                                        <button onClick={() => handleAtenderCita(c)} style={{
                                            width: '100%', padding: '0.6rem', background: 'var(--color-azul-oscuro)',
                                            color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
                                        }}>
                                            Crear Pedido
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Fila Secundaria: Almacén y Pedidos Activos */}
            <div className="secretaria-columnas">
                <section className="card card-almacen-sec">
                    <div className="card-header">
                        <h2>📦 Vistazo de Almacén</h2>
                    </div>
                    <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {almacen.length === 0 ? <p>Cargando almacén...</p> : almacen.map((item, i) => {
                            const bajo = item.cantidad_actual <= item.stock_minimo;
                            return (
                                <div key={i} className={`fila-stock ${bajo ? 'alerta-bajo' : ''}`}>
                                    <span className="stock-producto">{item.nombre_material}</span>
                                    <span className="stock-cantidad">{item.cantidad_actual} {item.unidad_medida}</span>
                                    {bajo && <span className="stock-alerta">⚠ Bajo</span>}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="card card-pedidos-importantes">
                    <div className="card-header">
                        <h2>⭐ Entregas Próximas</h2>
                    </div>
                    <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {pedidos.filter(p => p.estado !== 'Terminado').slice(0, 5).map((p) => (
                            <div key={p.id_pedido} className="fila-pedido-importante">
                                <span className="importante-id">#{p.id_pedido}</span>
                                <span className="importante-cliente">{p.cliente}</span>
                                <span className="importante-fecha">{new Date(p.fecha_entrega).toLocaleDateString()}</span>
                                <span className="importante-prioridad" style={{ background: '#e0e7ff', color: '#3730a3' }}>{p.estado}</span>
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
        </div>
    );
};

export default SecretariaDashboard;
