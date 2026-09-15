const db = require('../config/db');
const bcrypt = require('bcrypt');

const ClienteModel = {
    /**
     * Busca un cliente por su correo electrónico.
     * Retorna datos de autenticación y de su subtipo (persona o institucional).
     */
    buscarPorCorreo: async (correo) => {
        const resultado = await db.query(
            `SELECT c.id_cliente, c.id_tipo_cliente, tc.nombre_tipo as tipo_cliente,
                    c.id_rol, r.nombre_rol, c.id_estado_cliente, ec.nombre_estado as estado,
                    c.correo_electronico, c.correo_electronico as correo, c.password_hash, c.fecha_registro,
                    -- Subtipo Persona
                    dp.id_datos_persona, dp.nombre, dp.apellido,
                    TRIM(CONCAT(dp.nombre, ' ', dp.apellido)) as nombre_persona,
                    dp.telefono as telefono_persona, dp.fecha_nacimiento,
                    -- Subtipo Institucional
                    di.id_datos_institucional, di.razon_social, di.nit,
                    di.nombre_contacto, di.telefono_contacto,
                    -- Campo unificado para presentación
                    COALESCE(NULLIF(TRIM(CONCAT(dp.nombre, ' ', dp.apellido)), ''), di.razon_social) as nombre_completo,
                    COALESCE(dp.telefono, di.telefono_contacto) as telefono_whatsapp,
                    COALESCE(dp.telefono, di.telefono_contacto) as telefono,
                    di.nit as carnet_identidad
             FROM clientes c
             JOIN roles r ON c.id_rol = r.id_rol
             JOIN estados_cliente ec ON c.id_estado_cliente = ec.id_estado_cliente
             JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
             LEFT JOIN datos_cliente_persona dp ON c.id_cliente = dp.id_cliente
             LEFT JOIN datos_cliente_institucional di ON c.id_cliente = di.id_cliente
             WHERE LOWER(c.correo_electronico) = LOWER($1)`,
            [correo]
        );
        return resultado.rows[0] || null;
    },

    /**
     * Busca un cliente por ID incluyendo sus datos de subtipo y atributos.
     */
    buscarPorId: async (id) => {
        const clienteRes = await db.query(
            `SELECT c.id_cliente, c.id_tipo_cliente, tc.nombre_tipo as tipo_cliente,
                    c.id_rol, r.nombre_rol, c.id_estado_cliente, ec.nombre_estado as estado,
                    c.correo_electronico, c.correo_electronico as correo, c.fecha_registro,
                    -- Subtipo Persona
                    dp.id_datos_persona, dp.nombre, dp.apellido,
                    TRIM(CONCAT(dp.nombre, ' ', dp.apellido)) as nombre_persona,
                    dp.telefono as telefono_persona, dp.fecha_nacimiento,
                    -- Subtipo Institucional
                    di.id_datos_institucional, di.razon_social, di.nit,
                    di.nombre_contacto, di.telefono_contacto,
                    -- Unificados
                    COALESCE(NULLIF(TRIM(CONCAT(dp.nombre, ' ', dp.apellido)), ''), di.razon_social) as nombre_completo,
                    COALESCE(dp.telefono, di.telefono_contacto) as telefono_whatsapp,
                    COALESCE(dp.telefono, di.telefono_contacto) as telefono,
                    di.nit as carnet_identidad
             FROM clientes c
             JOIN roles r ON c.id_rol = r.id_rol
             JOIN estados_cliente ec ON c.id_estado_cliente = ec.id_estado_cliente
             JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
             LEFT JOIN datos_cliente_persona dp ON c.id_cliente = dp.id_cliente
             LEFT JOIN datos_cliente_institucional di ON c.id_cliente = di.id_cliente
             WHERE c.id_cliente = $1`,
            [id]
        );

        if (clienteRes.rows.length === 0) return null;
        const cliente = clienteRes.rows[0];

        // Atributos dinámicos del cliente
        const attrRes = await db.query(
            `SELECT id_atributo_cliente, nombre_atributo, valor_atributo
             FROM atributos_cliente WHERE id_cliente = $1`,
            [id]
        );
        cliente.atributos = attrRes.rows;

        // Si es institucional, cargar contratos
        if (cliente.id_datos_institucional) {
            const contratosRes = await db.query(
                `SELECT id_contrato, numero_contrato, fecha_firma, fecha_vencimiento, url_clausulas_pdf
                 FROM contratos WHERE id_datos_institucional = $1`,
                [cliente.id_datos_institucional]
            );
            cliente.contratos = contratosRes.rows;
        }

        return cliente;
    },

    /**
     * Lista todos los clientes unificando personas e instituciones.
     */
    listarTodos: async () => {
        const resultado = await db.query(
            `SELECT c.id_cliente, c.id_tipo_cliente, tc.nombre_tipo as tipo_cliente,
                    c.id_rol, r.nombre_rol, c.id_estado_cliente, ec.nombre_estado as estado,
                    c.correo_electronico, c.correo_electronico as correo, c.fecha_registro,
                    -- Subtipo Persona
                    dp.nombre, dp.apellido, dp.telefono as telefono_persona, dp.fecha_nacimiento,
                    -- Subtipo Institucional
                    di.razon_social, di.nit, di.nombre_contacto, di.telefono_contacto,
                    -- Unificados
                    COALESCE(NULLIF(TRIM(CONCAT(dp.nombre, ' ', dp.apellido)), ''), di.razon_social) as nombre_completo,
                    COALESCE(dp.telefono, di.telefono_contacto) as telefono_whatsapp,
                    COALESCE(dp.telefono, di.telefono_contacto) as telefono,
                    di.nit as carnet_identidad,
                    -- Contrato vigente si aplica
                    (SELECT numero_contrato FROM contratos WHERE id_datos_institucional = di.id_datos_institucional ORDER BY id_contrato DESC LIMIT 1) as numero_contrato
             FROM clientes c
             JOIN roles r ON c.id_rol = r.id_rol
             JOIN estados_cliente ec ON c.id_estado_cliente = ec.id_estado_cliente
             JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
             LEFT JOIN datos_cliente_persona dp ON c.id_cliente = dp.id_cliente
             LEFT JOIN datos_cliente_institucional di ON c.id_cliente = di.id_cliente
             ORDER BY c.id_cliente DESC`
        );
        return resultado.rows;
    },

    /**
     * Crea un cliente con soporte para subtipo Persona o Institucional.
     */
    crear: async ({
        id_tipo_cliente = 1, // 1: Persona, 2: Institucional
        tipo_cliente = 'Persona',
        correo_electronico,
        correo,
        password = 'password123',
        // Campos Persona
        nombre,
        apellido,
        nombre_completo,
        telefono,
        telefono_whatsapp,
        carnet_identidad,
        fecha_nacimiento,
        // Campos Institucional
        razon_social,
        nit,
        nombre_contacto,
        telefono_contacto,
        // Atributos y Contratos
        atributos = [],
        contrato = null
    }) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const email = (correo_electronico || correo || `cliente_${Date.now()}@simonetta.local`).toLowerCase().trim();
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            // Obtener tipo de cliente efectivo
            let resolvedTipoId = id_tipo_cliente;
            if (!resolvedTipoId && tipo_cliente) {
                const tipoRes = await client.query('SELECT id_tipo_cliente FROM tipo_cliente WHERE LOWER(nombre_tipo) = LOWER($1)', [tipo_cliente]);
                if (tipoRes.rows.length > 0) resolvedTipoId = tipoRes.rows[0].id_tipo_cliente;
            }
            if (!resolvedTipoId) resolvedTipoId = 1;

            // Rol Cliente (id_rol = 4 por defecto)
            let rolId = 4;
            const rolRes = await client.query("SELECT id_rol FROM roles WHERE nombre_rol = 'Cliente'");
            if (rolRes.rows.length > 0) rolId = rolRes.rows[0].id_rol;

            // Insertar en tabla clientes
            const cliRes = await client.query(
                `INSERT INTO clientes (id_tipo_cliente, id_rol, id_estado_cliente, correo_electronico, password_hash)
                 VALUES ($1, $2, 1, $3, $4)
                 RETURNING id_cliente`,
                [resolvedTipoId, rolId, email, hash]
            );
            const idCliente = cliRes.rows[0].id_cliente;

            // Si es Persona Natural (id_tipo_cliente === 1)
            if (resolvedTipoId === 1) {
                let finalNombre = nombre;
                let finalApellido = apellido;
                if (!finalNombre && nombre_completo) {
                    const parts = nombre_completo.trim().split(' ');
                    finalNombre = parts[0] || '';
                    finalApellido = parts.slice(1).join(' ') || '';
                }
                const tel = telefono || telefono_whatsapp || '';

                await client.query(
                    `INSERT INTO datos_cliente_persona (id_cliente, nombre, apellido, telefono, fecha_nacimiento)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [idCliente, finalNombre || '', finalApellido || '', tel, fecha_nacimiento || null]
                );
            } 
            // Si es Institucional (id_tipo_cliente === 2)
            else {
                const rs = razon_social || nombre_completo || 'Institución Sin Razón Social';
                const n = nit || carnet_identidad || '0';
                const contacto = nombre_contacto || nombre || '';
                const telContacto = telefono_contacto || telefono || telefono_whatsapp || '';

                const diRes = await client.query(
                    `INSERT INTO datos_cliente_institucional (id_cliente, razon_social, nit, nombre_contacto, telefono_contacto)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id_datos_institucional`,
                    [idCliente, rs, n, contacto, telContacto]
                );

                if (contrato && contrato.numero_contrato) {
                    await client.query(
                        `INSERT INTO contratos (id_datos_institucional, numero_contrato, fecha_firma, fecha_vencimiento, url_clausulas_pdf)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [diRes.rows[0].id_datos_institucional, contrato.numero_contrato, contrato.fecha_firma || 'CURRENT_DATE', contrato.fecha_vencimiento || null, contrato.url_clausulas_pdf || null]
                    );
                }
            }

            // Inserción de atributos dinámicos
            if (Array.isArray(atributos) && atributos.length > 0) {
                for (const attr of atributos) {
                    if (attr.nombre && attr.valor) {
                        await client.query(
                            `INSERT INTO atributos_cliente (id_cliente, nombre_atributo, valor_atributo)
                             VALUES ($1, $2, $3)`,
                            [idCliente, attr.nombre, attr.valor]
                        );
                    }
                }
            }

            await client.query('COMMIT');
            return ClienteModel.buscarPorId(idCliente);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Actualiza un cliente y su respectivo subtipo en transacción.
     */
    actualizar: async (id, datos) => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const clienteActual = await ClienteModel.buscarPorId(id);
            if (!clienteActual) {
                await client.query('ROLLBACK');
                return null;
            }

            // 1. Actualizar correo en clientes si se suministra
            if (datos.correo_electronico || datos.correo) {
                const nuevoCorreo = (datos.correo_electronico || datos.correo).toLowerCase().trim();
                await client.query(
                    `UPDATE clientes SET correo_electronico = $1 WHERE id_cliente = $2`,
                    [nuevoCorreo, id]
                );
            }

            // 2. Actualizar subtipo según corresponda
            if (clienteActual.id_tipo_cliente === 1) {
                // Persona
                let finalNombre = datos.nombre;
                let finalApellido = datos.apellido;
                if (finalNombre === undefined && datos.nombre_completo !== undefined) {
                    const parts = datos.nombre_completo.trim().split(' ');
                    finalNombre = parts[0] || '';
                    finalApellido = parts.slice(1).join(' ') || '';
                }
                const tel = datos.telefono !== undefined ? datos.telefono : datos.telefono_whatsapp;

                const pSets = [];
                const pVals = [];
                let pIdx = 1;

                if (finalNombre !== undefined) { pSets.push(`nombre = $${pIdx++}`); pVals.push(finalNombre); }
                if (finalApellido !== undefined) { pSets.push(`apellido = $${pIdx++}`); pVals.push(finalApellido); }
                if (tel !== undefined) { pSets.push(`telefono = $${pIdx++}`); pVals.push(tel); }
                if (datos.fecha_nacimiento !== undefined) { pSets.push(`fecha_nacimiento = $${pIdx++}`); pVals.push(datos.fecha_nacimiento); }

                if (pSets.length > 0) {
                    pVals.push(id);
                    await client.query(
                        `UPDATE datos_cliente_persona SET ${pSets.join(', ')} WHERE id_cliente = $${pIdx}`,
                        pVals
                    );
                }
            } else {
                // Institucional
                const iSets = [];
                const iVals = [];
                let iIdx = 1;

                const rs = datos.razon_social || datos.nombre_completo;
                const n = datos.nit || datos.carnet_identidad;
                const contacto = datos.nombre_contacto || datos.nombre;
                const tel = datos.telefono_contacto || datos.telefono || datos.telefono_whatsapp;

                if (rs !== undefined) { iSets.push(`razon_social = $${iIdx++}`); iVals.push(rs); }
                if (n !== undefined) { iSets.push(`nit = $${iIdx++}`); iVals.push(n); }
                if (contacto !== undefined) { iSets.push(`nombre_contacto = $${iIdx++}`); iVals.push(contacto); }
                if (tel !== undefined) { iSets.push(`telefono_contacto = $${iIdx++}`); iVals.push(tel); }

                if (iSets.length > 0) {
                    iVals.push(id);
                    await client.query(
                        `UPDATE datos_cliente_institucional SET ${iSets.join(', ')} WHERE id_cliente = $${iIdx}`,
                        iVals
                    );
                }
            }

            await client.query('COMMIT');
            return ClienteModel.buscarPorId(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Elimina un cliente. Las restricciones en cascada eliminan los subtipos y atributos.
     */
    eliminar: async (id) => {
        const res = await db.query('DELETE FROM clientes WHERE id_cliente = $1 RETURNING id_cliente', [id]);
        return res.rows.length > 0;
    }
};

module.exports = ClienteModel;
