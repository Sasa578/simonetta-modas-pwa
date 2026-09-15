
const UsuarioModel = require('../../models/UsuarioModel');
const db = require('../../config/db');

describe('UsuarioModel (Integration)', () => {
    let testUserId;
    const testEmail = 'test_jest_user@simonetta.com';

    afterAll(async () => {
        // Limpiar base de datos
        if (testUserId) {
            await db.query('DELETE FROM usuarios WHERE id_usuario = $1', [testUserId]);
        }
    });

    it('debe crear un nuevo usuario correctamente', async () => {
        // Asumimos que el rol 1 (Admin) o 2 (Secretaria) existe
        const user = {
            correo: testEmail,
            password: 'password123',
            id_rol: 2, // Secretaría
            nombre_completo: 'Test User Jest',
            carnet_identidad: '1234567',
            telefono: '77777777'
        };

        const result = await UsuarioModel.crear(user);
        expect(result).toHaveProperty('id_usuario');
        expect(result.correo).toBe(testEmail);
        testUserId = result.id_usuario; // Guardar ID para limpieza
    });

    it('debe buscar un usuario por correo', async () => {
        const user = await UsuarioModel.buscarPorCorreo(testEmail);
        expect(user).not.toBeNull();
        expect(user.correo).toBe(testEmail);
        expect(user).toHaveProperty('password_hash');
        expect(user).toHaveProperty('nombre_rol');
        expect(user).toHaveProperty('nombre_completo');
    });

    it('debe retornar null para un correo inexistente', async () => {
        const user = await UsuarioModel.buscarPorCorreo('correo_falso_que_no_existe@test.com');
        expect(user).toBeNull();
    });
});
