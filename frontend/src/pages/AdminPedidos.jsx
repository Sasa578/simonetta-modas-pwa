import { useState, useEffect } from 'react';
import api from '../api/axios';
import ModalPedido from '../components/ModalPedido';
import ModalEditarPedido from '../components/ModalEditarPedido';

const AdminPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editarPedidoId, setEditarPedidoId] = useState(null);
    const [msg, setMsg] = useState('');

    const cargarPedidos = async () => {
        try {
            const { data } = await api.get('/pedidos');
            setPedidos(data);
        } catch (error) {
            setMsg('Error al cargar pedidos.');
        }
    };

    useEffect(() => {
        cargarPedidos();
    }, []);

    const actualizarEstado = async (id, nuevoEstado) => {
        try {
            await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
            cargarPedidos();
        } catch (error) {
            alert('Error al actualizar estado');
        }
    };

    const handleEditarSuccess = () => {
        setEditarPedidoId(null);
        cargarPedidos();
    };

    const formatBs = (val) => `Bs. ${Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>📦 Gestión de Pedidos</h2>
                    <span className="card-subtitle">Todos los pedidos del sistema</span>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primario" style={{ borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    +
                </button>
            </div>
            <div className="card-body" style={{ flex: 1, overflowY: 'auto' }}>
                {msg && <div style={{ color: 'var(--color-rojo-texto)', marginBottom: '1rem' }}>{msg}</div>}
                <div style={{ overflowX: 'auto' }}>
                    <table className="usuarios-tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Prenda</th>
                                <th>F. Entrega</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map(p => (
                                <tr key={p.id_pedido}>
                                    <td>#{p.id_pedido}</td>
                                    <td>{p.cliente}</td>
                                    <td>{p.prenda || 'N/A'}</td>
                                    <td>{new Date(p.fecha_entrega).toLocaleDateString('es-ES')}</td>
                                    <td>
                                        <span className={`fila-estado estado-${(p.estado || '').toLowerCase().replace(/ /g, '-')}`}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                        <select 
                                            value={p.estado} 
                                            onChange={(e) => actualizarEstado(p.id_pedido, e.target.value)}
                                            style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--color-borde)', fontSize: '0.8rem' }}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Corte">Corte</option>
                                            <option value="Armado">Armado</option>
                                            <option value="Acabados">Acabados</option>
                                            <option value="Listo para Prueba">Listo para Prueba</option>
                                            <option value="Terminado">Terminado</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                        <button 
                                            onClick={() => setEditarPedidoId(p.id_pedido)}
                                            style={{ background: 'var(--color-azul-claro)', color: 'var(--color-azul-oscuro)', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                        >
                                            ✏️ Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pedidos.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center'}}>No hay pedidos registrados</td></tr>}
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
        </section>
    );
};

export default AdminPedidos;
