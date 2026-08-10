import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalUsuario = ({ isOpen, onClose, onSuccess, usuarioEdit = null, roles = [] }) => {
    const [form, setForm] = useState({ id_usuario: null, correo: '', password: '', id_rol: '' });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (usuarioEdit) {
                setForm({ id_usuario: usuarioEdit.id_usuario, correo: usuarioEdit.correo, password: '', id_rol: usuarioEdit.id_rol });
            } else {
                setForm({ id_usuario: null, correo: '', password: '', id_rol: '' });
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
                const data = { correo: form.correo, id_rol: form.id_rol, ...(form.password ? { password: form.password } : {}) };
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
                        {usuarioEdit ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-rojo-suave)', color:'var(--color-rojo-texto)'}}>{error}</div>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Correo *</label>
                        <input type="email" value={form.correo} onChange={(e) => setForm({...form, correo: e.target.value})} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Contraseña {usuarioEdit ? '(Dejar vacío para no cambiar)' : '*'}</label>
                        <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required={!usuarioEdit} style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}} />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Rol *</label>
                        <select value={form.id_rol} onChange={(e) => setForm({...form, id_rol: e.target.value})} required style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}>
                            <option value="">-- Seleccionar --</option>
                            {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                        </select>
                    </div>

                    <button type="submit" disabled={cargando} style={{
                        marginTop: '1rem', background: 'var(--color-azul-oscuro)', color: '#fff', padding: '1rem',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer'
                    }}>
                        {cargando ? 'Guardando...' : (usuarioEdit ? 'Actualizar Usuario' : 'Crear Usuario')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalUsuario;
