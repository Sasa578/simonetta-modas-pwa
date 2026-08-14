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

    const inputStyle = {
        padding: '0.8rem 1rem', 
        borderRadius: '8px', 
        border: '1px solid #E2E8F0',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        background: '#F8FAFC'
    };

    const labelStyle = {
        fontSize: '0.85rem', 
        fontWeight: 600,
        color: '#475569',
        marginBottom: '0.2rem'
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#ffffff', padding: '2.5rem', borderRadius: '16px',
                width: '90%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{background: 'var(--color-azul-claro)', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-azul-oscuro)', fontSize: '1.2rem'}}>
                            👤
                        </div>
                        <h2 style={{color: '#0F172A', margin: 0, fontSize: '1.4rem', fontWeight: 700}}>
                            Nuevo Cliente
                        </h2>
                    </div>
                    <button onClick={onClose} style={{
                        background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                        cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}>✕</button>
                </header>

                {error && (
                    <div style={{padding:'0.8rem 1rem', marginBottom:'1.5rem', borderRadius:'8px', background:'#FEF2F2', border: '1px solid #FCA5A5', color:'#991B1B', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={labelStyle}>Nombre Completo *</label>
                        <input type="text" placeholder="Ej. Juan Pérez" value={form.nombre_completo} onChange={(e) => setForm({...form, nombre_completo: e.target.value})} style={inputStyle} required />
                    </div>

                    <div style={{display: 'flex', gap: '1rem'}}>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>CI</label>
                            <input type="text" placeholder="Ej. 1234567" value={form.carnet_identidad} onChange={(e) => setForm({...form, carnet_identidad: e.target.value})} style={inputStyle} />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>WhatsApp *</label>
                            <input type="tel" placeholder="Ej. 70000000" value={form.telefono_whatsapp} onChange={(e) => setForm({...form, telefono_whatsapp: e.target.value})} style={inputStyle} required />
                        </div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={labelStyle}>Correo Electrónico</label>
                        <input type="email" placeholder="Opcional" value={form.correo} onChange={(e) => setForm({...form, correo: e.target.value})} style={inputStyle} />
                    </div>

                    <div style={{display: 'flex', gap: '0.8rem', marginTop: '0.5rem'}}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '0.9rem', background: '#F1F5F9', color: '#475569',
                            border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando} style={{
                            flex: 2, background: 'var(--color-azul-oscuro)', color: '#ffffff', padding: '0.9rem',
                            border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s', opacity: cargando ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                        }}>
                            {cargando ? 'Guardando...' : 'Crear Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCliente;
