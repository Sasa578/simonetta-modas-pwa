import { useState, useEffect } from 'react';
import api from '../api/axios';

const pedidosEntregadosMock = [{ id: '#P-1038', cliente: 'Elena Vargas', prenda: 'Blusa bordada', fecha: '02/08/2026' }];

const AdminDashboard = () => {
    const [metricas, setMetricas] = useState({ pedidosPendientes: 0, pedidosProximos48h: 0, ingresosMes: 0 });
    const [almacenStock, setAlmacenStock] = useState([]);
    const [pedidosProduccion, setPedidosProduccion] = useState([]);

    const formatBs = (val) => `Bs. ${Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;

    useEffect(() => {
        api.get('/pedidos/metricas').then(({ data }) => setMetricas(data)).catch(() => {});
        api.get('/almacen').then(({ data }) => setAlmacenStock(data)).catch(() => {});
        api.get('/pedidos').then(({ data }) => { if (data?.length) setPedidosProduccion(data); }).catch(() => {});
    }, []);

    return (
        <>
            {/* KPIs */}
            <section className="kpis-grid">
                <div className="kpi-card kpi-pendientes"><div className="kpi-icon">📋</div><div className="kpi-info"><span className="kpi-valor">{metricas.pedidosPendientes}</span><span className="kpi-label">Pedidos Pendientes</span></div></div>
                <div className="kpi-card kpi-urgentes"><div className="kpi-icon">⏰</div><div className="kpi-info"><span className="kpi-valor">{metricas.pedidosProximos48h}</span><span className="kpi-label">Próximas 48 horas</span></div></div>
                <div className="kpi-card kpi-ingresos"><div className="kpi-icon">💰</div><div className="kpi-info"><span className="kpi-valor">{formatBs(metricas.ingresosMes)}</span><span className="kpi-label">Ingresos del Mes</span></div></div>
            </section>

            {/* Pedidos en Producción */}
            <section className="card card-produccion">
                <div className="card-header"><h2>📋 Pedidos en Producción</h2><span className="card-badge">{pedidosProduccion.length} activos</span></div>
                <div className="card-body">
                    {pedidosProduccion.map((p) => (
                        <div key={p.id_pedido || p.id} className="fila-pedido">
                            <span className="fila-id">#{p.id_pedido || p.id}</span><span className="fila-cliente">{p.cliente}</span><span className="fila-prenda">{p.prenda}</span><span className="fila-fecha">{p.fecha_entrega || p.fecha}</span>
                            <span className={`fila-estado estado-${(p.estado || '').toLowerCase().replace(/ /g, '-')}`}>{p.estado}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pedidos Entregados */}
            <section className="card card-entregados">
                <div className="card-header"><h2>✅ Pedidos Entregados</h2><span className="card-badge entregado">{pedidosEntregadosMock.length} completados</span></div>
                <div className="card-body">{pedidosEntregadosMock.map((p) => (<div key={p.id} className="fila-pedido entregado"><span className="fila-id">{p.id}</span><span className="fila-cliente">{p.cliente}</span><span className="fila-prenda">{p.prenda}</span><span className="fila-fecha">{p.fecha}</span></div>))}</div>
            </section>

            {/* Almacén (solo bajo stock) */}
            <section className="card card-almacen">
                <div className="card-header"><h2>📦 Almacén</h2><span className="card-subtitle">Alertas de stock bajo</span></div>
                <div className="card-body">
                    {almacenStock.filter(i => i.cantidad_actual <= i.stock_minimo).map((item, i) => (
                        <div key={i} className="fila-stock alerta-bajo">
                            <span className="stock-producto">{item.nombre_material || item.producto}</span>
                            <span className="stock-cantidad">{item.cantidad_actual || item.stock} / {item.stock_minimo || item.minimo}</span>
                            <span className="stock-alerta">⚠ Bajo stock</span>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default AdminDashboard;
