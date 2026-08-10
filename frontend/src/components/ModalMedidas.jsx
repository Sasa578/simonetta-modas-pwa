import { useState, useEffect } from 'react';
import api from '../api/axios';

const camposMedida = [
    { key: 'cortas', label: 'Cortas', unidad: 'cm' },
    { key: 'cintura', label: 'Cintura', unidad: 'cm' },
    { key: 'frente', label: 'Frente', unidad: 'cm' },
    { key: 'alto_cadera', label: 'Alto de cadera', unidad: 'cm' },
    { key: 'cadera', label: 'Cadera', unidad: 'cm' },
    { key: 'entre_busto', label: 'Entre busto', unidad: 'cm' },
    { key: 'busto', label: 'Busto', unidad: 'cm' },
    { key: 'espalda', label: 'Espalda', unidad: 'cm' },
    { key: 'hombro', label: 'Hombro', unidad: 'cm' },
];

const ModalMedidas = ({ isOpen, onClose, onSuccess, cliente }) => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [alertaCaducada, setAlertaCaducada] = useState(false);

    const [medidas, setMedidas] = useState({
        cortas: '', cintura: '', frente: '', alto_cadera: '',
        cadera: '', entre_busto: '', busto: '', espalda: '', hombro: '',
        fecha_toma: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (isOpen && cliente) {
            setError('');
            setAlertaCaducada(false);
            
            // Cargar últimas medidas del cliente
            api.get(`/medidas/cliente/${cliente.id_cliente}`)
                .then(({ data }) => {
                    if (data.length > 0) {
                        const ultima = data[0];
                        setMedidas({
                            cortas: ultima.cortas ?? '',
                            cintura: ultima.cintura ?? '',
                            frente: ultima.frente ?? '',
                            alto_cadera: ultima.alto_cadera ?? '',
                            cadera: ultima.cadera ?? '',
                            entre_busto: ultima.entre_busto ?? '',
                            busto: ultima.busto ?? '',
                            espalda: ultima.espalda ?? '',
                            hombro: ultima.hombro ?? '',
                            fecha_toma: new Date().toISOString().split('T')[0],
                        });
                        if (ultima.medidas_caducadas) {
                            setAlertaCaducada(true);
                        }
                    } else {
                        // Reset if no prev measures
                        setMedidas({
                            cortas: '', cintura: '', frente: '', alto_cadera: '',
                            cadera: '', entre_busto: '', busto: '', espalda: '', hombro: '',
                            fecha_toma: new Date().toISOString().split('T')[0],
                        });
                    }
                })
                .catch(() => {});
        }
    }, [isOpen, cliente]);

    if (!isOpen || !cliente) return null;

    const handleMedidaChange = (key, value) => {
        setMedidas((prev) => ({ ...prev, [key]: value }));
    };

    const handleRegistrarMedidas = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        const payload = {
            id_cliente: cliente.id_cliente,
            fecha_toma: medidas.fecha_toma,
        };

        Object.entries(medidas).forEach(([k, v]) => {
            if (k !== 'fecha_toma') {
                payload[k] = v === '' ? null : parseFloat(v);
            }
        });

        try {
            await api.post('/medidas', payload);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrar las medidas.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '1rem'
        }}>
            <div style={{
                background: '#fff', padding: '2rem', borderRadius: '12px',
                width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <div>
                        <h2 style={{color: 'var(--color-azul-oscuro)', margin: 0}}>📏 Medidas de Cliente</h2>
                        <span style={{fontSize: '0.85rem', color: 'var(--color-texto-secundario)'}}>{cliente.nombre_completo}</span>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', color: 'var(--color-texto-secundario)'
                    }}>×</button>
                </header>

                {error && <div style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'var(--color-rojo-suave)', color:'var(--color-rojo-texto)'}}>{error}</div>}
                {alertaCaducada && (
                    <div style={{padding:'0.8rem', marginBottom:'1rem', borderRadius:'8px', background:'#fef08a', color:'#854d0e', fontWeight:'bold', fontSize:'0.85rem'}}>
                        ⚠️ Medidas Posiblemente Caducadas - Requiere Medición
                    </div>
                )}

                <form onSubmit={handleRegistrarMedidas} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <p style={{fontSize: '0.85rem', color: 'var(--color-texto-secundario)', margin: 0}}>
                        Ingrese las medidas en centímetros. Deje en blanco las que no correspondan.
                    </p>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem'}}>
                        {camposMedida.map(({ key, label, unidad }) => (
                            <div key={key} style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                                <label style={{fontSize: '0.75rem', fontWeight: 600}}>{label}</label>
                                <div style={{display: 'flex', alignItems: 'center', position: 'relative'}}>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={medidas[key]}
                                        onChange={(e) => handleMedidaChange(key, e.target.value)}
                                        placeholder="--"
                                        style={{width: '100%', padding: '0.5rem', paddingRight: '2rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}
                                    />
                                    <span style={{position: 'absolute', right: '0.5rem', fontSize: '0.75rem', color: 'var(--color-texto-secundario)'}}>{unidad}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem'}}>
                        <label style={{fontSize: '0.85rem', fontWeight: 600}}>Fecha de toma</label>
                        <input
                            type="date"
                            value={medidas.fecha_toma}
                            onChange={(e) => handleMedidaChange('fecha_toma', e.target.value)}
                            style={{padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--color-borde)'}}
                        />
                    </div>

                    <button type="submit" disabled={cargando} style={{
                        marginTop: '1rem', background: 'var(--color-azul-oscuro)', color: '#fff', padding: '1rem',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer'
                    }}>
                        {cargando ? 'Guardando...' : '💾 Guardar medidas'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalMedidas;
