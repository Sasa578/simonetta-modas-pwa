import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    const { login } = useAuth();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Verificación de CAPTCHA
        if (captchaInput.trim().toUpperCase() !== captchaCodigo) {
            setError('⚠️ El código CAPTCHA ingresado es incorrecto. Intente de nuevo.');
            regenerarCaptcha();
            return;
        }

        setCargando(true);

        try {
            const data = await login(correo.trim(), password);
            redirigirPorRol(data.usuario.rol);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión.');
            regenerarCaptcha();
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">👗</div>
                    <h1>Simonetta Modas</h1>
                    <p className="login-subtitle">Alta Costura — Confección a medida</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="correo">Correo electrónico</label>
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
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Desafío CAPTCHA Visual */}
                    <div className="form-group" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-borde)', marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-azul-oscuro)', display: 'block', marginBottom: '0.4rem' }}>
                            🔒 Verificación de Seguridad (CAPTCHA)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #455E8B 100%)',
                                color: '#A3FC9A',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                fontSize: '1.4rem',
                                fontWeight: '900',
                                letterSpacing: '4px',
                                textDecoration: 'line-through',
                                userSelect: 'none',
                                fontFamily: 'monospace',
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
                            }}>
                                {captchaCodigo}
                            </div>
                            <button
                                type="button"
                                onClick={regenerarCaptcha}
                                title="Cambiar código CAPTCHA"
                                style={{
                                    background: 'var(--color-azul-claro)',
                                    color: 'var(--color-azul-oscuro)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.6rem 0.8rem',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                🔄
                            </button>
                        </div>
                        <input
                            type="text"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                            placeholder="Ingrese el código de 5 letras/números"
                            required
                            maxLength={5}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontSize: '0.9rem', textTransform: 'uppercase' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={cargando}
                        style={{ marginTop: '1rem' }}
                    >
                        {cargando ? 'Ingresando...' : 'Ingresar al Sistema'}
                    </button>
                </form>

                <p className="login-footer">
                    Taller de confección — La Paz, Bolivia
                </p>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>¿No tienes cuenta de cliente?</p>
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
