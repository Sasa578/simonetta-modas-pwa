/**
 * Validadores y sanitizadores de datos para el backend de Simonetta Modas
 */

/**
 * Valida un campo de teléfono o WhatsApp.
 * Rechaza tajantemente la presencia de letras y exige un rango razonable de dígitos (7 a 15).
 */
const validarTelefono = (tel, campo = 'teléfono', obligatorio = false) => {
    if (!tel || typeof tel !== 'string' || !tel.trim()) {
        if (obligatorio) {
            return { valido: false, error: `El campo ${campo} es obligatorio.` };
        }
        return { valido: true, limpio: null };
    }

    const trimmed = tel.trim();

    // 1. Rechazar si contiene letras
    if (/[a-zA-Z]/.test(trimmed)) {
        return { valido: false, error: `El campo ${campo} no puede contener letras ni texto alfabético.` };
    }

    // 2. Rechazar símbolos de inyección o caracteres no telefónicos
    if (/[<>{};=*$%"'()]/.test(trimmed)) {
        return { valido: false, error: `El campo ${campo} contiene caracteres especiales no permitidos.` };
    }

    // 3. Contar la cantidad de dígitos reales
    const digitos = trimmed.replace(/\D/g, '');
    if (digitos.length < 7 || digitos.length > 15) {
        return { valido: false, error: `El campo ${campo} debe contener un número válido de entre 7 y 15 dígitos.` };
    }

    return { valido: true, limpio: trimmed };
};

/**
 * Valida un nombre o apellido.
 * Solo admite letras (incluyendo acentos y ñ) y espacios. Rechaza números y símbolos.
 */
const validarTextoAlfabetico = (texto, campo = 'nombre', obligatorio = false, minLength = 2) => {
    if (!texto || typeof texto !== 'string' || !texto.trim()) {
        if (obligatorio) {
            return { valido: false, error: `El campo ${campo} es obligatorio.` };
        }
        return { valido: true, limpio: null };
    }

    const trimmed = texto.trim();

    // 1. Rechazar números
    if (/[0-9]/.test(trimmed)) {
        return { valido: false, error: `El campo ${campo} no puede contener números.` };
    }

    // 2. Rechazar caracteres especiales
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(trimmed)) {
        return { valido: false, error: `El campo ${campo} solo debe contener letras del alfabeto y espacios.` };
    }

    // 3. Longitud mínima
    if (trimmed.length < minLength) {
        return { valido: false, error: `El campo ${campo} debe tener al menos ${minLength} caracteres.` };
    }

    return { valido: true, limpio: trimmed };
};

/**
 * Valida un Carnet de Identidad o NIT.
 * Permite números, espacios, guiones y letras de extensión departamental (ej. 1234567 LP).
 */
const validarCI = (ci, campo = 'carnet de identidad', obligatorio = false) => {
    if (!ci || typeof ci !== 'string' || !ci.trim()) {
        if (obligatorio) {
            return { valido: false, error: `El campo ${campo} es obligatorio.` };
        }
        return { valido: true, limpio: null };
    }

    const trimmed = ci.trim().toUpperCase();

    // Rechazar símbolos peligrosos
    if (/[<>{};=*$%"'()]/.test(trimmed)) {
        return { valido: false, error: `El campo ${campo} contiene caracteres inválidos.` };
    }

    // Debe contener al menos algunos dígitos
    const digitos = trimmed.replace(/\D/g, '');
    if (digitos.length < 4 || trimmed.length > 20) {
        return { valido: false, error: `El campo ${campo} debe tener un formato válido (ej. 1234567 LP).` };
    }

    return { valido: true, limpio: trimmed };
};

/**
 * Valida un correo electrónico con formato RFC.
 */
const validarEmail = (email, campo = 'correo electrónico', obligatorio = false) => {
    if (!email || typeof email !== 'string' || !email.trim()) {
        if (obligatorio) {
            return { valido: false, error: `El campo ${campo} es obligatorio.` };
        }
        return { valido: true, limpio: null };
    }

    const trimmed = email.trim().toLowerCase();
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(trimmed)) {
        return { valido: false, error: `El formato del ${campo} no es válido.` };
    }

    return { valido: true, limpio: trimmed };
};

/**
 * Valida montos monetarios o valores numéricos positivos.
 */
const validarMonto = (monto, campo = 'monto', obligatorio = false) => {
    if (monto === undefined || monto === null || monto === '') {
        if (obligatorio) {
            return { valido: false, error: `El campo ${campo} es obligatorio.` };
        }
        return { valido: true, limpio: null };
    }

    const num = Number(monto);
    if (isNaN(num)) {
        return { valido: false, error: `El campo ${campo} debe ser un valor numérico válido.` };
    }

    if (num < 0) {
        return { valido: false, error: `El campo ${campo} no puede ser negativo.` };
    }

    return { valido: true, limpio: num };
};

module.exports = {
    validarTelefono,
    validarTextoAlfabetico,
    validarCI,
    validarEmail,
    validarMonto
};
