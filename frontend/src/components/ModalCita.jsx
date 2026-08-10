import { useState } from 'react';
import api from '../api/axios';

const ModalCita = ({ isOpen, onClose, onSuccess }) => {
    const [fechaCita, setFechaCita] = useState('');
    const [detalles, setDetalles] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!fechaCita) {
            setError('Por favor, selecciona una fecha.');
            return;
        }

        // Validación básica: la fecha debe ser futura
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const fechaElegida = new Date(fechaCita);
        fechaElegida.setHours(0,0,0,0);

        if (fechaElegida < hoy) {
            setError('La fecha no puede ser en el pasado.');
            return;
        }

        setCargando(true);
        try {
            await api.post('/citas', { fecha_cita: fechaCita, detalles });
            onSuccess();
            setFechaCita('');
            setDetalles('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al solicitar la cita.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
            <div style={{
                background: '#fff', padding: '2rem', borderRadius: '12px',
                width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h2 style={{color: 'var(--color-azul-oscuro)', margin: 0}}>📅 Solicitar Cita</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-rojo-suave)', color:'var(--color-rojo-texto)', fontSize: '0.9rem'}}>{error}</div>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <p style={{fontSize: '0.9rem', color: 'var(--color-texto-secundario)', margin: 0}}>
                        Selecciona una fecha para acercarte al taller. Allí confirmaremos tus medidas, la tela y el precio final del pedido.
                    </p>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Fecha de la Cita *</label>
                        <input
                            type="date"
                            value={fechaCita}
                            onChange={(e) => setFechaCita(e.target.value)}
                            style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontFamily: 'inherit'}}
                            required
                        />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>¿Qué prenda te gustaría hacer? (Opcional)</label>
                        <textarea
                            value={detalles}
                            onChange={(e) => setDetalles(e.target.value)}
                            placeholder="Ej: Un vestido de gala rojo con encaje..."
                            rows="3"
                            style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontFamily: 'inherit', resize: 'vertical'}}
                        />
                    </div>

                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '0.8rem', background: '#f1f5f9', color: 'var(--color-texto-principal)',
                            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando} style={{
                            flex: 2, background: 'var(--color-azul-oscuro)', color: '#fff', padding: '0.8rem',
                            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer'
                        }}>
                            {cargando ? 'Enviando...' : 'Confirmar Solicitud'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCita;
