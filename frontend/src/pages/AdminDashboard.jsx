import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

// ── Datos mockeados ──

const usuariosTaller = [
    { id: 1, nombre: 'Laura Méndez', rol: 'Admin', iniciales: 'LM' },
    { id: 2, nombre: 'Carmen Rojas', rol: 'Secretaria', iniciales: 'CR' },
    { id: 3, nombre: 'Rosa Flores', rol: 'Costurera', iniciales: 'RF' },
    { id: 4, nombre: 'Ana Quispe', rol: 'Costurera', iniciales: 'AQ' },
];

const pedidosProduccion = [
    { id: '#P-1042', cliente: 'María García', prenda: 'Vestido de novia', fecha: '15/08/2026', estado: 'En corte' },
    { id: '#P-1043', cliente: 'Juana Pérez', prenda: 'Terno ejecutivo', fecha: '18/08/2026', estado: 'Confección' },
    { id: '#P-1044', cliente: 'Rosa Quispe', prenda: 'Pollera plisada', fecha: '20/08/2026', estado: 'Acabados' },
];

const pedidosEntregados = [
    { id: '#P-1038', cliente: 'Elena Vargas', prenda: 'Blusa bordada', fecha: '02/08/2026' },
    { id: '#P-1039', cliente: 'Sofía Mamani', prenda: 'Chamarra de cuero', fecha: '05/08/2026' },
    { id: '#P-1040', cliente: 'Lucía Condori', prenda: 'Vestido casual', fecha: '07/08/2026' },
];

const almacenStock = [
    { producto: 'Gabardina azul marino', stock: 2, minimo: 5, alerta: true },
    { producto: 'Lino blanco', stock: 8, minimo: 3, alerta: false },
    { producto: 'Hilo dorado (carrete)', stock: 1, minimo: 4, alerta: true },
    { producto: 'Cierre invisible 50cm', stock: 12, minimo: 5, alerta: false },
];

const pedidosProximos = [
    { id: '#P-1045', cliente: 'María García', fecha: '16/08/2026' },
    { id: '#P-1046', cliente: 'Juana Pérez', fecha: '19/08/2026' },
    { id: '#P-1047', cliente: 'Rosa Quispe', fecha: '22/08/2026' },
    { id: '#P-1048', cliente: 'Elena Vargas', fecha: '25/08/2026' },
    { id: '#P-1049', cliente: 'Sofía Mamani', fecha: '28/08/2026' },
];

const AdminDashboard = () => {
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
                        <div key={i} className={`fila-stock ${item.alerta ? 'alerta-bajo' : ''}`}>
                            <span className="stock-producto">{item.producto}</span>
                            <span className="stock-cantidad">
                                {item.stock} / {item.minimo}
                            </span>
                            {item.alerta && (
                                <span className="stock-alerta">⚠ Bajo stock</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default AdminDashboard;
