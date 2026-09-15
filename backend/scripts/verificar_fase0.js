const { pool } = require('../config/db');

async function verificarFase0() {
    try {
        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        console.log(`✅ Total de tablas en la base de datos: ${tablesRes.rows.length}`);
        console.log('Listado de tablas creadas:');
        console.log(tablesRes.rows.map(r => ` - ${r.table_name}`).join('\n'));

        // Probar consultas clave de integridad
        const usuarios = await pool.query(`
            SELECT u.id_usuario, u.correo_electronico, r.nombre_rol, du.nombre, du.apellido, du.carnet_identidad
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            JOIN datos_usuario du ON u.id_usuario = du.id_usuario
        `);
        console.log('\n✅ Usuarios internos activos (Particionamiento vertical):', usuarios.rows);

        const clientes = await pool.query(`
            SELECT c.id_cliente, c.correo_electronico, tc.nombre_tipo, 
                   COALESCE(dp.nombre || ' ' || dp.apellido, di.razon_social) as titular
            FROM clientes c
            JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
            LEFT JOIN datos_cliente_persona dp ON c.id_cliente = dp.id_cliente
            LEFT JOIN datos_cliente_institucional di ON c.id_cliente = di.id_cliente
        `);
        console.log('\n✅ Clientes registrados (Subtipos Persona/Institución):', clientes.rows);

        const pedidos = await pool.query(`
            SELECT p.id_pedido, ep.nombre_estado, p.costo_total, pr.tipo_prenda, ma.cintura, ma.busto, pg.monto_pago as adelanto
            FROM pedidos p
            JOIN estados_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
            JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
            JOIN prendas pr ON dp.id_prenda = pr.id_prenda
            LEFT JOIN medidas_anatomicas ma ON dp.id_detalle = ma.id_detalle
            LEFT JOIN pagos pg ON p.id_pedido = pg.id_pedido
        `);
        console.log('\n✅ Pedidos y medidas por prenda:', pedidos.rows);

        const almacen = await pool.query(`
            SELECT pa.id_producto, pa.nombre_articulo, tp.nombre_tipo, um.abreviatura, pa.cantidad_stock, et.textura, eh.tipo_hilo
            FROM productos_almacen pa
            JOIN tipos_producto tp ON pa.id_tipo_producto = tp.id_tipo_producto
            JOIN unidades_medida um ON pa.id_unidad_medida = um.id_unidad_medida
            LEFT JOIN esp_telas et ON pa.id_producto = et.id_producto
            LEFT JOIN esp_hilos eh ON pa.id_producto = eh.id_producto
        `);
        console.log('\n✅ Almacén e insumos con especificaciones polimórficas:', almacen.rows);

        console.log('\n🎉 ¡VERIFICACIÓN DE FASE 0 COMPLETADA EXITOSAMENTE!');
    } catch (err) {
        console.error('❌ Error en verificación:', err);
    } finally {
        await pool.end();
    }
}

verificarFase0();
