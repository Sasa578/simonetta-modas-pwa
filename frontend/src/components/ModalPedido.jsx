import ColorPickerHoneycomb, { COLORES_ALTA_COSTURA } from './ColorPickerHoneycomb';
import { filterPositiveDecimal, filterLetters, parseDecimalString, blockMathKeys } from '../utils/validators';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import '../pages/PedidoForm.css';

// Tabla Maestra de Medidas Convencionales por Rango de Edad, Género y Talla (cm)
const TABLA_MEDIDAS_CONVENCIONALES = {
    'Adulto': {
        'Mujer': {
            'XS':  { busto: 82, cintura: 62, cadera: 88, espalda: 35, hombro: 11, cortas: 38, frente: 41, alto_cadera: 18, entre_busto: 16 },
            'S':   { busto: 86, cintura: 66, cadera: 92, espalda: 36, hombro: 11.5, cortas: 40, frente: 42, alto_cadera: 19, entre_busto: 17 },
            'M':   { busto: 92, cintura: 72, cadera: 98, espalda: 37, hombro: 12, cortas: 42, frente: 44, alto_cadera: 20, entre_busto: 18 },
            'L':   { busto: 100, cintura: 80, cadera: 106, espalda: 38.5, hombro: 12.5, cortas: 43.5, frente: 46, alto_cadera: 21, entre_busto: 19 },
            'XL':  { busto: 108, cintura: 88, cadera: 114, espalda: 40, hombro: 13, cortas: 45, frente: 48, alto_cadera: 22, entre_busto: 20 },
            'XXL': { busto: 116, cintura: 96, cadera: 122, espalda: 42, hombro: 13.5, cortas: 46, frente: 50, alto_cadera: 23, entre_busto: 21 }
        },
        'Varón': {
            'XS':  { busto: 88, cintura: 74, cadera: 90, espalda: 41, hombro: 13, cortas: 43, frente: 43, alto_cadera: 20, entre_busto: 19 },
            'S':   { busto: 94, cintura: 80, cadera: 96, espalda: 43, hombro: 13.5, cortas: 44.5, frente: 45, alto_cadera: 20.5, entre_busto: 20 },
            'M':   { busto: 100, cintura: 86, cadera: 102, espalda: 45, hombro: 14, cortas: 46, frente: 47, alto_cadera: 21, entre_busto: 21 },
            'L':   { busto: 108, cintura: 94, cadera: 110, espalda: 47, hombro: 14.5, cortas: 48, frente: 49, alto_cadera: 22, entre_busto: 22 },
            'XL':  { busto: 116, cintura: 102, cadera: 118, espalda: 49, hombro: 15, cortas: 49.5, frente: 51, alto_cadera: 23, entre_busto: 23 },
            'XXL': { busto: 124, cintura: 110, cadera: 126, espalda: 51, hombro: 15.5, cortas: 51, frente: 53, alto_cadera: 24, entre_busto: 24 }
        }
    },
    'Adolescente': {
        'Mujer': {
            'XS':  { busto: 74, cintura: 56, cadera: 80, espalda: 32, hombro: 9.5, cortas: 34, frente: 36, alto_cadera: 16, entre_busto: 14 },
            'S':   { busto: 78, cintura: 60, cadera: 84, espalda: 33, hombro: 10, cortas: 36, frente: 38, alto_cadera: 17, entre_busto: 15 },
            'M':   { busto: 82, cintura: 64, cadera: 88, espalda: 34.5, hombro: 10.5, cortas: 38, frente: 40, alto_cadera: 18, entre_busto: 16 },
            'L':   { busto: 86, cintura: 68, cadera: 92, espalda: 36, hombro: 11, cortas: 40, frente: 42, alto_cadera: 19, entre_busto: 17 },
            'XL':  { busto: 92, cintura: 74, cadera: 98, espalda: 37, hombro: 11.5, cortas: 41, frente: 43, alto_cadera: 19.5, entre_busto: 18 },
            'XXL': { busto: 98, cintura: 80, cadera: 104, espalda: 38, hombro: 12, cortas: 42, frente: 44, alto_cadera: 20, entre_busto: 19 }
        },
        'Varón': {
            'XS':  { busto: 76, cintura: 64, cadera: 80, espalda: 36, hombro: 11, cortas: 38, frente: 38, alto_cadera: 17, entre_busto: 16 },
            'S':   { busto: 82, cintura: 68, cadera: 84, espalda: 38, hombro: 11.5, cortas: 40, frente: 40, alto_cadera: 18, entre_busto: 17 },
            'M':   { busto: 88, cintura: 74, cadera: 90, espalda: 40, hombro: 12, cortas: 42, frente: 42, alto_cadera: 19, entre_busto: 18 },
            'L':   { busto: 94, cintura: 80, cadera: 96, espalda: 42, hombro: 12.5, cortas: 44, frente: 44, alto_cadera: 20, entre_busto: 19 },
            'XL':  { busto: 100, cintura: 86, cadera: 102, espalda: 44, hombro: 13, cortas: 45.5, frente: 46, alto_cadera: 21, entre_busto: 20 },
            'XXL': { busto: 106, cintura: 92, cadera: 108, espalda: 46, hombro: 13.5, cortas: 47, frente: 48, alto_cadera: 21.5, entre_busto: 21 }
        }
    },
    'Niño': {
        'Mujer': {
            'XS':  { busto: 54, cintura: 50, cadera: 56, espalda: 24, hombro: 7, cortas: 24, frente: 25, alto_cadera: 12, entre_busto: 11 },
            'S':   { busto: 58, cintura: 53, cadera: 60, espalda: 25.5, hombro: 7.5, cortas: 26, frente: 27, alto_cadera: 13, entre_busto: 12 },
            'M':   { busto: 62, cintura: 56, cadera: 64, espalda: 27, hombro: 8, cortas: 28, frente: 29, alto_cadera: 14, entre_busto: 13 },
            'L':   { busto: 66, cintura: 59, cadera: 68, espalda: 28.5, hombro: 8.5, cortas: 30, frente: 31, alto_cadera: 14.5, entre_busto: 13.5 },
            'XL':  { busto: 70, cintura: 62, cadera: 72, espalda: 30, hombro: 9, cortas: 32, frente: 33, alto_cadera: 15, entre_busto: 14 },
            'XXL': { busto: 74, cintura: 65, cadera: 76, espalda: 31, hombro: 9.5, cortas: 34, frente: 35, alto_cadera: 15.5, entre_busto: 14.5 }
        },
        'Varón': {
            'XS':  { busto: 56, cintura: 52, cadera: 58, espalda: 25, hombro: 7.5, cortas: 25, frente: 26, alto_cadera: 12.5, entre_busto: 12 },
            'S':   { busto: 60, cintura: 55, cadera: 62, espalda: 26.5, hombro: 8, cortas: 27, frente: 28, alto_cadera: 13.5, entre_busto: 12.5 },
            'M':   { busto: 64, cintura: 58, cadera: 66, espalda: 28, hombro: 8.5, cortas: 29, frente: 30, alto_cadera: 14, entre_busto: 13 },
            'L':   { busto: 68, cintura: 61, cadera: 70, espalda: 29.5, hombro: 9, cortas: 31, frente: 32, alto_cadera: 15, entre_busto: 14 },
            'XL':  { busto: 72, cintura: 64, cadera: 74, espalda: 31, hombro: 9.5, cortas: 33, frente: 34, alto_cadera: 15.5, entre_busto: 14.5 },
            'XXL': { busto: 76, cintura: 67, cadera: 78, espalda: 32.5, hombro: 10, cortas: 35, frente: 36, alto_cadera: 16, entre_busto: 15 }
        }
    }
};

const OPCIONES_TIPO_INSUMO_CLIENTE = [
    'Tela Principal',
    'Tela Forro',
    'Botón / Broche',
    'Cierre / Cremallera',
    'Encaje / Tul',
    'Pedrería / Aplique',
    'Hilo Especial',
    'Cinta / Elástico',
    'Otro Insumo'
];

const OPCIONES_MATERIAL_BASE_CLIENTE = [
    'Seda Natural',
    'Raso / Satén',
    'Lino',
    'Algodón',
    'Poliéster / Sintético',
    'Lana / Paño',
    'Terciopelo',
    'Gasa / Tul',
    'Cuero / Cuerina',
    'Metálico',
    'Plástico / Resina',
    'Otro Material'
];

const ModalPedido = ({ isOpen, onClose, onSuccess, initialFecha = '', initialCliente = null }) => {
    const errorBottomRef = useRef(null);

    const [clientes, setClientes] = useState([]);
    const [costureras, setCostureras] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [metodosPago, setMetodosPago] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    // --- Datos de la Cabecera ---
    const [idCliente, setIdCliente] = useState('');
    const [idCosturera, setIdCosturera] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState(initialFecha);
    const [fechaPrueba, setFechaPrueba] = useState('');
    const [costoTotal, setCostoTotal] = useState('');
    const [adelanto, setAdelanto] = useState('');
    const [idMetodoPago, setIdMetodoPago] = useState(1);

    // --- Catálogos V2 (Prendas y Colores) ---
    const [tiposPrenda, setTiposPrenda] = useState([
        { id_tipo_prenda: 1, nombre_tipo: 'Vestido de Gala / Noche' },
        { id_tipo_prenda: 2, nombre_tipo: 'Vestido de Novia' },
        { id_tipo_prenda: 3, nombre_tipo: 'Vestido de 15 Años' },
        { id_tipo_prenda: 4, nombre_tipo: 'Traje Sastre Dama' },
        { id_tipo_prenda: 5, nombre_tipo: 'Traje Sastre Caballero' },
        { id_tipo_prenda: 6, nombre_tipo: 'Corset de Alta Costura' },
        { id_tipo_prenda: 7, nombre_tipo: 'Pollera Tradicional' },
        { id_tipo_prenda: 8, nombre_tipo: 'Blusa de Seda / Fiesta' },
        { id_tipo_prenda: 9, nombre_tipo: 'Falda Plisada / Tubo' },
        { id_tipo_prenda: 10, nombre_tipo: 'Abrigo / Chaqueta de Paño' }
    ]);
    const [colores, setColores] = useState(COLORES_ALTA_COSTURA);

    // --- Prenda & Diseño (V2) ---
    const [idTipoPrenda, setIdTipoPrenda] = useState(1);
    const [tipoPrenda, setTipoPrenda] = useState('Vestido de Gala / Noche');
    const [idColor, setIdColor] = useState(1);
    const [colorPrenda, setColorPrenda] = useState('Negro Azabache');
    const [codigoHex, setCodigoHex] = useState('#111111');
    const [notasDiseno, setNotasDiseno] = useState('');

    // --- Medidas por Pedido ---
    const [tipoMedida, setTipoMedida] = useState('convencional'); // 'convencional' | 'personalizada'
    
    // Medidas convencionales estructuradas
    const [rangoEdad, setRangoEdad] = useState('Adulto'); // 'Niño' | 'Adolescente' | 'Adulto'
    const [generoTalla, setGeneroTalla] = useState('Mujer'); // 'Mujer' | 'Varón'
    const [talla, setTalla] = useState('M');

    // 9 Medidas anatómicas personalizadas completas (cm)
    const [busto, setBusto] = useState('');
    const [cintura, setCintura] = useState('');
    const [cadera, setCadera] = useState('');
    const [espalda, setEspalda] = useState('');
    const [hombro, setHombro] = useState('');
    const [cortas, setCortas] = useState('');
    const [frente, setFrente] = useState('');
    const [altoCadera, setAltoCadera] = useState('');
    const [entreBusto, setEntreBusto] = useState('');

    const handleCambiarTipoMedida = (nuevoTipo) => {
        setTipoMedida(nuevoTipo);
        setError('');
        if (nuevoTipo === 'convencional') {
            setBusto('');
            setCintura('');
            setCadera('');
            setEspalda('');
            setHombro('');
            setCortas('');
            setFrente('');
            setAltoCadera('');
            setEntreBusto('');
            if (!talla || talla === 'A Medida') setTalla('M');
        } else {
            setTalla('A Medida');
        }
    };

    // --- Materiales e Insumos ---
    const [origenMaterial, setOrigenMaterial] = useState('Taller');
    const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
    const [insumoActualId, setInsumoActualId] = useState('');
    const [insumoActualCantidad, setInsumoActualCantidad] = useState('1');
    
    // Insumos traídos por el cliente (Mini Menú de Opciones para paridad de taller)
    const [insumosCliente, setInsumosCliente] = useState([]);
    const [itemCliente, setItemCliente] = useState({
        tipo: 'Tela Principal',
        materialBase: 'Seda Natural',
        color: '',
        cantidad: '1',
        unidad: 'Metros (m)',
        detalle: ''
    });
    const [descMaterialCliente, setDescMaterialCliente] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFechaEntrega(initialFecha);
            if (initialCliente) setIdCliente(initialCliente);
            cargarDatos();
        }
    }, [isOpen, initialFecha, initialCliente]);

    // Efecto para hacer scroll al error si ocurre
    useEffect(() => {
        if (error && errorBottomRef.current) {
            errorBottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [error]);

    const cargarDatos = async () => {
        try {
            const [resClientes, resUsuarios, resAlmacen, resPagos, resPrendas] = await Promise.all([
                api.get('/clientes'),
                api.get('/usuarios/costureras'),
                api.get('/almacen'),
                api.get('/pagos/catalogos'),
                api.get('/pedidos/catalogo-prendas').catch(() => ({ data: [] }))
            ]);
            setClientes(resClientes.data || []);
            setCostureras(resUsuarios.data || []);
            setMateriales(resAlmacen.data || []);
            if (Array.isArray(resPrendas.data) && resPrendas.data.length > 0) {
                setTiposPrenda(resPrendas.data);
            }
            const metodos = (resPagos.data?.metodos || []).filter(m => m.id_metodo_pago === 1 || m.id_metodo_pago === 2);
            setMetodosPago(metodos.length > 0 ? metodos : [
                { id_metodo_pago: 1, nombre_metodo: 'Efectivo' },
                { id_metodo_pago: 2, nombre_metodo: 'QR / Transferencia' }
            ]);
            if (!idMetodoPago) setIdMetodoPago(1);
        } catch {
            setError('No se pudieron cargar los datos auxiliares.');
        }
    };

    if (!isOpen) return null;

    const hoy = new Date().toISOString().split('T')[0];
    const costo = parseDecimalString(costoTotal);
    const adelantoFloat = parseDecimalString(adelanto);
    const saldo = Math.max(0, costo - adelantoFloat);

    // Búsqueda de stock del insumo seleccionado actualmente del taller
    const insumoSeleccionadoObj = materiales.find(m => String(m.id_material) === String(insumoActualId));
    const stockMaxInsumo = insumoSeleccionadoObj ? (parseFloat(insumoSeleccionadoObj.cantidad_actual !== undefined ? insumoSeleccionadoObj.cantidad_actual : insumoSeleccionadoObj.cantidad_stock) || 0) : 0;
    const cantActualNum = parseFloat(insumoActualCantidad) || 0;
    const hayExcesoStock = origenMaterial === 'Taller' && insumoSeleccionadoObj && cantActualNum > stockMaxInsumo;

    const agregarInsumo = () => {
        if (!insumoActualId) {
            setError('Por favor seleccione un insumo de almacén de la lista.');
            return;
        }
        const mat = materiales.find(m => String(m.id_material) === String(insumoActualId));
        if (!mat) return;
        const cant = parseDecimalString(insumoActualCantidad) || 0;
        if (cant <= 0) {
            setError('La cantidad del insumo debe ser mayor a 0.');
            return;
        }

        // 1. Control de duplicados
        const yaExiste = insumosSeleccionados.some(i => String(i.id_producto) === String(insumoActualId));
        if (yaExiste) {
            setError(`El insumo "${mat.nombre_material}" ya se encuentra en el pedido. Elimínelo de la lista inferior si desea especificar una cantidad distinta.`);
            return;
        }

        // 2. Control estricto de stock en tiempo real con alerta inmediata
        const stockDisponible = parseFloat(mat.cantidad_actual !== undefined ? mat.cantidad_actual : mat.cantidad_stock) || 0;
        if (origenMaterial === 'Taller' && cant > stockDisponible) {
            setError(`⚠️ Stock insuficiente: En almacén solo quedan ${stockDisponible} ${mat.unidad_medida || 'un'} de "${mat.nombre_material}". No se pueden solicitar ${cant} ${mat.unidad_medida || 'un'}.`);
            return;
        }

        setError('');
        setInsumosSeleccionados([
            ...insumosSeleccionados,
            {
                id_producto: mat.id_material,
                nombre_articulo: mat.nombre_material,
                cantidad: cant,
                unidad_medida: mat.unidad_medida || 'un'
            }
        ]);
        setInsumoActualId('');
        setInsumoActualCantidad('1');
    };

    const eliminarInsumo = (index) => {
        setInsumosSeleccionados(insumosSeleccionados.filter((_, idx) => idx !== index));
    };

    // Funciones para insumos traídos por el cliente (Mini Menú)
    const agregarInsumoCliente = () => {
        const cant = parseFloat(itemCliente.cantidad) || 0;
        if (cant <= 0) {
            setError('La cantidad del insumo entregado por el cliente debe ser mayor a 0.');
            return;
        }

        setError('');
        setInsumosCliente([
            ...insumosCliente,
            {
                id: Date.now(),
                tipo: itemCliente.tipo,
                materialBase: itemCliente.materialBase,
                color: itemCliente.color.trim() || 'No especificado',
                cantidad: cant,
                unidad: itemCliente.unidad,
                detalle: itemCliente.detalle.trim()
            }
        ]);

        setItemCliente(prev => ({
            ...prev,
            color: '',
            cantidad: '1',
            detalle: ''
        }));
    };

    const eliminarInsumoCliente = (id) => {
        setInsumosCliente(insumosCliente.filter(ic => ic.id !== id));
    };

    // Medidas por defecto calculadas dinámicamente según Rango de Edad, Género y Talla
    const medidasDefecto = (TABLA_MEDIDAS_CONVENCIONALES[rangoEdad]?.[generoTalla]?.[talla]) || {
        busto: 90, cintura: 70, cadera: 95, espalda: 37, hombro: 12, cortas: 40, frente: 43, alto_cadera: 20, entre_busto: 18
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');

        // 1. Validar Cliente
        if (!idCliente) {
            setError('Debe seleccionar obligatoriamente un cliente.');
            return;
        }

        // 2. Validar Costurera obligatoria
        if (!idCosturera) {
            setError('Debe seleccionar obligatoriamente una costurera para la confección del pedido.');
            return;
        }

        // 3. Validar Fecha de Entrega y Prueba
        if (!fechaEntrega) {
            setError('La fecha de entrega es obligatoria.');
            return;
        }
        if (fechaPrueba && fechaEntrega && new Date(fechaPrueba) > new Date(fechaEntrega)) {
            setError('La fecha de prueba no puede ser posterior a la fecha de entrega.');
            return;
        }

        // 4. Validar Costo estricto (> 0) y Adelanto
        if (!costo || costo <= 0) {
            setError('El costo total del pedido debe ser un monto numérico mayor a 0 Bs.');
            return;
        }
        if (adelantoFloat > costo) {
            setError('El adelanto inicial no puede ser superior al costo total del pedido.');
            return;
        }

        // 5. Validar Prenda
        if (!tipoPrenda || !tipoPrenda.trim()) {
            setError('Debe seleccionar el tipo de prenda a confeccionar.');
            return;
        }

        // 6. VALIDACIÓN ESTRICTA Y OBLIGATORIA DE MEDIDAS (Solicitud de Usuario)
        let medidasPayload = null;
        let tallaFinal = '';

        if (tipoMedida === 'personalizada') {
            const tieneMedida = [busto, cintura, cadera, espalda, hombro, cortas, frente, altoCadera, entreBusto].some(
                val => val !== '' && val !== null && parseFloat(val) > 0
            );

            if (!tieneMedida) {
                setError('⚠️ Medidas obligatorias: No se puede crear un pedido sin registrar las medidas. Por favor ingrese al menos las medidas anatómicas corporales (busto, cintura, etc.) en el formulario.');
                return;
            }

            medidasPayload = {
                busto: parseFloat(busto) || null,
                cintura: parseFloat(cintura) || null,
                cadera: parseFloat(cadera) || null,
                espalda: parseFloat(espalda) || null,
                hombro: parseFloat(hombro) || null,
                cortas: parseFloat(cortas) || null,
                frente: parseFloat(frente) || null,
                alto_cadera: parseFloat(altoCadera) || null,
                entre_busto: parseFloat(entreBusto) || null,
            };
            tallaFinal = 'A Medida';
        } else {
            if (!talla || !talla.trim()) {
                setError('Debe seleccionar una talla convencional para el pedido.');
                return;
            }
            tallaFinal = `${talla} (${rangoEdad} - ${generoTalla})`;
            // Asignar medidas corporales estándar calculadas para referencia en taller
            medidasPayload = { ...medidasDefecto };
        }

        // 7. Validar insumos y stock en tiempo real
        if (insumosSeleccionados.length > 0 && origenMaterial === 'Taller') {
            for (const ins of insumosSeleccionados) {
                const m = materiales.find(mat => String(mat.id_material) === String(ins.id_producto));
                const stockDisp = parseFloat(m ? (m.cantidad_actual !== undefined ? m.cantidad_actual : m.cantidad_stock) : 0) || 0;
                if (ins.cantidad > stockDisp) {
                    setError(`⚠️ Stock insuficiente: En almacén solo quedan ${stockDisp} ${ins.unidad_medida} de "${ins.nombre_articulo}". Cantidad en pedido: ${ins.cantidad}.`);
                    return;
                }
            }
        }

        setCargando(true);

        try {
            // Unir insumos finales del taller
            let insumosFinales = [...insumosSeleccionados];
            if (insumoActualId && origenMaterial === 'Taller') {
                const mat = materiales.find(m => String(m.id_material) === String(insumoActualId));
                const cant = parseFloat(insumoActualCantidad) || 1;
                if (mat && cant > 0 && cant <= stockMaxInsumo) {
                    const existeIdx = insumosFinales.findIndex(i => String(i.id_producto) === String(insumoActualId));
                    if (existeIdx >= 0) {
                        insumosFinales[existeIdx].cantidad = parseFloat((insumosFinales[existeIdx].cantidad + cant).toFixed(2));
                    } else {
                        insumosFinales.push({
                            id_producto: mat.id_material,
                            nombre_articulo: mat.nombre_material,
                            cantidad: cant,
                            unidad_medida: mat.unidad_medida || 'un'
                        });
                    }
                }
            }

            // Resumen de insumos del cliente estructurado
            let resumenInsumos = '';
            if (origenMaterial === 'Cliente' || insumosCliente.length > 0) {
                const itemsCliStr = insumosCliente.map(
                    ic => `${ic.tipo} [${ic.materialBase}, Color: ${ic.color}]: ${ic.cantidad} ${ic.unidad}${ic.detalle ? ` (${ic.detalle})` : ''}`
                ).join('; ');
                resumenInsumos = `Materiales traídos por cliente: ${itemsCliStr || descMaterialCliente || 'Insumos entregados en recepción'}. `;
            }
            if (insumosFinales.length > 0) {
                resumenInsumos += 'Insumos del taller: ' + insumosFinales.map(i => `${i.nombre_articulo} (${i.cantidad} ${i.unidad_medida})`).join(', ');
            }

            const notasTotales = [notasDiseno.trim(), resumenInsumos].filter(Boolean).join(' | ');

            const res = await api.post('/pedidos', {
                id_cliente: Number(idCliente),
                id_costurera: idCosturera ? Number(idCosturera) : null,
                fecha_entrega: fechaEntrega,
                fecha_prueba: fechaPrueba || null,
                costo_total: costo,
                adelanto: adelantoFloat,
                id_metodo_pago: Number(idMetodoPago),
                id_tipo_prenda: idTipoPrenda ? Number(idTipoPrenda) : 1,
                tipo_prenda: tipoPrenda.trim() || 'Vestido de Gala / Noche',
                color: colorPrenda,
                talla: tallaFinal,
                medidas_anatomicas: medidasPayload,
                notas_diseno: notasTotales.trim(),
                origen_material: origenMaterial,
                insumos: insumosFinales
            });

            const idNuevo = res.data?.id_pedido || res.data?.pedido?.id_pedido || '';
            setExito(`[OK] Pedido #${idNuevo} registrado exitosamente. Saldo: Bs. ${saldo.toFixed(2)}`);

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1200);

        } catch (err) {
            console.error('Error al registrar pedido:', err);
            const errStr = err.response?.data?.error || err.response?.data?.mensaje || err.message || 'Error al crear el pedido.';
            setError(errStr);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div className="modal-pedido-container" style={{
                background: '#ffffff', borderRadius: '16px', width: '92%', maxWidth: '900px',
                maxHeight: '92vh', overflowY: 'auto', overflowX: 'hidden', padding: '1.75rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative'
            }}>
                <style>{`
                    .modal-pedido-container select,
                    .modal-pedido-select {
                        background-color: #FFFFFF !important;
                        color: #0F172A !important;
                    }
                    .modal-pedido-container select option,
                    .modal-pedido-select option {
                        background-color: #FFFFFF !important;
                        color: #0F172A !important;
                    }
                `}</style>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>👗</span>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0F172A', fontWeight: 700 }}>
                            Registrar Nuevo Pedido de Alta Costura
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#F1F5F9', border: '1px solid #CBD5E1', width: '32px', height: '32px',
                            borderRadius: '50%', cursor: 'pointer', color: '#64748B', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                        }}
                    >
                        ✕
                    </button>
                </header>

                {/* ALERTA VISIBLE EN CABECERA */}
                {error && (
                    <div style={{
                        padding: '0.85rem 1.1rem', marginBottom: '1.2rem', borderRadius: '8px',
                        background: '#FEF2F2', border: '1.5px solid #EF4444', color: '#991B1B',
                        fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem'
                    }}>
                        <span>⚠️</span>
                        <div style={{ flex: 1 }}>{error}</div>
                        <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                )}

                {exito && (
                    <div style={{
                        padding: '0.85rem 1.1rem', marginBottom: '1.2rem', borderRadius: '8px',
                        background: '#F0FDF4', border: '1.5px solid #22C55E', color: '#166534',
                        fontSize: '0.9rem', fontWeight: 600
                    }}>
                        {exito}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* SECCIÓN 1: DATOS GENERALES Y COSTURERA */}
                    <fieldset style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                        <legend style={{ fontWeight: 700, color: 'var(--color-azul-oscuro, #455E8B)', padding: '0 0.5rem', fontSize: '0.95rem' }}>
                            1. Cliente, Costurera y Fechas
                        </legend>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Cliente *</label>
                                <select 
                                    value={idCliente} 
                                    onChange={(e) => { setIdCliente(e.target.value); setError(''); }}
                                    required 
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', marginTop: '0.2rem' }}
                                >
                                    <option value="">-- Seleccionar cliente --</option>
                                    {clientes.map(c => (
                                        <option key={c.id_cliente} value={c.id_cliente}>
                                            {c.nombre_completo || c.razon_social} (ID: #{c.id_cliente})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Costurera Asignada *</label>
                                <select 
                                    value={idCosturera} 
                                    onChange={(e) => { setIdCosturera(e.target.value); setError(''); }}
                                    required 
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', marginTop: '0.2rem' }}
                                >
                                    <option value="">-- Seleccionar costurera --</option>
                                    {costureras.map(u => (
                                        <option key={u.id_usuario} value={u.id_usuario}>
                                            🧵 {u.nombre || u.correo} ({u.nombre_rol || 'Costurera'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Fecha Entrega *</label>
                                <input 
                                    type="date" 
                                    min={hoy}
                                    value={fechaEntrega} 
                                    onChange={(e) => { setFechaEntrega(e.target.value); setError(''); }}
                                    required 
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', marginTop: '0.2rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Fecha Prueba (Opcional)</label>
                                <input 
                                    type="date" 
                                    min={hoy}
                                    max={fechaEntrega || undefined}
                                    value={fechaPrueba} 
                                    onChange={(e) => { setFechaPrueba(e.target.value); setError(''); }}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', marginTop: '0.2rem' }}
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* SECCIÓN 2: PRENDA Y COLOR (PANAL DE ABEJA) */}
                    <fieldset style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                        <legend style={{ fontWeight: 700, color: 'var(--color-azul-oscuro, #455E8B)', padding: '0 0.5rem', fontSize: '0.95rem' }}>
                            2. Prenda de Alta Costura y Color
                        </legend>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'flex-start' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Tipo de Prenda Confeccionable *</label>
                                <select 
                                    value={idTipoPrenda} 
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        setIdTipoPrenda(id);
                                        const found = tiposPrenda.find(t => t.id_tipo_prenda === id);
                                        if (found) setTipoPrenda(found.nombre_tipo);
                                    }}
                                    required
                                    className="modal-pedido-select"
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.65rem 0.75rem', 
                                        borderRadius: '6px', 
                                        border: '1.5px solid #CBD5E1', 
                                        marginTop: '0.2rem',
                                        backgroundColor: '#FFFFFF',
                                        color: '#0F172A',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {tiposPrenda.map(t => (
                                        <option 
                                            key={t.id_tipo_prenda} 
                                            value={t.id_tipo_prenda}
                                            style={{ backgroundColor: '#FFFFFF', color: '#0F172A', fontWeight: 600 }}
                                        >
                                            👗 {t.nombre_tipo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <ColorPickerHoneycomb
                                    value={idColor}
                                    onChange={(col) => {
                                        setIdColor(col.id_color);
                                        setColorPrenda(col.nombre_color);
                                        setCodigoHex(col.codigo_hex);
                                    }}
                                    coloresList={colores}
                                    label="Color Principal (30 Tonos)"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* SECCIÓN 3: MEDIDAS (CONVENCIONALES POR EDAD/GÉNERO VS 9 MEDIDAS ANATÓMICAS) */}
                    <fieldset style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                        <legend style={{ fontWeight: 700, color: 'var(--color-azul-oscuro, #455E8B)', padding: '0 0.5rem', fontSize: '0.95rem' }}>
                            3. Sistema de Medidas del Pedido (Obligatorio)
                        </legend>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <label style={{
                                flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem',
                                borderRadius: '8px', border: tipoMedida === 'convencional' ? '2px solid var(--color-azul-oscuro)' : '1px solid #CBD5E1',
                                background: tipoMedida === 'convencional' ? '#F0F9FF' : '#FFFFFF', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
                            }}>
                                <input 
                                    type="radio" 
                                    name="tipoMedida" 
                                    value="convencional" 
                                    checked={tipoMedida === 'convencional'} 
                                    onChange={() => handleCambiarTipoMedida('convencional')} 
                                />
                                <span>📏 Medidas Convencionales por Talla</span>
                            </label>

                            <label style={{
                                flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem',
                                borderRadius: '8px', border: tipoMedida === 'personalizada' ? '2px solid var(--color-azul-oscuro)' : '1px solid #CBD5E1',
                                background: tipoMedida === 'personalizada' ? '#F0F9FF' : '#FFFFFF', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
                            }}>
                                <input 
                                    type="radio" 
                                    name="tipoMedida" 
                                    value="personalizada" 
                                    checked={tipoMedida === 'personalizada'} 
                                    onChange={() => handleCambiarTipoMedida('personalizada')} 
                                />
                                <span>✂️ Medidas Personalizadas (9 Puntos Anatómicos)</span>
                            </label>
                        </div>

                        {/* MODO CONVENCIONAL: RANGO DE EDAD + GÉNERO + TALLA + MEDIDAS POR DEFECTO */}
                        {tipoMedida === 'convencional' && (
                            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                                            Rango de Edad *
                                        </label>
                                        <select
                                            value={rangoEdad}
                                            onChange={(e) => setRangoEdad(e.target.value)}
                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 600 }}
                                        >
                                            <option value="Adulto">Adulto</option>
                                            <option value="Adolescente">Adolescente</option>
                                            <option value="Niño">Niño</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                                            Género de Confección *
                                        </label>
                                        <select
                                            value={generoTalla}
                                            onChange={(e) => setGeneroTalla(e.target.value)}
                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 600 }}
                                        >
                                            <option value="Mujer">Mujer</option>
                                            <option value="Varón">Varón</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                                            Talla Estándar *
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setTalla(t)}
                                                    style={{
                                                        padding: '0.45rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem',
                                                        border: talla === t ? '2px solid var(--color-azul-oscuro)' : '1px solid #CBD5E1',
                                                        background: talla === t ? 'var(--color-azul-oscuro)' : '#F8FAFC',
                                                        color: talla === t ? '#FFFFFF' : '#334155', cursor: 'pointer'
                                                    }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* PREVIEW DE MEDIDAS POR DEFECTO PARA LA COMBINACIÓN SELECCIONADA */}
                                <div style={{ background: '#F8FAFC', padding: '0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-azul-oscuro, #455E8B)' }}>
                                            📐 Medidas Corporales Industriales Calculadas ({rangoEdad} - {generoTalla} - Talla {talla}):
                                        </span>
                                        <span style={{ fontSize: '0.72rem', background: '#EEF2FF', color: '#3730A3', padding: '0.1rem 0.45rem', borderRadius: '12px', fontWeight: 600 }}>
                                            Valores en cm
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '0.4rem', fontSize: '0.78rem' }}>
                                        <div style={{ background: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                            <span style={{ color: '#64748B' }}>Busto/Pecho:</span> <strong>{medidasDefecto.busto} cm</strong>
                                        </div>
                                        <div style={{ background: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                            <span style={{ color: '#64748B' }}>Cintura:</span> <strong>{medidasDefecto.cintura} cm</strong>
                                        </div>
                                        <div style={{ background: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                            <span style={{ color: '#64748B' }}>Cadera:</span> <strong>{medidasDefecto.cadera} cm</strong>
                                        </div>
                                        <div style={{ background: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                            <span style={{ color: '#64748B' }}>Espalda:</span> <strong>{medidasDefecto.espalda} cm</strong>
                                        </div>
                                        <div style={{ background: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                            <span style={{ color: '#64748B' }}>Hombro:</span> <strong>{medidasDefecto.hombro} cm</strong>
                                        </div>
                                        <div style={{ background: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                            <span style={{ color: '#64748B' }}>Largo/Talle:</span> <strong>{medidasDefecto.cortas} cm</strong>
                                        </div>
                                        <div style={{ background: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                            <span style={{ color: '#64748B' }}>Frente:</span> <strong>{medidasDefecto.frente} cm</strong>
                                        </div>
                                        <div style={{ background: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                            <span style={{ color: '#64748B' }}>Alto Cadera:</span> <strong>{medidasDefecto.alto_cadera} cm</strong>
                                        </div>
                                        <div style={{ background: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                            <span style={{ color: '#64748B' }}>Entre Busto:</span> <strong>{medidasDefecto.entre_busto} cm</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODO PERSONALIZADO: 9 CAMPOS ANATÓMICOS COMPLETOS */}
                        {tipoMedida === 'personalizada' && (
                            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.6rem', color: '#1E293B' }}>
                                    9 Medidas Anatómicas de Patronaje (cm) *
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>1. Busto / Pecho</label>
                                        <input type="number" step="0.5" placeholder="cm" value={busto} onChange={(e) => { setBusto(filterPositiveDecimal(e.target.value)); setError(''); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>2. Cintura</label>
                                        <input type="number" step="0.5" placeholder="cm" value={cintura} onChange={(e) => { setCintura(filterPositiveDecimal(e.target.value)); setError(''); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>3. Cadera</label>
                                        <input type="number" step="0.5" placeholder="cm" value={cadera} onChange={(e) => { setCadera(filterPositiveDecimal(e.target.value)); setError(''); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>4. Espalda</label>
                                        <input type="number" step="0.5" placeholder="cm" value={espalda} onChange={(e) => { setEspalda(filterPositiveDecimal(e.target.value)); setError(''); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>5. Hombro</label>
                                        <input type="number" step="0.5" placeholder="cm" value={hombro} onChange={(e) => { setHombro(filterPositiveDecimal(e.target.value)); setError(''); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>6. Largo / Talle</label>
                                        <input type="number" step="0.5" placeholder="cm" value={cortas} onChange={(e) => { setCortas(filterPositiveDecimal(e.target.value)); setError(''); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>7. Frente (Delantero)</label>
                                        <input type="number" step="0.5" placeholder="cm" value={frente} onChange={(e) => { setFrente(filterPositiveDecimal(e.target.value)); setError(''); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>8. Alto de Cadera</label>
                                        <input type="number" step="0.5" placeholder="cm" value={altoCadera} onChange={(e) => { setAltoCadera(filterPositiveDecimal(e.target.value)); setError(''); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>9. Entre Busto</label>
                                        <input type="number" step="0.5" placeholder="cm" value={entreBusto} onChange={(e) => { setEntreBusto(filterPositiveDecimal(e.target.value)); setError(''); }} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </fieldset>

                    {/* SECCIÓN 4: MATERIALES (TALLER VS TRAÍDOS POR CLIENTE MINI-MENÚ) */}
                    <fieldset style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                        <legend style={{ fontWeight: 700, color: 'var(--color-azul-oscuro, #455E8B)', padding: '0 0.5rem', fontSize: '0.95rem' }}>
                            4. Insumos y Materiales de Confección
                        </legend>

                        <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                                <input type="radio" value="Taller" checked={origenMaterial === 'Taller'} onChange={(e) => { setOrigenMaterial(e.target.value); setError(''); }} /> 
                                Suministrados por el Taller
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                                <input type="radio" value="Cliente" checked={origenMaterial === 'Cliente'} onChange={(e) => { setOrigenMaterial(e.target.value); setError(''); }} /> 
                                Traídos por el Cliente
                            </label>
                        </div>

                        {/* MINI-MENÚ DE INSUMOS TRAÍDOS POR EL CLIENTE (Paridad con Almacén de Taller) */}
                        {origenMaterial === 'Cliente' && (
                            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #C7D2FE', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                    <span style={{ fontSize: '1.1rem' }}>🛍️</span>
                                    <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#3730A3' }}>
                                        Mini-Menú de Materiales Provistos por el Cliente
                                    </label>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.6rem', alignItems: 'flex-end' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Tipo de Insumo *</label>
                                        <select
                                            value={itemCliente.tipo}
                                            onChange={(e) => setItemCliente({ ...itemCliente, tipo: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                                        >
                                            {OPCIONES_TIPO_INSUMO_CLIENTE.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Material Base *</label>
                                        <select
                                            value={itemCliente.materialBase}
                                            onChange={(e) => setItemCliente({ ...itemCliente, materialBase: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                                        >
                                            {OPCIONES_MATERIAL_BASE_CLIENTE.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Color / Tono</label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Azul marino"
                                            value={itemCliente.color}
                                            onChange={(e) => setItemCliente({ ...itemCliente, color: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Cantidad *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            placeholder="1"
                                            value={itemCliente.cantidad}
                                            onChange={(e) => setItemCliente({ ...itemCliente, cantidad: filterPositiveDecimal(e.target.value) })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Unidad *</label>
                                        <select
                                            value={itemCliente.unidad}
                                            onChange={(e) => setItemCliente({ ...itemCliente, unidad: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                                        >
                                            <option value="Metros (m)">Metros (m)</option>
                                            <option value="Unidades (un)">Unidades (un)</option>
                                            <option value="Piezas">Piezas</option>
                                            <option value="Rollos">Rollos</option>
                                            <option value="Centímetros (cm)">Centímetros (cm)</option>
                                        </select>
                                    </div>

                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Detalle u Observación (Opcional)</label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Brocado con hilos dorados, comprado en tienda X"
                                            value={itemCliente.detalle}
                                            onChange={(e) => setItemCliente({ ...itemCliente, detalle: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            onClick={agregarInsumoCliente}
                                            style={{
                                                width: '100%', padding: '0.55rem', background: '#3730A3', color: '#fff',
                                                border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                                            }}
                                        >
                                            + Agregar Insumo Cliente
                                        </button>
                                    </div>
                                </div>

                                {/* LISTA DE INSUMOS DEL CLIENTE REGISTRADOS */}
                                {insumosCliente.length > 0 && (
                                    <div style={{ marginTop: '0.8rem', borderTop: '1px solid #E0E7FF', paddingTop: '0.6rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                                            Insumos del Cliente Agregados a este Pedido:
                                        </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                            {insumosCliente.map(ic => (
                                                <div key={ic.id} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '0.45rem 0.75rem', background: '#EEF2FF', borderRadius: '6px', border: '1px solid #C7D2FE', fontSize: '0.82rem'
                                                }}>
                                                    <div>
                                                        <strong style={{ color: '#1E1B4B' }}>[Traído por Cliente] {ic.tipo}</strong> ({ic.materialBase}) — {ic.cantidad} {ic.unidad}
                                                        {ic.color !== 'No especificado' && <span> • Color: {ic.color}</span>}
                                                        {ic.detalle && <small style={{ color: '#6366F1', display: 'block' }}>Nota: {ic.detalle}</small>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarInsumoCliente(ic.id)}
                                                        style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}
                                                    >
                                                        ✕ Quitar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SELECTOR DE INSUMOS DEL TALLER CON CONTROL DE STOCK ESTRICTO */}
                        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-borde)' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
                                Agregar Insumos del Almacén del Taller:
                            </label>
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <div style={{ flex: '3 1 240px' }}>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--color-texto-secundario)' }}>Producto / Insumo</label>
                                    <select 
                                        value={insumoActualId} 
                                        onChange={(e) => {
                                            setInsumoActualId(e.target.value);
                                            setError('');
                                        }}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', fontSize: '0.85rem' }}
                                    >
                                        <option value="">-- Seleccionar insumo del taller --</option>
                                        {materiales.map(m => {
                                            const yaAgregado = insumosSeleccionados.some(i => String(i.id_producto) === String(m.id_material));
                                            const stockVal = parseFloat(m.cantidad_actual !== undefined ? m.cantidad_actual : m.cantidad_stock) || 0;
                                            return (
                                                <option key={m.id_material} value={m.id_material} disabled={yaAgregado}>
                                                    {m.nombre_material} [Stock: {stockVal} {m.unidad_medida || 'un'}]{yaAgregado ? ' — (Ya agregado)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    
                                    {insumoSeleccionadoObj && origenMaterial === 'Taller' && (
                                        <div style={{ fontSize: '0.76rem', color: stockMaxInsumo > 0 ? '#059669' : '#dc2626', fontWeight: 600, marginTop: '0.25rem' }}>
                                            📦 Stock disponible: <strong>{stockMaxInsumo} {insumoSeleccionadoObj.unidad_medida || 'un'}</strong>
                                            {stockMaxInsumo <= 0 && <span style={{ color: '#dc2626', marginLeft: '0.4rem' }}>[AGOTADO]</span>}
                                        </div>
                                    )}
                                </div>

                                <div style={{ flex: '1 1 110px' }}>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--color-texto-secundario)' }}>Cantidad</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0.01"
                                        value={insumoActualCantidad} 
                                        onChange={(e) => {
                                            const val = filterPositiveDecimal(e.target.value);
                                            setInsumoActualCantidad(val);
                                            const num = parseFloat(val) || 0;
                                            if (origenMaterial === 'Taller' && insumoSeleccionadoObj && num > stockMaxInsumo) {
                                                setError(`⚠️ Exceso de stock: Solo quedan ${stockMaxInsumo} ${insumoSeleccionadoObj.unidad_medida || 'un'} en almacén. La cantidad ingresada (${num}) sobrepasa las existencias.`);
                                            } else {
                                                setError('');
                                            }
                                        }}
                                        style={{
                                            width: '100%', padding: '0.6rem', borderRadius: '6px',
                                            border: hayExcesoStock ? '2px solid #EF4444' : '1px solid var(--color-borde)',
                                            fontSize: '0.85rem', boxSizing: 'border-box'
                                        }}
                                    />
                                    {hayExcesoStock && (
                                        <div style={{ color: '#DC2626', fontSize: '0.72rem', fontWeight: 700, marginTop: '0.15rem' }}>
                                            ⚠️ Supera stock ({stockMaxInsumo} máx)
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <button 
                                        type="button" 
                                        onClick={agregarInsumo}
                                        style={{
                                            padding: '0.6rem 1.1rem', background: '#3b82f6', color: '#fff',
                                            border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                                        }}
                                    >
                                        + Agregar Insumo
                                    </button>
                                </div>
                            </div>

                            {/* Lista de Insumos del Taller Seleccionados */}
                            {insumosSeleccionados.length > 0 && (
                                <div style={{ marginTop: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                                        Insumos del taller seleccionados:
                                    </span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {insumosSeleccionados.map((ins, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                                <span>• <strong>{ins.nombre_articulo}</strong>: {ins.cantidad} {ins.unidad_medida}</span>
                                                <button type="button" onClick={() => eliminarInsumo(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* SECCIÓN 5: DISEÑO Y PAGOS */}
                    <fieldset style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', background: '#F8FAFC' }}>
                        <legend style={{ fontWeight: 700, color: 'var(--color-azul-oscuro, #455E8B)', padding: '0 0.5rem', fontSize: '0.95rem' }}>
                            5. Costos, Adelanto y Notas de Diseño
                        </legend>
                        <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Instrucciones y Notas de Diseño para Confección</label>
                            <textarea 
                                rows="2" 
                                placeholder="Detalles de patronaje, pinzas, tipo de mangas, largo de falda..."
                                value={notasDiseno} 
                                onChange={(e) => setNotasDiseno(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-borde)', marginTop: '0.3rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.8rem', marginTop: '0.8rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Costo Total (Bs.) *</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={costoTotal}
                                    onKeyDown={blockMathKeys}
                                    onChange={(e) => {
                                        setCostoTotal(filterPositiveDecimal(e.target.value));
                                        setError('');
                                    }}
                                    required
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Adelanto Inicial (Bs.)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={adelanto}
                                    onKeyDown={blockMathKeys}
                                    onChange={(e) => {
                                        setAdelanto(filterPositiveDecimal(e.target.value));
                                        setError('');
                                    }}
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Método de Adelanto</label>
                                <select value={idMetodoPago} onChange={(e) => setIdMetodoPago(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--color-borde)', boxSizing: 'border-box' }}>
                                    {metodosPago.map(m => <option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre_metodo}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '0.8rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', color: saldo > 0 ? 'var(--color-rojo-texto)' : 'var(--color-verde)' }}>
                            Saldo a cobrar al entregar: Bs. {saldo.toFixed(2)}
                        </div>
                    </fieldset>

                    {/* ALERTA INTUITIVA Y VISIBLE JUSTO ENCIMA DE LA ACCIÓN DE CREAR PEDIDO (Sticky / Destacada) */}
                    {error && (
                        <div ref={errorBottomRef} style={{
                            padding: '0.9rem 1.25rem',
                            background: '#FEF2F2',
                            border: '2px solid #EF4444',
                            borderRadius: '10px',
                            color: '#991B1B',
                            fontSize: '0.92rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.18)'
                        }}>
                            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
                            <div style={{ flex: 1 }}>{error}</div>
                            <button
                                type="button"
                                onClick={() => setError('')}
                                style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={cargando} 
                        style={{
                            background: 'var(--color-azul-oscuro)', color: '#fff', padding: '0.95rem',
                            border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.05rem',
                            cursor: cargando ? 'not-allowed' : 'pointer', opacity: cargando ? 0.75 : 1,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        {cargando ? 'Registrando Pedido...' : 'Confirmar y Crear Pedido'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalPedido;
