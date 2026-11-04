import ColorPickerHoneycomb from './ColorPickerHoneycomb';
import { filterPositiveDecimal } from '../utils/validators';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const ModalAlmacen = ({ isOpen, onClose, onSuccess, materialEdit = null }) => {
    const [catalogos, setCatalogos] = useState({
        categorias: [],
        tipos: [],
        unidades: [],
        colores: [],
        materiales: []
    });

    const [form, setForm] = useState({
        id_categoria: '',
        id_tipo_producto: '',
        nombre_articulo: '',
        cantidad_stock: '',
        stock_minimo: '',
        id_unidad_medida: '',
        id_color: '',
        id_material_base: '',
        // Especificaciones Técnicas Unificadas (V2)
        caracteristica_principal: '',
        caracteristica_secundaria: '',
        observaciones_tecnicas: ''
    });

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            cargarCatalogos();
        }
    }, [isOpen]);

    const cargarCatalogos = async () => {
        try {
            const { data } = await api.get('/almacen/catalogos');
            setCatalogos(data);

            if (materialEdit) {
                setForm({
                    id_categoria: materialEdit.id_categoria || '',
                    id_tipo_producto: materialEdit.id_tipo_producto || '',
                    nombre_articulo: materialEdit.nombre_articulo || materialEdit.nombre_material || '',
                    cantidad_stock: materialEdit.cantidad_stock !== undefined ? materialEdit.cantidad_stock : materialEdit.cantidad_actual || '',
                    stock_minimo: materialEdit.stock_minimo !== undefined ? materialEdit.stock_minimo : 0,
                    id_unidad_medida: materialEdit.id_unidad_medida || '',
                    id_color: materialEdit.id_color || '',
                    id_material_base: materialEdit.id_material_base || '',
                    caracteristica_principal: materialEdit.caracteristica_principal || materialEdit.tela_textura || materialEdit.tipo_boton || materialEdit.tipo_hilo || materialEdit.tipo_cierre || '',
                    caracteristica_secundaria: materialEdit.caracteristica_secundaria || materialEdit.tela_calidad || materialEdit.boton_tamano || materialEdit.hilo_grosor || materialEdit.cierre_tamano || '',
                    observaciones_tecnicas: materialEdit.observaciones_tecnicas || ''
                });
            } else {
                const defaultCat = data.categorias[0]?.id_categoria || '';
                const defaultTipos = data.tipos.filter(t => t.id_categoria === defaultCat);
                setForm({
                    id_categoria: defaultCat,
                    id_tipo_producto: defaultTipos[0]?.id_tipo_producto || '',
                    nombre_articulo: '',
                    cantidad_stock: '',
                    stock_minimo: '',
                    id_unidad_medida: data.unidades[0]?.id_unidad_medida || '',
                    id_color: '',
                    id_material_base: '',
                    caracteristica_principal: '',
                    caracteristica_secundaria: '',
                    observaciones_tecnicas: ''
                });
            }
            setError('');
        } catch (err) {
            console.error('Error cargando catálogos de almacén:', err);
            setError('No se pudieron cargar los catálogos.');
        }
    };

    if (!isOpen) return null;

    const handleCategoriaChange = (e) => {
        const catId = Number(e.target.value);
        const tiposFiltrados = catalogos.tipos.filter(t => t.id_categoria === catId);
        setForm(prev => ({
            ...prev,
            id_categoria: catId,
            id_tipo_producto: tiposFiltrados[0]?.id_tipo_producto || ''
        }));
    };

    const categoriaSeleccionada = catalogos.categorias.find(c => c.id_categoria === Number(form.id_categoria));
    const nombreCat = (categoriaSeleccionada?.nombre_categoria || '').toLowerCase();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const especificaciones = {
                caracteristica_principal: form.caracteristica_principal || '',
                caracteristica_secundaria: form.caracteristica_secundaria || '',
                observaciones_tecnicas: form.observaciones_tecnicas || ''
            };

            const payload = {
                nombre_articulo: form.nombre_articulo,
                cantidad_stock: parseFloat(form.cantidad_stock) || 0,
                stock_minimo: parseFloat(form.stock_minimo) || 0,
                id_tipo_producto: form.id_tipo_producto ? Number(form.id_tipo_producto) : undefined,
                id_unidad_medida: form.id_unidad_medida ? Number(form.id_unidad_medida) : undefined,
                id_color: form.id_color ? Number(form.id_color) : null,
                id_material_base: form.id_material_base ? Number(form.id_material_base) : null,
                especificaciones
            };

            if (materialEdit) {
                await api.put(`/almacen/${materialEdit.id_producto || materialEdit.id_material}`, payload);
            } else {
                await api.post('/almacen', payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar el insumo.');
        } finally {
            setCargando(false);
        }
    };

    const inputStyle = {
        padding: '0.75rem 0.9rem',
        borderRadius: '8px',
        border: '1px solid #CBD5E1',
        fontSize: '0.9rem',
        outline: 'none',
        background: '#F8FAFC'
    };

    const labelStyle = {
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#475569',
        marginBottom: '0.2rem'
    };

    const tiposDisponibles = catalogos.tipos.filter(t => !form.id_categoria || t.id_categoria === Number(form.id_categoria));

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#ffffff', padding: '2rem', borderRadius: '16px',
                width: '94%', maxWidth: '820px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.4rem' }}></span>
                        <h2 style={{ color: '#0F172A', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                            {materialEdit ? 'Editar Insumo de Almacén' : 'Nuevo Insumo de Almacén'}
                        </h2>
                    </div>
                    <button onClick={onClose} style={{
                        background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                        cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>X</button>
                </header>

                {error && (
                    <div style={{ padding: '0.75rem 1rem', marginBottom: '1.2rem', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.85rem' }}>
                        [!] {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* CATEGORÍA Y TIPO */}
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label style={labelStyle}>Categoría de Almacén *</label>
                            <select value={form.id_categoria} onChange={handleCategoriaChange} style={inputStyle} required>
                                <option value="">Selecciona categoría...</option>
                                {catalogos.categorias.map(c => (
                                    <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label style={labelStyle}>Tipo de Producto *</label>
                            <select value={form.id_tipo_producto} onChange={(e) => setForm({ ...form, id_tipo_producto: e.target.value })} style={inputStyle} required>
                                <option value="">Selecciona tipo...</option>
                                {tiposDisponibles.map(t => (
                                    <option key={t.id_tipo_producto} value={t.id_tipo_producto}>{t.nombre_tipo}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* NOMBRE DEL ARTÍCULO */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Nombre del Insumo / Artículo *</label>
                        <input
                            type="text"
                            placeholder="Ej. Gabardina Twill Azul Noche"
                            value={form.nombre_articulo}
                            onChange={(e) => setForm({ ...form, nombre_articulo: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>

                    {/* STOCK, MÍNIMO Y UNIDAD */}
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label style={labelStyle}>Stock Actual *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={form.cantidad_stock}
                                onChange={(e) => setForm({ ...form, cantidad_stock: filterPositiveDecimal(e.target.value) })}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label style={labelStyle}>Stock Mínimo Alerta *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={form.stock_minimo}
                                onChange={(e) => setForm({ ...form, stock_minimo: filterPositiveDecimal(e.target.value) })}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label style={labelStyle}>Unidad *</label>
                            <select
                                value={form.id_unidad_medida}
                                onChange={(e) => setForm({ ...form, id_unidad_medida: e.target.value })}
                                style={inputStyle}
                                required
                            >
                                <option value="">Unidad...</option>
                                {catalogos.unidades.map(u => (
                                    <option key={u.id_unidad_medida} value={u.id_unidad_medida}>
                                        {u.abreviatura} ({u.descripcion})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* COLOR (PANAL DE ABEJA) Y MATERIAL BASE */}
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <ColorPickerHoneycomb
                                value={form.id_color}
                                onChange={(col) => setForm({ ...form, id_color: col.id_color })}
                                coloresList={catalogos.colores}
                                label="Color Asociado (Panal de Abeja)"
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={labelStyle}>Material Base</label>
                            <select
                                value={form.id_material_base}
                                onChange={(e) => setForm({ ...form, id_material_base: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="">(Opcional - Sin material)</option>
                                {catalogos.materiales.map(m => (
                                    <option key={m.id_material_base} value={m.id_material_base}>
                                        {m.nombre_material}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* FICHA TÉCNICA UNIFICADA (detalles_tecnicos_producto - V2) */}
                    <div style={{
                        background: '#F8FAFC',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1.5px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-azul-oscuro, #455E8B)' }}>
                                📋 Ficha Técnica y Especificaciones de Almacén
                            </span>
                            <span style={{ fontSize: '0.72rem', background: '#E2E8F0', padding: '0.1rem 0.5rem', borderRadius: '12px', color: '#475569', fontWeight: 600 }}>
                                detalles_tecnicos_producto
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column' }}>
                                <label style={labelStyle}>Característica Principal (Textura / Calibre / Tipo)</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Sarga diagonal, 4 Ojales, Metálico #5"
                                    value={form.caracteristica_principal}
                                    onChange={(e) => setForm({ ...form, caracteristica_principal: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column' }}>
                                <label style={labelStyle}>Característica Secundaria (Calidad / Grosor / Tamaño)</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Alta densidad, No. 40, Longitud 35cm"
                                    value={form.caracteristica_secundaria}
                                    onChange={(e) => setForm({ ...form, caracteristica_secundaria: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={labelStyle}>Observaciones Técnicas y Recomendaciones de Taller</label>
                            <textarea
                                rows="2"
                                placeholder="Ej. Lavado en seco, resistente al calor, apto para vestidos de noche..."
                                value={form.observaciones_tecnicas}
                                onChange={(e) => setForm({ ...form, observaciones_tecnicas: e.target.value })}
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.6rem' }}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '0.85rem', background: '#F1F5F9', color: '#475569',
                            border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando} style={{
                            flex: 2, background: 'var(--color-azul-oscuro)', color: '#ffffff', padding: '0.85rem',
                            border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer',
                            opacity: cargando ? 0.7 : 1
                        }}>
                            {cargando ? 'Guardando...' : (materialEdit ? 'Guardar Cambios' : 'Registrar Insumo')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAlmacen;
