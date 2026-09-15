
const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');
const UsuarioModel = require('../../models/UsuarioModel');
const db = require('../../config/db');

// Configurar Express para la prueba
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API (Integration)', () => {
    let testUserId;
    const testEmail = 'test_jest_auth@simonetta.com';
    const testPassword = 'password_seguro';

    beforeAll(async () => {
        // Crear un usuario real en BD para probar login
        const user = await UsuarioModel.crear({
            correo: testEmail,
            password: testPassword,
            id_rol: 2,
            nombre_completo: 'Test Auth User',
            telefono: '66666666'
        });
        testUserId = user.id_usuario;
    });

    afterAll(async () => {
        // Limpiar usuario de prueba
        if (testUserId) {
            await db.query('DELETE FROM usuarios WHERE id_usuario = $1', [testUserId]);
        }
    });

    it('POST /api/auth/login - debe autenticar y retornar JWT', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                correo: testEmail,
                password: testPassword
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('usuario');
        expect(response.body.usuario.correo).toBe(testEmail);
        expect(response.body.usuario).toHaveProperty('nombre_completo');
        expect(response.body.usuario).toHaveProperty('telefono');
    });

    it('POST /api/auth/login - debe fallar con contraseña incorrecta', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                correo: testEmail,
                password: 'wrong_password'
            });
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Credenciales inválidas.');
    });

    it('POST /api/auth/login - debe fallar si falta correo o contraseña', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                correo: testEmail
                // falta password
            });
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Correo y contraseña son obligatorios.');
    });
});
