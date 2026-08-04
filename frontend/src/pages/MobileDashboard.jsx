import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MobileDashboard.css';

// ── Mock data ──

const pedidosActivos = [
    {
        id: '#P-1042', cliente: 'María García', prenda: 'Vestido de novia',
        estado: 'En corte', fechaInicio: '01/08', fechaEntrega: '15/08',
        progreso: 30, colorEstado: 'corte',
    },
    {
        id: '#P-1043', cliente: 'Juana Pérez', prenda: 'Terno ejecutivo',
        estado: 'Confección', fechaInicio: '03/08', fechaEntrega: '18/08',
        progreso: 60, colorEstado: 'confeccion',
    },
    {
        id: '#P-1044', cliente: 'Rosa Quispe', prenda: 'Pollera plisada',
        estado: 'Acabados', fechaInicio: '05/08', fechaEntrega: '20/08',
        progreso: 85, colorEstado: 'acabados',
    },
];

const materialesDisponibles = [
    { nombre: 'Gabardina azul marino', stock: '12m', ubicacion: 'Estante A-3' },
    { nombre: 'Lino blanco', stock: '8m', ubicacion: 'Estante B-1' },
    { nombre: 'Hilo dorado', stock: '4 carretes', ubicacion: 'Cajón H-2' },
];

const MobileDashboard = () => {
    const { usuario } = useAuth();
    const esCosturera = usuario?.rol === 'Costurera';

    return (
        <>
            {/* Sección: Pedidos en Producción */}
            <section className="mobile-section">
                <h2 className="mobile-section-title">📋 Pedidos en Producción</h2>
                <div className="pedidos-cards">
                    {pedidosActivos.map((p) => (
                        <div key={p.id} className="pedido-card">
                            <div className="pedido-card-top">
                                <span className="pedido-card-id">{p.id}</span>
                                <span className={`pedido-estado-badge estado-${p.colorEstado}`}>
                                    {p.estado}
                                </span>
                            </div>
                            <h3 className="pedido-card-cliente">{p.cliente}</h3>
                            <p className="pedido-card-prenda">{p.prenda}</p>

                            {/* Barra de progreso */}
                            <div className="progreso-bar-wrapper">
                                <div className="progreso-bar">
                                    <div
                                        className={`progreso-fill fill-${p.colorEstado}`}
                                        style={{ width: `${p.progreso}%` }}
                                    />
                                </div>
                                <span className="progreso-texto">{p.progreso}%</span>
                            </div>

                            <div className="pedido-card-fechas">
                                <span>📅 Inicio: {p.fechaInicio}</span>
                                <span>🏁 Entrega: {p.fechaEntrega}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sección: Materiales (solo costurera) */}
            {esCosturera && (
                <section className="mobile-section">
                    <h2 className="mobile-section-title">🧶 Materiales Disponibles</h2>
                    <div className="materiales-lista">
                        {materialesDisponibles.map((m, i) => (
                            <div key={i} className="material-item">
                                <div className="material-info">
                                    <span className="material-nombre">{m.nombre}</span>
                                    <span className="material-stock">{m.stock}</span>
                                </div>
                                <span className="material-ubicacion">📍 {m.ubicacion}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
};

export default MobileDashboard;
