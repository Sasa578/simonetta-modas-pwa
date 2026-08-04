import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';
import './SecretariaDashboard.css';

// ── Mock data ──

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const calendarioDias = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = hoy.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    const dias = [];
    for (let i = 0; i < primerDia; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) dias.push(d);
    return dias;
};

const almacenVistazo = [
    { producto: 'Gabardina azul', stock: 2, minimo: 5 },
    { producto: 'Hilo dorado', stock: 1, minimo: 4 },
    { producto: 'Lino blanco', stock: 8, minimo: 3 },
];

const pedidosImportantes = [
    { id: '#P-1042', cliente: 'María García', fecha: '15/08/2026', prioridad: 'Alta' },
    { id: '#P-1043', cliente: 'Juana Pérez', fecha: '18/08/2026', prioridad: 'Media' },
    { id: '#P-1045', cliente: 'Rosa Quispe', fecha: '20/08/2026', prioridad: 'Alta' },
];

const clientesActivos = [
    { id: 1, nombre: 'María García', pedido: '#P-1042', entrega: '15/08/2026' },
    { id: 2, nombre: 'Juana Pérez', pedido: '#P-1043', entrega: '18/08/2026' },
    { id: 3, nombre: 'Rosa Quispe', pedido: '#P-1045', entrega: '20/08/2026' },
    { id: 4, nombre: 'Elena Vargas', pedido: '#P-1046', entrega: '22/08/2026' },
];

const SecretariaDashboard = () => {
    const navigate = useNavigate();
    const [mesActual] = useState(new Date().toLocaleString('es', { month: 'long', year: 'numeric' }));

    const handleDiaClick = (dia) => {
        const fecha = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        navigate(`/secretaria/pedidos/nuevo?fecha=${fecha}`);
    };

    const dias = calendarioDias();

    return (
        <>
            {/* Calendario */}
            <section className="card card-calendario">
                <div className="card-header">
                    <h2>📅 {mesActual}</h2>
                    <span className="card-subtitle">Click en un día para agendar pedido</span>
                </div>
                <div className="calendario-grid-wrapper">
                    <div className="calendario-dias-semana">
                        {diasSemana.map((d) => <span key={d} className="dia-semana">{d}</span>)}
                    </div>
                    <div className="calendario-grid">
                        {dias.map((dia, i) => (
                            <div
                                key={i}
                                className={`calendario-dia ${dia ? 'activo' : 'vacio'} ${dia === new Date().getDate() ? 'hoy' : ''}`}
                                onClick={() => dia && handleDiaClick(dia)}
                            >
                                {dia || ''}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Columnas inferiores */}
            <div className="secretaria-columnas">
                {/* Almacén */}
                <section className="card card-almacen-sec">
                    <div className="card-header">
                        <h2>📦 Vistazo de Almacén</h2>
                    </div>
                    <div className="card-body">
                        {almacenVistazo.map((item, i) => (
                            <div key={i} className={`fila-stock ${item.stock <= item.minimo ? 'alerta-bajo' : ''}`}>
                                <span className="stock-producto">{item.producto}</span>
                                <span className="stock-cantidad">{item.stock} / {item.minimo}</span>
                                {item.stock <= item.minimo && <span className="stock-alerta">⚠ Bajo</span>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pedidos Importantes */}
                <section className="card card-pedidos-importantes">
                    <div className="card-header">
                        <h2>⭐ Pedidos Importantes</h2>
                    </div>
                    <div className="card-body">
                        {pedidosImportantes.map((p) => (
                            <div key={p.id} className="fila-pedido-importante">
                                <span className="importante-id">{p.id}</span>
                                <span className="importante-cliente">{p.cliente}</span>
                                <span className="importante-fecha">{p.fecha}</span>
                                <span className={`importante-prioridad prioridad-${p.prioridad.toLowerCase()}`}>{p.prioridad}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

export default SecretariaDashboard;
