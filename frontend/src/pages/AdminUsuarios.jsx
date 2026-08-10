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
        if (!window.confirm('¿Eliminar este usuario?')) return;
        try { 
            await api.delete(`/usuarios/${id}`); 
            cargarUsuarios(); 
            setMsg('✅ Usuario eliminado.'); 
        } catch (err) { 
            setMsg('❌ ' + (err.response?.data?.error || 'Error al eliminar.')); 
        }
    };

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>👤 Usuarios del Sistema</h2>
                    <span className="card-subtitle">Administradores, Secretarias y Costureras</span>
                </div>
                <button onClick={handleAdd} className="btn-primario" style={{ borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    +
                </button>
            </div>
            <div className="card-body" style={{ flex: 1, overflowY: 'auto' }}>
                {msg && <div className={msg.startsWith('✅') ? 'pedido-exito' : 'pedido-error'} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>{msg}</div>}
                
                <div style={{ overflowX: 'auto' }}>
                    <table className="usuarios-tabla">
                        <thead><tr><th>ID</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {usuarios.map((u) => {
                                const esYo = u.id_usuario === yoId;
                                return (
                                    <tr key={u.id_usuario} style={esYo ? { background: 'rgba(69,94,139,0.06)' } : {}}>
                                        <td>{u.id_usuario}{esYo && ' (tú)'}</td>
                                        <td>{u.correo}</td>
                                        <td><span className="rol-badge">{u.nombre_rol}</span></td>
                                        <td>
                                            {!esYo && (
                                                <>
                                                    <button onClick={() => handleEditar(u)} style={{ background: 'var(--color-azul-claro)', color: 'var(--color-azul-oscuro)', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', marginRight: '0.3rem' }}>✏️</button>
                                                    <button onClick={() => handleEliminar(u.id_usuario)} style={{ background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>🗑</button>
                                                </>
                                            )}
                                            {esYo && <span style={{ fontSize: '0.7rem', color: 'var(--color-texto-secundario)' }}>Usuario actual</span>}
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
                onSuccess={() => { cargarUsuarios(); setMsg('✅ Operación exitosa.'); }}
                usuarioEdit={usuarioEdit}
                roles={roles}
            />
        </section>
    );
};

export default AdminUsuarios;
