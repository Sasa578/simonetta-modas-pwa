import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ModalUsuario from '../components/ModalUsuario';
import '../pages/AdminDashboard.css';

const AdminUsuarios = () => {
    const { usuario } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioEdit, setUsuarioEdit] = useState(null);
    const [msg, setMsg] = useState('');

    const yoId = usuario?.id_usuario;

    useEffect(() => {
        cargarUsuarios();
        api.get('/auth/roles').then(({ data }) => setRoles(data)).catch(() => {});
    }, []);

    const cargarUsuarios = async () => {
        try { 
            const { data } = await api.get('/usuarios'); 
            setUsuarios(data); 
        } catch { 
            setMsg('Error al cargar usuarios.'); 
        }
    };

    const handleAdd = () => {
        setUsuarioEdit(null);
        setIsModalOpen(true);
    };

    const handleEditar = (u) => {
        setUsuarioEdit(u);
        setIsModalOpen(true);
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Eliminar este usuario del personal?')) return;
        try { 
            await api.delete(`/usuarios/${id}`); 
            cargarUsuarios(); 
            setMsg('[OK] Usuario eliminado.'); 
        } catch (err) { 
            setMsg('[X] ' + (err.response?.data?.error || 'Error al eliminar.')); 
        }
    };

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2> Personal del Taller</h2>
                    <span className="card-subtitle">Administradores, Secretarias y Costureras (Particionamiento Vertical)</span>
                </div>
                <button onClick={handleAdd} className="btn-primario" style={{ borderRadius: '8px', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <span>+</span> Nuevo Usuario
                </button>
            </div>
            <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {msg && <div className={msg.startsWith('[OK]') ? 'pedido-exito' : 'pedido-error'} style={{ marginBottom: '1rem', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.88rem' }}>{msg}</div>}
                
                <div style={{ overflowX: 'auto' }}>
                    <table className="usuarios-tabla" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #E2E8F0' }}>
                                <th style={{ padding: '0.75rem' }}>ID</th>
                                <th style={{ padding: '0.75rem' }}>Nombre Completo</th>
                                <th style={{ padding: '0.75rem' }}>CI</th>
                                <th style={{ padding: '0.75rem' }}>Teléfono</th>
                                <th style={{ padding: '0.75rem' }}>Correo</th>
                                <th style={{ padding: '0.75rem' }}>Rol</th>
                                <th style={{ padding: '0.75rem' }}>Estado</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u) => {
                                const esYo = u.id_usuario === yoId;
                                return (
                                    <tr key={u.id_usuario} style={{ borderBottom: '1px solid #F1F5F9', background: esYo ? 'rgba(69,94,139,0.06)' : 'transparent' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#64748B' }}>#{u.id_usuario}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
                                            {u.nombre_completo || 'Sin nombre'}
                                            {esYo && <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--color-azul-oscuro)', fontWeight: 'bold' }}>(tú)</span>}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#475569' }}>{u.carnet_identidad || '-'}</td>
                                        <td style={{ padding: '0.75rem', color: '#475569' }}>{u.telefono || '-'}</td>
                                        <td style={{ padding: '0.75rem', color: '#475569' }}>{u.correo_electronico || u.correo}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span className="rol-badge" style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {u.nombre_rol}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#DCFCE7', color: '#166534', fontWeight: 600 }}>
                                                {u.estado || 'Activo'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            {!esYo ? (
                                                <div style={{ display: 'inline-flex', gap: '0.3rem' }}>
                                                    <button onClick={() => handleEditar(u)} title="Editar" style={{ background: 'var(--color-azul-claro)', color: 'var(--color-azul-oscuro)', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer' }}>✏️</button>
                                                    <button onClick={() => handleEliminar(u.id_usuario)} title="Eliminar" style={{ background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer' }}>🗑</button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)', fontStyle: 'italic' }}>Sesión actual</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalUsuario 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { cargarUsuarios(); setMsg('[OK] Operación exitosa.'); }}
                usuarioEdit={usuarioEdit}
                roles={roles}
            />
        </section>
    );
};

export default AdminUsuarios;
