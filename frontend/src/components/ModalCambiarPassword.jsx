import { useState } from 'react';
import api from '../api/axios';

const ModalCambiarPassword = ({ isOpen, usuario, onSuccess, onLogout }) => {
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (nuevaPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (nuevaPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (nuevaPassword === '123456') {
            setError('Por seguridad, la nueva contraseña no puede ser la contraseña temporal por defecto.');
            return;
        }

        setCargando(true);

        try {
            await api.put('/auth/cambiar-password', {
                nueva_password: nuevaPassword
            });

            // Actualizar usuario en localStorage con debe_cambiar_password: false
            const usuarioGuardado = localStorage.getItem('usuario');
            if (usuarioGuardado) {
                const u = JSON.parse(usuarioGuardado);
                u.debe_cambiar_password = false;
                localStorage.setItem('usuario', JSON.stringify(u));
            }

            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar la contraseña.');
        } finally {
            setCargando(false);
        }
    };

    const inputStyle = {
        padding: '0.85rem 1rem',
        borderRadius: '8px',
        border: '1.5px solid #CBD5E1',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        background: '#F8FAFC',
        width: '100%',
        boxSizing: 'border-box'
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            padding: '1rem'
        }}>
            <div style={{
                background: '#ffffff', padding: '2.5rem', borderRadius: '16px',
                width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                textAlign: 'left'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                        background: '#FEF3C7', color: '#D97706', width: '44px', height: '44px',
                        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem'
                    }}>
                        🔐
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0F172A', fontWeight: 700 }}>
                            Primer Inicio de Sesión
                        </h2>
                        <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                            Cambio obligatorio de contraseña
                        </span>
                    </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', borderLeft: '4px solid #D97706' }}>
                    Hola <strong>{usuario?.nombre_completo || usuario?.correo}</strong>. Has ingresado con tu contraseña temporal. Por políticas de seguridad, debes establecer tu contraseña personal y privada antes de continuar al sistema.
                </p>

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem', marginBottom: '1.2rem', borderRadius: '8px',
                        background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
                        fontSize: '0.86rem'
                    }}>
                        [!] {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                            Nueva Contraseña *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={nuevaPassword}
                                onChange={(e) => setNuevaPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                style={inputStyle}
                                required
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    fontSize: '0.85rem', color: '#64748B', fontWeight: 600
                                }}
                            >
                                {showPassword ? 'Ocultar' : 'Ver'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                            Confirmar Nueva Contraseña *
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la nueva contraseña"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                        {onLogout && (
                            <button
                                type="button"
                                onClick={onLogout}
                                style={{
                                    flex: 1, padding: '0.85rem', background: '#F1F5F9', color: '#64748B',
                                    border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Salir
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={cargando}
                            style={{
                                flex: 2, background: 'var(--color-azul-oscuro)', color: '#ffffff',
                                padding: '0.85rem', border: 'none', borderRadius: '10px',
                                fontWeight: 700, cursor: cargando ? 'not-allowed' : 'pointer',
                                opacity: cargando ? 0.7 : 1, transition: 'background 0.2s'
                            }}
                        >
                            {cargando ? 'Actualizando...' : 'Guardar y Continuar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCambiarPassword;
