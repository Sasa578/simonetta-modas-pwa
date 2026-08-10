import { useState, useEffect } from 'react';
import api from '../api/axios';
import '../pages/AdminDashboard.css';
import ModalAlmacen from '../components/ModalAlmacen';

const AlmacenView = ({ readOnly = false }) => {
    const [items, setItems] = useState([]);
    const [msg, setMsg] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [materialEdit, setMaterialEdit] = useState(null);

    const cargar = async () => {
        try { 
            const { data } = await api.get('/almacen'); 
            setItems(data); 
        } catch { 
            setMsg('Error al cargar almacén.'); 
        }
    };
    useEffect(() => { cargar(); }, []);

    const handleDelete = async (id) => {
        if (readOnly) return;
        if (!window.confirm('¿Eliminar este material?')) return;
        try { 
            await api.delete(`/almacen/${id}`); 
            cargar(); 
            setMsg('✅ Material eliminado.'); 
        }
        catch (err) { setMsg('❌ Error al eliminar.'); }
    };

    const handleAdd = () => {
        if (readOnly) return;
        setMaterialEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        if (readOnly) return;
        setMaterialEdit(item);
        setIsModalOpen(true);
    };

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>📦 Gestión de Almacén {readOnly && '(Solo Lectura)'}</h2>
                    <span className="card-badge">{items.length} materiales</span>
                </div>
                {!readOnly && (
                    <button onClick={handleAdd} className="btn-primario" style={{ borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        +
                    </button>
                )}
            </div>
            <div className="card-body" style={{ flex: 1, overflowY: 'auto' }}>
                {msg && <div className={msg.startsWith('✅') ? 'pedido-exito' : 'pedido-error'} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>{msg}</div>}
                
                <div style={{ overflowX: 'auto' }}>
                    <table className="usuarios-tabla">
                        <thead><tr><th>ID</th><th>Material</th><th>Cantidad</th><th>Stock Mín</th><th>Unidad</th><th>Estado</th>{!readOnly && <th>Acciones</th>}</tr></thead>
                        <tbody>
                            {items.map((item) => {
                                const bajo = item.cantidad_actual <= item.stock_minimo;
                                return (
                                    <tr key={item.id_material} className={bajo ? 'alerta-bajo' : ''}>
                                        <td>{item.id_material}</td>
                                        <td>{item.nombre_material}</td>
                                        <td>{item.cantidad_actual}</td>
                                        <td>{item.stock_minimo}</td>
                                        <td>{item.unidad_medida}</td>
                                        <td>{bajo ? <span className="stock-alerta">⚠ Bajo</span> : <span style={{ color: '#166534', fontWeight: 600, fontSize: '0.75rem' }}>✓ OK</span>}</td>
                                        {!readOnly && (
                                            <td>
                                                <button onClick={() => handleEdit(item)} style={{ background: 'var(--color-azul-claro)', color: 'var(--color-azul-oscuro)', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', marginRight: '0.3rem' }}>✏️</button>
                                                <button onClick={() => handleDelete(item.id_material)} style={{ background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>🗑</button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {!readOnly && (
                <ModalAlmacen 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => { cargar(); setMsg('✅ Almacén actualizado.'); }}
                    materialEdit={materialEdit}
                />
            )}
        </section>
    );
};

export default AlmacenView;
