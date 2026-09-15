import { useState, useEffect } from 'react';
import api from '../api/axios';
import ModalPedido from '../components/ModalPedido';
import ModalEntrega from '../components/ModalEntrega';
import ModalEditarPedido from '../components/ModalEditarPedido';
import ModalPago from '../components/ModalPago';
import ModalNotaVenta from '../components/ModalNotaVenta';

const AdminPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editarPedidoId, setEditarPedidoId] = useState(null);
    const [pedidoAEntregar, setPedidoAEntregar] = useState(null);
    const [pedidoAbono, setPedidoAbono] = useState(null);
    const [pedidoNotaVentaId, setPedidoNotaVentaId] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [msg, setMsg] = useState('');

    const cargarPedidos = async () => {
        try {
            const { data } = await api.get('/pedidos');
            setPedidos(data || []);
        } catch {
            setMsg('Error al cargar la lista de pedidos.');
        }
    };

    useEffect(() => {
        cargarPedidos();
    }, []);

    const actualizarEstado = async (id, nuevoEstado) => {
        try {
            await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
            cargarPedidos();
        } catch {
            alert('Error al actualizar estado del pedido');
        }
    };

    const handleEditarSuccess = () => {
        setEditarPedidoId(null);
        cargarPedidos();
    };

    const formatBs = (val) => `Bs. ${Number(val || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;

    const pedidosFiltrados = pedidos.filter(p => {
        // Filtro de búsqueda
        const matchBusqueda = (
            p.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.prenda?.toLowerCase().includes(busqueda.toLowerCase()) ||
            String(p.id_pedido).includes(busqueda)
        );

        // Filtro por pestaña de estado
        if (!matchBusqueda) return false;
        if (filtroEstado === 'todos') return true;
        if (filtroEstado === 'pendientes') return p.estado === 'Pendiente';
        if (filtroEstado === 'taller') return ['Corte', 'Armado', 'Prueba'].includes(p.estado);
        if (filtroEstado === 'terminados') return p.estado === 'Terminado';
        if (filtroEstado === 'entregados') return p.estado === 'Entregado';
        return true;
    });

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>📦 Control y Gestión de Pedidos</h2>
                    <span className="card-subtitle">Seguimiento de confección, prendas a medida y control de saldos</span>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primario"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
                >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Nuevo Pedido
                </button>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid var(--color-borde)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'pendientes', label: '⏳ Pendientes' },
                        { id: 'taller', label: '🧵 En Confección' },
                        { id: 'terminados', label: '✨ Listos' },
                        { id: 'entregados', label: '✅ Entregados' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFiltroEstado(tab.id)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                border: filtroEstado === tab.id ? '1px solid var(--color-azul-oscuro)' : '1px solid var(--color-borde)',
                                background: filtroEstado === tab.id ? 'var(--color-azul-oscuro)' : '#fff',
                                color: filtroEstado === tab.id ? '#fff' : 'var(--color-texto-secundario)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ minWidth: '220px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar por cliente o prenda..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div className="card-body" style={{ flex: 1, overflowY: 'auto' }}>
                {msg && <div style={{ color: 'var(--color-rojo-texto)', marginBottom: '1rem' }}>{msg}</div>}
                
                <div style={{ overflowX: 'auto' }}>
                    <table className="usuarios-tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Prenda & Color</th>
                                <th>Costo</th>
                                <th>Pagado</th>
                                <th>Saldo</th>
                                <th>Entrega</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map(p => {
                                const saldoVal = parseFloat(p.saldo || 0);
                                return (
                                    <tr key={p.id_pedido}>
                                        <td style={{ fontWeight: 'bold', color: 'var(--color-azul-oscuro)' }}>#{p.id_pedido}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{p.cliente}</div>
                                            {p.telefono_whatsapp && (
                                                <small style={{ color: 'var(--color-texto-secundario)' }}>📱 {p.telefono_whatsapp}</small>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{p.prenda || 'Prenda a Medida'}</div>
                                            {p.color && <small style={{ color: 'var(--color-texto-secundario)' }}>🎨 {p.color}</small>}
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>{formatBs(p.costo_total)}</td>
                                        <td style={{ color: 'var(--color-verde)', fontWeight: 600 }}>{formatBs(p.adelanto)}</td>
                                        <td style={{ color: saldoVal > 0 ? 'var(--color-rojo-texto)' : 'var(--color-verde)', fontWeight: 'bold' }}>
                                            {formatBs(saldoVal)}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>{new Date(p.fecha_entrega).toLocaleDateString('es-ES')}</div>
                                            {p.fecha_prueba && (
                                                <small style={{ color: '#0284c7', display: 'block' }}>
                                                    Prueba: {new Date(p.fecha_prueba).toLocaleDateString('es-ES')}
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            <select
                                                value={p.estado}
                                                onChange={(e) => actualizarEstado(p.id_pedido, e.target.value)}
                                                style={{
                                                    padding: '0.3rem 0.5rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--color-borde)',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    background: p.estado === 'Entregado' ? '#f0fdf4' : p.estado === 'Terminado' ? '#eff6ff' : '#fff',
                                                    color: p.estado === 'Entregado' ? '#166534' : 'inherit'
                                                }}
                                            >
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="Corte">Corte</option>
                                                <option value="Armado">Armado</option>
                                                <option value="Prueba">Prueba</option>
                                                <option value="Terminado">Terminado</option>
                                                <option value="Entregado">Entregado</option>
                                                <option value="Cancelado">Cancelado</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                {/* Botón Pagos */}
                                                <button
                                                    onClick={() => setPedidoAbono(p)}
                                                    title="Ver pagos o registrar abono"
                                                    style={{
                                                        background: '#f8fafc', color: 'var(--color-azul-oscuro)',
                                                        border: '1px solid var(--color-borde)', borderRadius: '6px',
                                                        padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                                                    }}
                                                >
                                                    💳 Pagos
                                                </button>

                                                {/* Botón Nota de Venta */}
                                                <button
                                                    onClick={() => setPedidoNotaVentaId(p.id_pedido)}
                                                    title="Ver o emitir Nota de Venta oficial inmutable"
                                                    style={{
                                                        background: '#f8fafc', color: '#0284c7',
                                                        border: '1px solid #bae6fd', borderRadius: '6px',
                                                        padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                                                    }}
                                                >
                                                    🧾 Nota
                                                </button>

                                                {/* Botón Entregar */}
                                                {p.estado !== 'Entregado' && p.estado !== 'Cancelado' && (
                                                    <button
                                                        onClick={() => setPedidoAEntregar(p)}
                                                        title="Cobrar saldo y entregar"
                                                        style={{
                                                            background: 'var(--color-verde)', color: '#fff',
                                                            border: 'none', borderRadius: '6px',
                                                            padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                                                        }}
                                                    >
                                                        🎁 Entregar
                                                    </button>
                                                )}

                                                {/* Botón Editar */}
                                                <button
                                                    onClick={() => setEditarPedidoId(p.id_pedido)}
                                                    title="Editar pedido"
                                                    style={{
                                                        background: '#f1f5f9', color: 'var(--color-texto-principal)',
                                                        border: 'none', borderRadius: '6px',
                                                        padding: '0.35rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem'
                                                    }}
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {pedidosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-texto-secundario)' }}>
                                        No se encontraron pedidos con los filtros seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalPedido
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={cargarPedidos}
            />

            <ModalEditarPedido
                isOpen={!!editarPedidoId}
                onClose={() => setEditarPedidoId(null)}
                onSuccess={handleEditarSuccess}
                idPedido={editarPedidoId}
            />

            <ModalEntrega
                isOpen={!!pedidoAEntregar}
                onClose={() => setPedidoAEntregar(null)}
                onSuccess={cargarPedidos}
                pedido={pedidoAEntregar}
            />

            <ModalPago
                isOpen={!!pedidoAbono}
                onClose={() => setPedidoAbono(null)}
                onSuccess={cargarPedidos}
                pedido={pedidoAbono}
            />

            <ModalNotaVenta
                isOpen={!!pedidoNotaVentaId}
                onClose={() => setPedidoNotaVentaId(null)}
                idPedido={pedidoNotaVentaId}
            />
        </section>
    );
};

export default AdminPedidos;
