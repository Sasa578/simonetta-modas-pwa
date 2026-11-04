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

    const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rolActual = usuarioActual.rol || usuarioActual.nombre_rol || '';
    const esSecretaria = rolActual === 'Secretaria';

    const actualizarEstado = async (id, nuevoEstado) => {
        try {
            await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
            setMsg('');
            cargarPedidos();
        } catch (err) {
            const mensajeError = err.response?.data?.error || 'Error al actualizar estado del pedido.';
            setMsg(mensajeError);
            alert(mensajeError);
            cargarPedidos(); // Reestablecer estado previo en el select
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
        const estNorm = (p.estado || '').toLowerCase().trim();
        if (filtroEstado === 'todos') return true;
        if (filtroEstado === 'pendientes') return estNorm === 'pendiente';
        if (filtroEstado === 'taller') {
            return estNorm.includes('confección') || estNorm.includes('confeccion') || estNorm === 'corte' || estNorm === 'armado' || estNorm.includes('prueba');
        }
        if (filtroEstado === 'terminados') {
            return estNorm.includes('terminado') || estNorm.includes('listo');
        }
        if (filtroEstado === 'entregados') return estNorm === 'entregado';
        return true;
    });

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2> Control y Gestión de Pedidos</h2>
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
                        { id: 'taller', label: ' En Confección' },
                        { id: 'terminados', label: ' Listos' },
                        { id: 'entregados', label: '[OK] Entregados' }
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
                                                <small style={{ color: 'var(--color-texto-secundario)' }}> {p.telefono_whatsapp}</small>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{p.prenda || 'Prenda a Medida'}</div>
                                            {p.color && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                                                    {p.codigo_hexadecimal && (
                                                        <span style={{
                                                            display: 'inline-block',
                                                            width: '11px',
                                                            height: '11px',
                                                            borderRadius: '50%',
                                                            backgroundColor: p.codigo_hexadecimal,
                                                            border: '1px solid rgba(0,0,0,0.2)',
                                                            flexShrink: 0
                                                        }} />
                                                    )}
                                                    <small style={{ color: 'var(--color-texto-secundario)', fontSize: '0.78rem' }}>{p.color}</small>
                                                </div>
                                            )}
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
                                                disabled={esSecretaria && p.estado !== 'Terminado'}
                                                onChange={(e) => actualizarEstado(p.id_pedido, e.target.value)}
                                                title={
                                                    esSecretaria && p.estado !== 'Terminado'
                                                        ? 'Pedido en confección a cargo de la costurera. Solo se puede entregar cuando la costurera lo marque como Terminado.'
                                                        : 'Cambiar estado del pedido'
                                                }
                                                style={{
                                                    padding: '0.35rem 0.5rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--color-borde)',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    background: p.estado === 'Entregado' ? '#f0fdf4' : p.estado === 'Terminado' ? '#eff6ff' : (esSecretaria && p.estado !== 'Terminado' ? '#f8fafc' : '#fff'),
                                                    color: p.estado === 'Entregado' ? '#166534' : p.estado === 'Terminado' ? '#1d4ed8' : (esSecretaria && p.estado !== 'Terminado' ? '#64748b' : 'inherit'),
                                                    cursor: (esSecretaria && p.estado !== 'Terminado') ? 'not-allowed' : 'pointer',
                                                    opacity: (esSecretaria && p.estado !== 'Terminado') ? 0.85 : 1
                                                }}
                                            >
                                                <option value="Pendiente" disabled={esSecretaria} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>Pendiente</option>
                                                <option value="En Confección" disabled={esSecretaria} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>En Confección</option>
                                                <option value="Prueba" disabled={esSecretaria} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>Prueba</option>
                                                <option value="Terminado" disabled={esSecretaria} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>Terminado</option>
                                                <option value="Entregado" disabled={esSecretaria && p.estado !== 'Terminado'} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>Entregado</option>
                                                <option value="Cancelado" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>Cancelado</option>
                                            </select>
                                            {esSecretaria && p.estado !== 'Terminado' && (
                                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                                                    🧵 En Taller ({p.costurera || 'Costurera'})
                                                </div>
                                            )}
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
                                                     Pagos
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
                                                     Nota
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
