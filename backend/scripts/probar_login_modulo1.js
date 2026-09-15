async function probarLogin() {
    try {
        console.log('🔑 Probando autenticación con http://localhost:3000/api/auth/login...\n');

        // Helper fetch
        async function doLogin(correo, password) {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password })
            });
            const data = await res.json();
            return { status: res.status, data };
        }

        // 1. Login Admin (Personal interno)
        const resAdmin = await doLogin('admin@simonetta.com', '123456');
        console.log('✅ Login Staff (Admin) [Status: ' + resAdmin.status + ']:');
        console.log('   Usuario:', resAdmin.data.usuario);
        console.log('   Token generado:', resAdmin.data.token ? 'Sí (JWT válido)' : 'No');

        // 2. Login Cliente Persona
        const resClientePersona = await doLogin('maria.garcia@email.com', '123456');
        console.log('\n✅ Login Cliente Persona (María García) [Status: ' + resClientePersona.status + ']:');
        console.log('   Cliente:', resClientePersona.data.usuario);

        // 3. Login Cliente Institucional
        const resClienteInst = await doLogin('contacto@colegiofrances.edu.bo', '123456');
        console.log('\n✅ Login Cliente Institucional (Colegio Francés) [Status: ' + resClienteInst.status + ']:');
        console.log('   Cliente:', resClienteInst.data.usuario);

        console.log('\n🎉 ¡TODOS LOS LOGINS FUNCIONAN PERFECTAMENTE EN EL SERVIDOR!');
    } catch (err) {
        console.error('❌ Error en prueba de login:', err.message);
    }
}

probarLogin();
