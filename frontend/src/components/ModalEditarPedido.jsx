import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalEditarPedido = ({ isOpen, onClose, onSuccess, idPedido }) => {
    const [costureras, setCostureras] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    const [idCosturera, setIdCosturera] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [fechaPrueba, setFechaPrueba] = useState('');
    const [costoTotal, setCostoTotal] = useState('');
    const [adelanto, setAdelanto] = useState('');

    useEffect(() => {
        if (isOpen && idPedido) {
            cargarDatos();
        }
    }, [isOpen, idPedido]);

    const cargarDatos = async () => {
        setCargandoDatos(true);
        setError('');
        try {
            const [resUsuarios, resPedido] = await Promise.all([
                api.get('/usuarios/costureras'),
                api.get(`/pedidos/${idPedido}`)
            ]);
            setCostureras(resUsuarios.data);
            
            const p = resPedido.data;
            setIdCosturera(p.id_costurera || '');
            setFechaEntrega(p.fecha_entrega ? new Date(p.fecha_entrega).toISOString().split('T')[0] : '');
            setFechaPrueba(p.fecha_prueba ? new Date(p.fecha_prueba).toISOString().split('T')[0] : '');
            setCostoTotal(p.costo_total || '');
            setAdelanto(p.adelanto || '');
            
        } catch {
            setError('No se pudieron cargar los datos del pedido.');
        } finally {
            setCargandoDatos(false);
        }
    };

    if (!isOpen) return null;

    const costo = parseFloat(costoTotal) || 0;
    const adelantoFloat = parseFloat(adelanto) || 0;
    const saldo = Math.max(0, costo - adelantoFloat);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');
        setCargando(true);

        try {
            await api.put(`/pedidos/${idPedido}`, {
                id_costurera: Number(idCosturera) || null,
                fecha_entrega: fechaEntrega,
                fecha_prueba: fechaPrueba || null,
                costo_total: costo,
                adelanto: adelantoFloat,
            });

            setExito('✅ Pedido actualizado correctamente.');

            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar el pedido.');
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
                width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h2 style={{color: 'var(--color-azul-oscuro)', margin: 0}}>Editar Pedido #{idPedido}</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-rojo-suave)', color:'var(--color-rojo-texto)'}}>{error}</div>}
                {exito && <div style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-verde-suave)', color:'var(--color-azul-oscuro)'}}>{exito}</div>}

                {cargandoDatos ? (
                    <p style={{textAlign:'center', padding:'2rem'}}>Cargando datos...</p>
                ) : (
                    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                            <label style={{fontSize: '0.85rem', fontWeight: 600}}>Costurera Asignada</label>
                            <select value={idCosturera} onChange={(e) => setIdCosturera(e.target.value)} style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}>
                                <option value="">-- Sin Asignar --</option>
                                {costureras.map(c => <option key={c.id_usuario} value={c.id_usuario}>{c.correo}</option>)}
                            </select>
                        </div>

                        <div style={{display: 'flex', gap: '1rem'}}>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Fecha de entrega *</label>
                                <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}/>
                            </div>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Fecha de prueba</label>
                                <input type="date" value={fechaPrueba} onChange={(e) => setFechaPrueba(e.target.value)} style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}/>
                            </div>
                        </div>

                        <div style={{display: 'flex', gap: '1rem'}}>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Costo Total (Bs.) *</label>
                                <input type="number" step="0.01" min="0" value={costoTotal} onChange={(e) => setCostoTotal(e.target.value)} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}/>
                            </div>
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.85rem', fontWeight: 600}}>Adelanto (Bs.)</label>
                                <input type="number" step="0.01" min="0" value={adelanto} onChange={(e) => setAdelanto(e.target.value)} style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}/>
                            </div>
                        </div>
                        
                        <div style={{textAlign: 'right', fontWeight: 'bold', color: 'var(--color-azul-oscuro)'}}>
                            Saldo: Bs. {saldo.toFixed(2)}
                        </div>

                        <button type="submit" disabled={cargando} style={{
                            background: 'var(--color-azul-oscuro)', color: '#fff', padding: '1rem',
                            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer', marginTop: '1rem'
                        }}>
                            {cargando ? 'Guardando...' : '💾 Guardar Cambios'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ModalEditarPedido;
