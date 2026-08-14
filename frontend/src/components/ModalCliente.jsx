import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalCliente = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({ nombre_completo: '', telefono_whatsapp: '', carnet_identidad: '', correo: '' });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({ nombre_completo: '', telefono_whatsapp: '', carnet_identidad: '', correo: '' });
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            await api.post('/clientes', form);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear el cliente.');
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
                    <h2 style={{color: 'var(--color-azul-oscuro)', margin: 0}}>👤 Nuevo Cliente</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-rojo-suave)', color:'var(--color-rojo-texto)'}}>{error}</div>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Nombre Completo *</label>
                        <input type="text" value={form.nombre_completo} onChange={(e) => setForm({...form, nombre_completo: e.target.value})} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Carnet de Identidad</label>
                        <input type="text" value={form.carnet_identidad} onChange={(e) => setForm({...form, carnet_identidad: e.target.value})} style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>WhatsApp *</label>
                        <input type="tel" value={form.telefono_whatsapp} onChange={(e) => setForm({...form, telefono_whatsapp: e.target.value})} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Correo</label>
                        <input type="email" value={form.correo} onChange={(e) => setForm({...form, correo: e.target.value})} style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} />
                    </div>

                    <button type="submit" disabled={cargando} style={{
                        marginTop: '1rem', background: 'var(--color-azul-oscuro)', color: '#fff', padding: '1rem',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer'
                    }}>
                        {cargando ? 'Guardando...' : 'Crear Cliente'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalCliente;
