import { useState, useEffect } from 'react';
import api from '../api/axios';
import ModalCliente from '../components/ModalCliente';
import ModalMedidas from '../components/ModalMedidas';

const ClientesView = () => {
    const [clientes, setClientes] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState('Todos'); // 'Todos', 'Persona', 'Institucional'
    const [busqueda, setBusqueda] = useState('');
    const [msg, setMsg] = useState('');
    const [isModalClienteOpen, setIsModalClienteOpen] = useState(false);
    const [isModalMedidasOpen, setIsModalMedidasOpen] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    const cargarClientes = async () => {
        try { 
            const { data } = await api.get('/clientes'); 
            setClientes(data); 
        } catch { 
            setMsg('Error al cargar clientes.'); 
        }
    };

    useEffect(() => { cargarClientes(); }, []);

    const handleAddCliente = () => setIsModalClienteOpen(true);
    const handleMedidas = (c) => {
        setClienteSeleccionado(c);
        setIsModalMedidasOpen(true);
    };

    const clientesFiltrados = clientes.filter(c => {
        const matchesTipo = filtroTipo === 'Todos' || c.tipo_cliente === filtroTipo;
        const matchesBusqueda = !busqueda || 
            (c.nombre_completo && c.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())) ||
            (c.telefono_whatsapp && c.telefono_whatsapp.includes(busqueda)) ||
            (c.correo && c.correo.toLowerCase().includes(busqueda.toLowerCase())) ||
            (c.carnet_identidad && c.carnet_identidad.includes(busqueda));
        return matchesTipo && matchesBusqueda;
    });

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2>👥 Directorio de Clientes</h2>
                    <span className="card-subtitle">{clientes.length} clientes registrados (Personas e Instituciones)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <button onClick={handleAddCliente} className="btn-primario" style={{ borderRadius: '8px', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <span>+</span> Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* BARRA DE BÚSQUEDA Y FILTRO */}
            <div style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid var(--color-borde)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
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
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['Todos', 'Persona', 'Institucional'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFiltroTipo(t)}
                            style={{
                                padding: '0.5rem 0.9rem', borderRadius: '20px', border: '1px solid #CBD5E1',
                                background: filtroTipo === t ? 'var(--color-azul-oscuro)' : '#F8FAFC',
                                color: filtroTipo === t ? '#FFFFFF' : '#475569',
                                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t === 'Todos' ? '🌐 Todos' : t === 'Persona' ? '👤 Personas' : '🏢 Instituciones'}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '1.2rem' }}>
                {msg && <div className={msg.startsWith('✅') ? 'pedido-exito' : 'pedido-error'} style={{ marginBottom: '1rem', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.88rem' }}>{msg}</div>}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
                    {clientesFiltrados.map(c => {
                        const esInst = c.tipo_cliente === 'Institucional';
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
                                            {esInst ? '🏢 Institucional' : '👤 Persona Natural'}
                                        </span>
                                        <h3 style={{ margin: '0 0 0.2rem', color: 'var(--color-azul-oscuro)', fontSize: '1.1rem' }}>
                                            {c.nombre_completo}
                                        </h3>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>ID: #{c.id_cliente}</span>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    <p style={{ margin: 0 }}>
                                        📞 <strong>{esInst ? 'Contacto' : 'WhatsApp'}:</strong> {c.telefono_whatsapp || 'Sin registrar'}
                                    </p>
                                    {c.correo && (
                                        <p style={{ margin: 0, wordBreak: 'break-all' }}>
                                            ✉️ <strong>Correo:</strong> {c.correo}
                                        </p>
                                    )}
                                    {c.carnet_identidad && (
                                        <p style={{ margin: 0 }}>
                                            🆔 <strong>{esInst ? 'NIT' : 'CI'}:</strong> {c.carnet_identidad}
                                        </p>
                                    )}
                                    {esInst && c.nombre_contacto && (
                                        <p style={{ margin: 0, color: '#475569' }}>
                                            👔 <strong>Atención:</strong> {c.nombre_contacto}
                                        </p>
                                    )}
                                    {esInst && c.numero_contrato && (
                                        <p style={{ margin: 0, color: '#1E40AF', fontSize: '0.8rem' }}>
                                            📄 <strong>Contrato:</strong> {c.numero_contrato}
                                        </p>
                                    )}
                                </div>

                                {!esInst && (
                                    <button onClick={() => handleMedidas(c)} style={{
                                        width: '100%', padding: '0.65rem', background: 'var(--color-azul-claro)',
                                        color: 'var(--color-azul-oscuro)', border: 'none', borderRadius: '8px',
                                        fontWeight: '600', cursor: 'pointer', marginTop: 'auto', fontSize: '0.85rem',
                                        transition: 'background 0.2s'
                                    }}>
                                        📏 Ver / Registrar Medidas
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {clientesFiltrados.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                            <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>🔍</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>No se encontraron clientes con el filtro actual.</p>
                        </div>
                    )}
                </div>
            </div>

            <ModalCliente 
                isOpen={isModalClienteOpen}
                onClose={() => setIsModalClienteOpen(false)}
                onSuccess={() => { cargarClientes(); setMsg('✅ Cliente creado exitosamente.'); }}
            />

            <ModalMedidas
                isOpen={isModalMedidasOpen}
                onClose={() => setIsModalMedidasOpen(false)}
                onSuccess={() => { cargarClientes(); setMsg('✅ Medidas actualizadas exitosamente.'); }}
                cliente={clienteSeleccionado}
            />
        </section>
    );
};

export default ClientesView;
