/**
 * Utilidades de validación y sanitización en tiempo real para Simonetta Modas
 */

/**
 * Permite únicamente letras (incluyendo acentos, diéresis y ñ) y espacios.
 * Ideal para: nombres, apellidos, nombres de contacto, colores y prendas.
 */
export const filterLetters = (val) => {
    if (typeof val !== 'string') return '';
    return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
};

/**
 * Permite únicamente números, espacios y un '+' opcional al principio.
 * Bloquea estrictamente el ingreso de letras o caracteres especiales.
 * Ideal para: teléfonos, WhatsApp, celular.
 */
export const filterPhone = (val) => {
    if (typeof val !== 'string') return '';
    const hasPlus = val.startsWith('+');
    const cleaned = val.replace(/[^0-9\s]/g, '');
    return hasPlus ? `+${cleaned}` : cleaned;
};

/**
 * Permite números, letras de extensión departamental (LP, CB, etc.) y guiones.
 * Bloquea símbolos extraños o caracteres de inyección.
 * Ideal para: Carnet de Identidad (CI), NIT.
 */
export const filterCI = (val) => {
    if (typeof val !== 'string') return '';
    return val.replace(/[^0-9a-zA-Z\s-]/g, '').toUpperCase();
};

/**
 * Permite únicamente números positivos y hasta un solo punto decimal.
 * Bloquea letras, signos negativos y múltiples puntos.
 * Ideal para: montos de dinero, adelantos, precios, medidas anatómicas.
 */
export const filterPositiveDecimal = (val) => {
    if (typeof val !== 'string' && typeof val !== 'number') return '';
    const str = String(val).replace(/[^0-9.]/g, '');
    const parts = str.split('.');
    if (parts.length > 2) {
        return `${parts[0]}.${parts.slice(1).join('')}`;
    }
    return str;
};

/**
 * Permite únicamente dígitos enteros (0-9).
 * Ideal para: cantidades de stock, unidades enteras.
 */
export const filterInteger = (val) => {
    if (typeof val !== 'string' && typeof val !== 'number') return '';
    return String(val).replace(/[^0-9]/g, '');
};

/**
 * Valida si un correo electrónico cumple la estructura estándar RFC
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
};

/**
 * Valida si un número telefónico tiene una cantidad razonable de dígitos (mínimo 7)
 */
export const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
};
