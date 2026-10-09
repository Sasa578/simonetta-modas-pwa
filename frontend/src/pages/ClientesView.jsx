import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ModalCliente from '../components/ModalCliente';
import ModalHistorialPedidosCliente from '../components/ModalHistorialPedidosCliente';

const ClientesView = () => {
    const { usuario } = useAuth();
    const esAdmin = (usuario?.rol || '').toLowerCase().includes('admin');

    const [clientes, setClientes] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState('Todos'); // 'Todos', 'Persona', 'Institucional'
    const [busqueda, setBusqueda] = useState('');
    const [msg, setMsg] = useState('');

    // Modales
    const [isModalClienteOpen, setIsModalClienteOpen] = useState(false);
    const [clienteEditando, setClienteEditando] = useState(null);
    const [clienteHistorial, setClienteHistorial] = useState(null);
    const [isHistorialOpen, setIsHistorialOpen] = useState(false);

    // Modal Restablecer Contraseña (Exclusivo Admin)
    const [modalReset, setModalReset] = useState({
        abierto: false,
        cliente: null,
        nuevaPassword: '',
        cargando: false,
        error: '',
        exito: ''
    });

    const cargarClientes = async () => {
        try { 
            const { data } = await api.get('/clientes'); 
            setClientes(data || []); 
        } catch { 
            setMsg('Error al cargar clientes.'); 
        }
    };

    useEffect(() => { cargarClientes(); }, []);

    const handleAddCliente = () => {
        setClienteEditando(null);
        setIsModalClienteOpen(true);
    };

    const handleEditarCliente = (c) => {
        setClienteEditando(c);
        setIsModalClienteOpen(true);
    };

    const handleVerHistorial = (c) => {
        setClienteHistorial(c);
        setIsHistorialOpen(true);
    };

    const handleAbrirResetPass = (c) => {
        setModalReset({
            abierto: true,
            cliente: c,
            nuevaPassword: '0986067862',
            cargando: false,
            error: '',
            exito: ''
        });
    };

    const handleConfirmarResetPass = async (e) => {
        e.preventDefault();
        if (!modalReset.cliente) return;
        const pass = modalReset.nuevaPassword.trim() || '0986067862';

        if (pass.length < 6) {
            setModalReset(prev => ({ ...prev, error: 'La contraseña debe tener al menos 6 caracteres.' }));
            return;
        }

        try {
            setModalReset(prev => ({ ...prev, cargando: true, error: '', exito: '' }));
            const res = await api.put(`/clientes/${modalReset.cliente.id_cliente}/reset-password`, {
                password: pass
            });
            setModalReset(prev => ({
                ...prev,
                cargando: false,
                exito: res.data.mensaje || `Contraseña restablecida exitosamente a: ${pass}`
            }));
            setMsg(`[OK] Contraseña restablecida exitosamente para ${modalReset.cliente.nombre_completo || modalReset.cliente.razon_social}.`);
            setTimeout(() => {
                setModalReset({ abierto: false, cliente: null, nuevaPassword: '', cargando: false, error: '', exito: '' });
            }, 1800);
        } catch (err) {
            setModalReset(prev => ({
                ...prev,
                cargando: false,
                error: err.response?.data?.error || 'Error al restablecer la contraseña.'
            }));
        }
    };

    // Funciones auxiliares para determinar el tipo de cliente sin fallos de string
    const isPersona = (c) => Number(c.id_tipo_cliente) === 1 || 
        (c.tipo_cliente && c.tipo_cliente.toLowerCase().includes('persona'));
    
    const isInstitucion = (c) => Number(c.id_tipo_cliente) === 2 || 
        (c.tipo_cliente && (c.tipo_cliente.toLowerCase().includes('instituc') || c.tipo_cliente.toLowerCase().includes('empresa')));

    // Contadores en tiempo real
    const totalCount = clientes.length;
    const personasCount = clientes.filter(isPersona).length;
    const institucionesCount = clientes.filter(isInstitucion).length;

    const clientesFiltrados = clientes.filter(c => {
        const matchesTipo = 
            filtroTipo === 'Todos' ||
            (filtroTipo === 'Persona' && isPersona(c)) ||
            (filtroTipo === 'Institucional' && isInstitucion(c));

        const busq = busqueda.toLowerCase().trim();
        const matchesBusqueda = !busq || 
            (c.nombre_completo && c.nombre_completo.toLowerCase().includes(busq)) ||
            (c.razon_social && c.razon_social.toLowerCase().includes(busq)) ||
            (c.nombre_contacto && c.nombre_contacto.toLowerCase().includes(busq)) ||
            (c.telefono_whatsapp && c.telefono_whatsapp.includes(busq)) ||
            (c.telefono_contacto && c.telefono_contacto.includes(busq)) ||
            (c.correo && c.correo.toLowerCase().includes(busq)) ||
            (c.carnet_identidad && c.carnet_identidad.includes(busq)) ||
            (c.nit && c.nit.includes(busq));

        return matchesTipo && matchesBusqueda;
    });

    const opcionesFiltro = [
        { key: 'Todos', label: `Todos (${totalCount})` },
        { key: 'Persona', label: `Personas Naturales (${personasCount})` },
        { key: 'Institucional', label: `Instituciones (${institucionesCount})` }
    ];

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>👥 Directorio y Gestión de Clientes</h2>
                    <span className="card-subtitle">{totalCount} clientes registrados ({personasCount} personas, {institucionesCount} instituciones)</span>
                </div>
                <button 
                    onClick={handleAddCliente}
                    style={{
                        padding: '0.65rem 1.25rem', background: 'var(--color-azul-oscuro)', color: '#fff',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    + Nuevo Cliente
                </button>
            </div>

            {/* Barra de Filtros Rápidos y Buscador */}
            <div style={{
                padding: '0.8rem 1.2rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
                display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ flex: '1 1 280px', maxWidth: '420px' }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Buscar por nombre, razón social, CI, NIT o teléfono..." 
                        value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{
                            width: '100%', padding: '0.6rem 1rem', borderRadius: '8px',
                            border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {opcionesFiltro.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setFiltroTipo(opt.key)}
                            style={{
                                padding: '0.5rem 0.9rem', borderRadius: '20px', border: '1px solid #CBD5E1',
                                background: filtroTipo === opt.key ? 'var(--color-azul-oscuro)' : '#F8FAFC',
                                color: filtroTipo === opt.key ? '#FFFFFF' : '#475569',
                                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.2s', boxShadow: filtroTipo === opt.key ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '1.2rem' }}>
                {msg && (
                    <div className={msg.startsWith('[OK]') ? 'pedido-exito' : 'pedido-error'} style={{ marginBottom: '1rem', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.88rem' }}>
                        {msg}
                    </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
                    {clientesFiltrados.map(c => {
                        const esInst = isInstitucion(c);
                        const nombreMostrar = esInst 
                            ? (c.razon_social || c.nombre_completo) 
                            : c.nombre_completo;
                        const telefonoMostrar = esInst 
                            ? (c.telefono_contacto || c.telefono_whatsapp) 
                            : c.telefono_whatsapp;
                        const docMostrar = esInst 
                            ? (c.nit || c.carnet_identidad) 
                            : c.carnet_identidad;

                        return (
                            <div key={c.id_cliente} style={{
                                border: '1px solid var(--color-borde)', borderRadius: '12px', padding: '1.25rem',
                                display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span style={{
                                            display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem',
                                            borderRadius: '6px', marginBottom: '0.4rem',
                                            background: esInst ? '#EEF2FF' : '#F0FDF4',
                                            color: esInst ? '#3730A3' : '#166534',
                                            border: esInst ? '1px solid #C7D2FE' : '1px solid #BBF7D0'
                                        }}>
                                            {esInst ? '🏢 Institucional / Empresa' : '👤 Persona Natural'}
                                        </span>
                                        <h3 style={{ margin: '0 0 0.2rem', color: 'var(--color-azul-oscuro)', fontSize: '1.1rem' }}>
                                            {nombreMostrar}
                                        </h3>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>ID: #{c.id_cliente}</span>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <p style={{ margin: 0 }}>
                                        📱 <strong>{esInst ? 'Teléfono Contacto' : 'WhatsApp'}:</strong> {telefonoMostrar || 'Sin registrar'}
                                    </p>
                                    {c.correo && (
                                        <p style={{ margin: 0, wordBreak: 'break-all' }}>
                                            ✉️ <strong>Correo:</strong> {c.correo}
                                        </p>
                                    )}
                                    {docMostrar && (
                                        <p style={{ margin: 0 }}>
                                            🆔 <strong>{esInst ? 'NIT' : 'CI'}:</strong> {docMostrar}
                                        </p>
                                    )}
                                    {esInst && c.nombre_contacto && (
                                        <p style={{ margin: 0, color: '#475569' }}>
                                            👤 <strong>Atención / Contacto:</strong> {c.nombre_contacto}
                                        </p>
                                    )}
                                    {esInst && (
                                        <p style={{ margin: 0, color: '#1E40AF', fontSize: '0.8rem' }}>
                                            📄 <strong>Contrato:</strong> {c.numero_contrato || 'Sin contrato vigente'}
                                        </p>
                                    )}
                                </div>

                                {/* Barra de Acciones del Cliente */}
                                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
                                    {/* Botón Historial de Pedidos (Reemplazo de Medidas aisladas) */}
                                    <button 
                                        type="button"
                                        onClick={() => handleVerHistorial(c)} 
                                        style={{
                                            width: '100%', padding: '0.6rem', background: '#F1F5F9',
                                            color: '#1E293B', border: '1px solid #CBD5E1', borderRadius: '8px',
                                            fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        📋 Ver Historial de Pedidos
                                    </button>

                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        {/* Botón Editar Datos */}
                                        <button
                                            type="button"
                                            onClick={() => handleEditarCliente(c)}
                                            style={{
                                                flex: 1, padding: '0.55rem', background: '#EEF2FF',
                                                color: '#3730A3', border: '1px solid #C7D2FE', borderRadius: '8px',
                                                fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                                            }}
                                            title="Editar información del cliente"
                                        >
                                            ✏️ Editar Datos
                                        </button>

                                        {/* Botón Restablecer Contraseña (Exclusivo Admin) */}
                                        {esAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => handleAbrirResetPass(c)}
                                                style={{
                                                    flex: 1, padding: '0.55rem', background: '#FEF3C7',
                                                    color: '#92400E', border: '1px solid #FDE68A', borderRadius: '8px',
                                                    fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                                                }}
                                                title="Restablecer contraseña del cliente (Exclusivo Admin)"
                                            >
                                                🔑 Reset Clave
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {clientesFiltrados.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                            <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>🔍</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>No se encontraron clientes con el filtro seleccionado ({filtroTipo}).</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Crear / Editar Cliente */}
            <ModalCliente 
                isOpen={isModalClienteOpen}
                onClose={() => { setIsModalClienteOpen(false); setClienteEditando(null); }}
                onSuccess={() => {
                    cargarClientes();
                    setMsg(clienteEditando ? '[OK] Datos del cliente actualizados exitosamente.' : '[OK] Cliente registrado exitosamente.');
                }}
                clienteEdit={clienteEditando}
            />

            {/* Modal Historial de Pedidos del Cliente */}
            <ModalHistorialPedidosCliente
                isOpen={isHistorialOpen}
                onClose={() => { setIsHistorialOpen(false); setClienteHistorial(null); }}
                cliente={clienteHistorial}
            />

            {/* Modal Restablecer Contraseña (Exclusivo Admin) */}
            {modalReset.abierto && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: '#ffffff', borderRadius: '14px', width: '90%', maxWidth: '440px',
                        padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.4rem' }}>🔑</span>
                                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.15rem' }}>Restablecer Contraseña</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalReset({ abierto: false, cliente: null, nuevaPassword: '', cargando: false, error: '', exito: '' })}
                                style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.1rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                            Cliente: <strong>{modalReset.cliente?.nombre_completo || modalReset.cliente?.razon_social}</strong>
                            <br />
                            <small style={{ color: '#64748B' }}>Correo: {modalReset.cliente?.correo || 'Sin correo asociado'}</small>
                        </p>

                        {modalReset.error && (
                            <div style={{ padding: '0.6rem 0.8rem', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', fontSize: '0.85rem' }}>
                                ⚠️ {modalReset.error}
                            </div>
                        )}

                        {modalReset.exito && (
                            <div style={{ padding: '0.6rem 0.8rem', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', borderRadius: '8px', fontSize: '0.85rem' }}>
                                ✓ {modalReset.exito}
                            </div>
                        )}

                        <form onSubmit={handleConfirmarResetPass} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                                    Nueva Contraseña Provisional *
                                </label>
                                <input
                                    type="text"
                                    value={modalReset.nuevaPassword}
                                    onChange={(e) => setModalReset({ ...modalReset, nuevaPassword: e.target.value })}
                                    placeholder="0986067862"
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px',
                                        border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none'
                                    }}
                                    required
                                />
                                <small style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                                    Por defecto sugerida: <code>0986067862</code>. El cliente podrá cambiarla en su perfil tras iniciar sesión.
                                </small>
                            </div>

                            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalReset({ abierto: false, cliente: null, nuevaPassword: '', cargando: false, error: '', exito: '' })}
                                    style={{
                                        flex: 1, padding: '0.7rem', background: '#F1F5F9', border: 'none',
                                        borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalReset.cargando}
                                    style={{
                                        flex: 2, padding: '0.7rem', background: 'var(--color-azul-oscuro)',
                                        border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 600,
                                        cursor: modalReset.cargando ? 'not-allowed' : 'pointer', opacity: modalReset.cargando ? 0.7 : 1
                                    }}
                                >
                                    {modalReset.cargando ? 'Guardando...' : 'Asignar Nueva Clave'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ClientesView;
