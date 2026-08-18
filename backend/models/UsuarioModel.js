const db = require('../config/db');
const bcrypt = require('bcrypt');

const UsuarioModel = {
    buscarPorCorreo: async (correo) => {
        const resultado = await db.query(
            `SELECT u.id_usuario, u.correo, u.password_hash, r.nombre_rol, u.nombre_completo, u.telefono, u.debe_cambiar_password
             FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
             WHERE u.correo = $1`, [correo]
        );
        return resultado.rows[0] || null;
    },

    /** Lista todos los usuarios con su rol y estado de clave inicial (para Admin) */
    listarTodos: async () => {
        const resultado = await db.query(
            `SELECT u.id_usuario, u.correo, u.fcm_token, r.id_rol, r.nombre_rol, u.nombre_completo, u.carnet_identidad, u.telefono, u.debe_cambiar_password, u.fecha_registro
             FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
             ORDER BY u.id_usuario`
        );
        return resultado.rows;
    },

    /** Crea un nuevo usuario (password hasheado) con bandera opcional de debe_cambiar_password */
    crear: async ({ correo, password, id_rol, nombre_completo, carnet_identidad, telefono, debe_cambiar_password = false }) => {
        const hash = await bcrypt.hash(password, 10);
        const resultado = await db.query(
            `INSERT INTO usuarios (correo, password_hash, id_rol, nombre_completo, carnet_identidad, telefono, debe_cambiar_password) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario, correo, debe_cambiar_password`,
            [correo, hash, id_rol, nombre_completo || null, carnet_identidad || null, telefono || null, debe_cambiar_password]
        );
        return resultado.rows[0];
    },

    /** Actualiza datos de un usuario */
    actualizar: async (id, { correo, password, id_rol, nombre_completo, carnet_identidad, telefono, debe_cambiar_password }) => {
        const sets = [];
        const vals = [];
        let idx = 1;
        if (correo) { sets.push(`correo = $${idx++}`); vals.push(correo); }
        if (id_rol)  { sets.push(`id_rol = $${idx++}`); vals.push(id_rol); }
        if (nombre_completo !== undefined) { sets.push(`nombre_completo = $${idx++}`); vals.push(nombre_completo); }
        if (carnet_identidad !== undefined) { sets.push(`carnet_identidad = $${idx++}`); vals.push(carnet_identidad); }
        if (telefono !== undefined) { sets.push(`telefono = $${idx++}`); vals.push(telefono); }
        if (debe_cambiar_password !== undefined) { sets.push(`debe_cambiar_password = $${idx++}`); vals.push(debe_cambiar_password); }
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            sets.push(`password_hash = $${idx++}`); vals.push(hash);
        }
        if (sets.length === 0) return null;
        vals.push(id);
        const resultado = await db.query(
            `UPDATE usuarios SET ${sets.join(', ')} WHERE id_usuario = $${idx} RETURNING id_usuario, correo, debe_cambiar_password`,
            vals
        );
        return resultado.rows[0] || null;
    },

    /** Actualiza contraseña inicial y desactiva debe_cambiar_password */
    actualizarPasswordInicial: async (id_usuario, nuevaPassword) => {
        const hash = await bcrypt.hash(nuevaPassword, 10);
        const resultado = await db.query(
            `UPDATE usuarios SET password_hash = $1, debe_cambiar_password = false WHERE id_usuario = $2 RETURNING id_usuario, correo, debe_cambiar_password`,
            [hash, id_usuario]
        );
        return resultado.rows[0] || null;
    },

    /** Elimina un usuario */
    eliminar: async (id) => {
        const resultado = await db.query(
            `DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario`, [id]
        );
        return resultado.rows.length > 0;
    },

    /** Registra o actualiza el FCM Token de un usuario */
    guardarFcmToken: async (id_usuario, token) => {
        await db.query(
            `UPDATE usuarios SET fcm_token = $1 WHERE id_usuario = $2`,
            [token, id_usuario]
        );
    }
};

module.exports = UsuarioModel;
