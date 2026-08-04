import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './MedidasForm.css';

const MedidasForm = () => {
    const { id_cliente } = useParams();
    const navigate = useNavigate();
    const esNuevo = id_cliente === 'nuevo';

    const [paso, setPaso] = useState(esNuevo ? 1 : 2); // Paso 1: info cliente, Paso 2: medidas
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [alertaCaducada, setAlertaCaducada] = useState(false);

    // Datos del cliente (paso 1)
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('');
    const [clienteCreadoId, setClienteCreadoId] = useState(esNuevo ? null : Number(id_cliente));

    // Medidas anatómicas (paso 2)
    const [medidas, setMedidas] = useState({
        cortas: '', cintura: '', frente: '', alto_cadera: '',
        cadera: '', entre_busto: '', busto: '', espalda: '', hombro: '',
        fecha_toma: new Date().toISOString().split('T')[0],
    });

    // --- HU-03: Cargar medidas previas si el cliente ya existe ---
    useEffect(() => {
        if (!esNuevo) {
            const cargarMedidas = async () => {
                try {
                    const { data } = await api.get(`/medidas/cliente/${id_cliente}`);
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
                    }
                } catch {
                    // Silencio: si falla la carga, el formulario queda vacío
                }
            };
            cargarMedidas();
        }
    }, [id_cliente, esNuevo]);

    // --- Paso 1: Crear cliente ---
    const handleCrearCliente = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        if (!nombreCompleto.trim()) {
            setError('El nombre completo es obligatorio.');
            setCargando(false);
            return;
        }

        if (!telefonoWhatsapp.trim()) {
            setError('El número de WhatsApp es obligatorio.');
            setCargando(false);
            return;
        }

        try {
            const { data } = await api.post('/clientes', {
                nombre_completo: nombreCompleto.trim(),
                telefono_whatsapp: telefonoWhatsapp.trim(),
            });
            setClienteCreadoId(data.cliente.id_cliente);
            setPaso(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear el cliente.');
        } finally {
            setCargando(false);
        }
    };

    // --- Paso 2: Registrar medidas ---
    const handleRegistrarMedidas = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');
        setCargando(true);

        const payload = {
            id_cliente: clienteCreadoId,
            fecha_toma: medidas.fecha_toma,
        };

        // Convertir campos vacíos a null y numéricos a float
        Object.entries(medidas).forEach(([k, v]) => {
            if (k !== 'fecha_toma') {
                payload[k] = v === '' ? null : parseFloat(v);
            }
        });

        try {
            const { data } = await api.post('/medidas', payload);

            const badge = data.medidas_caducadas
                ? ' ⚠️ Medidas caducadas (más de 6 meses)'
                : ' ✅ Medidas vigentes';

            setExito(`Medidas registradas con éxito.${badge}`);

            // Volver al dashboard después de 1.5s
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrar las medidas.');
        } finally {
            setCargando(false);
        }
    };

    // Campos de medida con etiquetas descriptivas
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

    const handleMedidaChange = (key, value) => {
        setMedidas((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="medidas-container">
            {/* Header */}
            <header className="medidas-header">
                <button className="btn-volver" onClick={() => navigate('/dashboard')}>
                    ← Volver
                </button>
                <h1 className="medidas-title">
                    {paso === 1 ? 'Nuevo cliente' : 'Registrar medidas'}
                </h1>
            </header>

            <div className="medidas-content">
                {/* Indicador de pasos */}
                <div className="pasos-indicador">
                    <div className={`paso ${paso >= 1 ? 'activo' : ''}`}>1</div>
                    <div className="paso-linea"></div>
                    <div className={`paso ${paso >= 2 ? 'activo' : ''}`}>2</div>
                </div>

                {error && <div className="medidas-error">{error}</div>}
                {exito && <div className="medidas-exito">{exito}</div>}

                {/* === HU-03: Alerta de caducidad === */}
                {alertaCaducada && (
                    <div className="alerta-caducada">
                        Medidas Posiblemente Caducadas - Requiere Medición
                    </div>
                )}

                {/* === PASO 1: Datos del cliente === */}
                {paso === 1 && (
                    <form onSubmit={handleCrearCliente} className="medidas-form">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre completo *</label>
                            <input
                                id="nombre"
                                type="text"
                                value={nombreCompleto}
                                onChange={(e) => setNombreCompleto(e.target.value)}
                                placeholder="Ej: María García López"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="telefono">WhatsApp *</label>
                            <input
                                id="telefono"
                                type="tel"
                                value={telefonoWhatsapp}
                                onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                                placeholder="+591 77712345"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primario" disabled={cargando}>
                            {cargando ? 'Guardando...' : 'Continuar →'}
                        </button>
                    </form>
                )}

                {/* === PASO 2: Medidas anatómicas === */}
                {paso === 2 && (
                    <form onSubmit={handleRegistrarMedidas} className="medidas-form">
                        <p className="medidas-subtitulo">
                            Ingrese las medidas en centímetros. Deje en blanco las que no correspondan.
                        </p>

                        <div className="medidas-grid">
                            {camposMedida.map(({ key, label, unidad }) => (
                                <div className="form-group-medida" key={key}>
                                    <label htmlFor={key}>{label}</label>
                                    <div className="input-con-unidad">
                                        <input
                                            id={key}
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={medidas[key]}
                                            onChange={(e) => handleMedidaChange(key, e.target.value)}
                                            placeholder="--"
                                        />
                                        <span className="unidad">{unidad}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_toma">Fecha de toma</label>
                            <input
                                id="fecha_toma"
                                type="date"
                                value={medidas.fecha_toma}
                                onChange={(e) => handleMedidaChange('fecha_toma', e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-primario" disabled={cargando}>
                            {cargando ? 'Registrando...' : '💾 Guardar medidas'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MedidasForm;
