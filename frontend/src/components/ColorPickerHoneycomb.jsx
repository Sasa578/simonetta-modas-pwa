import React, { useState, useEffect } from 'react';
import './ColorPickerHoneycomb.css';

// 30 Colores de Alta Costura preestablecidos (armonía con BD V2)
export const COLORES_ALTA_COSTURA = [
    { id_color: 1, nombre_color: 'Negro Azabache', codigo_hexadecimal: '#111111' },
    { id_color: 2, nombre_color: 'Blanco Puro', codigo_hexadecimal: '#FFFFFF' },
    { id_color: 3, nombre_color: 'Blanco Marfil', codigo_hexadecimal: '#FFFFF0' },
    { id_color: 4, nombre_color: 'Champán', codigo_hexadecimal: '#F7E7CE' },
    { id_color: 5, nombre_color: 'Dorado Metálico', codigo_hexadecimal: '#D4AF37' },
    { id_color: 6, nombre_color: 'Plateado Seda', codigo_hexadecimal: '#C0C0C0' },
    { id_color: 7, nombre_color: 'Bronce Cobrizo', codigo_hexadecimal: '#CD7F32' },
    { id_color: 8, nombre_color: 'Rojo Pasión', codigo_hexadecimal: '#D00000' },
    { id_color: 9, nombre_color: 'Rojo Carmesí', codigo_hexadecimal: '#990000' },
    { id_color: 10, nombre_color: 'Vino Tinto / Borgoña', codigo_hexadecimal: '#6A0D25' },
    { id_color: 11, nombre_color: 'Rosa Pastel', codigo_hexadecimal: '#F8BBD0' },
    { id_color: 12, nombre_color: 'Rosa Palo / Nude', codigo_hexadecimal: '#D8A47F' },
    { id_color: 13, nombre_color: 'Fucsia Real', codigo_hexadecimal: '#C2185B' },
    { id_color: 14, nombre_color: 'Coral Vivo', codigo_hexadecimal: '#FF6F61' },
    { id_color: 15, nombre_color: 'Terracota', codigo_hexadecimal: '#C86446' },
    { id_color: 16, nombre_color: 'Naranja Ocre', codigo_hexadecimal: '#D97706' },
    { id_color: 17, nombre_color: 'Amarillo Oro', codigo_hexadecimal: '#FBBF24' },
    { id_color: 18, nombre_color: 'Verde Esmeralda', codigo_hexadecimal: '#059669' },
    { id_color: 19, nombre_color: 'Verde Jade', codigo_hexadecimal: '#00A86B' },
    { id_color: 20, nombre_color: 'Verde Oliva', codigo_hexadecimal: '#556B2F' },
    { id_color: 21, nombre_color: 'Verde Menta', codigo_hexadecimal: '#A7F3D0' },
    { id_color: 22, nombre_color: 'Verde Salvia', codigo_hexadecimal: '#9CAF88' },
    { id_color: 23, nombre_color: 'Azul Marino Profundo', codigo_hexadecimal: '#0F172A' },
    { id_color: 24, nombre_color: 'Azul Rey / Cobalto', codigo_hexadecimal: '#1D4ED8' },
    { id_color: 25, nombre_color: 'Azul Petróleo', codigo_hexadecimal: '#0E7490' },
    { id_color: 26, nombre_color: 'Azul Celeste Cielo', codigo_hexadecimal: '#38BDF8' },
    { id_color: 27, nombre_color: 'Turquesa Intenso', codigo_hexadecimal: '#06B6D4' },
    { id_color: 28, nombre_color: 'Morado Real', codigo_hexadecimal: '#6B21A8' },
    { id_color: 29, nombre_color: 'Lavanda Lila', codigo_hexadecimal: '#C084FC' },
    { id_color: 30, nombre_color: 'Violeta Profundo', codigo_hexadecimal: '#4C1D95' }
];

// Cálculo de contraste para legibilidad de íconos
function getContrastColor(hex) {
    if (!hex) return '#ffffff';
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16) || 0;
    const g = parseInt(c.substring(2, 4), 16) || 0;
    const b = parseInt(c.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? '#0f172a' : '#ffffff';
}

const ColorPickerHoneycomb = ({
    value, // puede ser id_color, hex o nombre_color
    onChange, // ({ id_color, nombre_color, codigo_hexadecimal }) => void
    coloresList = null, // array opcional desde backend
    label = 'Color de Prenda',
    required = false,
    inline = false // si true, muestra el panal siempre visible
}) => {
    const lista = (coloresList && coloresList.length > 0) ? coloresList : COLORES_ALTA_COSTURA;
    const [desplegado, setDesplegado] = useState(inline);
    const [hoveredColor, setHoveredColor] = useState(null);

    // Resolver color seleccionado actual
    const selected = lista.find(c => {
        if (!value) return false;
        if (typeof value === 'number' || !isNaN(Number(value))) {
            return c.id_color === Number(value);
        }
        return (
            (c.codigo_hexadecimal && c.codigo_hexadecimal.toLowerCase() === String(value).toLowerCase()) ||
            (c.nombre_color && c.nombre_color.toLowerCase() === String(value).toLowerCase())
        );
    }) || lista[0]; // Default a Negro Azabache

    useEffect(() => {
        if (inline) setDesplegado(true);
    }, [inline]);

    const handleSelect = (color) => {
        if (onChange) {
            onChange(color);
        }
        if (!inline) {
            setDesplegado(false);
        }
    };

    // Estructurar los 30 colores en filas de panal alternadas (5 filas de 6 colores)
    const rows = [];
    const itemsPerRow = 6;
    for (let i = 0; i < lista.length; i += itemsPerRow) {
        rows.push(lista.slice(i, i + itemsPerRow));
    }

    const colorActivoInfo = hoveredColor || selected;

    return (
        <div className="honeycomb-picker-container">
            {label && (
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-azul-oscuro, #455E8B)' }}>
                    {label} {required && '*'}
                </label>
            )}

            {/* Tarjeta de visualización y apertura */}
            {!inline && (
                <div
                    className="honeycomb-trigger-card"
                    onClick={() => setDesplegado(!desplegado)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={desplegado}
                    title="Haga clic para elegir un color del panal de alta costura"
                >
                    <div className="honeycomb-active-preview">
                        <div
                            className="honeycomb-swatch-badge"
                            style={{ backgroundColor: selected?.codigo_hexadecimal || '#111111' }}
                        />
                        <div>
                            <span className="honeycomb-swatch-name">
                                {selected?.nombre_color || 'Seleccionar Color'}
                            </span>
                            <span className="honeycomb-swatch-hex">
                                {selected?.codigo_hexadecimal || '#111111'}
                            </span>
                        </div>
                    </div>
                    <span className={`honeycomb-chevron ${desplegado ? 'open' : ''}`}>▼</span>
                </div>
            )}

            {/* Matriz Panal de Abeja */}
            {(desplegado || inline) && (
                <div className="honeycomb-matrix-panel">
                    <div className="honeycomb-panel-header">
                        <div className="honeycomb-title">
                            <span>⬡ Paleta Panal de Abeja</span>
                            <span className="honeycomb-count-badge">{lista.length} Colores</span>
                        </div>
                        {!inline && (
                            <button
                                type="button"
                                onClick={() => setDesplegado(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="honeycomb-grid">
                        {rows.map((row, rIdx) => {
                            // Alternar sangría de filas para el efecto de panal
                            const isOddRow = rIdx % 2 !== 0;
                            return (
                                <div
                                    key={rIdx}
                                    className="honeycomb-row"
                                    style={{
                                        transform: isOddRow ? 'translateX(19px)' : 'none'
                                    }}
                                >
                                    {row.map((color) => {
                                        const isSelected = selected?.id_color === color.id_color;
                                        const textColor = getContrastColor(color.codigo_hexadecimal);

                                        return (
                                            <button
                                                key={color.id_color}
                                                type="button"
                                                className={`honeycomb-cell-btn ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleSelect(color)}
                                                onMouseEnter={() => setHoveredColor(color)}
                                                onMouseLeave={() => setHoveredColor(null)}
                                                title={`${color.nombre_color} (${color.codigo_hexadecimal})`}
                                                aria-label={color.nombre_color}
                                            >
                                                <svg
                                                    viewBox="0 0 100 115"
                                                    className="honeycomb-svg"
                                                >
                                                    <polygon
                                                        points="50 3, 97 29, 97 86, 50 112, 3 86, 3 29"
                                                        fill={color.codigo_hexadecimal}
                                                        className="honeycomb-hex-polygon"
                                                    />
                                                </svg>

                                                {isSelected && (
                                                    <span
                                                        className="honeycomb-check-icon"
                                                        style={{ color: textColor }}
                                                    >
                                                        ✓
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* Resumen del color apuntado o seleccionado */}
                    <div className="honeycomb-footer-info">
                        <div className="honeycomb-hovered-label">
                            <span
                                className="honeycomb-hovered-dot"
                                style={{ backgroundColor: colorActivoInfo?.codigo_hexadecimal || '#111' }}
                            />
                            <span>{colorActivoInfo?.nombre_color}</span>
                        </div>
                        <span className="honeycomb-swatch-hex">
                            {colorActivoInfo?.codigo_hexadecimal}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPickerHoneycomb;
