import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalUsuario = ({ isOpen, onClose, onSuccess, usuarioEdit = null, roles = [] }) => {
    const [form, setForm] = useState({ id_usuario: null, correo: '', password: '', id_rol: '', nombre_completo: '', carnet_identidad: '', telefono: '' });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (usuarioEdit) {
                setForm({ 
                    id_usuario: usuarioEdit.id_usuario, 
                    correo: usuarioEdit.correo, 
                    password: '', 
                    id_rol: usuarioEdit.id_rol,
                    nombre_completo: usuarioEdit.nombre_completo || '',
                    carnet_identidad: usuarioEdit.carnet_identidad || '',
                    telefono: usuarioEdit.telefono || ''
                });
            } else {
                setForm({ id_usuario: null, correo: '', password: '', id_rol: '', nombre_completo: '', carnet_identidad: '', telefono: '' });
            }
            setError('');
        }
    }, [isOpen, usuarioEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            if (usuarioEdit) {
                const data = { 
                    correo: form.correo, 
                    id_rol: form.id_rol, 
                    nombre_completo: form.nombre_completo,
                    carnet_identidad: form.carnet_identidad,
                    telefono: form.telefono,
                    ...(form.password ? { password: form.password } : {}) 
                };
                await api.put(`/usuarios/${usuarioEdit.id_usuario}`, data);
            } else {
                await api.post('/usuarios', form);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar usuario.');
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
                width: '90%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{background: 'var(--color-azul-claro)', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-azul-oscuro)', fontSize: '1.2rem'}}>
                            {usuarioEdit ? '✏️' : '👤'}
                        </div>
                        <h2 style={{color: '#0F172A', margin: 0, fontSize: '1.4rem', fontWeight: 700}}>
                            {usuarioEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                        <input type="text" placeholder="Ej. Ana Pérez" value={form.nombre_completo} onChange={(e) => setForm({...form, nombre_completo: e.target.value})} style={inputStyle} required />
                    </div>

                    <div style={{display: 'flex', gap: '1rem'}}>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>CI</label>
                            <input type="text" placeholder="Ej. 1234567" value={form.carnet_identidad} onChange={(e) => setForm({...form, carnet_identidad: e.target.value})} style={inputStyle} />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>Teléfono *</label>
                            <input type="tel" placeholder="Ej. 70000000" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} style={inputStyle} required />
                        </div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={labelStyle}>Correo Electrónico *</label>
                        <input type="email" placeholder="ejemplo@correo.com" value={form.correo} onChange={(e) => setForm({...form, correo: e.target.value})} style={inputStyle} required />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={labelStyle}>Contraseña {usuarioEdit && <span style={{fontWeight: 400, color: '#94A3B8'}}>(Dejar vacío para no cambiar)</span>}</label>
                        <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} style={inputStyle} required={!usuarioEdit} />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={labelStyle}>Rol del Usuario *</label>
                        <select value={form.id_rol} onChange={(e) => setForm({...form, id_rol: e.target.value})} required style={{...inputStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em'}}>
                            <option value="">Selecciona un rol...</option>
                            {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                        </select>
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
                            {cargando ? 'Guardando...' : (usuarioEdit ? 'Guardar Cambios' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalUsuario;
