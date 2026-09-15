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
    const [idMetodoPago, setIdMetodoPago] = useState(1); // 1: Efectivo, 2: QR, 3: Tarjeta

    // --- Prenda & Confección ---
    const [tipoPrenda, setTipoPrenda] = useState('');
    const [colorPrenda, setColorPrenda] = useState('');
    const [notasDiseno, setNotasDiseno] = useState('');

    // --- Medidas (Opcionales / Colapsables) ---
    const [mostrarMedidas, setMostrarMedidas] = useState(false);
    const [talla, setTalla] = useState('M');
    const [busto, setBusto] = useState('');
    const [cintura, setCintura] = useState('');
    const [cadera, setCadera] = useState('');
    const [espalda, setEspalda] = useState('');
    const [hombro, setHombro] = useState('');
    const [cortas, setCortas] = useState('');

    // --- Material ---
    const [origenMaterial, setOrigenMaterial] = useState('Taller');
    const [idMaterial, setIdMaterial] = useState('');
    const [cantidadMetros, setCantidadMetros] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFechaEntrega(initialFecha);
            if (initialCliente) setIdCliente(initialCliente);
            cargarDatos();
        }
    }, [isOpen, initialFecha, initialCliente]);

    const cargarDatos = async () => {
        try {
            const [resClientes, resUsuarios, resAlmacen, resPagos] = await Promise.all([
                api.get('/clientes'),
                api.get('/usuarios/costureras'),
                api.get('/almacen'),
                api.get('/pagos/catalogos')
            ]);
            setClientes(resClientes.data || []);
            setCostureras(resUsuarios.data || []);
            setMateriales(resAlmacen.data || []);
            setMetodosPago(resPagos.data?.metodos || []);
        } catch {
            setError('No se pudieron cargar los datos auxiliares.');
        }
    };

    if (!isOpen) return null;

    const hoy = new Date().toISOString().split('T')[0];
    const costo = parseFloat(costoTotal) || 0;
    const adelantoFloat = parseFloat(adelanto) || 0;
    const saldo = Math.max(0, costo - adelantoFloat);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');

        if (!tipoPrenda.trim()) {
            setError('Especifica el tipo de prenda a confeccionar.');
            return;
        }

        if (origenMaterial === 'Taller' && !idMaterial && materiales.length > 0) {
            // Si el taller tiene insumos y se seleccionó Taller, sugerir seleccionar material
        }

        setCargando(true);

        try {
            const medidasPayload = (busto || cintura || cadera || espalda || hombro || cortas) ? {
                busto: parseFloat(busto) || null,
                cintura: parseFloat(cintura) || null,
                cadera: parseFloat(cadera) || null,
                espalda: parseFloat(espalda) || null,
                hombro: parseFloat(hombro) || null,
                cortas: parseFloat(cortas) || null,
            } : null;

            const res = await api.post('/pedidos', {
                id_cliente: Number(idCliente),
                id_costurera: idCosturera ? Number(idCosturera) : null,
                fecha_entrega: fechaEntrega,
                fecha_prueba: fechaPrueba || null,
                costo_total: costo,
                adelanto: adelantoFloat,
                id_metodo_pago: Number(idMetodoPago),
                // Prenda y diseño
                tipo_prenda: tipoPrenda.trim(),
                color: colorPrenda.trim() || 'A elección',
                notas_diseno: notasDiseno.trim(),
                talla: talla,
                medidas_anatomicas: medidasPayload,
                // Material
                descripcion_tela: tipoPrenda.trim(),
                origen_material: origenMaterial,
                id_material: idMaterial ? Number(idMaterial) : null,
                cantidad_metros: cantidadMetros || null,
            });

            const idNuevo = res.data?.id_pedido || res.data?.pedido?.id_pedido || '';
            setExito(`✅ Pedido #${idNuevo} registrado exitosamente. Saldo: Bs. ${saldo.toFixed(2)}`);

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
                width: '100%', maxWidth: '650px', maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <h2 style={{ color: 'var(--color-azul-oscuro)', margin: 0, fontSize: '1.4rem' }}>👗 Nuevo Pedido de Confección</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)', fontSize: '0.9rem' }}>{error}</div>}
                {exito && <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'var(--color-verde-suave)', color: 'var(--color-azul-oscuro)', fontSize: '0.9rem' }}>{exito}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* 1. Cliente y Operaria */}
                    <fieldset style={{ border: '1px solid var(--color-borde)', padding: '1.2rem', borderRadius: '8px' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>👤 Cliente y Personal</legend>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '2 1 240px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cliente *</label>
                                <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}>
                                    <option value="">-- Seleccionar Cliente --</option>
                                    {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Operaria Asignada</label>
                                <select value={idCosturera} onChange={(e) => setIdCosturera(e.target.value)} style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}>
                                    <option value="">-- Por asignar / Taller --</option>
                                    {costureras.map(c => <option key={c.id_usuario} value={c.id_usuario}>{c.correo}</option>)}
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* 2. Prenda & Diseño */}
                    <fieldset style={{ border: '1px solid var(--color-borde)', padding: '1.2rem', borderRadius: '8px' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>✨ Prenda y Detalles de Diseño</legend>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '2 1 220px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tipo de Prenda *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Vestido de Gala, Traje Sastre, Blusa de Seda"
                                    value={tipoPrenda}
                                    onChange={(e) => setTipoPrenda(e.target.value)}
                                    required
                                    style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}
                                />
                            </div>
                            <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Color de Prenda</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Rojo Borgoña, Negro, Marfil"
                                    value={colorPrenda}
                                    onChange={(e) => setColorPrenda(e.target.value)}
                                    style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.8rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notas de Diseño y Cortes Específicos</label>
                            <textarea
                                placeholder="Ej: Escote en V, forro de satén, abertura lateral, cierre invisible posterior..."
                                value={notasDiseno}
                                onChange={(e) => setNotasDiseno(e.target.value)}
                                rows="2"
                                style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', resize: 'vertical' }}
                            />
                        </div>
                    </fieldset>

                    {/* 3. Medidas & Talla (Sección Desplegable) */}
                    <fieldset style={{ border: '1px solid var(--color-borde)', padding: '1.2rem', borderRadius: '8px' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)', cursor: 'pointer' }} onClick={() => setMostrarMedidas(!mostrarMedidas)}>
                            📏 Medidas y Talla {mostrarMedidas ? '▲ (Ocultar)' : '▼ (Hacer clic para ingresar medidas)'}
                        </legend>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: mostrarMedidas ? '0.8rem' : '0' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Talla Estándar:</label>
                            <select value={talla} onChange={(e) => setTalla(e.target.value)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}>
                                <option value="XS">XS (Extra Pequeño)</option>
                                <option value="S">S (Pequeño)</option>
                                <option value="M">M (Mediano)</option>
                                <option value="L">L (Grande)</option>
                                <option value="XL">XL (Extra Grande)</option>
                                <option value="XXL">XXL</option>
                                <option value="A Medida">A Medida (Personalizado)</option>
                            </select>
                        </div>

                        {mostrarMedidas && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.6rem', marginTop: '0.6rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Busto (cm)</label>
                                    <input type="number" step="0.5" value={busto} onChange={(e) => setBusto(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cintura (cm)</label>
                                    <input type="number" step="0.5" value={cintura} onChange={(e) => setCintura(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cadera (cm)</label>
                                    <input type="number" step="0.5" value={cadera} onChange={(e) => setCadera(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Espalda (cm)</label>
                                    <input type="number" step="0.5" value={espalda} onChange={(e) => setEspalda(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Hombro (cm)</label>
                                    <input type="number" step="0.5" value={hombro} onChange={(e) => setHombro(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Largo (cm)</label>
                                    <input type="number" step="0.5" value={cortas} onChange={(e) => setCortas(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                        )}
                    </fieldset>

                    {/* 4. Fechas y Cobro Financiero */}
                    <fieldset style={{ border: '1px solid var(--color-borde)', padding: '1.2rem', borderRadius: '8px' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>📅 Fechas y Finanzas</legend>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fecha de Entrega *</label>
                                <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} min={hoy} required style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fecha de Prueba</label>
                                <input type="date" value={fechaPrueba} onChange={(e) => setFechaPrueba(e.target.value)} min={hoy} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '0.8rem', marginTop: '0.8rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Costo Total (Bs.) *</label>
                                <input type="number" step="0.01" min="0" value={costoTotal} onChange={(e) => setCostoTotal(e.target.value)} required style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Adelanto (Bs.)</label>
                                <input type="number" step="0.01" min="0" value={adelanto} onChange={(e) => setAdelanto(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Método de Adelanto</label>
                                <select value={idMetodoPago} onChange={(e) => setIdMetodoPago(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}>
                                    {metodosPago.map(m => <option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre_metodo}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '0.8rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', color: saldo > 0 ? 'var(--color-rojo-texto)' : 'var(--color-verde)' }}>
                            Saldo a cobrar al entregar: Bs. {saldo.toFixed(2)}
                        </div>
                    </fieldset>

                    {/* 5. Insumos y Origen de Material */}
                    <fieldset style={{ border: '1px solid var(--color-borde)', padding: '1.2rem', borderRadius: '8px' }}>
                        <legend style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)' }}>🧵 Origen de la Materia Prima</legend>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.6rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="radio" value="Taller" checked={origenMaterial === 'Taller'} onChange={(e) => setOrigenMaterial(e.target.value)} /> Suministrada por el Taller
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="radio" value="Cliente" checked={origenMaterial === 'Cliente'} onChange={(e) => { setOrigenMaterial(e.target.value); setIdMaterial(''); }} /> Traída por el Cliente
                            </label>
                        </div>
                        {origenMaterial === 'Taller' && (
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: '2 1 200px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Seleccionar Tela del Almacén</label>
                                    <select value={idMaterial} onChange={(e) => setIdMaterial(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)' }}>
                                        <option value="">-- Ninguna / A descontar manualmente --</option>
                                        {materiales.map(m => <option key={m.id_material} value={m.id_material}>{m.nombre_material} (Stock: {m.cantidad_actual} {m.unidad_medida})</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: '1 1 100px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Metros a Utilizar</label>
                                    <input type="number" step="0.1" min="0" placeholder="Ej: 2.5" value={cantidadMetros} onChange={(e) => setCantidadMetros(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                        )}
                    </fieldset>

                    <button type="submit" disabled={cargando} style={{
                        background: 'var(--color-azul-oscuro)', color: '#fff', padding: '0.9rem',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: cargando ? 'not-allowed' : 'pointer'
                    }}>
                        {cargando ? 'Registrando Pedido...' : '💾 Confirmar y Crear Pedido'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalPedido;
