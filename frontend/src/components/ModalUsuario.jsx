import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalUsuario = ({ isOpen, onClose, onSuccess, usuarioEdit = null, roles = [] }) => {
    const [form, setForm] = useState({
        id_usuario: null,
        correo: '',
        password: '',
        id_rol: '',
        nombre: '',
        apellido: '',
        carnet_identidad: '',
        fecha_nacimiento: '',
        telefono: ''
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // Filtrar estrictamente para no permitir rol Cliente en el personal
    const rolesDisponibles = roles.filter(r => r.nombre_rol?.toLowerCase() !== 'cliente');

    useEffect(() => {
        if (isOpen) {
            if (usuarioEdit) {
                let nom = usuarioEdit.nombre || '';
                let ape = usuarioEdit.apellido || '';
                if (!nom && usuarioEdit.nombre_completo) {
                    const parts = usuarioEdit.nombre_completo.trim().split(' ');
                    nom = parts[0] || '';
                    ape = parts.slice(1).join(' ') || '';
                }

                setForm({ 
                    id_usuario: usuarioEdit.id_usuario, 
                    correo: usuarioEdit.correo || usuarioEdit.correo_electronico || '', 
                    password: '', 
                    id_rol: usuarioEdit.id_rol || '',
                    nombre: nom,
                    apellido: ape,
                    carnet_identidad: usuarioEdit.carnet_identidad || '',
                    fecha_nacimiento: usuarioEdit.fecha_nacimiento ? usuarioEdit.fecha_nacimiento.split('T')[0] : '',
                    telefono: usuarioEdit.telefono || ''
                });
            } else {
                setForm({
                    id_usuario: null,
                    correo: '',
                    password: '',
                    id_rol: '',
                    nombre: '',
                    apellido: '',
                    carnet_identidad: '',
                    fecha_nacimiento: '',
                    telefono: ''
                });
            }
            setError('');
        }
    }, [isOpen, usuarioEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.nombre.trim() || !form.apellido.trim()) {
            setError('El nombre y el apellido del usuario son obligatorios.');
            return;
        }

        if (!form.id_rol) {
            setError('Debes seleccionar un rol para el usuario.');
            return;
        }

        setCargando(true);

        try {
            const payload = { 
                correo: form.correo.trim(), 
                id_rol: Number(form.id_rol), 
                nombre: form.nombre.trim(),
                apellido: form.apellido.trim(),
                nombre_completo: `${form.nombre.trim()} ${form.apellido.trim()}`.trim(),
                carnet_identidad: form.carnet_identidad?.trim() || null,
                fecha_nacimiento: form.fecha_nacimiento || null,
                telefono: form.telefono?.trim() || null
            };

            if (usuarioEdit) {
                if (form.password && form.password.trim()) {
                    payload.password = form.password.trim();
                }
                await api.put(`/usuarios/${usuarioEdit.id_usuario}`, payload);
            } else {
                payload.password = form.password && form.password.trim() ? form.password.trim() : '123456';
                await api.post('/usuarios', payload);
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
        fontSize: '0.92rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        background: '#F8FAFC'
    };

    const labelStyle = {
        fontSize: '0.85rem', 
        fontWeight: 600,
        color: '#475569',
        marginBottom: '0.25rem'
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#ffffff', padding: '2.2rem', borderRadius: '16px',
                width: '90%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                maxHeight: '92vh', overflowY: 'auto'
            }}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{background: 'var(--color-azul-claro)', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-azul-oscuro)', fontSize: '1.2rem'}}>
                            {usuarioEdit ? '✏️' : '👤'}
                        </div>
                        <h2 style={{color: '#0F172A', margin: 0, fontSize: '1.3rem', fontWeight: 700}}>
                            {usuarioEdit ? 'Editar Usuario del Personal' : 'Nuevo Usuario del Personal'}
                        </h2>
                    </div>
                    <button onClick={onClose} style={{
                        background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                        cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}>X</button>
                </header>

                {error && (
                    <div style={{padding:'0.8rem 1rem', marginBottom:'1.2rem', borderRadius:'8px', background:'#FEF2F2', border: '1px solid #FCA5A5', color:'#991B1B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        [!] {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    
                    {/* NOMBRE Y APELLIDO SEPARADOS */}
                    <div style={{display: 'flex', gap: '0.8rem'}}>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>Nombre *</label>
                            <input type="text" placeholder="Ej. Patricia" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} style={inputStyle} required />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>Apellido *</label>
                            <input type="text" placeholder="Ej. Gómez Rojas" value={form.apellido} onChange={(e) => setForm({...form, apellido: e.target.value})} style={inputStyle} required />
                        </div>
                    </div>

                    {/* CI Y TELÉFONO */}
                    <div style={{display: 'flex', gap: '0.8rem'}}>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>CI / Cédula</label>
                            <input type="text" placeholder="Ej. 6543210 LP" value={form.carnet_identidad} onChange={(e) => setForm({...form, carnet_identidad: e.target.value})} style={inputStyle} />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>Teléfono *</label>
                            <input type="tel" placeholder="Ej. 70022334" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} style={inputStyle} required />
                        </div>
                    </div>

                    {/* FECHA DE NACIMIENTO Y CORREO */}
                    <div style={{display: 'flex', gap: '0.8rem'}}>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>Fecha Nacimiento</label>
                            <input type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({...form, fecha_nacimiento: e.target.value})} style={inputStyle} />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                            <label style={labelStyle}>Correo Electrónico *</label>
                            <input type="email" placeholder="usuario@simonetta.com" value={form.correo} onChange={(e) => setForm({...form, correo: e.target.value})} style={inputStyle} required />
                        </div>
                    </div>

                    {/* ROL EXCLUYENDO CLIENTE */}
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={labelStyle}>Rol del Personal *</label>
                        <select 
                            value={form.id_rol} 
                            onChange={(e) => setForm({...form, id_rol: e.target.value})} 
                            required 
                            style={{
                                ...inputStyle, 
                                appearance: 'none', 
                                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', 
                                backgroundRepeat: 'no-repeat', 
                                backgroundPosition: 'right 1rem center', 
                                backgroundSize: '1em'
                            }}
                        >
                            <option value="">Selecciona un rol operativo...</option>
                            {rolesDisponibles.map(r => (
                                <option key={r.id_rol} value={r.id_rol}>
                                    {r.nombre_rol}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* CONTRASEÑA */}
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={labelStyle}>
                            Contraseña {usuarioEdit ? <span style={{fontWeight: 400, color: '#94A3B8'}}>(Dejar vacío para no modificar)</span> : <span style={{fontWeight: 400, color: '#64748B'}}>(Opcional)</span>}
                        </label>
                        <input 
                            type="password" 
                            placeholder={usuarioEdit ? '••••••••' : 'Por defecto: 123456'} 
                            value={form.password} 
                            onChange={(e) => setForm({...form, password: e.target.value})} 
                            style={inputStyle} 
                        />
                        {!usuarioEdit && (
                            <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                                ℹ️ Si se deja vacía, se asignará la contraseña por defecto <strong>123456</strong>. El usuario deberá cambiarla obligatoriamente en su primer inicio de sesión.
                            </span>
                        )}
                    </div>

                    <div style={{display: 'flex', gap: '0.8rem', marginTop: '0.5rem'}}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '0.85rem', background: '#F1F5F9', color: '#475569',
                            border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando} style={{
                            flex: 2, background: 'var(--color-azul-oscuro)', color: '#ffffff', padding: '0.85rem',
                            border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer',
                            opacity: cargando ? 0.7 : 1
                        }}>
                            {cargando ? 'Guardando...' : (usuarioEdit ? 'Actualizar Usuario' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalUsuario;
