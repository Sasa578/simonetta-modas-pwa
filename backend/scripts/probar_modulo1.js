const UsuarioModel = require('../models/UsuarioModel');
const ClienteModel = require('../models/ClienteModel');
const { pool } = require('../config/db');

async function testModulo1() {
    try {
        console.log('🧪 Probando Módulo 1 (Seguridad, Usuarios y Clientes)...\n');

        // 1. Probar listar usuarios
        const usuarios = await UsuarioModel.listarTodos();
        console.log(`✅ Usuarios internos listados (${usuarios.length}):`, usuarios.map(u => `${u.id_usuario}: ${u.nombre_completo} (${u.nombre_rol}) - CI: ${u.carnet_identidad}`));

        // 2. Probar buscar por correo
        const admin = await UsuarioModel.buscarPorCorreo('admin@simonetta.com');
        console.log('✅ Admin encontrado por correo:', admin.nombre_completo, admin.correo_electronico, admin.nombre_rol);

        // 3. Probar crear usuario interno
        const testUserEmail = `test.staff.${Date.now()}@simonetta.com`;
        const nuevoStaff = await UsuarioModel.crear({
            correo: testUserEmail,
            password: 'passwordStaff123',
            id_rol: 2, // Secretaria
            nombre: 'Lucía',
            apellido: 'Navarro',
            carnet_identidad: `CI-${Date.now()}`,
            telefono: '+591 79998877'
        });
        console.log('✅ Nuevo staff creado:', nuevoStaff.id_usuario, nuevoStaff.nombre_completo, nuevoStaff.correo_electronico);

        // 4. Probar listar clientes
        const clientes = await ClienteModel.listarTodos();
        console.log(`\n✅ Clientes listados (${clientes.length}):`);
        clientes.forEach(c => {
            console.log(`   - [${c.tipo_cliente}] ${c.nombre_completo} | Tel: ${c.telefono_whatsapp} | Correo: ${c.correo_electronico}`);
        });

        // 5. Probar crear cliente Persona Natural
        const testCliPersonaEmail = `cliente.persona.${Date.now()}@email.com`;
        const nuevaPersona = await ClienteModel.crear({
            id_tipo_cliente: 1,
            correo: testCliPersonaEmail,
            nombre_completo: 'Valeria Montero Soria',
            telefono_whatsapp: '+591 78889900',
            carnet_identidad: '5566778 LP',
            atributos: [{ nombre: 'Preferencia de Escote', valor: 'Redondo clásico' }]
        });
        console.log('✅ Nuevo cliente Persona creado:', nuevaPersona.id_cliente, nuevaPersona.nombre_completo, nuevaPersona.atributos);

        // 6. Probar crear cliente Institucional
        const testCliInstEmail = `empresa.${Date.now()}@bolivia.bo`;
        const nuevaInst = await ClienteModel.crear({
            id_tipo_cliente: 2,
            correo: testCliInstEmail,
            razon_social: 'Banco Unión S.A. Regional La Paz',
            nit: '8899776655',
            nombre_contacto: 'Lic. Fernando Morales',
            telefono_contacto: '+591 2 2112233',
            contrato: {
                numero_contrato: `CTR-${Date.now()}`,
                fecha_firma: '2026-03-01',
                fecha_vencimiento: '2026-12-31'
            }
        });
        console.log('✅ Nuevo cliente Institucional creado:', nuevaInst.id_cliente, nuevaInst.nombre_completo, 'Contratos:', nuevaInst.contratos?.length);

        console.log('\n🎉 ¡TODAS LAS PRUEBAS DEL MÓDULO 1 PASARON CON ÉXITO!');
    } catch (err) {
        console.error('❌ Error probando Módulo 1:', err);
    } finally {
        await pool.end();
    }
}

testModulo1();
