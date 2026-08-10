import { useState, useEffect } from 'react';
import api from '../api/axios';
import ModalCliente from '../components/ModalCliente';
import ModalMedidas from '../components/ModalMedidas';

const ClientesView = () => {
    const [clientes, setClientes] = useState([]);
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

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>👥 Gestión de Clientes</h2>
                    <span className="card-subtitle">{clientes.length} registrados</span>
                </div>
                <button onClick={handleAddCliente} className="btn-primario" style={{ borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    +
                </button>
            </div>
            
            <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {msg && <div className={msg.startsWith('✅') ? 'pedido-exito' : 'pedido-error'} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>{msg}</div>}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {clientes.map(c => (
                        <div key={c.id_cliente} style={{
                            border: '1px solid var(--color-borde)', borderRadius: '12px', padding: '1.25rem',
                            display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.3rem', color: 'var(--color-azul-oscuro)' }}>{c.nombre_completo}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>📞 {c.telefono_whatsapp}</p>
                                {c.correo && <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-texto-secundario)' }}>✉️ {c.correo}</p>}
                            </div>

                            <div style={{ background: 'var(--color-fondo)', padding: '0.8rem', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--color-texto-principal)' }}>Últimas Medidas {c.fecha_toma ? `(${new Date(c.fecha_toma).toLocaleDateString()})` : ''}</h4>
                                {c.fecha_toma ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-texto-secundario)' }}>
                                        {c.busto && <span>Busto: {c.busto}cm</span>}
                                        {c.cintura && <span>Cintura: {c.cintura}cm</span>}
                                        {c.cadera && <span>Cadera: {c.cadera}cm</span>}
                                        {c.espalda && <span>Espalda: {c.espalda}cm</span>}
                                        {c.hombro && <span>Hombro: {c.hombro}cm</span>}
                                        {c.frente && <span>Frente: {c.frente}cm</span>}
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', fontStyle: 'italic' }}>Sin medidas registradas</span>
                                )}
                            </div>

                            <button onClick={() => handleMedidas(c)} style={{
                                width: '100%', padding: '0.6rem', background: 'var(--color-azul-claro)',
                                color: 'var(--color-azul-oscuro)', border: 'none', borderRadius: '6px',
                                fontWeight: '600', cursor: 'pointer', marginTop: 'auto', fontSize: '0.85rem'
                            }}>
                                📏 {c.fecha_toma ? 'Actualizar Medidas' : 'Agregar Medidas'}
                            </button>
                        </div>
                    ))}
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
                onSuccess={() => { cargarClientes(); setMsg('✅ Medidas guardadas exitosamente.'); }}
                cliente={clienteSeleccionado}
            />
        </section>
    );
};

export default ClientesView;
