import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

// ── Datos mockeados para pedidos (pendiente conexión) ──

const pedidosProduccion = [
    { id: '#P-1042', cliente: 'María García', prenda: 'Vestido de novia', fecha: '15/08/2026', estado: 'Corte' },
    { id: '#P-1043', cliente: 'Juana Pérez', prenda: 'Terno ejecutivo', fecha: '18/08/2026', estado: 'Armado' }
];

const pedidosEntregados = [
    { id: '#P-1038', cliente: 'Elena Vargas', prenda: 'Blusa bordada', fecha: '02/08/2026' }
];

const AdminDashboard = () => {
    const { token } = useAuth();
    const [almacenStock, setAlmacenStock] = useState([]);
    
    useEffect(() => {
        const fetchAlmacen = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/almacen', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAlmacenStock(data);
                }
            } catch (error) {
                console.error("Error cargando almacén:", error);
            }
        };
        if (token) fetchAlmacen();
    }, [token]);

    return (
        <>
            {/* Tarjeta 1: Pedidos en Producción */}
            <section className="card card-produccion">
                <div className="card-header">
                    <h2>📋 Pedidos en Producción</h2>
                    <span className="card-badge">{pedidosProduccion.length} activos</span>
                </div>
                <div className="card-body">
                    {pedidosProduccion.map((p) => (
                        <div key={p.id} className="fila-pedido">
                            <span className="fila-id">{p.id}</span>
                            <span className="fila-cliente">{p.cliente}</span>
                            <span className="fila-prenda">{p.prenda}</span>
                            <span className="fila-fecha">{p.fecha}</span>
                            <span className={`fila-estado estado-${p.estado.toLowerCase().replace(' ', '-')}`}>
                                {p.estado}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tarjeta 2: Pedidos Entregados */}
            <section className="card card-entregados">
                <div className="card-header">
                    <h2>✅ Pedidos Entregados</h2>
                    <span className="card-badge entregado">{pedidosEntregados.length} completados</span>
                </div>
                <div className="card-body">
                    {pedidosEntregados.map((p) => (
                        <div key={p.id} className="fila-pedido entregado">
                            <span className="fila-id">{p.id}</span>
                            <span className="fila-cliente">{p.cliente}</span>
                            <span className="fila-prenda">{p.prenda}</span>
                            <span className="fila-fecha">{p.fecha}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tarjeta 3: Almacén */}
            <section className="card card-almacen">
                <div className="card-header">
                    <h2>📦 Almacén</h2>
                    <span className="card-subtitle">Productos con bajo stock</span>
                </div>
                <div className="card-body">
                    {almacenStock.map((item, i) => (
                        <div key={i} className={`fila-stock ${item.alerta ? 'alerta-bajo' : ''}`} style={item.alerta ? { color: 'red', fontWeight: 'bold' } : {}}>
                            <span className="stock-producto">{item.producto}</span>
                            <span className="stock-cantidad">
                                {item.stock} / {item.minimo}
                            </span>
                            {item.alerta && (
                                <span className="stock-alerta" style={{ color: 'red' }}>⚠ Bajo stock</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default AdminDashboard;
