import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalMovimientoKardex = ({ isOpen, onClose, onSuccess }) => {
    const [insumos, setInsumos] = useState([]);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [origenes, setOrigenes] = useState([]);
    const [proveedores, setProveedores] = useState([]);

    const [idProducto, setIdProducto] = useState('');
    const [idTipoMovimiento, setIdTipoMovimiento] = useState('');
    const [idOrigen, setIdOrigen] = useState(1); // 1: Taller, 2: Cliente
    const [idProveedor, setIdProveedor] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [observacion, setObservacion] = useState('');

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            setExito('');
            cargarCatalogos();
        }
    }, [isOpen]);

    const cargarCatalogos = async () => {
        try {
            const { data } = await api.get('/kardex/catalogos');
            setInsumos(data.insumos || []);
            setTiposMovimiento(data.tipos_movimiento || []);
            setOrigenes(data.origenes_material || []);
            setProveedores(data.proveedores || []);

            if (data.insumos?.length > 0) setIdProducto(data.insumos[0].id_producto);
            if (data.tipos_movimiento?.length > 0) setIdTipoMovimiento(data.tipos_movimiento[0].id_tipo_movimiento);
        } catch (err) {
            setError('Error al cargar catálogos de Kardex.');
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');

        const cant = parseFloat(cantidad);
        if (!cant || cant <= 0) {
            setError('Ingresa una cantidad válida mayor a 0.');
            return;
        }

        setCargando(true);
        try {
            const res = await api.post('/kardex', {
                id_producto: Number(idProducto),
                id_tipo_movimiento: Number(idTipoMovimiento),
                id_origen: Number(idOrigen),
                id_proveedor: idProveedor ? Number(idProveedor) : null,
                cantidad: cant,
                observacion: observacion.trim() || null
            });

            setExito(`✅ Movimiento registrado exitosamente. Stock resultante: ${res.data?.movimiento?.stock_resultante}`);

            setTimeout(() => {
                setCantidad('');
                setObservacion('');
                setIdProveedor('');
                setExito('');
                if (onSuccess) onSuccess();
                onClose();
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al procesar el movimiento de Kardex.');
        } finally {
            setCargando(false);
        }
    };

    const insumoSeleccionado = insumos.find(i => String(i.id_producto) === String(idProducto));

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
            <div style={{
                background: '#fff', padding: '2rem', borderRadius: '12px',
                width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <h2 style={{ color: 'var(--color-azul-oscuro)', margin: 0, fontSize: '1.3rem' }}>
                        📊 Registrar Movimiento en Kardex
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)', fontSize: '0.85rem' }}>{error}</div>}
                {exito && <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'var(--color-verde-suave)', color: 'var(--color-azul-oscuro)', fontSize: '0.85rem' }}>{exito}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* Insumo */}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                            Insumo de Almacén *
                        </label>
                        <select
                            value={idProducto}
                            onChange={(e) => setIdProducto(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}
                        >
                            {insumos.map(ins => (
                                <option key={ins.id_producto} value={ins.id_producto}>
                                    {ins.nombre_material} (Stock: {ins.cantidad_actual} {ins.unidad_medida}) - {ins.categoria}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de Movimiento y Cantidad */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.8rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                                Tipo de Movimiento *
                            </label>
                            <select
                                value={idTipoMovimiento}
                                onChange={(e) => setIdTipoMovimiento(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}
                            >
                                {tiposMovimiento.map(tm => (
                                    <option key={tm.id_tipo_movimiento} value={tm.id_tipo_movimiento}>
                                        {tm.nombre_movimiento}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                                Cantidad ({insumoSeleccionado?.unidad_medida || 'u'}) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Ej: 5.0"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* Origen del Material */}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                            Origen de la Materia Prima *
                        </label>
                        <div style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}>
                            {origenes.map(orig => (
                                <label key={orig.id_origen} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="id_origen"
                                        value={orig.id_origen}
                                        checked={Number(idOrigen) === orig.id_origen}
                                        onChange={() => setIdOrigen(orig.id_origen)}
                                    />
                                    <strong>{orig.nombre_origen}</strong>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {orig.id_origen === 1 ? '(Afecta inventario)' : '(Protege stock taller)'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Proveedor (Visible para Entrada por Compra) */}
                    {Number(idTipoMovimiento) === 1 && (
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                                Proveedor Asociado
                            </label>
                            <select
                                value={idProveedor}
                                onChange={(e) => setIdProveedor(e.target.value)}
                                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}
                            >
                                <option value="">-- Seleccionar Proveedor --</option>
                                {proveedores.map(p => (
                                    <option key={p.id_proveedor} value={p.id_proveedor}>
                                        {p.nombre_empresa}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Observación */}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                            Observaciones / Justificación
                        </label>
                        <textarea
                            rows="2"
                            placeholder="Ej: Factura Nº 1023, o corte para saco sastre..."
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        style={{
                            background: 'var(--color-azul-oscuro)', color: '#fff', border: 'none',
                            borderRadius: '8px', padding: '0.9rem', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer', fontSize: '1rem'
                        }}
                    >
                        {cargando ? 'Procesando...' : '💾 Registrar en Kardex'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalMovimientoKardex;
