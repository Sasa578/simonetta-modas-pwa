/**
 * Helper de Sanitización y Validación de Entradas
 * Previene inyecciones SQL, scripts maliciosos (XSS) y datos inválidos
 */

const sanearTexto = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .trim()
        .replace(/<[^>]*>/g, '') // Elimina etiquetas HTML/script
        .replace(/['";=]/g, '');  // Elimina caracteres sospechosos de SQLi
};

const validarCorreo = (correo) => {
    if (!correo || typeof correo !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo.trim());
};

const validarTelefono = (telefono) => {
    if (!telefono || typeof telefono !== 'string') return false;
    // Permitir solo números y opcional signo + inicial (entre 7 y 15 dígitos)
    const limpio = telefono.trim();
    const regex = /^\+?[0-9\s-]{7,15}$/;
    return regex.test(limpio);
};

module.exports = {
    sanearTexto,
    validarCorreo,
    validarTelefono,
};
