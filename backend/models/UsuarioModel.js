const db = require('../config/db');
const bcrypt = require('bcrypt');

const UsuarioModel = {
    /**
     * Busca un usuario interno por su correo electrónico.
     * Une usuarios, roles, estados_usuario y datos_usuario.
     */
    buscarPorCorreo: async (correo) => {
        const resultado = await db.query(
            `SELECT u.id_usuario, u.correo_electronico, u.correo_electronico as correo,
                    u.password_hash, u.id_rol, r.nombre_rol, 
                    u.id_estado_usuario, eu.nombre_estado as estado,
                    du.id_datos_usuario, du.nombre, du.apellido,
                    TRIM(CONCAT(du.nombre, ' ', du.apellido)) as nombre_completo,
                    du.carnet_identidad, du.telefono, du.fecha_nacimiento, du.fecha_registro
             FROM usuarios u
             JOIN roles r ON u.id_rol = r.id_rol
             JOIN estados_usuario eu ON u.id_estado_usuario = eu.id_estado_usuario
             LEFT JOIN datos_usuario du ON u.id_usuario = du.id_usuario
             WHERE LOWER(u.correo_electronico) = LOWER($1)`,
            [correo]
        );
        return resultado.rows[0] || null;
    },

    /**
     * Busca un usuario interno por ID.
     */
    buscarPorId: async (id) => {
        const resultado = await db.query(
            `SELECT u.id_usuario, u.correo_electronico, u.correo_electronico as correo,
                    u.id_rol, r.nombre_rol, u.id_estado_usuario, eu.nombre_estado as estado,
                    du.id_datos_usuario, du.nombre, du.apellido,
                    TRIM(CONCAT(du.nombre, ' ', du.apellido)) as nombre_completo,
                    du.carnet_identidad, du.telefono, du.fecha_nacimiento, du.fecha_registro
             FROM usuarios u
             JOIN roles r ON u.id_rol = r.id_rol
             JOIN estados_usuario eu ON u.id_estado_usuario = eu.id_estado_usuario
             LEFT JOIN datos_usuario du ON u.id_usuario = du.id_usuario
             WHERE u.id_usuario = $1`,
            [id]
        );
        return resultado.rows[0] || null;
    },

    /**
     * Lista todos los usuarios internos con su información personal y de rol.
     */
    listarTodos: async () => {
        const resultado = await db.query(
            `SELECT u.id_usuario, u.correo_electronico, u.correo_electronico as correo,
                    u.id_rol, r.nombre_rol, u.id_estado_usuario, eu.nombre_estado as estado,
                    du.id_datos_usuario, du.nombre, du.apellido,
                    TRIM(CONCAT(du.nombre, ' ', du.apellido)) as nombre_completo,
                    du.carnet_identidad, du.telefono, du.fecha_nacimiento, du.fecha_registro
             FROM usuarios u
             JOIN roles r ON u.id_rol = r.id_rol
             JOIN estados_usuario eu ON u.id_estado_usuario = eu.id_estado_usuario
             LEFT JOIN datos_usuario du ON u.id_usuario = du.id_usuario
             ORDER BY u.id_usuario ASC`
        );
        return resultado.rows;
    },

    /**
     * Crea un nuevo usuario interno en transacción (usuarios + datos_usuario).
     */
    crear: async ({ correo, correo_electronico, password, id_rol, nombre, apellido, nombre_completo, carnet_identidad, telefono, fecha_nacimiento, id_estado_usuario = 1 }) => {
        const email = correo_electronico || correo;
        const hash = await bcrypt.hash(password, 10);

        let finalNombre = nombre;
        let finalApellido = apellido;

        if (!finalNombre && nombre_completo) {
            const parts = nombre_completo.trim().split(' ');
            finalNombre = parts[0] || '';
            finalApellido = parts.slice(1).join(' ') || '';
        }

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const uRes = await client.query(
                `INSERT INTO usuarios (id_rol, id_estado_usuario, correo_electronico, password_hash)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id_usuario, correo_electronico`,
                [id_rol, id_estado_usuario, email, hash]
            );
            const idUsuario = uRes.rows[0].id_usuario;

            const ciClean = (carnet_identidad && String(carnet_identidad).trim()) ? String(carnet_identidad).trim() : null;
            const telClean = (telefono && String(telefono).trim()) ? String(telefono).trim() : null;
            const fnClean = fecha_nacimiento ? fecha_nacimiento : null;

            await client.query(
                `INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, fecha_nacimiento, telefono)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [idUsuario, finalNombre || '', finalApellido || '', ciClean, fnClean, telClean]
            );

            await client.query('COMMIT');
            return UsuarioModel.buscarPorId(idUsuario);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Actualiza datos de un usuario (usuarios + datos_usuario) en transacción.
     */
    actualizar: async (id, { correo, correo_electronico, password, id_rol, id_estado_usuario, nombre, apellido, nombre_completo, carnet_identidad, telefono, fecha_nacimiento }) => {
        const email = correo_electronico || correo;
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Actualizar tabla usuarios si aplica
            const uSets = [];
            const uVals = [];
            let uIdx = 1;

            if (email) { uSets.push(`correo_electronico = $${uIdx++}`); uVals.push(email); }
            if (id_rol) { uSets.push(`id_rol = $${uIdx++}`); uVals.push(id_rol); }
            if (id_estado_usuario) { uSets.push(`id_estado_usuario = $${uIdx++}`); uVals.push(id_estado_usuario); }
            if (password) {
                const hash = await bcrypt.hash(password, 10);
                uSets.push(`password_hash = $${uIdx++}`);
                uVals.push(hash);
            }

            if (uSets.length > 0) {
                uVals.push(id);
                await client.query(
                    `UPDATE usuarios SET ${uSets.join(', ')} WHERE id_usuario = $${uIdx}`,
                    uVals
                );
            }

            // 2. Actualizar tabla datos_usuario si aplica
            let finalNombre = nombre;
            let finalApellido = apellido;
            if (finalNombre === undefined && nombre_completo !== undefined) {
                const parts = nombre_completo.trim().split(' ');
                finalNombre = parts[0] || '';
                finalApellido = parts.slice(1).join(' ') || '';
            }

            const dSets = [];
            const dVals = [];
            let dIdx = 1;

            if (finalNombre !== undefined) { dSets.push(`nombre = $${dIdx++}`); dVals.push(finalNombre); }
            if (finalApellido !== undefined) { dSets.push(`apellido = $${dIdx++}`); dVals.push(finalApellido); }
            if (carnet_identidad !== undefined) {
                const ciClean = (carnet_identidad && String(carnet_identidad).trim()) ? String(carnet_identidad).trim() : null;
                dSets.push(`carnet_identidad = $${dIdx++}`);
                dVals.push(ciClean);
            }
            if (telefono !== undefined) { dSets.push(`telefono = $${dIdx++}`); dVals.push(telefono); }
            if (fecha_nacimiento !== undefined) { dSets.push(`fecha_nacimiento = $${dIdx++}`); dVals.push(fecha_nacimiento); }

            if (dSets.length > 0) {
                dVals.push(id);
                // Si existe datos_usuario, actualizamos; sino insertamos
                const check = await client.query('SELECT id_datos_usuario FROM datos_usuario WHERE id_usuario = $1', [id]);
                if (check.rows.length > 0) {
                    await client.query(
                        `UPDATE datos_usuario SET ${dSets.join(', ')} WHERE id_usuario = $${dIdx}`,
                        dVals
                    );
                } else {
                    const ciInsert = (carnet_identidad && String(carnet_identidad).trim()) ? String(carnet_identidad).trim() : null;
                    await client.query(
                        `INSERT INTO datos_usuario (id_usuario, nombre, apellido, carnet_identidad, telefono, fecha_nacimiento)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [id, finalNombre || '', finalApellido || '', ciInsert, telefono || null, fecha_nacimiento || null]
                    );
                }
            }

            await client.query('COMMIT');
            return UsuarioModel.buscarPorId(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Elimina un usuario por ID. La cascada elimina datos_usuario.
     */
    eliminar: async (id) => {
        const resultado = await db.query(
            `DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario`,
            [id]
        );
        return resultado.rows.length > 0;
    }
};

module.exports = UsuarioModel;
