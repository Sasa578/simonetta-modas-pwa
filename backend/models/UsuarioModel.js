const db = require('../config/db');
const bcrypt = require('bcrypt');

const UsuarioModel = {
    buscarPorCorreo: async (correo) => {
        const resultado = await db.query(
            `SELECT u.id_usuario, u.correo, u.password_hash, r.nombre_rol
             FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
             WHERE u.correo = $1`, [correo]
        );
        return resultado.rows[0] || null;
    },

    /** Lista todos los usuarios con su rol (para Admin) */
    listarTodos: async () => {
        const resultado = await db.query(
            `SELECT u.id_usuario, u.correo, u.fcm_token, r.id_rol, r.nombre_rol
             FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
             ORDER BY u.id_usuario`
        );
        return resultado.rows;
    },

    /** Crea un nuevo usuario (password hasheado) */
    crear: async ({ correo, password, id_rol }) => {
        const hash = await bcrypt.hash(password, 10);
        const resultado = await db.query(
            `INSERT INTO usuarios (correo, password_hash, id_rol) VALUES ($1, $2, $3) RETURNING id_usuario, correo`,
            [correo, hash, id_rol]
        );
        return resultado.rows[0];
    },

    /** Actualiza datos de un usuario (opcionalmente cambia password) */
    actualizar: async (id, { correo, password, id_rol }) => {
        const sets = [];
        const vals = [];
        let idx = 1;
        if (correo) { sets.push(`correo = $${idx++}`); vals.push(correo); }
        if (id_rol)  { sets.push(`id_rol = $${idx++}`); vals.push(id_rol); }
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            sets.push(`password_hash = $${idx++}`); vals.push(hash);
        }
        if (sets.length === 0) return null;
        vals.push(id);
        const resultado = await db.query(
            `UPDATE usuarios SET ${sets.join(', ')} WHERE id_usuario = $${idx} RETURNING id_usuario, correo`,
            vals
        );
        return resultado.rows[0] || null;
    },

    /** Elimina un usuario (solo si no es el último Admin) */
    eliminar: async (id) => {
        const resultado = await db.query(
            `DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario`, [id]
        );
        return resultado.rows.length > 0;
    },
};

module.exports = UsuarioModel;
