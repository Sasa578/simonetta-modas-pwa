import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalCliente = ({ isOpen, onClose, onSuccess }) => {
    const [tipoCliente, setTipoCliente] = useState(1); // 1: Persona, 2: Institucional
    const [form, setForm] = useState({
        // Persona
        nombre: '',
        apellido: '',
        carnet_identidad: '',
        telefono_whatsapp: '',
        fecha_nacimiento: '',
        // Institucional
        razon_social: '',
        nit: '',
        nombre_contacto: '',
        telefono_contacto: '',
        // Comunes y extras
        correo: '',
        numero_contrato: '',
        fecha_firma: '',
        fecha_vencimiento: '',
        atributo_preferencia: ''
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTipoCliente(1);
            setForm({
                nombre: '',
                apellido: '',
                carnet_identidad: '',
                telefono_whatsapp: '',
                fecha_nacimiento: '',
                razon_social: '',
                nit: '',
                nombre_contacto: '',
                telefono_contacto: '',
                correo: '',
                numero_contrato: '',
                fecha_firma: '',
                fecha_vencimiento: '',
                atributo_preferencia: ''
            });
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const payload = {
                id_tipo_cliente: tipoCliente,
                correo: form.correo || undefined
            };

            if (tipoCliente === 1) {
                payload.nombre = form.nombre.trim();
                payload.apellido = form.apellido.trim();
                payload.nombre_completo = `${form.nombre.trim()} ${form.apellido.trim()}`.trim();
                payload.carnet_identidad = form.carnet_identidad;
                payload.telefono_whatsapp = form.telefono_whatsapp;
                payload.fecha_nacimiento = form.fecha_nacimiento || null;
                if (form.atributo_preferencia) {
                    payload.atributos = [{ nombre: 'Preferencia de diseño', valor: form.atributo_preferencia }];
                }
            } else {
                payload.razon_social = form.razon_social;
                payload.nit = form.nit;
                payload.nombre_contacto = form.nombre_contacto;
                payload.telefono_contacto = form.telefono_contacto;
                if (form.numero_contrato) {
                    payload.contrato = {
                        numero_contrato: form.numero_contrato,
                        fecha_firma: form.fecha_firma || new Date().toISOString().split('T')[0],
                        fecha_vencimiento: form.fecha_vencimiento || null
                    };
                }
            }

            await api.post('/clientes', payload);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrar el cliente.');
        } finally {
            setCargando(false);
        }
    };

    const inputStyle = {
        padding: '0.75rem 0.9rem',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        fontSize: '0.92rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        background: '#F8FAFC'
    };

    const labelStyle = {
        fontSize: '0.82rem',
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
                background: '#ffffff', padding: '2rem', borderRadius: '16px',
                width: '90%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ background: 'var(--color-azul-claro)', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-azul-oscuro)', fontSize: '1.2rem' }}>
                            {tipoCliente === 1 ? '' : ''}
                        </div>
                        <h2 style={{ color: '#0F172A', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                            {tipoCliente === 1 ? 'Nuevo Cliente (Persona)' : 'Nuevo Cliente (Institucional)'}
                        </h2>
                    </div>
                    <button onClick={onClose} style={{
                        background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                        cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}>X</button>
                </header>

                {/* SELECTOR DE SUBTIPO: PERSONA VS INSTITUCIONAL */}
                <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '4px', marginBottom: '1.2rem' }}>
                    <button
                        type="button"
                        onClick={() => setTipoCliente(1)}
                        style={{
                            flex: 1, padding: '0.55rem', border: 'none', borderRadius: '7px',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                            background: tipoCliente === 1 ? '#ffffff' : 'transparent',
                            color: tipoCliente === 1 ? 'var(--color-azul-oscuro)' : '#64748B',
                            boxShadow: tipoCliente === 1 ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                         Persona Natural
                    </button>
                    <button
                        type="button"
                        onClick={() => setTipoCliente(2)}
                        style={{
                            flex: 1, padding: '0.55rem', border: 'none', borderRadius: '7px',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                            background: tipoCliente === 2 ? '#ffffff' : 'transparent',
                            color: tipoCliente === 2 ? 'var(--color-azul-oscuro)' : '#64748B',
                            boxShadow: tipoCliente === 2 ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                         Institucional / Empresa
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem 1rem', marginBottom: '1.2rem', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        [!] {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* CAMPOS SEGÚN TIPO */}
                    {tipoCliente === 1 ? (
                        <>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>Nombre *</label>
                                    <input type="text" placeholder="Ej. Ana" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>Apellido *</label>
                                    <input type="text" placeholder="Ej. García Rojas" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} style={inputStyle} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>CI / Cédula</label>
                                    <input type="text" placeholder="Ej. 6543210 LP" value={form.carnet_identidad} onChange={(e) => setForm({ ...form, carnet_identidad: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>WhatsApp / Celular *</label>
                                    <input type="tel" placeholder="Ej. 77712345" value={form.telefono_whatsapp} onChange={(e) => setForm({ ...form, telefono_whatsapp: e.target.value })} style={inputStyle} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>Correo Electrónico</label>
                                    <input type="email" placeholder="cliente@correo.com" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>Fecha Nacimiento</label>
                                    <input type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={labelStyle}>Preferencia / Nota de Estilo (Opcional)</label>
                                <input type="text" placeholder="Ej. Alergia al látex, prefiere lino o seda" value={form.atributo_preferencia} onChange={(e) => setForm({ ...form, atributo_preferencia: e.target.value })} style={inputStyle} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={labelStyle}>Razón Social de la Institución *</label>
                                <input type="text" placeholder="Ej. Colegio Alemán La Paz S.R.L." value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} style={inputStyle} required />
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>NIT *</label>
                                    <input type="text" placeholder="Ej. 1023948571" value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} style={inputStyle} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>N° Contrato (Opcional)</label>
                                    <input type="text" placeholder="Ej. CTR-2026-002" value={form.numero_contrato} onChange={(e) => setForm({ ...form, numero_contrato: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={labelStyle}>Persona de Contacto *</label>
                                <input type="text" placeholder="Ej. Lic. Fernando Morales" value={form.nombre_contacto} onChange={(e) => setForm({ ...form, nombre_contacto: e.target.value })} style={inputStyle} required />
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>Teléfono de Contacto *</label>
                                    <input type="tel" placeholder="Ej. 2 2789000 o 76543210" value={form.telefono_contacto} onChange={(e) => setForm({ ...form, telefono_contacto: e.target.value })} style={inputStyle} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>Correo Institucional</label>
                                    <input type="email" placeholder="contacto@empresa.com" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>Fecha Firma Contrato</label>
                                    <input type="date" value={form.fecha_firma} onChange={(e) => setForm({ ...form, fecha_firma: e.target.value })} style={inputStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={labelStyle}>Fecha Vencimiento Contrato</label>
                                    <input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} style={inputStyle} />
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.6rem' }}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '0.85rem', background: '#F1F5F9', color: '#475569',
                            border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando} style={{
                            flex: 2, background: 'var(--color-azul-oscuro)', color: '#ffffff', padding: '0.85rem',
                            border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s', opacity: cargando ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                        }}>
                            {cargando ? 'Guardando...' : (tipoCliente === 1 ? 'Registrar Persona' : 'Registrar Institución')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCliente;
