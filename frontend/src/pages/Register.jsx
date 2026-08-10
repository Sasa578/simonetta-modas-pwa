import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Login.css'; // Reutilizamos el estilo minimalista

const Register = () => {
    const [formData, setFormData] = useState({
        correo: '',
        password: '',
        nombre_completo: '',
        telefono_whatsapp: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setCargando(true);

        try {
            await api.post('/auth/register', formData);
            // Registro exitoso, redirigimos a login
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrarse.');
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
                    <p className="login-subtitle">Registro de Cliente</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input
                            type="text"
                            value={formData.nombre_completo}
                            onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                            placeholder="María Pérez"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input
                            type="tel"
                            value={formData.telefono_whatsapp}
                            onChange={(e) => setFormData({ ...formData, telefono_whatsapp: e.target.value })}
                            placeholder="60012345"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            value={formData.correo}
                            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                            placeholder="cliente@correo.com"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Contraseña</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                            position: 'absolute', right: '10px', top: '35px', background: 'transparent',
                            border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-texto-secundario)'
                        }}>
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Confirmar Contraseña</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={cargando}>
                        {cargando ? 'Registrando...' : 'Registrar Cuenta'}
                    </button>
                </form>

                <div style={{marginTop: '1rem', textAlign: 'center'}}>
                    <button 
                        onClick={() => navigate('/login')} 
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-texto-secundario)',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}
                    >
                        Volver al Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
