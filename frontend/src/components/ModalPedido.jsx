import ColorPickerHoneycomb, { COLORES_ALTA_COSTURA } from './ColorPickerHoneycomb';
import { filterPositiveDecimal, filterLetters, parseDecimalString, blockMathKeys } from '../utils/validators';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import '../pages/PedidoForm.css';

const ModalPedido = ({ isOpen, onClose, onSuccess, initialFecha = '', initialCliente = null }) => {
    const [clientes, setClientes] = useState([]);
    const [costureras, setCostureras] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [metodosPago, setMetodosPago] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    // --- Datos de la Cabecera ---
    const [idCliente, setIdCliente] = useState('');
    const [idCosturera, setIdCosturera] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState(initialFecha);
    const [fechaPrueba, setFechaPrueba] = useState('');
    const [costoTotal, setCostoTotal] = useState('');
    const [adelanto, setAdelanto] = useState('');
    const [idMetodoPago, setIdMetodoPago] = useState(1);

    // --- Catálogos V2 (Prendas y Colores) ---
    const [tiposPrenda, setTiposPrenda] = useState([
        { id_tipo_prenda: 1, nombre_tipo: 'Vestido de Gala / Noche' },
        { id_tipo_prenda: 2, nombre_tipo: 'Vestido de Novia' },
        { id_tipo_prenda: 3, nombre_tipo: 'Vestido de 15 Años' },
        { id_tipo_prenda: 4, nombre_tipo: 'Traje Sastre Dama' },
        { id_tipo_prenda: 5, nombre_tipo: 'Traje Sastre Caballero' },
        { id_tipo_prenda: 6, nombre_tipo: 'Corset de Alta Costura' },
        { id_tipo_prenda: 7, nombre_tipo: 'Pollera Tradicional' },
        { id_tipo_prenda: 8, nombre_tipo: 'Blusa de Seda / Fiesta' },
        { id_tipo_prenda: 9, nombre_tipo: 'Falda Plisada / Tubo' },
        { id_tipo_prenda: 10, nombre_tipo: 'Abrigo / Chaqueta de Paño' }
    ]);
    const [colores, setColores] = useState(COLORES_ALTA_COSTURA);

    // --- Prenda & Diseño (V2) ---
    const [idTipoPrenda, setIdTipoPrenda] = useState(1);
    const [tipoPrenda, setTipoPrenda] = useState('Vestido de Gala / Noche');
    const [idColor, setIdColor] = useState(1);
    const [colorPrenda, setColorPrenda] = useState('Negro Azabache');
    const [codigoHex, setCodigoHex] = useState('#111111');
    const [notasDiseno, setNotasDiseno] = useState('');

    // --- Medidas por Pedido (Excluyente: Convencional vs Personalizada) ---
    const [tipoMedida, setTipoMedida] = useState('convencional'); // 'convencional' | 'personalizada'
    const [talla, setTalla] = useState('M');
    const [busto, setBusto] = useState('');
    const [cintura, setCintura] = useState('');
    const [cadera, setCadera] = useState('');
    const [espalda, setEspalda] = useState('');
    const [hombro, setHombro] = useState('');
    const [cortas, setCortas] = useState('');

    const handleCambiarTipoMedida = (nuevoTipo) => {
        setTipoMedida(nuevoTipo);
        if (nuevoTipo === 'convencional') {
            // Limpiar medidas corporales
            setBusto('');
            setCintura('');
            setCadera('');
            setEspalda('');
            setHombro('');
            setCortas('');
            if (!talla || talla === 'A Medida') setTalla('M');
        } else {
            // Modo a la medida anatómica
            setTalla('A Medida');
        }
    };

    // --- Materiales e Insumos Múltiples ---
    const [origenMaterial, setOrigenMaterial] = useState('Taller');
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [insumoActualId, setInsumoActualId] = useState('');
    const [insumoActualCantidad, setInsumoActualCantidad] = useState('1');
    const [descMaterialCliente, setDescMaterialCliente] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFechaEntrega(initialFecha);
            if (initialCliente) setIdCliente(initialCliente);
            cargarDatos();
        }
    }, [isOpen, initialFecha, initialCliente]);

    const cargarDatos = async () => {
        try {
            const [resClientes, resUsuarios, resAlmacen, resPagos, resCatalogosPedidos] = await Promise.all([
                api.get('/clientes'),
                api.get('/usuarios/costureras'),
                api.get('/almacen'),
                api.get('/pagos/catalogos'),
                api.get('/pedidos/catalogos').catch(() => ({ data: {} }))
            ]);
            setClientes(resClientes.data || []);
            setCostureras(resUsuarios.data || []);
            setMateriales(resAlmacen.data || []);
            const metodos = (resPagos.data?.metodos || []).filter(m => m.id_metodo_pago === 1 || m.id_metodo_pago === 2);
            setMetodosPago(metodos.length > 0 ? metodos : [
                { id_metodo_pago: 1, nombre_metodo: 'Efectivo' },
                { id_metodo_pago: 2, nombre_metodo: 'QR / Transferencia' }
            ]);
            if (!idMetodoPago) setIdMetodoPago(1);
        } catch {
            setError('No se pudieron cargar los datos auxiliares.');
        }
    };

    if (!isOpen) return null;

    const hoy = new Date().toISOString().split('T')[0];
    const costo = parseDecimalString(costoTotal);
    const adelantoFloat = parseDecimalString(adelanto);
    const saldo = Math.max(0, costo - adelantoFloat);

    // Búsqueda de stock del insumo seleccionado actualmente
    const insumoSeleccionadoObj = materiales.find(m => String(m.id_material) === String(insumoActualId));
    const stockMaxInsumo = insumoSeleccionadoObj ? (parseFloat(insumoSeleccionadoObj.cantidad_actual !== undefined ? insumoSeleccionadoObj.cantidad_actual : insumoSeleccionadoObj.cantidad_stock) || 0) : 0;

    const agregarInsumo = () => {
        if (!insumoActualId) return;
        const mat = materiales.find(m => String(m.id_material) === String(insumoActualId));
        if (!mat) return;
        const cant = parseDecimalString(insumoActualCantidad) || 1;
        if (cant <= 0) {
            setError('La cantidad del insumo debe ser mayor a 0.');
            return;
        }

        // 1. Control de duplicados: No permitir agregar el mismo insumo dos veces
        const yaExiste = insumosSeleccionados.some(i => String(i.id_producto) === String(insumoActualId));
        if (yaExiste) {
            setError(`El insumo "${mat.nombre_material}" ya se encuentra agregado al pedido. Si necesita una cantidad diferente, elimínelo de la lista inferior y vuelva a agregarlo con la cantidad correcta.`);
            return;
        }

        // 2. Control de stock en tiempo real
        const stockDisponible = parseFloat(mat.cantidad_actual !== undefined ? mat.cantidad_actual : mat.cantidad_stock) || 0;
        if (origenMaterial === 'Taller' && cant > stockDisponible) {
            setError(`Stock insuficiente para "${mat.nombre_material}". Stock disponible en almacén: ${stockDisponible} ${mat.unidad_medida || 'un'}, solicitado: ${cant}`);
            return;
        }

        setError('');
        setInsumosSeleccionados([
            ...insumosSeleccionados,
            {
                id_producto: mat.id_material,
                nombre_articulo: mat.nombre_material,
                cantidad: cant,
                unidad_medida: mat.unidad_medida || 'un'
            }
        ]);
        setInsumoActualId('');
        setInsumoActualCantidad('1');
    };

    const eliminarInsumo = (index) => {
        setInsumosSeleccionados(insumosSeleccionados.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');

        // 1. Validar Cliente
        if (!idCliente) {
            setError('Debe seleccionar obligatoriamente un cliente.');
            return;
        }

        // 2. Validar Costurera obligatoria (no se permite nulo ni taller)
        if (!idCosturera) {
            setError('Debe seleccionar obligatoriamente una costurera para la confección del pedido.');
            return;
        }

        // 3. Validar Fecha de Entrega y límite para Fecha de Prueba
        if (!fechaEntrega) {
            setError('La fecha de entrega es obligatoria.');
            return;
        }
        if (fechaPrueba && fechaEntrega && new Date(fechaPrueba) > new Date(fechaEntrega)) {
            setError('La fecha de prueba no puede ser posterior a la fecha de entrega.');
            return;
        }

        // 4. Validar Costo estricto (> 0) y Adelanto
        if (!costo || costo <= 0) {
            setError('El costo total del pedido debe ser un monto numérico mayor a 0 Bs.');
            return;
        }
        if (adelantoFloat > costo) {
            setError('El adelanto inicial no puede ser superior al costo total del pedido.');
            return;
        }

        // 5. Validar Prenda
        if (!tipoPrenda || !tipoPrenda.trim()) {
            setError('Debe seleccionar el tipo de prenda a confeccionar.');
            return;
        }

        // 6. Validar insumos y stock en tiempo real
        if (insumosSeleccionados.length > 0) {
            // Unicidad
            const idsIns = insumosSeleccionados.map(i => String(i.id_producto));
            if (new Set(idsIns).size !== idsIns.length) {
                setError('No se permiten insumos duplicados en el mismo pedido.');
                return;
            }

            // Stock disponible
            if (origenMaterial === 'Taller') {
                for (const ins of insumosSeleccionados) {
                    const m = materiales.find(mat => String(mat.id_material) === String(ins.id_producto));
                    const stockDisp = parseFloat(m ? (m.cantidad_actual !== undefined ? m.cantidad_actual : m.cantidad_stock) : 0) || 0;
                    if (ins.cantidad > stockDisp) {
                        setError(`Stock insuficiente para "${ins.nombre_articulo}". Disponible: ${stockDisp} ${ins.unidad_medida}, solicitado: ${ins.cantidad}`);
                        return;
                    }
                }
            }
        }

        setCargando(true);

        try {
            const medidasPayload = (tipoMedida === 'personalizada' && (busto || cintura || cadera || espalda || hombro || cortas)) ? {
                busto: parseFloat(busto) || null,
                cintura: parseFloat(cintura) || null,
                cadera: parseFloat(cadera) || null,
                espalda: parseFloat(espalda) || null,
                hombro: parseFloat(hombro) || null,
                cortas: parseFloat(cortas) || null,
            } : null;

            const tallaFinal = tipoMedida === 'convencional' ? talla : 'A Medida';

            // Si el usuario seleccionó un insumo en los campos pero no pulsó "+ Agregar Insumo", lo incluimos automáticamente
            let insumosFinales = [...insumosSeleccionados];
            if (insumoActualId) {
                const mat = materiales.find(m => String(m.id_material) === String(insumoActualId));
                const cant = parseFloat(insumoActualCantidad) || 1;
                if (mat && cant > 0) {
                    const existeIdx = insumosFinales.findIndex(i => String(i.id_producto) === String(insumoActualId));
                    if (existeIdx >= 0) {
                        insumosFinales[existeIdx].cantidad = parseFloat((insumosFinales[existeIdx].cantidad + cant).toFixed(2));
                    } else {
                        insumosFinales.push({
                            id_producto: mat.id_material,
                            nombre_articulo: mat.nombre_material,
                            cantidad: cant,
                            unidad_medida: mat.unidad_medida || 'un'
                        });
                    }
                }
            }

            // Formar resumen de insumos para notas de diseno
            let resumenInsumos = '';
            if (origenMaterial === 'Cliente') {
                resumenInsumos = `Material provisto por cliente: ${descMaterialCliente || 'Tela entregada en recepción'}. `;
            }
            if (insumosFinales.length > 0) {
                resumenInsumos += 'Insumos del taller: ' + insumosFinales.map(i => `${i.nombre_articulo} (${i.cantidad} ${i.unidad_medida})`).join(', ');
            }

            const notasTotales = [notasDiseno.trim(), resumenInsumos].filter(Boolean).join(' | ');

            const res = await api.post('/pedidos', {
                id_cliente: Number(idCliente),
                id_costurera: idCosturera ? Number(idCosturera) : null,
                fecha_entrega: fechaEntrega,
                fecha_prueba: fechaPrueba || null,
                costo_total: costo,
                adelanto: adelantoFloat,
                id_metodo_pago: Number(idMetodoPago),
                id_tipo_prenda: idTipoPrenda ? Number(idTipoPrenda) : 1,
                tipo_prenda: tipoPrenda.trim() || 'Vestido de Gala / Noche',
                id_color: idColor ? Number(idColor) : 1,
                color: colorPrenda.trim() || 'Negro Azabache',
                notas_diseno: notasTotales,
                talla: tallaFinal,
                medidas_anatomicas: medidasPayload,
                descripcion_tela: tipoPrenda.trim(),
                origen_material: origenMaterial,
                insumos: insumosFinales
            });

            const idNuevo = res.data?.id_pedido || res.data?.pedido?.id_pedido || '';
            setExito(`[OK] Pedido #${idNuevo} registrado exitosamente. Saldo: Bs. ${saldo.toFixed(2)}`);

            setTimeout(() => {
                setIdCliente('');
                setIdCosturera('');
                setFechaEntrega('');
                setFechaPrueba('');
                setCostoTotal('');
                setAdelanto('');
                setTipoPrenda('');
                setColorPrenda('');
                setNotasDiseno('');
                setInsumosSeleccionados([]);
                setDescMaterialCliente('');
                setBusto('');
                setCintura('');
                setCadera('');
                setEspalda('');
                setHombro('');
                setCortas('');
                setExito('');
                if (onSuccess) onSuccess();
                onClose();
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrar el pedido.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '1rem'
        }}>
            <div style={{
                background: '#fff', padding: '2rem', borderRadius: '12px',
                width: '100%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <h2 style={{ color: 'var(--color-azul-oscuro)', margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>Nuevo Pedido de Confeccion</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.3rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)', fontWeight: 'bold'
                    }}>X</button>
                </header>

                {error && <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)', fontSize: '0.9rem' }}>{error}</div>}
                {exito && <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'var(--color-verde-suave)', color: 'var(--color-azul-oscuro)', fontSize: '0.9rem' }}>{exito}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* 1. Cliente y Operaria */}
                    <fieldset style={{ border: '1px solid var(--color-borde)', padding: '1.2rem', borderRadius: '8px' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>Cliente y Personal</legend>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '2 1 240px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cliente *</label>
                                <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}>
                                    <option value="">-- Seleccionar Cliente --</option>
                                    {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>Costurera Asignada *</label>
                                <select
                                    value={idCosturera}
                                    onChange={(e) => {
                                        setIdCosturera(e.target.value);
                                        setError('');
                                    }}
                                    required
                                    style={{
                                        padding: '0.65rem',
                                        borderRadius: '6px',
                                        border: '1.5px solid var(--color-borde)',
                                        background: '#fff',
                                        fontWeight: 600,
                                        color: idCosturera ? '#1e293b' : '#64748b'
                                    }}
                                >
                                    <option value="">-- Seleccionar Costurera Asignada * --</option>
                                    {costureras.map(c => (
                                        <option key={c.id_usuario} value={c.id_usuario}>
                                            👩‍🎨 {c.nombre_completo || c.nombre || c.correo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* 2. Prenda & Diseño */}
                    <fieldset style={{ border: '1px solid var(--color-borde)', padding: '1.2rem', borderRadius: '8px' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>Prenda y Detalles de Diseno</legend>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                            <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>
                                    Tipo de Prenda (Catálogo Preestablecido) *
                                </label>
                                <select
                                    value={idTipoPrenda}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setIdTipoPrenda(val);
                                        const tp = tiposPrenda.find(t => t.id_tipo_prenda === val);
                                        if (tp) setTipoPrenda(tp.nombre_tipo);
                                    }}
                                    required
                                    style={{
                                        padding: '0.65rem',
                                        borderRadius: '8px',
                                        border: '1.5px solid var(--color-borde)',
                                        background: '#ffffff',
                                        fontWeight: 600,
                                        color: '#1e293b',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {tiposPrenda.map(tp => (
                                        <option key={tp.id_tipo_prenda} value={tp.id_tipo_prenda}>
                                            👗 {tp.nombre_tipo}
                                        </option>
                                    ))}
                                </select>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    Prenda seleccionada: <strong>{tipoPrenda}</strong>
                                </span>
                            </div>

                            <div style={{ flex: '1 1 270px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <ColorPickerHoneycomb
                                    value={idColor}
                                    onChange={(col) => {
                                        setIdColor(col.id_color);
                                        setColorPrenda(col.nombre_color);
                                        setCodigoHex(col.codigo_hexadecimal);
                                    }}
                                    coloresList={colores}
                                    label="Color de Prenda (Paleta Panal de Abeja)"
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.8rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notas de Diseno y Cortes Especificos</label>
                            <textarea
                                placeholder="Ej: Escote en V, forro de satén, botones dorados en mangas, abertura lateral..."
                                value={notasDiseno}
                                onChange={(e) => setNotasDiseno(e.target.value)}
                                rows="2"
                                style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', resize: 'vertical' }}
                            />
                        </div>
                    </fieldset>

                    {/* 3. Selección Múltiple de Productos e Insumos de Almacén */}
                    <fieldset style={{ border: '1.5px solid var(--color-azul-oscuro)', padding: '1.2rem', borderRadius: '8px', background: '#fcfbf9' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 700, color: 'var(--color-azul-oscuro)' }}>
                            Seleccion de Productos e Insumos (Telas, Botones, Hilos, Cierres)
                        </legend>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.8rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                                <input type="radio" value="Taller" checked={origenMaterial === 'Taller'} onChange={(e) => setOrigenMaterial(e.target.value)} /> 
                                Suministrados por el Taller
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                                <input type="radio" value="Cliente" checked={origenMaterial === 'Cliente'} onChange={(e) => setOrigenMaterial(e.target.value)} /> 
                                Traidos por el Cliente
                            </label>
                        </div>

                        {origenMaterial === 'Cliente' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>
                                    Descripcion del material entregado por el cliente:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: 3 metros de Seda Brocada azul y 8 botones plateados traídos por la clienta"
                                    value={descMaterialCliente}
                                    onChange={(e) => setDescMaterialCliente(e.target.value)}
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', marginTop: '0.3rem', boxSizing: 'border-box' }}
                                />
                            </div>
                        )}

                        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
                                Agregar Insumos del Almacen al Pedido:
                            </label>
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <div style={{ flex: '3 1 240px' }}>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--color-texto-secundario)' }}>Producto / Insumo</label>
                                    <select 
                                        value={insumoActualId} 
                                        onChange={(e) => {
                                            setInsumoActualId(e.target.value);
                                            setError('');
                                        }}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontSize: '0.85rem' }}
                                    >
                                        <option value="">-- Seleccionar insumo del almacén --</option>
                                        {materiales.map(m => {
                                            const yaAgregado = insumosSeleccionados.some(i => String(i.id_producto) === String(m.id_material));
                                            const stockVal = parseFloat(m.cantidad_actual !== undefined ? m.cantidad_actual : m.cantidad_stock) || 0;
                                            return (
                                                <option key={m.id_material} value={m.id_material} disabled={yaAgregado}>
                                                    {m.nombre_material} [Stock: {stockVal} {m.unidad_medida || 'un'}]{yaAgregado ? ' — (Ya agregado)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {insumoSeleccionadoObj && origenMaterial === 'Taller' && (
                                        <div style={{ fontSize: '0.75rem', color: stockMaxInsumo > 0 ? '#059669' : '#dc2626', fontWeight: 600, marginTop: '0.25rem' }}>
                                            📦 Stock disponible en almacén: <strong>{stockMaxInsumo} {insumoSeleccionadoObj.unidad_medida || 'un'}</strong>
                                            {stockMaxInsumo <= 0 && <span style={{ color: '#dc2626', marginLeft: '0.4rem' }}>[AGOTADO]</span>}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: '1 1 90px' }}>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--color-texto-secundario)' }}>Cantidad</label>
                                    <input 
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="1"
                                        value={insumoActualCantidad}
                                        onKeyDown={blockMathKeys}
                                        onChange={(e) => setInsumoActualCantidad(filterPositiveDecimal(e.target.value))}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={agregarInsumo}
                                    style={{
                                        background: 'var(--color-azul-oscuro)', color: '#fff', border: 'none',
                                        borderRadius: '6px', padding: '0.65rem 1.2rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                                    }}
                                >
                                    + Agregar Insumo
                                </button>
                            </div>

                            {/* Lista de productos seleccionados */}
                            {insumosSeleccionados.length > 0 ? (
                                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-borde)', paddingTop: '0.8rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-azul-oscuro)' }}>
                                        Insumos seleccionados para esta prenda ({insumosSeleccionados.length}):
                                    </span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                                        {insumosSeleccionados.map((item, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                background: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem'
                                            }}>
                                                <span>
                                                    <strong>{item.nombre_articulo}</strong> — {item.cantidad} {item.unidad_medida}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarInsumo(idx)}
                                                    style={{
                                                        background: '#fee2e2', color: '#dc2626', border: 'none',
                                                        borderRadius: '4px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 'bold'
                                                    }}
                                                    title="Quitar insumo"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.78rem', color: 'var(--color-texto-secundario)', marginTop: '0.6rem', fontStyle: 'italic', margin: '0.6rem 0 0' }}>
                                    Puedes agregar varios productos a este pedido (por ejemplo, 2.5 metros de tela, 6 botones, 1 cierre).
                                </p>
                            )}
                        </div>
                    </fieldset>

                    {/* 4. Especificación de Medidas del Pedido (Convencionales vs Personalizadas) */}
                    <fieldset style={{ border: '1.5px solid var(--color-azul-oscuro)', padding: '1.2rem', borderRadius: '8px', background: '#ffffff' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 700, color: 'var(--color-azul-oscuro)' }}>
                            Medidas de Confección para este Pedido
                        </legend>
                        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1rem' }}>
                            Seleccione el tipo de patronaje para esta prenda (convencional o a la medida anatómica exacta):
                        </p>

                        {/* Selector Exclusivo: Tallas Convencionales vs Medidas Personalizadas */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                            <label style={{
                                flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem',
                                borderRadius: '8px', border: tipoMedida === 'convencional' ? '2px solid var(--color-azul-oscuro)' : '1px solid #CBD5E1',
                                background: tipoMedida === 'convencional' ? '#F0F9FF' : '#F8FAFC', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}>
                                <input 
                                    type="radio" 
                                    name="tipoMedida" 
                                    value="convencional" 
                                    checked={tipoMedida === 'convencional'} 
                                    onChange={() => handleCambiarTipoMedida('convencional')} 
                                />
                                <span>📏 Tallas Convencionales (XS a XXL)</span>
                            </label>

                            <label style={{
                                flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem',
                                borderRadius: '8px', border: tipoMedida === 'personalizada' ? '2px solid var(--color-azul-oscuro)' : '1px solid #CBD5E1',
                                background: tipoMedida === 'personalizada' ? '#F0F9FF' : '#F8FAFC', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}>
                                <input 
                                    type="radio" 
                                    name="tipoMedida" 
                                    value="personalizada" 
                                    checked={tipoMedida === 'personalizada'} 
                                    onChange={() => handleCambiarTipoMedida('personalizada')} 
                                />
                                <span>✂️ Medidas Personalizadas (A Medida)</span>
                            </label>
                        </div>

                        {/* Vista Tallas Convencionales */}
                        {tipoMedida === 'convencional' && (
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.6rem', color: '#1E293B' }}>
                                    Seleccionar Talla Estándar de Confección:
                                </label>
                                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTalla(t)}
                                            style={{
                                                padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem',
                                                border: talla === t ? '2px solid var(--color-azul-oscuro)' : '1px solid #CBD5E1',
                                                background: talla === t ? 'var(--color-azul-oscuro)' : '#FFFFFF',
                                                color: talla === t ? '#FFFFFF' : '#334155', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vista Medidas Personalizadas */}
                        {tipoMedida === 'personalizada' && (
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.6rem', color: '#1E293B' }}>
                                    Medidas Corporales para esta Prenda (cm):
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '0.8rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Busto</label>
                                        <input type="number" step="0.5" placeholder="cm" value={busto} onChange={(e) => setBusto(filterPositiveDecimal(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Cintura</label>
                                        <input type="number" step="0.5" placeholder="cm" value={cintura} onChange={(e) => setCintura(filterPositiveDecimal(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Cadera</label>
                                        <input type="number" step="0.5" placeholder="cm" value={cadera} onChange={(e) => setCadera(filterPositiveDecimal(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Espalda</label>
                                        <input type="number" step="0.5" placeholder="cm" value={espalda} onChange={(e) => setEspalda(filterPositiveDecimal(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Hombro</label>
                                        <input type="number" step="0.5" placeholder="cm" value={hombro} onChange={(e) => setHombro(filterPositiveDecimal(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Largo / Talle</label>
                                        <input type="number" step="0.5" placeholder="cm" value={cortas} onChange={(e) => setCortas(filterPositiveDecimal(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </fieldset>

                    {/* 5. Fechas y Cobro Financiero */}
                    <fieldset style={{ border: '1px solid var(--color-borde)', padding: '1.2rem', borderRadius: '8px' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>Fechas y Finanzas</legend>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fecha de Entrega (Límite Máximo) *</label>
                                <input
                                    type="date"
                                    value={fechaEntrega}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFechaEntrega(val);
                                        if (fechaPrueba && val && new Date(fechaPrueba) > new Date(val)) {
                                            setFechaPrueba(val);
                                        }
                                        setError('');
                                    }}
                                    min={fechaPrueba || hoy}
                                    required
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fecha de Prueba (Opcional)</label>
                                <input
                                    type="date"
                                    value={fechaPrueba}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (fechaEntrega && val && new Date(val) > new Date(fechaEntrega)) {
                                            setError('La fecha de prueba no puede ser posterior a la fecha de entrega.');
                                            return;
                                        }
                                        setError('');
                                        setFechaPrueba(val);
                                    }}
                                    min={hoy}
                                    max={fechaEntrega || undefined}
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}
                                />
                                {fechaEntrega && (
                                    <small style={{ color: '#64748b', fontSize: '0.74rem' }}>
                                        Límite: hasta {new Date(fechaEntrega + 'T00:00:00').toLocaleDateString('es-ES')}
                                    </small>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '0.8rem', marginTop: '0.8rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Costo Total (Bs.) *</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={costoTotal}
                                    onKeyDown={blockMathKeys}
                                    onChange={(e) => {
                                        setCostoTotal(filterPositiveDecimal(e.target.value));
                                        setError('');
                                    }}
                                    required
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Adelanto Inicial (Bs.)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={adelanto}
                                    onKeyDown={blockMathKeys}
                                    onChange={(e) => {
                                        setAdelanto(filterPositiveDecimal(e.target.value));
                                        setError('');
                                    }}
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Metodo de Adelanto</label>
                                <select value={idMetodoPago} onChange={(e) => setIdMetodoPago(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}>
                                    {metodosPago.map(m => <option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre_metodo}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '0.8rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', color: saldo > 0 ? 'var(--color-rojo-texto)' : 'var(--color-verde)' }}>
                            Saldo a cobrar al entregar: Bs. {saldo.toFixed(2)}
                        </div>
                    </fieldset>

                    <button type="submit" disabled={cargando} style={{
                        background: 'var(--color-azul-oscuro)', color: '#fff', padding: '0.9rem',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: cargando ? 'not-allowed' : 'pointer'
                    }}>
                        {cargando ? 'Registrando Pedido...' : 'Confirmar y Crear Pedido'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalPedido;
