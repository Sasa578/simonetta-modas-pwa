import { useState, useEffect } from 'react';
import api from '../api/axios';
import '../pages/PedidoForm.css'; // Reutilizamos algo de estilo

const ModalPedido = ({ isOpen, onClose, onSuccess, initialFecha = '', initialCliente = null }) => {
    const [clientes, setClientes] = useState([]);
    const [costureras, setCostureras] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    // --- HU-04: Datos del pedido ---
    const [idCliente, setIdCliente] = useState('');
    const [idCosturera, setIdCosturera] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState(initialFecha);
    const [fechaPrueba, setFechaPrueba] = useState('');
    const [costoTotal, setCostoTotal] = useState('');
    const [adelanto, setAdelanto] = useState('');

    // --- HU-05: Material ---
    const [descripcionTela, setDescripcionTela] = useState('');
    const [origenMaterial, setOrigenMaterial] = useState('');
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
            const [resClientes, resUsuarios, resAlmacen] = await Promise.all([
                api.get('/clientes'),
                api.get('/usuarios/costureras'),
                api.get('/almacen')
            ]);
            setClientes(resClientes.data);
            setCostureras(resUsuarios.data);
            setMateriales(resAlmacen.data);
        } catch {
            setError('No se pudieron cargar los datos.');
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

        if (origenMaterial === 'Taller' && !idMaterial) {
            setError('Debes seleccionar el material del almacén si el origen es el Taller.');
            return;
        }

        setCargando(true);

        try {
            const { data } = await api.post('/pedidos', {
                id_cliente: Number(idCliente),
                id_costurera: Number(idCosturera) || null,
                fecha_entrega: fechaEntrega,
                fecha_prueba: fechaPrueba || null,
                costo_total: costo,
                adelanto: adelantoFloat,
                descripcion_tela: descripcionTela.trim(),
                origen_material: origenMaterial,
                id_material: idMaterial ? Number(idMaterial) : null,
                cantidad_metros: cantidadMetros || null,
            });

            setExito(`✅ Pedido #${data.pedido.id_pedido} creado. Saldo: Bs. ${data.pedido.saldo}`);

            setTimeout(() => {
                setIdCliente('');
                setIdCosturera('');
                setFechaEntrega('');
                setFechaPrueba('');
                setCostoTotal('');
                setAdelanto('');
                setDescripcionTela('');
                setOrigenMaterial('');
                setIdMaterial('');
                setCantidadMetros('');
                setExito('');
                if (onSuccess) onSuccess();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear el pedido.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, overflowY: 'auto'
        }}>
            <div style={{
                background: '#fff', padding: '2rem', borderRadius: '12px',
                width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h2 style={{color: 'var(--color-azul-oscuro)', margin: 0}}>Nuevo Pedido</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div className="pedido-error" style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-rojo-suave)', color:'var(--color-rojo-texto)'}}>{error}</div>}
                {exito && <div className="pedido-exito" style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-verde-suave)', color:'var(--color-azul-oscuro)'}}>{exito}</div>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <fieldset style={{border: '1px solid var(--color-borde)', padding: '1.5rem', borderRadius: '8px'}}>
                        <legend style={{padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)'}}>📋 Datos del Pedido</legend>
                        
                        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                            <div style={{flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Cliente *</label>
                                <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}>
                                    <option value="">-- Seleccionar --</option>
                                    {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>)}
                                </select>
                            </div>
                            
                            <div style={{flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Costurera Asignada *</label>
                                <select value={idCosturera} onChange={(e) => setIdCosturera(e.target.value)} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}>
                                    <option value="">-- Asignar Operaria --</option>
                                    {costureras.map(c => <option key={c.id_usuario} value={c.id_usuario}>{c.correo}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem'}}>
                            <div style={{flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Fecha de entrega *</label>
                                <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} min={hoy} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}/>
                            </div>
                            <div style={{flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Fecha de prueba (Opcional)</label>
                                <input type="date" value={fechaPrueba} onChange={(e) => setFechaPrueba(e.target.value)} min={hoy} style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}/>
                            </div>
                            <div style={{flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Costo (Bs.) *</label>
                                <input type="number" step="0.01" min="0" value={costoTotal} onChange={(e) => setCostoTotal(e.target.value)} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}/>
                            </div>
                            <div style={{flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Adelanto (Bs.)</label>
                                <input type="number" step="0.01" min="0" value={adelanto} onChange={(e) => setAdelanto(e.target.value)} style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}/>
                            </div>
                        </div>
                        <div style={{marginTop: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-azul-oscuro)'}}>
                            Saldo a pagar: Bs. {saldo.toFixed(2)}
                        </div>
                    </fieldset>

                    <fieldset style={{border: '1px solid var(--color-borde)', padding: '1.5rem', borderRadius: '8px'}}>
                        <legend style={{padding: '0 0.5rem', fontWeight: 600, color: 'var(--color-azul-oscuro)'}}>🧶 Material</legend>
                        
                        <div style={{marginTop: '0.5rem', marginBottom: '1rem'}}>
                            <label style={{fontSize: '0.85rem', fontWeight: 600}}>Origen del Material *</label>
                            <div style={{display: 'flex', gap: '1.5rem', marginTop: '0.5rem'}}>
                                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                    <input type="radio" value="Taller" checked={origenMaterial === 'Taller'} onChange={(e) => setOrigenMaterial(e.target.value)} required/> Taller
                                </label>
                                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                    <input type="radio" value="Cliente" checked={origenMaterial === 'Cliente'} onChange={(e) => { setOrigenMaterial(e.target.value); setIdMaterial(''); }}/> Cliente
                                </label>
                            </div>
                        </div>

                        {origenMaterial === 'Taller' && (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Seleccionar Material del Almacén *</label>
                                <select value={idMaterial} onChange={(e) => setIdMaterial(e.target.value)} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}>
                                    <option value="">-- Seleccionar --</option>
                                    {materiales.map(m => <option key={m.id_material} value={m.id_material}>{m.nombre_material} (Disp: {m.cantidad_actual} {m.unidad_medida})</option>)}
                                </select>
                            </div>
                        )}

                        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                            <div style={{flex: '2 1 200px', display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Descripción / Color *</label>
                                <input type="text" value={descripcionTela} onChange={(e) => setDescripcionTela(e.target.value)} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} placeholder="Ej: Gabardina azul"/>
                            </div>
                            <div style={{flex: '1 1 100px', display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Metros *</label>
                                <input type="number" step="0.01" min="0" value={cantidadMetros} onChange={(e) => setCantidadMetros(e.target.value)} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}/>
                            </div>
                        </div>
                    </fieldset>

                    <button type="submit" disabled={cargando} style={{
                        background: 'var(--color-azul-oscuro)', color: '#fff', padding: '1rem',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer'
                    }}>
                        {cargando ? 'Guardando...' : 'Crear Pedido'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalPedido;
