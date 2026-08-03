const db = require('../config/db');

const UsuarioModel = {
    /**
     * Busca un usuario por correo, incluyendo su rol (JOIN).
     * @param {string} correo
     * @returns {object|null} usuario con { id_usuario, correo, password_hash, nombre_rol }
     */
    buscarPorCorreo: async (correo) => {
        const resultado = await db.query(
            `SELECT u.id_usuario, u.correo, u.password_hash, r.nombre_rol
             FROM usuarios u
             JOIN roles r ON u.id_rol = r.id_rol
             WHERE u.correo = $1`,
            [correo]
        );
        return resultado.rows[0] || null;
    },
};

module.exports = UsuarioModel;
