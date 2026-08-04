import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const redirigirPorRol = (rol) => {
        if (rol === 'Admin') navigate('/admin');
        else if (rol === 'Secretaria') navigate('/secretaria');
        else navigate('/mobile'); // Costurera, Cliente
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const data = await login(correo, password);
            redirigirPorRol(data.usuario.rol);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">🧵</div>
                    <h1>Simonetta</h1>
                    <p className="login-subtitle">Alta Costura · Confección a medida</p>
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

                    <button
                        type="submit"
                        className="login-button"
                        disabled={cargando}
                    >
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="login-footer">
                    Taller de confección · La Paz, Bolivia
                </p>
            </div>
        </div>
    );
};

export default Login;
