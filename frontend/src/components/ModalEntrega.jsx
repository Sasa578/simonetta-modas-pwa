import { useState } from 'react';
import api from '../api/axios';

const ModalEntrega = ({ isOpen, onClose, onSuccess, pedido }) => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !pedido) return null;

    const costoTotal = parseFloat(pedido.costo_total) || 0;
    const adelanto = parseFloat(pedido.adelanto) || 0;
    const saldo = Math.max(0, costoTotal - adelanto);

    const handleSaldar = async () => {
        setError('');
        setCargando(true);
        try {
            await api.put(`/pedidos/${pedido.id_pedido}/saldar`);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al saldar el pedido.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#fff', padding: '2rem', borderRadius: '12px',
                width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h2 style={{color: 'var(--color-azul-oscuro)', margin: 0}}>🛍️ Entregar Pedido #{pedido.id_pedido}</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-rojo-suave)', color:'var(--color-rojo-texto)'}}>{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Cliente:</strong> {pedido.cliente}</p>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Prenda:</strong> {pedido.prenda}</p>
                    
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--color-texto-secundario)' }}>Costo Total:</span>
                            <strong>Bs. {costoTotal.toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--color-texto-secundario)' }}>Adelanto:</span>
                            <strong style={{ color: 'var(--color-verde)' }}>- Bs. {adelanto.toFixed(2)}</strong>
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-borde)', margin: '0.8rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                            <span style={{ color: 'var(--color-texto-principal)', fontWeight: 'bold' }}>Saldo Pendiente:</span>
                            <strong style={{ color: 'var(--color-rojo-texto)' }}>Bs. {saldo.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={onClose} disabled={cargando} style={{
                        flex: 1, padding: '0.8rem', background: 'transparent', color: 'var(--color-texto-secundario)',
                        border: '1px solid var(--color-borde)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                        Cancelar
                    </button>
                    <button onClick={handleSaldar} disabled={cargando} style={{
                        flex: 2, padding: '0.8rem', background: 'var(--color-verde)', color: '#fff',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer'
                    }}>
                        {cargando ? 'Procesando...' : 'Cobrar y Entregar ✅'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEntrega;
