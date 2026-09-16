import { useState, useEffect } from 'react';
import api from '../api/axios';
import '../pages/AdminDashboard.css';
import ModalAlmacen from '../components/ModalAlmacen';

const AlmacenView = ({ readOnly = false }) => {
    const [items, setItems] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState('Todas');
    const [filtroStockBajo, setFiltroStockBajo] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [msg, setMsg] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [materialEdit, setMaterialEdit] = useState(null);

    const cargar = async () => {
        try { 
            const [resAlmacen, resCat] = await Promise.all([
                api.get('/almacen'),
                api.get('/almacen/catalogos')
            ]);
            setItems(resAlmacen.data);
            setCategorias(resCat.data.categorias || []);
        } catch { 
            setMsg('Error al cargar inventario de almacén.'); 
        }
    };

    useEffect(() => { cargar(); }, []);

    const handleDelete = async (id) => {
        if (readOnly) return;
        if (!window.confirm('¿Eliminar este insumo del inventario?')) return;
        try { 
            await api.delete(`/almacen/${id}`); 
            cargar(); 
            setMsg('[OK] Insumo eliminado correctamente.'); 
        } catch (err) { 
            setMsg('[X] ' + (err.response?.data?.error || 'Error al eliminar el insumo.')); 
        }
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

    const itemsFiltrados = items.filter(item => {
        const stockActual = parseFloat(item.cantidad_stock !== undefined ? item.cantidad_stock : item.cantidad_actual) || 0;
        const stockMin = parseFloat(item.stock_minimo) || 0;
        const esBajo = stockActual <= stockMin;

        if (filtroStockBajo && !esBajo) return false;
        if (filtroCategoria !== 'Todas' && item.nombre_categoria !== filtroCategoria) return false;

        if (busqueda) {
            const term = busqueda.toLowerCase();
            const nom = (item.nombre_articulo || item.nombre_material || '').toLowerCase();
            const cat = (item.nombre_categoria || '').toLowerCase();
            const tipo = (item.nombre_tipo || '').toLowerCase();
            const color = (item.nombre_color || '').toLowerCase();
            if (!nom.includes(term) && !cat.includes(term) && !tipo.includes(term) && !color.includes(term)) {
                return false;
            }
        }
        return true;
    });

    return (
        <section className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* ENCABEZADO */}
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2> Almacén e Inventario de Insumos {readOnly && '(Solo Lectura)'}</h2>
                    <span className="card-subtitle">Control cuantitativo centralizado y especificaciones técnicas</span>
                </div>
                {!readOnly && (
                    <button onClick={handleAdd} className="btn-primario" style={{ borderRadius: '8px', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <span>+</span> Registrar Insumo
                    </button>
                )}
            </div>

            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid var(--color-borde)', display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Buscar insumo, categoría, tipo o color..." 
                        value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{
                            width: '100%', padding: '0.6rem 1rem', borderRadius: '8px',
                            border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none'
                        }}
                    />
                </div>

                {/* FILTRO CATEGORÍA */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setFiltroCategoria('Todas')}
                        style={{
                            padding: '0.45rem 0.8rem', borderRadius: '18px', border: '1px solid #CBD5E1',
                            background: filtroCategoria === 'Todas' ? 'var(--color-azul-oscuro)' : '#F8FAFC',
                            color: filtroCategoria === 'Todas' ? '#FFFFFF' : '#475569',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Todas
                    </button>
                    {categorias.map(c => (
                        <button
                            key={c.id_categoria}
                            onClick={() => setFiltroCategoria(c.nombre_categoria)}
                            style={{
                                padding: '0.45rem 0.8rem', borderRadius: '18px', border: '1px solid #CBD5E1',
                                background: filtroCategoria === c.nombre_categoria ? 'var(--color-azul-oscuro)' : '#F8FAFC',
                                color: filtroCategoria === c.nombre_categoria ? '#FFFFFF' : '#475569',
                                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            {c.nombre_categoria}
                        </button>
                    ))}
                    <button
                        onClick={() => setFiltroStockBajo(!filtroStockBajo)}
                        style={{
                            padding: '0.45rem 0.8rem', borderRadius: '18px',
                            border: filtroStockBajo ? '1px solid #DC2626' : '1px solid #CBD5E1',
                            background: filtroStockBajo ? '#FEF2F2' : '#F8FAFC',
                            color: filtroStockBajo ? '#DC2626' : '#475569',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        {filtroStockBajo ? '[!] Solo Stock Bajo (Activo)' : '[!] Ver Stock Bajo'}
                    </button>
                </div>
            </div>

            {/* TABLA DE INSUMOS */}
            <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {msg && <div className={msg.startsWith('[OK]') ? 'pedido-exito' : 'pedido-error'} style={{ marginBottom: '1rem', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.88rem' }}>{msg}</div>}
                
                <div style={{ overflowX: 'auto' }}>
                    <table className="usuarios-tabla" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #E2E8F0' }}>
                                <th style={{ padding: '0.75rem' }}>ID</th>
                                <th style={{ padding: '0.75rem' }}>Insumo</th>
                                <th style={{ padding: '0.75rem' }}>Categoría / Tipo</th>
                                <th style={{ padding: '0.75rem' }}>Color</th>
                                <th style={{ padding: '0.75rem' }}>Material Base</th>
                                <th style={{ padding: '0.75rem' }}>Stock</th>
                                <th style={{ padding: '0.75rem' }}>Mínimo</th>
                                <th style={{ padding: '0.75rem' }}>Estado</th>
                                {!readOnly && <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {itemsFiltrados.map((item) => {
                                const stockActual = parseFloat(item.cantidad_stock !== undefined ? item.cantidad_stock : item.cantidad_actual) || 0;
                                const stockMin = parseFloat(item.stock_minimo) || 0;
                                const bajo = stockActual <= stockMin;

                                return (
                                    <tr key={item.id_producto || item.id_material} style={{ borderBottom: '1px solid #F1F5F9', background: bajo ? '#FFFBEB' : 'transparent' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#64748B' }}>#{item.id_producto || item.id_material}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
                                            {item.nombre_articulo || item.nombre_material}
                                            {/* Sub-especificaciones en texto sutil */}
                                            {(item.tela_textura || item.boton_tamano || item.hilo_grosor || item.cierre_tamano) && (
                                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>
                                                    {item.tela_textura && `Textura: ${item.tela_textura} `}
                                                    {item.tela_calidad && `(${item.tela_calidad})`}
                                                    {item.boton_tamano && `Calibre: ${item.boton_tamano}`}
                                                    {item.hilo_grosor && `Grosor: ${item.hilo_grosor}`}
                                                    {item.cierre_tamano && `Tamaño: ${item.cierre_tamano}`}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{ display: 'inline-block', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#F1F5F9', color: '#334155', fontWeight: 600 }}>
                                                {item.nombre_categoria || 'Sin categoría'}
                                            </span>
                                            {item.nombre_tipo && (
                                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.nombre_tipo}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {item.nombre_color ? (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.codigo_hexadecimal || '#94A3B8', border: '1px solid #CBD5E1', display: 'inline-block' }}></span>
                                                    {item.nombre_color}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
                                            {item.material_base || '-'}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontWeight: 700, color: bajo ? '#B45309' : '#0F172A' }}>
                                            {stockActual} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B' }}>{item.unidad_medida || 'u'}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#64748B', fontSize: '0.85rem' }}>
                                            {stockMin} {item.unidad_medida || 'u'}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {bajo ? (
                                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                                                    [!] Stock Bajo
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#DCFCE7', color: '#166534', fontWeight: 600 }}>
                                                    ✓ Adecuado
                                                </span>
                                            )}
                                        </td>
                                        {!readOnly && (
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', gap: '0.3rem' }}>
                                                    <button onClick={() => handleEdit(item)} title="Editar" style={{ background: 'var(--color-azul-claro)', color: 'var(--color-azul-oscuro)', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer' }}>✏️</button>
                                                    <button onClick={() => handleDelete(item.id_producto || item.id_material)} title="Eliminar" style={{ background: 'var(--color-rojo-suave)', color: 'var(--color-rojo-texto)', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer' }}>🗑</button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}

                            {itemsFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={readOnly ? 8 : 9} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                                         No se encontraron insumos con el filtro seleccionado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!readOnly && (
                <ModalAlmacen 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => { cargar(); setMsg('[OK] Almacén actualizado.'); }}
                    materialEdit={materialEdit}
                />
            )}
        </section>
    );
};

export default AlmacenView;
