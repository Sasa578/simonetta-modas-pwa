import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalAlmacen = ({ isOpen, onClose, onSuccess, materialEdit = null }) => {
    const [form, setForm] = useState({ 
        nombre_material: '', 
        cantidad_actual: '', 
        stock_minimo: '', 
        unidad_medida: 'metros' 
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (materialEdit) {
                setForm(materialEdit);
            } else {
                setForm({ nombre_material: '', cantidad_actual: '', stock_minimo: '', unidad_medida: 'metros' });
            }
            setError('');
        }
    }, [isOpen, materialEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            if (materialEdit) {
                await api.put(`/almacen/${materialEdit.id_material}`, form);
            } else {
                await api.post('/almacen', form);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar el material.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#fff', padding: '2rem', borderRadius: '12px',
                width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h2 style={{color: 'var(--color-azul-oscuro)', margin: 0}}>
                        {materialEdit ? '✏️ Editar Producto' : '📦 Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-rojo-suave)', color:'var(--color-rojo-texto)'}}>{error}</div>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Nombre del Material *</label>
                        <input type="text" value={form.nombre_material} onChange={(e) => setForm({...form, nombre_material: e.target.value})} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} />
                    </div>

                    <div style={{display: 'flex', gap: '1rem'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1}}>
                            <label style={{fontSize: '0.85rem', fontWeight: 600}}>Stock Actual *</label>
                            <input type="number" step="0.01" min="0" value={form.cantidad_actual} onChange={(e) => setForm({...form, cantidad_actual: e.target.value})} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1}}>
                            <label style={{fontSize: '0.85rem', fontWeight: 600}}>Stock Mínimo *</label>
                            <input type="number" step="0.01" min="0" value={form.stock_minimo} onChange={(e) => setForm({...form, stock_minimo: e.target.value})} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} />
                        </div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Unidad de Medida</label>
                        <select value={form.unidad_medida} onChange={(e) => setForm({...form, unidad_medida: e.target.value})} style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}>
                            <option value="metros">Metros</option>
                            <option value="unidades">Unidades</option>
                            <option value="carretes">Carretes</option>
                            <option value="rollos">Rollos</option>
                        </select>
                    </div>

                    <button type="submit" disabled={cargando} style={{
                        marginTop: '1rem', background: 'var(--color-azul-oscuro)', color: '#fff', padding: '1rem',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer'
                    }}>
                        {cargando ? 'Guardando...' : (materialEdit ? 'Actualizar Producto' : 'Crear Producto')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalAlmacen;
