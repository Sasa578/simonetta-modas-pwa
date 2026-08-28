const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Importar rutas y middleware
const authRoutes = require('../routes/authRoutes');
const clientesRoutes = require('../routes/clientesRoutes');
const usuariosRoutes = require('../routes/usuariosRoutes');
const almacenRoutes = require('../routes/almacenRoutes');
const pedidosRoutes = require('../routes/pedidosRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/almacen', almacenRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Token JWT simulado para pruebas de rutas protegidas
const adminToken = jwt.sign(
    { id_usuario: 1, correo: 'admin@simonetta.com', rol: 'Admin' },
    process.env.JWT_SECRET || 'secreto_simonetta_pwa_2026',
    { expiresIn: '1h' }
);

describe('🧪 Suite de Pruebas de API & Usabilidad — Simonetta Modas PWA', () => {

    describe('1. Módulo de Autenticación & Seguridad (/api/auth)', () => {
        test('GET /api/auth/roles - Debería retornar los roles del sistema', async () => {
            const res = await request(app).get('/api/auth/roles');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            const nombres = res.body.map(r => r.nombre_rol);
            expect(nombres).toContain('Admin');
            expect(nombres).toContain('Secretaria');
            expect(nombres).toContain('Costurera');
            expect(nombres).toContain('Cliente');
        });

        test('POST /api/auth/login - Debería rechazar datos vacíos con 400 Bad Request', async () => {
            const res = await request(app).post('/api/auth/login').send({ correo: '' });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        test('POST /api/auth/login - Debería rechazar correo con formato inválido', async () => {
            const res = await request(app).post('/api/auth/login').send({ correo: 'correo_invalido_sin_arroba', password: '123' });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('inválido');
        });

        test('POST /api/auth/login - Debería procesar intento de login', async () => {
            const res = await request(app).post('/api/auth/login').send({
                correo: 'admin@simonetta.com',
                password: '123456'
            });
            expect([200, 401]).toContain(res.statusCode);
        });
    });

    describe('2. Módulo de Clientes & Validación de Formularios (/api/clientes)', () => {
        test('POST /api/clientes - Debería rechazar teléfonos con letras (Validación Estricta)', async () => {
            const res = await request(app)
                .post('/api/clientes')
                .set('Authorization', 'Bearer ' + adminToken)
                .send({
                    nombre_completo: 'Cliente Pruebas',
                    telefono_whatsapp: '70000000_CON_LETRAS'
                });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('números');
        });

        test('POST /api/clientes - Debería exigir el campo de nombre completo', async () => {
            const res = await request(app)
                .post('/api/clientes')
                .set('Authorization', 'Bearer ' + adminToken)
                .send({
                    nombre_completo: '',
                    telefono_whatsapp: '77712345'
                });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('3. Módulo de Almacén & Inventario (/api/almacen)', () => {
        test('GET /api/almacen - Debería consultar el listado de insumos con token autenticado', async () => {
            const res = await request(app)
                .get('/api/almacen')
                .set('Authorization', 'Bearer ' + adminToken);
            expect([200, 304]).toContain(res.statusCode);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('4. Módulo de Pedidos & Producción (/api/pedidos)', () => {
        test('GET /api/pedidos/metricas - Debería calcular métricas con token autenticado', async () => {
            const res = await request(app)
                .get('/api/pedidos/metricas')
                .set('Authorization', 'Bearer ' + adminToken);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('pedidosPendientes');
            expect(res.body).toHaveProperty('ingresosMes');
        });
    });
});
