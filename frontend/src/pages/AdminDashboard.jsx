import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AdminDashboard.css';

// ── Datos mockeados (fallback si no hay API) ──

const pedidosProduccionMock = [
    { id: '#P-1042', cliente: 'María García', prenda: 'Vestido de novia', fecha: '15/08/2026', estado: 'Corte' },
    { id: '#P-1043', cliente: 'Juana Pérez', prenda: 'Terno ejecutivo', fecha: '18/08/2026', estado: 'Armado' },
];

const pedidosEntregadosMock = [
    { id: '#P-1038', cliente: 'Elena Vargas', prenda: 'Blusa bordada', fecha: '02/08/2026' },
];

const AdminDashboard = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    // ── KPIs (TI-4.2) ──
    const [metricas, setMetricas] = useState({
        pedidosPendientes: 0,
        pedidosProximos48h: 0,
        ingresosMes: 0,
    });

    const [almacenStock, setAlmacenStock] = useState([]);
    const [pedidosProduccion, setPedidosProduccion] = useState(pedidosProduccionMock);
    const [pedidosEntregados] = useState(pedidosEntregadosMock);

    const handleLogout = () => { logout(); navigate('/login'); };

    useEffect(() => {
        // Cargar KPIs desde /api/pedidos/metricas
        const cargarMetricas = async () => {
            try {
                const { data } = await api.get('/pedidos/metricas');
                setMetricas(data);
            } catch (err) {
                console.error('Error cargando métricas:', err);
            }
        };

        // Cargar almacén
        const cargarAlmacen = async () => {
            try {
                const { data } = await api.get('/almacen');
                setAlmacenStock(data);
            } catch (err) {
                console.error('Error cargando almacén:', err);
            }
        };

        // Cargar pedidos activos
        const cargarPedidos = async () => {
            try {
                const { data } = await api.get('/pedidos');
                if (data && data.length > 0) setPedidosProduccion(data);
            } catch (err) {
                console.error('Error cargando pedidos:', err);
            }
        };

        cargarMetricas();
        cargarAlmacen();
        cargarPedidos();
    }, []);

    // Formatear moneda
    const formatBs = (val) => `Bs. ${Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;

    return (
        <div className="admin-layout">
            {/* === Sidebar Izquierdo === */}
            <aside className="sidebar-left">
                <div className="sidebar-brand">
                    <span className="brand-icon">🧵</span>
                    <h1 className="brand-name">SIMONETTA</h1>
                    <p className="brand-subtitle">Panel Admin</p>
                </div>
                <div className="sidebar-section">
                    <h3 className="sidebar-heading">Navegación</h3>
                    <div className="accesos-lista">
                        <button className="acceso-item active" disabled>📊 Dashboard</button>
                        <button className="acceso-item" onClick={() => navigate('/pedidos/nuevo')}>+ Nuevo Pedido</button>
                        <button className="acceso-item" onClick={() => navigate('/dashboard')}>👥 Clientes</button>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={handleLogout}>⏻ Cerrar sesión</button>
            </aside>

            {/* === Topbar === */}
            <header className="topbar">
                <nav className="topbar-nav">
                    <button className="nav-item" disabled>Usuarios</button>
                    <button className="nav-item" onClick={() => navigate('/dashboard')}>Clientes</button>
                    <button className="nav-item active">Pedidos</button>
                    <button className="nav-item" disabled>Almacén</button>
                </nav>
                <div className="topbar-perfil">
                    <div className="perfil-avatar">{usuario?.correo?.charAt(0).toUpperCase() || 'A'}</div>
                    <div className="perfil-info">
                        <span className="perfil-nombre">{usuario?.correo || 'Admin'}</span>
                        <span className="perfil-rol">{usuario?.rol || 'Admin'}</span>
                    </div>
                </div>
            </header>

            {/* === Panel Central === */}
            <main className="main-content">
                {/* ── TI-4.2: Sección KPIs ── */}
                <section className="kpis-grid">
                    <div className="kpi-card kpi-pendientes">
                        <div className="kpi-icon">📋</div>
                        <div className="kpi-info">
                            <span className="kpi-valor">{metricas.pedidosPendientes}</span>
                            <span className="kpi-label">Pedidos Pendientes</span>
                        </div>
                    </div>
                    <div className="kpi-card kpi-urgentes">
                        <div className="kpi-icon">⏰</div>
                        <div className="kpi-info">
                            <span className="kpi-valor">{metricas.pedidosProximos48h}</span>
                            <span className="kpi-label">Próximas 48 horas</span>
                        </div>
                    </div>
                    <div className="kpi-card kpi-ingresos">
                        <div className="kpi-icon">💰</div>
                        <div className="kpi-info">
                            <span className="kpi-valor">{formatBs(metricas.ingresosMes)}</span>
                            <span className="kpi-label">Ingresos del Mes</span>
                        </div>
                    </div>
                </section>

                {/* Tarjeta 1: Pedidos en Producción */}
                <section className="card card-produccion">
                    <div className="card-header">
                        <h2>📋 Pedidos en Producción</h2>
                        <span className="card-badge">{pedidosProduccion.length} activos</span>
                    </div>
                    <div className="card-body">
                        {pedidosProduccion.map((p) => (
                            <div key={p.id_pedido || p.id} className="fila-pedido">
                                <span className="fila-id">#{p.id_pedido || p.id}</span>
                                <span className="fila-cliente">{p.cliente}</span>
                                <span className="fila-prenda">{p.prenda}</span>
                                <span className="fila-fecha">{p.fecha_entrega || p.fecha}</span>
                                <span className={`fila-estado estado-${(p.estado || '').toLowerCase().replace(/ /g, '-')}`}>
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
                        <span className="card-subtitle">Alertas de stock bajo</span>
                    </div>
                    <div className="card-body">
                        {almacenStock.map((item, i) => (
                            <div key={i} className={`fila-stock ${item.cantidad_actual <= item.stock_minimo ? 'alerta-bajo' : ''}`}>
                                <span className="stock-producto">{item.nombre_material || item.producto}</span>
                                <span className="stock-cantidad">
                                    {item.cantidad_actual || item.stock} / {item.stock_minimo || item.minimo}
                                </span>
                                {(item.cantidad_actual <= item.stock_minimo || item.alerta) && (
                                    <span className="stock-alerta">⚠ Bajo stock</span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
