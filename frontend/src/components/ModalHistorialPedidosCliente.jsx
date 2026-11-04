import { useState, useEffect } from 'react';
import api from '../api/axios';

const ETIQUETAS_MEDIDAS = {
    busto: 'Busto / Pecho',
    cintura: 'Cintura',
    cadera: 'Cadera',
    espalda: 'Espalda',
    hombro: 'Hombro',
    cortas: 'Largo / Talle',
    frente: 'Frente (Talle Delantero)',
    alto_cadera: 'Alto de Cadera',
    entre_busto: 'Entre Busto'
};

const ModalHistorialPedidosCliente = ({ isOpen, onClose, cliente }) => {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [pedidoExpandido, setPedidoExpandido] = useState(null);

    useEffect(() => {
        if (isOpen && cliente) {
            cargarHistorial();
        }
    }, [isOpen, cliente]);

    const cargarHistorial = async () => {
        try {
            setCargando(true);
            setError('');
            const res = await api.get('/pedidos');
            const todosPedidos = res.data || [];
            // Filtrar pedidos correspondientes a este cliente
            const pedidosCliente = todosPedidos.filter(
                p => Number(p.id_cliente) === Number(cliente.id_cliente)
            );
            setPedidos(pedidosCliente);
        } catch (err) {
            console.error('Error cargando historial de pedidos:', err);
            setError('No se pudo cargar el historial de pedidos del cliente.');
        } finally {
            setCargando(false);
        }
    };

    if (!isOpen || !cliente) return null;

    const nombreCliente = cliente.nombre_completo || cliente.razon_social || `Cliente #${cliente.id_cliente}`;

    const getEstadoBadgeStyle = (estado) => {
        const est = (estado || '').toLowerCase();
        if (est.includes('terminado')) return { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' };
        if (est.includes('entregado')) return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
        if (est.includes('confección') || est.includes('confeccion') || est.includes('corte') || est.includes('armado')) 
            return { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
        if (est.includes('prueba')) return { bg: '#F5F3FF', color: '#5B21B6', border: '#DDD6FE' };
        if (est.includes('cancelado')) return { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' };
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' }; // Pendiente
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#ffffff', borderRadius: '16px', width: '92%', maxWidth: '850px',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.75rem', borderBottom: '1px solid #E2E8F0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#F8FAFC'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontSize: '1.4rem' }}>📋</span>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A', fontWeight: 700 }}>
                                Historial de Pedidos y Medidas
                            </h2>
                        </div>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                            Cliente: <strong>{nombreCliente}</strong> (ID #{cliente.id_cliente})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#FFFFFF', border: '1px solid #CBD5E1', width: '34px', height: '34px',
                            borderRadius: '50%', cursor: 'pointer', color: '#64748B', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && (
                        <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', fontSize: '0.88rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {cargando ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                            <p>Cargando historial de pedidos del cliente...</p>
                        </div>
                    ) : pedidos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94A3B8' }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>👗</span>
                            <h3 style={{ margin: '0 0 0.5rem', color: '#475569' }}>Sin pedidos registrados</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                Este cliente no cuenta con pedidos registrados actualmente en el atelier. Las medidas corporales se registrarán automáticamente cuando cree su primer pedido.
                            </p>
                        </div>
                    ) : (
                        pedidos.map(p => {
                            const badgeStyle = getEstadoBadgeStyle(p.estado);
                            const estaExpandido = pedidoExpandido === p.id_pedido;
                            const total = parseFloat(p.costo_total) || 0;
                            const adelanto = parseFloat(p.adelanto) || 0;
                            const saldo = parseFloat(p.saldo) !== undefined ? parseFloat(p.saldo) : Math.max(0, total - adelanto);

                            return (
                                <div
                                    key={p.id_pedido}
                                    style={{
                                        border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem',
                                        background: '#FFFFFF', boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                        display: 'flex', flexDirection: 'column', gap: '0.8rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.6rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1E293B' }}>
                                                    {p.prenda || 'Prenda a Medida'}
                                                </h3>
                                                {p.color && (
                                                    <span style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#475569' }}>
                                                        🎨 {p.color}
                                                    </span>
                                                )}
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                                                    borderRadius: '20px', background: badgeStyle.bg, color: badgeStyle.color,
                                                    border: `1px solid ${badgeStyle.border}`
                                                }}>
                                                    {p.estado || 'Pendiente'}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                                                Pedido #{p.id_pedido} • Fecha Pedido: {p.fecha_pedido ? new Date(p.fecha_pedido).toLocaleDateString() : '—'}
                                            </span>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                                                Total: {total.toFixed(2)} Bs
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: saldo > 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
                                                {saldo > 0 ? `Saldo Pendiente: ${saldo.toFixed(2)} Bs` : '✓ Pagado Completo'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fechas clave */}
                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#475569', background: '#F8FAFC', padding: '0.6rem 0.9rem', borderRadius: '8px' }}>
                                        {p.fecha_prueba && (
                                            <div>
                                                <span style={{ color: '#64748B' }}>✂️ Fecha Prueba:</span> <strong>{new Date(p.fecha_prueba).toLocaleDateString()}</strong>
                                            </div>
                                        )}
                                        {p.fecha_entrega && (
                                            <div>
                                                <span style={{ color: '#64748B' }}>🏁 Fecha Entrega:</span> <strong>{new Date(p.fecha_entrega).toLocaleDateString()}</strong>
                                            </div>
                                        )}
                                        {p.costurera && (
                                            <div>
                                                <span style={{ color: '#64748B' }}>🧵 Costurera:</span> <strong>{p.costurera}</strong>
                                            </div>
                                        )}
                                    </div>

                                    {/* Medidas anatómicas o talla del pedido */}
                                    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '0.6rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-azul-oscuro, #455E8B)' }}>
                                                    📏 Medidas Asignadas al Pedido:
                                                </span>
                                                {p.talla && p.talla !== 'A Medida' ? (
                                                    <span style={{ fontSize: '0.78rem', background: '#EFF6FF', color: '#1E40AF', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, border: '1px solid #BFDBFE' }}>
                                                        Talla: {p.talla}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.78rem', background: '#FDF4FF', color: '#86198F', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, border: '1px solid #F0ABFC' }}>
                                                        Patronaje a la Medida
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPedidoExpandido(estaExpandido ? null : p.id_pedido)}
                                                style={{
                                                    background: 'none', border: 'none', color: '#2563EB',
                                                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                {estaExpandido ? 'Ocultar detalles ▲' : 'Ver 9 medidas y diseño ▼'}
                                            </button>
                                        </div>

                                        {estaExpandido && (
                                            <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {/* Grid de 9 medidas anatómicas */}
                                                <div style={{
                                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                                                    gap: '0.5rem', background: '#F8FAFC', padding: '0.8rem', borderRadius: '8px'
                                                }}>
                                                    {Object.entries(ETIQUETAS_MEDIDAS).map(([campo, label]) => (
                                                        <div key={campo} style={{ background: '#FFFFFF', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{label}</div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                                                                {p[campo] ? `${p[campo]} cm` : '—'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {p.notas_diseno && (
                                                    <div style={{ fontSize: '0.8rem', color: '#475569', background: '#FFFBEB', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                                                        <strong>Notas de Diseño / Insumos:</strong> {p.notas_diseno}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '0.65rem 1.4rem', background: '#334155', color: '#ffffff',
                            border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                            fontSize: '0.88rem'
                        }}
                    >
                        Cerrar Historial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalHistorialPedidosCliente;
