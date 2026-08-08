import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MobileDashboard.css';

const MobileDashboard = () => {
    const { token, usuario } = useAuth();
    const esCosturera = usuario?.rol === 'Costurera';
    const [pedidosActivos, setPedidosActivos] = useState([]);

    const fetchPedidos = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/pedidos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filtrar los terminados
                const filtrados = data.filter(p => p.estado !== 'Terminado' && p.estado !== 'Listo para Prueba');
                setPedidosActivos(filtrados);
            }
        } catch (error) {
            console.error("Error cargando pedidos:", error);
        }
    };

    useEffect(() => {
        if (token) fetchPedidos();
    }, [token]);

    const actualizarEstado = async (id_pedido, nuevoEstado) => {
        try {
            const res = await fetch(`http://localhost:3000/api/pedidos/${id_pedido}/estado`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (res.ok) {
                fetchPedidos(); // Recargar tras actualizar
            }
        } catch (error) {
            console.error("Error al actualizar estado", error);
        }
    };

    // Helper para determinar progreso según estado
    const getProgreso = (estado) => {
        switch(estado) {
            case 'Pendiente': return 10;
            case 'Corte': return 30;
            case 'Armado': return 60;
            case 'Acabados': return 85;
            default: return 0;
        }
    };

    const getColorEstado = (estado) => {
        switch(estado) {
            case 'Pendiente': return 'pendiente';
            case 'Corte': return 'corte';
            case 'Armado': return 'confeccion';
            case 'Acabados': return 'acabados';
            default: return 'default';
        }
    };

    return (
        <>
            {/* Sección: Pedidos en Producción */}
            <section className="mobile-section">
                <h2 className="mobile-section-title">📋 Tareas Pendientes</h2>
                <div className="pedidos-cards">
                    {pedidosActivos.length === 0 ? (
                        <p style={{textAlign: 'center', color: '#666'}}>No hay tareas pendientes.</p>
                    ) : pedidosActivos.map((p) => (
                        <div key={p.id_pedido} className="pedido-card">
                            <div className="pedido-card-top">
                                <span className="pedido-card-id">#{p.id_pedido}</span>
                                <span className={`pedido-estado-badge estado-${getColorEstado(p.estado)}`}>
                                    {p.estado}
                                </span>
                            </div>
                            <h3 className="pedido-card-cliente">{p.cliente}</h3>
                            <p className="pedido-card-prenda">{p.prenda}</p>

                            {/* Barra de progreso */}
                            <div className="progreso-bar-wrapper">
                                <div className="progreso-bar">
                                    <div
                                        className={`progreso-fill fill-${getColorEstado(p.estado)}`}
                                        style={{ width: `${getProgreso(p.estado)}%` }}
                                    />
                                </div>
                                <span className="progreso-texto">{getProgreso(p.estado)}%</span>
                            </div>

                            <div className="pedido-card-fechas">
                                <span>📅 Inicio: {new Date(p.fecha_pedido).toLocaleDateString()}</span>
                                <span>🏁 Entrega: {new Date(p.fecha_entrega).toLocaleDateString()}</span>
                            </div>

                            {/* Botones de acción Táctiles (Mobile First) */}
                            {esCosturera && (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                                    {p.estado === 'Pendiente' && (
                                        <button onClick={() => actualizarEstado(p.id_pedido, 'Corte')} style={{ flex: 1, padding: '12px', background: '#455E8B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>Pasar a Corte</button>
                                    )}
                                    {p.estado === 'Corte' && (
                                        <button onClick={() => actualizarEstado(p.id_pedido, 'Armado')} style={{ flex: 1, padding: '12px', background: '#A3FC9A', color: '#333', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>Pasar a Armado</button>
                                    )}
                                    {p.estado === 'Armado' && (
                                        <button onClick={() => actualizarEstado(p.id_pedido, 'Acabados')} style={{ flex: 1, padding: '12px', background: '#E1F0FE', color: '#333', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>A Acabados</button>
                                    )}
                                    {p.estado === 'Acabados' && (
                                        <button onClick={() => actualizarEstado(p.id_pedido, 'Terminado')} style={{ flex: 1, padding: '12px', background: '#8290B0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>Finalizar Prenda</button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default MobileDashboard;
