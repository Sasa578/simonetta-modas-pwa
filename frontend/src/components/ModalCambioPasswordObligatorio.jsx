import { useState } from 'react';
import api from '../api/axios';

const ModalCambioPasswordObligatorio = ({ isOpen, onSuccess }) => {
    const [passwordActual, setPasswordActual] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!passwordActual) {
            setError('Debe ingresar la contraseña genérica asignada.');
            return;
        }

        if (nuevaPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (nuevaPassword !== confirmarPassword) {
            setError('La nueva contraseña y su confirmación no coinciden.');
            return;
        }

        setCargando(true);

        try {
            await api.put('/auth/cambiar-password-inicial', {
                passwordActual: passwordActual.trim(),
                nuevaPassword: nuevaPassword.trim(),
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar la contraseña.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(26, 26, 46, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
        }}>
            <div style={{
                background: '#fff', padding: '2.5rem', borderRadius: '16px',
                width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: '2px solid var(--color-azul-oscuro)'
            }}>
                <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔑</div>
                    <h2 style={{ color: 'var(--color-azul-oscuro)', margin: 0, fontSize: '1.4rem' }}>
                        Cambio Obligatorio de Contraseña
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)', marginTop: '0.5rem' }}>
                        Por motivos de seguridad, debe cambiar la contraseña genérica inicial asignada antes de continuar.
                    </p>
                </header>

                {error && (
                    <div style={{
                        padding: '0.8rem 1rem', marginBottom: '1.2rem', borderRadius: '8px',
                        background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)',
                        fontSize: '0.85rem', fontWeight: 600
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contraseña Genérica Actual *</label>
                        <input
                            type="password"
                            value={passwordActual}
                            onChange={(e) => setPasswordActual(e.target.value)}
                            placeholder="Ej. 12345678"
                            required
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nueva Contraseña Personal *</label>
                        <input
                            type="password"
                            value={nuevaPassword}
                            onChange={(e) => setNuevaPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confirmar Nueva Contraseña *</label>
                        <input
                            type="password"
                            value={confirmarPassword}
                            onChange={(e) => setConfirmarPassword(e.target.value)}
                            placeholder="Repita la nueva contraseña"
                            required
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        style={{
                            marginTop: '1rem', background: 'var(--color-azul-oscuro)', color: '#fff',
                            padding: '1rem', border: 'none', borderRadius: '8px', fontWeight: 'bold',
                            fontSize: '1rem', cursor: cargando ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(69, 94, 139, 0.3)'
                        }}
                    >
                        {cargando ? 'Guardando...' : 'Establecer Nueva Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalCambioPasswordObligatorio;
