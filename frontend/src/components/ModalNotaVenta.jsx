import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalNotaVenta = ({ isOpen, onClose, idPedido }) => {
    const [nota, setNota] = useState(null);
    const [descuentos, setDescuentos] = useState([]);
    const [idDescuentoSeleccionado, setIdDescuentoSeleccionado] = useState('');
    const [cargando, setCargando] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && idPedido) {
            setError('');
            cargarNota();
        }
    }, [isOpen, idPedido]);

    const cargarNota = async () => {
        setCargando(true);
        try {
            // 1. Intentar consultar si ya existe una nota emitida para este pedido
            try {
                const resExistente = await api.get(`/notas-venta/pedido/${idPedido}`);
                if (resExistente.data) {
                    setNota(resExistente.data);
                    setCargando(false);
                    return;
                }
            } catch (e) {
                // Si retorna 404, significa que aún no ha sido emitida
                setNota(null);
            }

            // 2. Cargar descuentos para permitir emisión inicial
            const resDesc = await api.get('/notas-venta/descuentos');
            setDescuentos(resDesc.data || []);
        } catch (err) {
            console.error('Error al cargar datos de nota:', err);
            setError('Error al consultar el estado de la nota de venta.');
        } finally {
            setCargando(false);
        }
    };

    const handleEmitirNota = async () => {
        setError('');
        setGenerando(true);
        try {
            const { data } = await api.post('/notas-venta', {
                id_pedido: Number(idPedido),
                id_descuento: idDescuentoSeleccionado ? Number(idDescuentoSeleccionado) : null
            });
            setNota(data.nota);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al emitir la nota de venta.');
        } finally {
            setGenerando(false);
        }
    };

    const [descargandoPdf, setDescargandoPdf] = useState(false);

    const handleImprimir = () => {
        window.print();
    };

    const handleDescargarPdf = async () => {
        try {
            setDescargandoPdf(true);
            const resp = await api.get(`/reportes/pedido/${idPedido}/pdf`, { responseType: 'blob' });
            const blob = new Blob([resp.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Nota_Venta_Pedido_${idPedido}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Error al descargar el archivo PDF.');
        } finally {
            setDescargandoPdf(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
            <div style={{
                background: '#fff', padding: '2.5rem', borderRadius: '12px',
                width: '100%', maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 15px 35px rgba(0,0,0,0.25)', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1.2rem',
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}
                >
                    X
                </button>

                {error && <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)', fontSize: '0.85rem' }}>{error}</div>}

                {cargando ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Consultando Nota de Venta...</p>
                ) : nota ? (
                    /* COMPROBANTE DE VENTA INMUTABLE */
                    <div id="comprobante-imprimible">
                        {/* Cabecera Comercial */}
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '2rem' }}></div>
                            <h2 style={{ margin: '0.3rem 0 0', letterSpacing: '2px', color: 'var(--color-azul-oscuro)', fontSize: '1.4rem' }}>
                                SIMONETTA MODAS
                            </h2>
                            <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>
                                Alta Costura y Confecciones Personalizadas
                            </p>
                            <div style={{ marginTop: '0.8rem', display: 'inline-block', background: '#f1f5f9', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.95rem' }}>
                                NOTA DE VENTA: {nota.numero_nota}
                            </div>
                        </div>

                        {/* Metadatos Cliente y Fechas */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                            <div>
                                <strong style={{ color: 'var(--color-texto-secundario)' }}>CLIENTE:</strong>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{nota.cliente}</div>
                                {nota.nit && <div><strong>NIT:</strong> {nota.nit}</div>}
                                {nota.cliente_telefono && <div><strong>Tel:</strong> {nota.cliente_telefono}</div>}
                                {nota.tipo_cliente && <div><span style={{ fontSize: '0.75rem', background: '#e0e7ff', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#3730a3' }}>{nota.tipo_cliente}</span></div>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <strong style={{ color: 'var(--color-texto-secundario)' }}>EMISIÓN:</strong>
                                <div>{new Date(nota.fecha_emision).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                <div style={{ marginTop: '0.4rem' }}><strong>Pedido:</strong> #{nota.id_pedido}</div>
                                <div><strong>Estado:</strong> <span style={{ color: 'var(--color-verde)', fontWeight: 600 }}>{nota.estado_pedido}</span></div>
                            </div>
                        </div>

                        {/* Detalle de Prendas */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                                    <th style={{ padding: '0.6rem' }}>Descripción / Prenda</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Cant.</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.6rem' }}>
                                        <strong>{nota.tipo_prenda || 'Prenda a Medida'}</strong>
                                        {nota.color && <span style={{ color: 'var(--color-texto-secundario)' }}> - Color: {nota.color}</span>}
                                        {nota.notas_diseno && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{nota.notas_diseno}</div>}
                                    </td>
                                    <td style={{ padding: '0.6rem', textAlign: 'center' }}>{nota.cantidad || 1}</td>
                                    <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 600 }}>Bs. {parseFloat(nota.subtotal).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Liquidación Financiera Inmutable */}
                        <div style={{ marginLeft: 'auto', width: '260px', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-borde)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <span style={{ color: 'var(--color-texto-secundario)' }}>Subtotal:</span>
                                <span>Bs. {parseFloat(nota.subtotal).toFixed(2)}</span>
                            </div>
                            {parseFloat(nota.porcentaje_descuento || 0) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#b91c1c' }}>
                                    <span>Descuento ({parseFloat(nota.porcentaje_descuento)}%):</span>
                                    <span>- Bs. {(parseFloat(nota.subtotal) - parseFloat(nota.total_final)).toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-azul-oscuro)' }}>
                                <span>TOTAL FINAL:</span>
                                <span>Bs. {parseFloat(nota.total_final).toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                             Este comprobante es un registro inmutable emitido de acuerdo a las políticas de taller de Simonetta Modas.
                        </div>

                        {/* Botones de Acción */}
                        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                                onClick={handleDescargarPdf}
                                disabled={descargandoPdf}
                                style={{
                                    padding: '0.6rem 1.2rem', background: 'var(--color-azul-oscuro)', color: '#fff',
                                    border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                                }}
                            >
                                {descargandoPdf ? '⏳ Generando PDF...' : '📄 Descargar PDF Oficial'}
                            </button>
                            <button
                                onClick={handleImprimir}
                                style={{
                                    padding: '0.6rem 1.2rem', background: '#f1f5f9', color: 'var(--color-texto-principal)',
                                    border: '1px solid var(--color-borde)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                 Imprimir
                            </button>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '0.6rem 1.2rem', background: '#e2e8f0', color: '#334155',
                                    border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    /* FORMULARIO PARA EMITIR NOTA DE VENTA */
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.4rem', color: 'var(--color-azul-oscuro)' }}> Emitir Nota de Venta Inmutable</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>
                                Genera la fotografía comercial final para el Pedido #{idPedido}. Una vez emitida, sus montos quedarán congelados para auditoría.
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                Aplicar Descuento Comercial (Opcional):
                            </label>
                            <select
                                value={idDescuentoSeleccionado}
                                onChange={(e) => setIdDescuentoSeleccionado(e.target.value)}
                                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontSize: '0.9rem' }}
                            >
                                <option value="">-- Sin descuento / Precio de lista estándar --</option>
                                {descuentos.map(d => (
                                    <option key={d.id_descuento} value={d.id_descuento}>
                                        {d.nombre_descuento} ({d.porcentaje}%) {d.tipo_cliente ? `- ${d.tipo_cliente}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '0.7rem 1.2rem', background: '#f1f5f9', color: 'var(--color-texto-principal)',
                                    border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEmitirNota}
                                disabled={generando}
                                style={{
                                    padding: '0.7rem 1.5rem', background: 'var(--color-azul-oscuro)', color: '#fff',
                                    border: 'none', borderRadius: '6px', fontWeight: 600, cursor: generando ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {generando ? 'Emitiendo...' : ' Emitir Comprobante Oficial'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalNotaVenta;
