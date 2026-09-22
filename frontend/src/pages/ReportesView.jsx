import { useState, useEffect } from 'react';
import api from '../api/axios';
import ModalMovimientoKardex from '../components/ModalMovimientoKardex';

const ReportesView = () => {
    // Estado del reporte general
    const [reporte, setReporte] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [descargandoPdf, setDescargandoPdf] = useState(false);
    const [descargandoNotaId, setDescargandoNotaId] = useState(null);
    const [enviandoEmailReporte, setEnviandoEmailReporte] = useState(false);
    const [enviandoNotaId, setEnviandoNotaId] = useState(null);
    const [tabActiva, setTabActiva] = useState('finanzas'); // 'finanzas', 'pedidos', 'kardex'

    // Filtros de periodo
    const hoy = new Date();
    const [filtroPeriodo, setFiltroPeriodo] = useState('mes_actual');
    const [fechaInicio, setFechaInicio] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]);

    // Estados para Kardex Almacén
    const [isModalMovimientoOpen, setIsModalMovimientoOpen] = useState(false);
    const [busquedaKardex, setBusquedaKardex] = useState('');
    const [filtroTipoKardex, setFiltroTipoKardex] = useState('todos');

    // Mensajes
    const [msg, setMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const cargarReporte = async () => {
        setCargando(true);
        setErrorMsg('');
        try {
            let params = {};
            if (filtroPeriodo === 'mes_actual') {
                params = { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
            } else if (filtroPeriodo === 'mes_anterior') {
                const mesAnt = hoy.getMonth() === 0 ? 12 : hoy.getMonth();
                const anioAnt = hoy.getMonth() === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();
                params = { mes: mesAnt, anio: anioAnt };
            } else if (filtroPeriodo === 'personalizado') {
                params = { fechaInicio, fechaFin };
            }

            const { data } = await api.get('/reportes/taller', { params });
            setReporte(data);
        } catch (err) {
            console.error('Error al cargar datos del reporte:', err);
            setErrorMsg('No se pudieron obtener los datos actualizados del taller.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarReporte();
    }, [filtroPeriodo]);

    // Descarga del Reporte General del Taller en PDF
    const handleDescargarReportePdf = async () => {
        try {
            setDescargandoPdf(true);
            let params = {};
            if (filtroPeriodo === 'mes_actual') {
                params = { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
            } else if (filtroPeriodo === 'mes_anterior') {
                const mesAnt = hoy.getMonth() === 0 ? 12 : hoy.getMonth();
                const anioAnt = hoy.getMonth() === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();
                params = { mes: mesAnt, anio: anioAnt };
            } else if (filtroPeriodo === 'personalizado') {
                params = { fechaInicio, fechaFin };
            }

            const response = await api.get('/reportes/taller/pdf', {
                params,
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const nombreArchivo = `Reporte_Taller_Simonetta_${(reporte?.periodo || 'Mensual').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setMsg('Informe general del taller generado y descargado correctamente en PDF.');
            setTimeout(() => setMsg(''), 4000);
        } catch (err) {
            console.error('Error al descargar PDF:', err);
            setErrorMsg('No fue posible generar el archivo PDF del taller. Intente nuevamente.');
        } finally {
            setDescargandoPdf(false);
        }
    };

    // Descarga de Nota de Venta individual en PDF
    const handleDescargarNotaVenta = async (idPedido) => {
        try {
            setDescargandoNotaId(idPedido);
            const response = await api.get(`/reportes/pedido/${idPedido}/pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Nota_Venta_Pedido_${idPedido}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setMsg(`Nota de Venta del Pedido #${idPedido} descargada exitosamente en PDF.`);
            setTimeout(() => setMsg(''), 4000);
        } catch (err) {
            console.error('Error al descargar nota de venta:', err);
            setErrorMsg(`Error al generar la nota de venta para el pedido #${idPedido}.`);
        } finally {
            setDescargandoNotaId(null);
        }
    };

    // Envío del Reporte General del Taller por Correo al Admin
    const handleEnviarReporteEmail = async () => {
        try {
            setEnviandoEmailReporte(true);
            let params = {};
            if (filtroPeriodo === 'mes_actual') {
                params = { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
            } else if (filtroPeriodo === 'mes_anterior') {
                const mesAnt = hoy.getMonth() === 0 ? 12 : hoy.getMonth();
                const anioAnt = hoy.getMonth() === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();
                params = { mes: mesAnt, anio: anioAnt };
            } else if (filtroPeriodo === 'personalizado') {
                params = { fechaInicio, fechaFin };
            }

            const { data } = await api.post('/reportes/taller/enviar-correo', params);
            setMsg(`✨ ${data.mensaje}`);
            setTimeout(() => setMsg(''), 5000);
        } catch (err) {
            console.error('Error al enviar reporte por correo:', err);
            setErrorMsg(err.response?.data?.error || 'Error al enviar reporte del taller por correo.');
            setTimeout(() => setErrorMsg(''), 5000);
        } finally {
            setEnviandoEmailReporte(false);
        }
    };

    // Envío de la Nota de Venta por Correo al Cliente
    const handleEnviarNotaEmail = async (idPedido) => {
        try {
            setEnviandoNotaId(idPedido);
            const { data } = await api.post(`/reportes/pedido/${idPedido}/enviar-correo`);
            setMsg(`✨ ${data.mensaje}`);
            setTimeout(() => setMsg(''), 5000);
        } catch (err) {
            console.error('Error al enviar nota por correo:', err);
            setErrorMsg(err.response?.data?.error || `Error al enviar nota de venta del pedido #${idPedido} por correo.`);
            setTimeout(() => setErrorMsg(''), 5000);
        } finally {
            setEnviandoNotaId(null);
        }
    };

    const kpis = reporte?.kpis || {};
    const pedidos = reporte?.pedidos || [];
    const deudas = reporte?.deudas || [];
    const bajoStock = reporte?.bajo_stock || [];
    const movimientos = reporte?.movimientos || [];

    // Filtros para Kardex
    const movimientosFiltrados = movimientos.filter(m => {
        const matchBusqueda = (
            m.nombre_material?.toLowerCase().includes(busquedaKardex.toLowerCase()) ||
            m.proveedor?.toLowerCase().includes(busquedaKardex.toLowerCase()) ||
            m.observacion?.toLowerCase().includes(busquedaKardex.toLowerCase()) ||
            String(m.id_movimiento).includes(busquedaKardex)
        );
        if (!matchBusqueda) return false;
        if (filtroTipoKardex === 'todos') return true;
        if (filtroTipoKardex === 'entradas') return m.id_tipo_movimiento === 1 || m.id_tipo_movimiento === 4;
        if (filtroTipoKardex === 'salidas') return m.id_tipo_movimiento === 2;
        if (filtroTipoKardex === 'ajustes') return m.id_tipo_movimiento === 3;
        return true;
    });

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header Principal */}
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-borde)', paddingBottom: '1rem' }}>
                <div>
                    <h2>Centro de Reportes del Taller</h2>
                    <span className="card-subtitle">Auditoría integral de confección, almacén, balance financiero y cobranzas</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {/* Selector de Periodo */}
                    <select
                        value={filtroPeriodo}
                        onChange={(e) => setFiltroPeriodo(e.target.value)}
                        style={{
                            padding: '0.55rem 0.9rem',
                            borderRadius: '8px',
                            border: '1px solid var(--color-borde)',
                            background: '#fff',
                            fontSize: '0.88rem',
                            fontWeight: 500
                        }}
                    >
                        <option value="mes_actual">📅 Mes Actual ({reporte?.periodo || 'Actual'})</option>
                        <option value="mes_anterior">⏮️ Mes Anterior</option>
                        <option value="personalizado">🗓️ Rango Personalizado</option>
                    </select>

                    {filtroPeriodo === 'personalizado' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontSize: '0.82rem' }}
                            />
                            <span>a</span>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontSize: '0.82rem' }}
                            />
                            <button
                                onClick={cargarReporte}
                                className="btn-secundario"
                                style={{ padding: '0.45rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem' }}
                            >
                                Filtrar
                            </button>
                        </div>
                    )}

                    {/* Botón Descarga PDF */}
                    <button
                        onClick={handleDescargarReportePdf}
                        disabled={descargandoPdf || cargando}
                        className="btn-primario"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            background: 'var(--color-azul-oscuro)',
                            color: '#fff',
                            fontWeight: 600
                        }}
                    >
                        {descargandoPdf ? 'Generando PDF...' : '📄 Descargar Reporte PDF'}
                    </button>

                    {/* Botón Enviar Reporte por Correo */}
                    <button
                        onClick={handleEnviarReporteEmail}
                        disabled={enviandoEmailReporte || cargando}
                        className="btn-secundario"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.6rem 1rem',
                            borderRadius: '8px',
                            fontWeight: 600,
                            background: '#fff',
                            border: '1px solid var(--color-borde)',
                            cursor: 'pointer'
                        }}
                        title="Enviar informe general al correo del administrador"
                    >
                        {enviandoEmailReporte ? '⏳ Enviando...' : '✉️ Enviar al Admin'}
                    </button>
                </div>
            </div>

            {/* Alertas */}
            {msg && (
                <div style={{ margin: '0.8rem 1.5rem', padding: '0.8rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '0.88rem' }}>
                    ✨ {msg}
                </div>
            )}
            {errorMsg && (
                <div style={{ margin: '0.8rem 1.5rem', padding: '0.8rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.88rem' }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* Tarjetas de Métricas Ejecutivas (KPIs) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-borde)', background: '#f8fafc' }}>
                <div style={{ background: '#fff', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--color-borde)', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>PEDIDOS DEL PERIODO</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>{kpis.total_pedidos || 0}</div>
                    <div style={{ fontSize: '0.78rem', color: '#16a34a' }}>✓ {kpis.pedidos_entregados || 0} entregados</div>
                </div>

                <div style={{ background: '#fff', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--color-borde)', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>TOTAL RECAUDADO</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#15803d' }}>
                        Bs. {parseFloat(kpis.total_recaudado || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        💵 Efectivo: Bs. {parseFloat(kpis.total_efectivo || 0).toFixed(0)} | 📱 QR: Bs. {parseFloat(kpis.total_qr || 0).toFixed(0)}
                    </div>
                </div>

                <div style={{ background: '#fff', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--color-borde)', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>SALDOS POR COBRAR</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#b45309' }}>
                        Bs. {parseFloat(kpis.total_saldos_pendientes || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#d97706' }}>⚠️ {kpis.pedidos_con_deuda || 0} clientes con deuda</div>
                </div>

                <div style={{ background: '#fff', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--color-borde)', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>ALMACÉN & ALERTAS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: kpis.items_bajo_stock > 0 ? '#b91c1c' : '#1e293b' }}>
                        {kpis.items_bajo_stock || 0} <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>bajo stock</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>📦 {kpis.movimientos_almacen || 0} movimientos</div>
                </div>
            </div>

            {/* Pestañas de Navegación del Centro de Reportes */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.8rem 1.5rem', borderBottom: '1px solid var(--color-borde)', background: '#fff' }}>
                <button
                    onClick={() => setTabActiva('finanzas')}
                    style={{
                        padding: '0.55rem 1.1rem',
                        borderRadius: '6px',
                        fontWeight: tabActiva === 'finanzas' ? 700 : 500,
                        background: tabActiva === 'finanzas' ? 'var(--color-azul-oscuro)' : '#f1f5f9',
                        color: tabActiva === 'finanzas' ? '#fff' : '#475569',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    💰 Balance & Cuentas por Cobrar
                </button>
                <button
                    onClick={() => setTabActiva('pedidos')}
                    style={{
                        padding: '0.55rem 1.1rem',
                        borderRadius: '6px',
                        fontWeight: tabActiva === 'pedidos' ? 700 : 500,
                        background: tabActiva === 'pedidos' ? 'var(--color-azul-oscuro)' : '#f1f5f9',
                        color: tabActiva === 'pedidos' ? '#fff' : '#475569',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    ✂️ Pedidos & Confección ({pedidos.length})
                </button>
                <button
                    onClick={() => setTabActiva('kardex')}
                    style={{
                        padding: '0.55rem 1.1rem',
                        borderRadius: '6px',
                        fontWeight: tabActiva === 'kardex' ? 700 : 500,
                        background: tabActiva === 'kardex' ? 'var(--color-azul-oscuro)' : '#f1f5f9',
                        color: tabActiva === 'kardex' ? '#fff' : '#475569',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    📦 Kardex Almacén ({movimientos.length})
                </button>
            </div>

            {/* Contenido según Pestaña Activa */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {cargando ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '0.8rem' }}>Consolidando auditoría y reportes del taller...</p>
                    </div>
                ) : (
                    <>
                        {/* ======================================================== */}
                        {/* PESTAÑA 1: BALANCE FINANCIERO Y CUENTAS POR COBRAR       */}
                        {/* ======================================================== */}
                        {tabActiva === 'finanzas' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Desglose Efectivo vs QR */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--color-borde)' }}>
                                        <h4 style={{ margin: '0 0 0.8rem 0', color: '#1e293b' }}>💵 Recaudación en Efectivo</h4>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#166534' }}>
                                            Bs. {parseFloat(kpis.total_efectivo || 0).toFixed(2)}
                                        </div>
                                        <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                                            Ingresos en caja física y pagos directos en recepción del taller.
                                        </p>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--color-borde)' }}>
                                        <h4 style={{ margin: '0 0 0.8rem 0', color: '#1e293b' }}>📱 Recaudación por QR / Transferencia</h4>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1d4ed8' }}>
                                            Bs. {parseFloat(kpis.total_qr || 0).toFixed(2)}
                                        </div>
                                        <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                                            Cobros digitales con confirmación de comprobante bancario.
                                        </p>
                                    </div>
                                </div>

                                {/* Tabla de Cuentas por Cobrar (Clientes con Saldo Pendiente) */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                                            Cartera de Cuentas por Cobrar ({deudas.length} pendientes)
                                        </h3>
                                        <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
                                            Deuda Global: Bs. {parseFloat(kpis.total_saldos_pendientes || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {deudas.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#16a34a' }}>
                                            ✨ No existen pedidos con saldos pendientes. Toda la cartera se encuentra regularizada.
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto', border: '1px solid var(--color-borde)', borderRadius: '8px' }}>
                                            <table className="tabla-datos" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ background: '#f1f5f9', textAlign: 'left', fontSize: '0.82rem' }}>
                                                        <th style={{ padding: '0.7rem' }}>Pedido</th>
                                                        <th style={{ padding: '0.7rem' }}>Cliente</th>
                                                        <th style={{ padding: '0.7rem' }}>Contacto</th>
                                                        <th style={{ padding: '0.7rem' }}>Prenda</th>
                                                        <th style={{ padding: '0.7rem' }}>Entrega</th>
                                                        <th style={{ padding: '0.7rem', textAlign: 'right' }}>Total</th>
                                                        <th style={{ padding: '0.7rem', textAlign: 'right' }}>Abonado</th>
                                                        <th style={{ padding: '0.7rem', textAlign: 'right' }}>Saldo Pendiente</th>
                                                        <th style={{ padding: '0.7rem', textAlign: 'center' }}>Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {deudas.map((d) => (
                                                        <tr key={d.id_pedido} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                                            <td style={{ padding: '0.7rem', fontWeight: 600 }}>#{d.id_pedido}</td>
                                                            <td style={{ padding: '0.7rem' }}>{d.cliente}</td>
                                                            <td style={{ padding: '0.7rem', color: '#475569' }}>{d.telefono || d.correo}</td>
                                                            <td style={{ padding: '0.7rem' }}>{d.prenda}</td>
                                                            <td style={{ padding: '0.7rem' }}>{new Date(d.fecha_entrega).toLocaleDateString()}</td>
                                                            <td style={{ padding: '0.7rem', textAlign: 'right' }}>Bs. {parseFloat(d.costo_total).toFixed(2)}</td>
                                                            <td style={{ padding: '0.7rem', textAlign: 'right', color: '#166534' }}>Bs. {parseFloat(d.total_pagado).toFixed(2)}</td>
                                                            <td style={{ padding: '0.7rem', textAlign: 'right', fontWeight: 700, color: '#b91c1c' }}>
                                                                Bs. {parseFloat(d.saldo).toFixed(2)}
                                                            </td>
                                                            <td style={{ padding: '0.7rem', textAlign: 'center' }}>
                                                                <button
                                                                    onClick={() => handleDescargarNotaVenta(d.id_pedido)}
                                                                    disabled={descargandoNotaId === d.id_pedido}
                                                                    className="btn-secundario"
                                                                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', borderRadius: '6px' }}
                                                                >
                                                                    {descargandoNotaId === d.id_pedido ? '...' : '📄 Nota Venta'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* PESTAÑA 2: PEDIDOS Y CONFECCIÓN                          */}
                        {/* ======================================================== */}
                        {tabActiva === 'pedidos' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                                        Pedidos Registrados en el Periodo ({pedidos.length})
                                    </h3>
                                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                        Facturación: Bs. {parseFloat(kpis.total_facturado || 0).toFixed(2)}
                                    </span>
                                </div>

                                {pedidos.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                                        No se encontraron pedidos registrados en el periodo seleccionado.
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto', border: '1px solid var(--color-borde)', borderRadius: '8px' }}>
                                        <table className="tabla-datos" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: '#f1f5f9', textAlign: 'left', fontSize: '0.82rem' }}>
                                                    <th style={{ padding: '0.7rem' }}>ID</th>
                                                    <th style={{ padding: '0.7rem' }}>Fecha</th>
                                                    <th style={{ padding: '0.7rem' }}>Cliente</th>
                                                    <th style={{ padding: '0.7rem' }}>Prenda / Tono</th>
                                                    <th style={{ padding: '0.7rem' }}>Costurera</th>
                                                    <th style={{ padding: '0.7rem' }}>Estado</th>
                                                    <th style={{ padding: '0.7rem', textAlign: 'right' }}>Total</th>
                                                    <th style={{ padding: '0.7rem', textAlign: 'right' }}>Saldo</th>
                                                    <th style={{ padding: '0.7rem', textAlign: 'center' }}>Comprobante</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pedidos.map((p) => {
                                                    const saldoNum = parseFloat(p.saldo || 0);
                                                    return (
                                                        <tr key={p.id_pedido} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                                            <td style={{ padding: '0.7rem', fontWeight: 600 }}>#{p.id_pedido}</td>
                                                            <td style={{ padding: '0.7rem' }}>{new Date(p.fecha_pedido).toLocaleDateString()}</td>
                                                            <td style={{ padding: '0.7rem' }}>{p.cliente}</td>
                                                            <td style={{ padding: '0.7rem' }}>{p.prenda} {p.color ? `(${p.color})` : ''}</td>
                                                            <td style={{ padding: '0.7rem', color: '#475569' }}>{p.costurera}</td>
                                                            <td style={{ padding: '0.7rem' }}>
                                                                <span style={{
                                                                    padding: '0.2rem 0.55rem',
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 600,
                                                                    background: p.estado === 'Terminado' || p.estado === 'Entregado' ? '#dcfce7' : '#fef3c7',
                                                                    color: p.estado === 'Terminado' || p.estado === 'Entregado' ? '#166534' : '#92400e'
                                                                }}>
                                                                    {p.estado}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '0.7rem', textAlign: 'right' }}>Bs. {parseFloat(p.costo_total).toFixed(2)}</td>
                                                            <td style={{ padding: '0.7rem', textAlign: 'right', fontWeight: 700, color: saldoNum > 0 ? '#b91c1c' : '#166534' }}>
                                                                {saldoNum > 0 ? `Bs. ${saldoNum.toFixed(2)}` : '✓ Pagado'}
                                                            </td>
                                                            <td style={{ padding: '0.7rem', textAlign: 'center' }}>
                                                                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                                                    <button
                                                                        onClick={() => handleDescargarNotaVenta(p.id_pedido)}
                                                                        disabled={descargandoNotaId === p.id_pedido}
                                                                        className="btn-secundario"
                                                                        style={{
                                                                            padding: '0.35rem 0.65rem',
                                                                            fontSize: '0.78rem',
                                                                            borderRadius: '6px',
                                                                            background: '#fff',
                                                                            border: '1px solid var(--color-borde)'
                                                                        }}
                                                                        title="Descargar Nota de Venta PDF"
                                                                    >
                                                                        {descargandoNotaId === p.id_pedido ? '...' : '📄 PDF'}
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handleEnviarNotaEmail(p.id_pedido)}
                                                                        disabled={enviandoNotaId === p.id_pedido}
                                                                        className="btn-secundario"
                                                                        style={{
                                                                            padding: '0.35rem 0.65rem',
                                                                            fontSize: '0.78rem',
                                                                            borderRadius: '6px',
                                                                            background: '#eff6ff',
                                                                            border: '1px solid #bfdbfe',
                                                                            color: '#1d4ed8'
                                                                        }}
                                                                        title={`Enviar nota de venta al correo del cliente (${p.cliente})`}
                                                                    >
                                                                        {enviandoNotaId === p.id_pedido ? '...' : '✉️ Correo'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* PESTAÑA 3: KARDEX ALMACÉN & ALERTAS DE STOCK             */}
                        {/* ======================================================== */}
                        {tabActiva === 'kardex' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Alertas de Stock Mínimo */}
                                {bajoStock.length > 0 && (
                                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: 700, marginBottom: '0.5rem' }}>
                                            <span>⚠️ Alerta: Insumos que requieren reposición inmediata</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
                                            {bajoStock.map((item) => (
                                                <div key={item.id_producto} style={{ background: '#fff', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '0.82rem' }}>
                                                    <strong>{item.nombre_material}</strong>
                                                    <div style={{ color: '#b91c1c' }}>
                                                        Stock actual: {parseFloat(item.cantidad_stock).toFixed(1)} {item.unidad} (Mín: {parseFloat(item.stock_minimo).toFixed(1)})
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Barra de búsqueda y botón nuevo movimiento */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {[
                                            { id: 'todos', label: 'Todos' },
                                            { id: 'entradas', label: '📥 Entradas' },
                                            { id: 'salidas', label: '📤 Salidas' },
                                            { id: 'ajustes', label: '⚙️ Ajustes' }
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setFiltroTipoKardex(tab.id)}
                                                style={{
                                                    padding: '0.45rem 0.9rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.82rem',
                                                    border: '1px solid var(--color-borde)',
                                                    background: filtroTipoKardex === tab.id ? 'var(--color-azul-oscuro)' : '#fff',
                                                    color: filtroTipoKardex === tab.id ? '#fff' : 'var(--color-texto)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="Buscar material o proveedor..."
                                            value={busquedaKardex}
                                            onChange={(e) => setBusquedaKardex(e.target.value)}
                                            style={{
                                                padding: '0.45rem 0.8rem',
                                                borderRadius: '6px',
                                                border: '1px solid var(--color-borde)',
                                                fontSize: '0.82rem',
                                                width: '200px'
                                            }}
                                        />
                                        <button
                                            onClick={() => setIsModalMovimientoOpen(true)}
                                            className="btn-primario"
                                            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', borderRadius: '6px' }}
                                        >
                                            + Registrar Movimiento
                                        </button>
                                    </div>
                                </div>

                                {/* Tabla de Movimientos */}
                                <div style={{ overflowX: 'auto', border: '1px solid var(--color-borde)', borderRadius: '8px' }}>
                                    <table className="tabla-datos" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9', textAlign: 'left', fontSize: '0.82rem' }}>
                                                <th style={{ padding: '0.7rem' }}>ID</th>
                                                <th style={{ padding: '0.7rem' }}>Fecha</th>
                                                <th style={{ padding: '0.7rem' }}>Tipo</th>
                                                <th style={{ padding: '0.7rem' }}>Material / Insumo</th>
                                                <th style={{ padding: '0.7rem', textAlign: 'right' }}>Cantidad</th>
                                                <th style={{ padding: '0.7rem' }}>Proveedor / Observación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movimientosFiltrados.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                                        No hay movimientos que coincidan con los filtros en este periodo.
                                                    </td>
                                                </tr>
                                            ) : (
                                                movimientosFiltrados.map((m) => (
                                                    <tr key={m.id_movimiento} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                                        <td style={{ padding: '0.7rem', fontWeight: 600 }}>#{m.id_movimiento}</td>
                                                        <td style={{ padding: '0.7rem' }}>{new Date(m.fecha_movimiento).toLocaleString()}</td>
                                                        <td style={{ padding: '0.7rem' }}>
                                                            <span style={{
                                                                padding: '0.2rem 0.55rem',
                                                                borderRadius: '12px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                background: m.id_tipo_movimiento === 1 || m.id_tipo_movimiento === 4 ? '#dcfce7' : '#fee2e2',
                                                                color: m.id_tipo_movimiento === 1 || m.id_tipo_movimiento === 4 ? '#166534' : '#991b1b'
                                                            }}>
                                                                {m.tipo_movimiento}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.7rem', fontWeight: 500 }}>{m.nombre_material}</td>
                                                        <td style={{ padding: '0.7rem', textAlign: 'right', fontWeight: 700 }}>
                                                            {parseFloat(m.cantidad).toFixed(2)}
                                                        </td>
                                                        <td style={{ padding: '0.7rem', color: '#475569' }}>
                                                            {m.proveedor ? `Prov: ${m.proveedor}` : (m.observacion || '-')}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de Registro de Movimiento en Kardex */}
            {isModalMovimientoOpen && (
                <ModalMovimientoKardex
                    isOpen={isModalMovimientoOpen}
                    onClose={() => setIsModalMovimientoOpen(false)}
                    onMovimientoGuardado={() => {
                        setIsModalMovimientoOpen(false);
                        cargarReporte();
                    }}
                />
            )}
        </section>
    );
};

export default ReportesView;
