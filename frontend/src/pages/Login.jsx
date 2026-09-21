import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModalCambiarPassword from '../components/ModalCambiarPassword';
import './Login.css';

const generarCaptchaCodigo = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let resultado = '';
    for (let i = 0; i < 5; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
};

const Login = () => {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [captchaCodigo, setCaptchaCodigo] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
    const [usuarioPendiente, setUsuarioPendiente] = useState(null);
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const regenerarCaptcha = () => {
        setCaptchaCodigo(generarCaptchaCodigo());
        setCaptchaInput('');
    };

    useEffect(() => {
        regenerarCaptcha();
    }, []);

    const redirigirPorRol = (rol) => {
        if (rol === 'Admin') navigate('/admin');
        else if (rol === 'Secretaria') navigate('/secretaria');
        else if (rol === 'Cliente') navigate('/cliente');
        else navigate('/mobile'); // Costurera
    };

    const handlePasswordSuccess = () => {
        setMostrarModalPassword(false);
        if (usuarioPendiente) {
            redirigirPorRol(usuarioPendiente.rol);
        }
    };

    const handlePasswordLogout = () => {
        logout();
        setMostrarModalPassword(false);
        setUsuarioPendiente(null);
        setError('Debe cambiar su contrasena temporal antes de acceder al sistema.');
        regenerarCaptcha();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Verificacion de codigo CAPTCHA
        if (captchaInput.trim().toUpperCase() !== captchaCodigo) {
            setError('El codigo de seguridad (CAPTCHA) es incorrecto. Intente de nuevo.');
            regenerarCaptcha();
            return;
        }

        setCargando(true);

        try {
            const data = await login(correo.trim(), password);
            if (data.usuario?.debe_cambiar_password) {
                setUsuarioPendiente(data.usuario);
                setMostrarModalPassword(true);
            } else {
                redirigirPorRol(data.usuario.rol);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesion.');
            regenerarCaptcha();
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-container">
            {mostrarModalPassword && (
                <ModalCambiarPassword
                    isOpen={mostrarModalPassword}
                    usuario={usuarioPendiente}
                    onSuccess={handlePasswordSuccess}
                    onLogout={handlePasswordLogout}
                />
            )}
            <div className="login-card">
                <div className="login-header">
                    <h1 style={{ letterSpacing: '1px', fontWeight: 700 }}>SIMONETTA MODAS</h1>
                    <p className="login-subtitle">Alta Costura - Confeccion a Medida</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="correo">Correo electronico</label>
                        <input
                            id="correo"
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="admin@simonetta.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contrasena</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingrese su contrasena"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Desafio CAPTCHA Visual */}
                    <div className="form-group" style={{
                        background: '#f8fafc',
                        padding: '0.9rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        marginTop: '0.2rem'
                    }}>
                        <label style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--color-azul-oscuro)',
                            display: 'block',
                            marginBottom: '0.4rem',
                            textTransform: 'uppercase'
                        }}>
                            Verificacion de Seguridad (CAPTCHA)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                            <div style={{
                                background: '#1e293b',
                                color: '#a3fc9a',
                                padding: '0.5rem 1.1rem',
                                borderRadius: '6px',
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                                letterSpacing: '4px',
                                textDecoration: 'line-through',
                                userSelect: 'none',
                                fontFamily: 'monospace',
                                border: '1px solid #334155',
                                boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)'
                            }}>
                                {captchaCodigo}
                            </div>
                            <button
                                type="button"
                                onClick={regenerarCaptcha}
                                title="Cambiar codigo CAPTCHA"
                                style={{
                                    background: '#e2e8f0',
                                    color: '#1e293b',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '0.5rem 0.8rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Cambiar codigo
                            </button>
                        </div>
                        <input
                            type="text"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                            placeholder="Ingrese las 5 letras o numeros de arriba"
                            required
                            maxLength={5}
                            style={{
                                width: '100%',
                                padding: '0.65rem 0.9rem',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontWeight: 'bold'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={cargando}
                        style={{ marginTop: '0.5rem' }}
                    >
                        {cargando ? 'Ingresando al sistema...' : 'Ingresar al Sistema'}
                    </button>
                </form>

                <p className="login-footer">
                    Taller de confeccion - La Paz, Bolivia
                </p>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>No tienes cuenta de cliente?</p>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            background: 'transparent',
                            border: '1.5px solid var(--color-azul-oscuro)',
                            color: 'var(--color-azul-oscuro)',
                            borderRadius: 'var(--radio-borde-sm)',
                            padding: '0.6rem',
                            width: '100%',
                            marginTop: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Registrarse como Cliente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
