import { useState, useEffect } from 'react';
import api from '../api/axios';
import ModalMovimientoKardex from '../components/ModalMovimientoKardex';

const KardexView = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [msg, setMsg] = useState('');

    const cargarMovimientos = async () => {
        setCargando(true);
        try {
            const { data } = await api.get('/kardex');
            setMovimientos(data || []);
        } catch {
            setMsg('Error al consultar los registros del Kardex.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarMovimientos();
    }, []);

    // KPIs
    const totalMovimientos = movimientos.length;
    const totalEntradas = movimientos.filter(m => m.id_tipo_movimiento === 1 || m.id_tipo_movimiento === 4).length;
    const totalSalidas = movimientos.filter(m => m.id_tipo_movimiento === 2).length;
    const proveedoresUnicos = new Set(movimientos.map(m => m.proveedor).filter(Boolean)).size;

    // Filtros
    const movimientosFiltrados = movimientos.filter(m => {
        const matchBusqueda = (
            m.nombre_material?.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.observacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
            String(m.id_movimiento).includes(busqueda)
        );

        if (!matchBusqueda) return false;
        if (filtroTipo === 'todos') return true;
        if (filtroTipo === 'entradas') return m.id_tipo_movimiento === 1 || m.id_tipo_movimiento === 4;
        if (filtroTipo === 'salidas') return m.id_tipo_movimiento === 2;
        if (filtroTipo === 'ajustes') return m.id_tipo_movimiento === 3;
        return true;
    });

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>📊 Kardex Transaccional y Auditoría</h2>
                    <span className="card-subtitle">Control inmutable de entradas, salidas y origen de materia prima</span>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primario"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
                >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Registrar Movimiento
                </button>
            </div>

            {/* KPIs Rápidos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-borde)', background: '#f8fafc' }}>
                <div style={{ background: '#fff', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--color-borde)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-texto-secundario)' }}>Total Movimientos</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-azul-oscuro)' }}>{totalMovimientos}</div>
                </div>
                <div style={{ background: '#fff', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--color-borde)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#166534' }}>📥 Entradas por Compra</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#16a34a' }}>{totalEntradas}</div>
                </div>
                <div style={{ background: '#fff', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--color-borde)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#b45309' }}>📤 Salidas Confección</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#d97706' }}>{totalSalidas}</div>
                </div>
                <div style={{ background: '#fff', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--color-borde)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#4338ca' }}>🏢 Proveedores Registrados</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#6366f1' }}>{proveedoresUnicos}</div>
                </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid var(--color-borde)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'entradas', label: '📥 Entradas' },
                        { id: 'salidas', label: '📤 Salidas' },
                        { id: 'ajustes', label: '⚙️ Ajustes' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFiltroTipo(tab.id)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                border: filtroTipo === tab.id ? '1px solid var(--color-azul-oscuro)' : '1px solid var(--color-borde)',
                                background: filtroTipo === tab.id ? 'var(--color-azul-oscuro)' : '#fff',
                                color: filtroTipo === tab.id ? '#fff' : 'var(--color-texto-secundario)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ minWidth: '240px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar insumo, proveedor u obs..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            {/* Tabla de Movimientos */}
            <div className="card-body" style={{ flex: 1, overflowY: 'auto' }}>
                {msg && <div style={{ color: 'var(--color-rojo-texto)', marginBottom: '1rem' }}>{msg}</div>}

                {cargando ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando registros del Kardex...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="usuarios-tabla">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Insumo</th>
                                    <th>Tipo de Movimiento</th>
                                    <th>Origen</th>
                                    <th>Cantidad</th>
                                    <th>Asociado a</th>
                                    <th>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientosFiltrados.map(m => {
                                    const esEntrada = m.id_tipo_movimiento === 1 || m.id_tipo_movimiento === 4;
                                    const esSalida = m.id_tipo_movimiento === 2;

                                    return (
                                        <tr key={m.id_movimiento}>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                {new Date(m.fecha_movimiento).toLocaleDateString('es-ES')}
                                                <small style={{ display: 'block', color: 'var(--color-texto-secundario)' }}>
                                                    {new Date(m.fecha_movimiento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{m.nombre_material}</div>
                                                <small style={{ color: 'var(--color-texto-secundario)' }}>{m.categoria}</small>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 600,
                                                    background: esEntrada ? '#dcfce7' : esSalida ? '#fef3c7' : '#f3e8ff',
                                                    color: esEntrada ? '#166534' : esSalida ? '#92400e' : '#6b21a8'
                                                }}>
                                                    {m.tipo_movimiento}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600,
                                                    background: m.id_origen === 1 ? '#e0f2fe' : '#fef9c3',
                                                    color: m.id_origen === 1 ? '#0369a1' : '#854d0e'
                                                }}>
                                                    {m.origen_material}
                                                </span>
                                            </td>
                                            <td style={{
                                                fontWeight: 'bold',
                                                color: esEntrada ? 'var(--color-verde)' : esSalida ? 'var(--color-rojo-texto)' : 'inherit'
                                            }}>
                                                {esEntrada ? `+${m.cantidad}` : esSalida ? `-${m.cantidad}` : m.cantidad} {m.unidad_medida}
                                            </td>
                                            <td>
                                                {m.proveedor ? (
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>🏢 {m.proveedor}</span>
                                                ) : m.id_pedido ? (
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-azul-oscuro)', fontWeight: 500 }}>📦 Pedido #{m.id_pedido}</span>
                                                ) : (
                                                    <span style={{ color: 'var(--color-texto-secundario)', fontSize: '0.8rem' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '0.85rem', maxWidth: '240px' }}>
                                                {m.observacion ? (
                                                    <span title={m.observacion} style={{ fontStyle: 'italic', color: '#475569' }}>
                                                        {m.observacion.length > 50 ? `${m.observacion.substring(0, 50)}...` : m.observacion}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {movimientosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-texto-secundario)' }}>
                                            No se encontraron movimientos registrados en Kardex con los criterios actuales.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ModalMovimientoKardex
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={cargarMovimientos}
            />
        </section>
    );
};

export default KardexView;
