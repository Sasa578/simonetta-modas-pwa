import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalPago = ({ isOpen, onClose, onSuccess, pedido }) => {
    const [pagos, setPagos] = useState([]);
    const [metodos, setMetodos] = useState([]);
    const [montoAbono, setMontoAbono] = useState('');
    const [idMetodo, setIdMetodo] = useState(1);
    const [cargando, setCargando] = useState(false);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    useEffect(() => {
        if (isOpen && pedido) {
            setMontoAbono('');
            setError('');
            setExito('');
            cargarHistorialYCatalogos();
        }
    }, [isOpen, pedido]);

    const cargarHistorialYCatalogos = async () => {
        setCargandoHistorial(true);
        try {
            const [resPagos, resCat] = await Promise.all([
                api.get(`/pagos/pedido/${pedido.id_pedido}`),
                api.get('/pagos/catalogos')
            ]);
            setPagos(resPagos.data || []);
            setMetodos(resCat.data?.metodos || []);
            if (resCat.data?.metodos?.length > 0) {
                setIdMetodo(resCat.data.metodos[0].id_metodo_pago);
            }
        } catch (err) {
            console.error('Error cargando pagos:', err);
        } finally {
            setCargandoHistorial(false);
        }
    };

    if (!isOpen || !pedido) return null;

    const costoTotal = parseFloat(pedido.costo_total) || 0;
    const totalPagado = pagos.reduce((acc, p) => acc + parseFloat(p.monto_pago || 0), 0);
    const saldoPendiente = Math.max(0, costoTotal - totalPagado);

    const handleRegistrarAbono = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');

        const monto = parseFloat(montoAbono);
        if (!monto || monto <= 0) {
            setError('Ingresa un monto de abono válido mayor a 0.');
            return;
        }

        if (monto > saldoPendiente) {
            setError(`El monto ingresado (Bs. ${monto}) supera el saldo pendiente (Bs. ${saldoPendiente.toFixed(2)}).`);
            return;
        }

        setCargando(true);
        try {
            await api.post('/pagos', {
                id_pedido: pedido.id_pedido,
                monto_pago: monto,
                id_metodo_pago: Number(idMetodo),
                id_estado_pago: monto >= saldoPendiente ? 3 : 2
            });

            setExito(`[OK] Abono de Bs. ${monto.toFixed(2)} registrado exitosamente.`);
            setMontoAbono('');
            await cargarHistorialYCatalogos();
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrar el abono.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
            <div style={{
                background: '#fff', padding: '1.8rem', borderRadius: '12px',
                width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <div>
                        <h2 style={{ color: 'var(--color-azul-oscuro)', margin: 0, fontSize: '1.3rem' }}>
                             Pagos y Abonos - Pedido #{pedido.id_pedido}
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>
                            Cliente: <strong>{pedido.cliente}</strong> | Prenda: <strong>{pedido.prenda}</strong>
                        </span>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>X</button>
                </header>

                {error && <div style={{ padding: '0.7rem', marginBottom: '1rem', borderRadius: '8px', background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)', fontSize: '0.85rem' }}>{error}</div>}
                {exito && <div style={{ padding: '0.7rem', marginBottom: '1rem', borderRadius: '8px', background: 'var(--color-verde-suave)', color: 'var(--color-azul-oscuro)', fontSize: '0.85rem' }}>{exito}</div>}

                {/* Resumen Financiero */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.2rem', textAlign: 'center' }}>
                    <div style={{ background: '#f8fafc', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)' }}>Costo Total</span>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--color-azul-oscuro)' }}>Bs. {costoTotal.toFixed(2)}</div>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '0.7rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '0.75rem', color: '#166534' }}>Total Pagado</span>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--color-verde)' }}>Bs. {totalPagado.toFixed(2)}</div>
                    </div>
                    <div style={{ background: saldoPendiente > 0 ? '#fef2f2' : '#f0fdf4', padding: '0.7rem', borderRadius: '8px', border: saldoPendiente > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '0.75rem', color: saldoPendiente > 0 ? '#991b1b' : '#166534' }}>Saldo Restante</span>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: saldoPendiente > 0 ? 'var(--color-rojo-texto)' : 'var(--color-verde)' }}>
                            Bs. {saldoPendiente.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Formulario de Nuevo Abono (solo si hay saldo pendiente) */}
                {saldoPendiente > 0 ? (
                    <form onSubmit={handleRegistrarAbono} style={{
                        background: '#f8fafc', padding: '1rem', borderRadius: '8px',
                        border: '1px solid var(--color-borde)', marginBottom: '1.5rem',
                        display: 'flex', flexDirection: 'column', gap: '0.8rem'
                    }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-azul-oscuro)' }}>
                            ➕ Registrar Nuevo Abono / Pago Parcial
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 120px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Monto (Bs.) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={saldoPendiente}
                                    placeholder={`Máx: ${saldoPendiente.toFixed(2)}`}
                                    value={montoAbono}
                                    onChange={(e) => setMontoAbono(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Método de Pago</label>
                                <select
                                    value={idMetodo}
                                    onChange={(e) => setIdMetodo(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}
                                >
                                    {metodos.map(m => (
                                        <option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre_metodo}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={cargando}
                            style={{
                                background: 'var(--color-azul-oscuro)', color: '#fff', border: 'none',
                                borderRadius: '6px', padding: '0.7rem', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {cargando ? 'Procesando...' : '💰 Guardar Abono'}
                        </button>
                    </form>
                ) : (
                    <div style={{ padding: '0.8rem', marginBottom: '1.2rem', background: '#f0fdf4', color: '#166534', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        🎉 ¡Este pedido se encuentra 100% saldado!
                    </div>
                )}

                {/* Historial de Pagos */}
                <div>
                    <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', color: 'var(--color-azul-oscuro)' }}>
                        📜 Historial de Transacciones Registradas ({pagos.length})
                    </h4>
                    {cargandoHistorial ? (
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>Cargando pagos...</p>
                    ) : pagos.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-texto-secundario)', padding: '1rem 0' }}>No se registran pagos para este pedido.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem' }}>Fecha</th>
                                        <th style={{ padding: '0.5rem' }}>Método</th>
                                        <th style={{ padding: '0.5rem' }}>Monto</th>
                                        <th style={{ padding: '0.5rem' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagos.map(p => (
                                        <tr key={p.id_pago} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.5rem' }}>{new Date(p.fecha_pago).toLocaleDateString('es-ES')}</td>
                                            <td style={{ padding: '0.5rem' }}>{p.metodo_pago}</td>
                                            <td style={{ padding: '0.5rem', fontWeight: 'bold', color: 'var(--color-verde)' }}>Bs. {parseFloat(p.monto_pago).toFixed(2)}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                                                    background: p.id_estado_pago === 3 ? '#dcfce7' : '#fef9c3',
                                                    color: p.id_estado_pago === 3 ? '#166534' : '#854d0e',
                                                    fontWeight: 600
                                                }}>
                                                    {p.estado_pago}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '1.2rem', textAlign: 'right' }}>
                    <button onClick={onClose} style={{
                        padding: '0.6rem 1.2rem', background: '#f1f5f9', color: 'var(--color-texto-principal)',
                        border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalPago;
