const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
    listarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    obtenerMiPerfil,
    resetPasswordCliente,
} = require('../controllers/clientesController');

// Todas las rutas de clientes requieren autenticación
router.use(verificarToken);

// GET /api/clientes/mi-perfil — Perfil y medidas del usuario logueado
router.get('/mi-perfil', obtenerMiPerfil);

// GET    /api/clientes        — Listar todos los clientes
// POST   /api/clientes        — Crear un nuevo cliente
router.route('/')
    .get(listarClientes)
    .post(crearCliente);

// GET    /api/clientes/:id    — Obtener un cliente
// PUT    /api/clientes/:id    — Actualizar un cliente
// DELETE /api/clientes/:id    — Eliminar un cliente
// Middleware para proteger acciones exclusivas del Administrador
const soloAdmin = (req, res, next) => {
    const rol = (req.usuario?.rol || req.usuario?.nombre_rol || '').toLowerCase();
    if (rol !== 'admin' && rol !== 'administrador') {
        return res.status(403).json({ error: 'Acceso denegado. Función exclusiva del Administrador.' });
    }
    next();
};

// PUT /api/clientes/:id/reset-password — Restablecer contraseña de cliente
router.put('/:id/reset-password', soloAdmin, resetPasswordCliente);

router.route('/:id')
    .get(obtenerCliente)
    .put(actualizarCliente)
    .delete(eliminarCliente);

module.exports = router;
