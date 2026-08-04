import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const { data } = await api.get('/clientes');
            setClientes(data);
        } catch (err) {
            setError('Error al cargar los clientes.');
        } finally {
            setCargando(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const clientesFiltrados = clientes.filter((c) =>
        c.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1 className="header-title">
                        <span className="header-icon">🧵</span> Simonetta
                    </h1>
                </div>
                <div className="header-right">
                    <span className="header-rol">{usuario?.rol}</span>
                    <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
                        Salir 🚪
                    </button>
                </div>
            </header>

            {/* Bienvenida */}
            <div className="dashboard-welcome">
                <h2>Clientes del taller</h2>
                <p>{clientes.length} clientes registrados</p>
            </div>

            {/* Búsqueda */}
            <div className="dashboard-search">
                <input
                    type="text"
                    placeholder="🔍 Buscar cliente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {/* Lista de clientes */}
            <div className="dashboard-content">
                {cargando ? (
                    <div className="dashboard-loading">Cargando...</div>
                ) : error ? (
                    <div className="dashboard-error">{error}</div>
                ) : clientesFiltrados.length === 0 ? (
                    <div className="dashboard-empty">
                        {busqueda ? 'No se encontraron clientes.' : 'Aún no hay clientes registrados.'}
                    </div>
                ) : (
                    <div className="clientes-lista">
                        {clientesFiltrados.map((cliente) => (
                            <div
                                key={cliente.id_cliente}
                                className="cliente-card"
                                onClick={() => navigate(`/medidas/${cliente.id_cliente}`)}
                            >
                                <div className="cliente-avatar">
                                    {cliente.nombre_completo.charAt(0)}
                                </div>
                                <div className="cliente-info">
                                    <h3>{cliente.nombre_completo}</h3>
                                    {cliente.telefono_whatsapp && (
                                        <p className="cliente-telefono">{cliente.telefono_whatsapp}</p>
                                    )}
                                </div>
                                <div className="cliente-flecha">→</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB para agregar cliente */}
            <button
                className="fab-agregar"
                onClick={() => navigate('/medidas/nuevo')}
                title="Nuevo cliente"
            >
                +
            </button>
        </div>
    );
};

export default Dashboard;
