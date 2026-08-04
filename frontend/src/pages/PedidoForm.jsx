import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './PedidoForm.css';

const PedidoForm = () => {
    const navigate = useNavigate();

    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    // --- HU-04: Datos del pedido ---
    const [idCliente, setIdCliente] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [costoTotal, setCostoTotal] = useState('');
    const [adelanto, setAdelanto] = useState('');

    // --- HU-05: Material ---
    const [descripcionTela, setDescripcionTela] = useState('');
    const [origenMaterial, setOrigenMaterial] = useState('');
    const [cantidadMetros, setCantidadMetros] = useState('');

    // Cargar lista de clientes para el <select>
    useEffect(() => {
        const cargarClientes = async () => {
            try {
                const { data } = await api.get('/clientes');
                setClientes(data);
            } catch {
                setError('No se pudieron cargar los clientes.');
            }
        };
        cargarClientes();
    }, []);

    // Fecha mínima = hoy
    const hoy = new Date().toISOString().split('T')[0];

    // Saldo calculado en tiempo real
    const costo = parseFloat(costoTotal) || 0;
    const adelantoFloat = parseFloat(adelanto) || 0;
    const saldo = Math.max(0, costo - adelantoFloat);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');
        setCargando(true);

        try {
            const { data } = await api.post('/pedidos', {
                id_cliente: Number(idCliente),
                fecha_entrega: fechaEntrega,
                costo_total: costo,
                adelanto: adelantoFloat,
                descripcion_tela: descripcionTela.trim(),
                origen_material: origenMaterial,
                cantidad_metros: cantidadMetros || null,
            });

            setExito(`✅ Pedido #${data.pedido.id_pedido} creado. Saldo: Bs. ${data.pedido.saldo}`);

            // Limpiar formulario después de 2s
            setTimeout(() => {
                setIdCliente('');
                setFechaEntrega('');
                setCostoTotal('');
                setAdelanto('');
                setDescripcionTela('');
                setOrigenMaterial('');
                setCantidadMetros('');
                setExito('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear el pedido.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="pedido-container">
            {/* Header */}
            <header className="pedido-header">
                <button className="btn-volver" onClick={() => navigate('/')}>
                    ← Volver
                </button>
                <h1 className="pedido-title">Nuevo Pedido</h1>
            </header>

            <div className="pedido-content">
                {error && <div className="pedido-error">{error}</div>}
                {exito && <div className="pedido-exito">{exito}</div>}

                <form onSubmit={handleSubmit} className="pedido-form">
                    {/* === SECCIÓN 1: Datos del Pedido (HU-04) === */}
                    <fieldset className="pedido-seccion">
                        <legend>📋 Datos del Pedido</legend>

                        {/* Selector de cliente */}
                        <div className="form-group">
                            <label htmlFor="cliente">Cliente *</label>
                            <select
                                id="cliente"
                                value={idCliente}
                                onChange={(e) => setIdCliente(e.target.value)}
                                required
                            >
                                <option value="">-- Seleccionar cliente --</option>
                                {clientes.map((c) => (
                                    <option key={c.id_cliente} value={c.id_cliente}>
                                        {c.nombre_completo} {c.telefono_whatsapp ? `(${c.telefono_whatsapp})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Fecha de entrega */}
                        <div className="form-group">
                            <label htmlFor="fecha_entrega">Fecha de entrega *</label>
                            <input
                                id="fecha_entrega"
                                type="date"
                                value={fechaEntrega}
                                onChange={(e) => setFechaEntrega(e.target.value)}
                                min={hoy}
                                required
                            />
                        </div>

                        {/* Costo total */}
                        <div className="form-group">
                            <label htmlFor="costo_total">Costo total (Bs.) *</label>
                            <input
                                id="costo_total"
                                type="number"
                                step="0.01"
                                min="0"
                                value={costoTotal}
                                onChange={(e) => setCostoTotal(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        {/* Adelanto */}
                        <div className="form-group">
                            <label htmlFor="adelanto">Adelanto (Bs.)</label>
                            <input
                                id="adelanto"
                                type="number"
                                step="0.01"
                                min="0"
                                value={adelanto}
                                onChange={(e) => setAdelanto(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        {/* Saldo calculado en tiempo real */}
                        <div className="saldo-display">
                            <span className="saldo-label">Saldo a pagar</span>
                            <span className="saldo-valor">Bs. {saldo.toFixed(2)}</span>
                        </div>
                    </fieldset>

                    {/* === SECCIÓN 2: Materiales (HU-05) === */}
                    <fieldset className="pedido-seccion">
                        <legend>🧶 Material</legend>

                        {/* Descripción de tela */}
                        <div className="form-group">
                            <label htmlFor="descripcion_tela">Descripción de la tela *</label>
                            <input
                                id="descripcion_tela"
                                type="text"
                                value={descripcionTela}
                                onChange={(e) => setDescripcionTela(e.target.value)}
                                placeholder="Ej: Gabardina azul marino"
                                required
                            />
                        </div>

                        {/* Origen del material (radio buttons) */}
                        <div className="form-group">
                            <label>Origen del material *</label>
                            <div className="radio-group">
                                <label className="radio-opcion">
                                    <input
                                        type="radio"
                                        name="origen_material"
                                        value="Taller"
                                        checked={origenMaterial === 'Taller'}
                                        onChange={(e) => setOrigenMaterial(e.target.value)}
                                        required
                                    />
                                    <span>Material del Taller</span>
                                </label>
                                <label className="radio-opcion">
                                    <input
                                        type="radio"
                                        name="origen_material"
                                        value="Cliente"
                                        checked={origenMaterial === 'Cliente'}
                                        onChange={(e) => setOrigenMaterial(e.target.value)}
                                    />
                                    <span>Material traído por el Cliente</span>
                                </label>
                            </div>
                        </div>

                        {/* Cantidad de metros */}
                        <div className="form-group">
                            <label htmlFor="cantidad_metros">Cantidad (metros)</label>
                            <input
                                id="cantidad_metros"
                                type="number"
                                step="0.01"
                                min="0"
                                value={cantidadMetros}
                                onChange={(e) => setCantidadMetros(e.target.value)}
                                placeholder="Opcional"
                            />
                        </div>
                    </fieldset>

                    {/* Botón enviar */}
                    <button type="submit" className="btn-primario" disabled={cargando}>
                        {cargando ? 'Creando pedido...' : '📝 Crear Pedido'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PedidoForm;
