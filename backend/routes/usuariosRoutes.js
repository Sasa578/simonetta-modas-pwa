const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, listarCostureras } = require('../controllers/usuariosController');

router.use(verificarToken);

// Ruta accesible para autenticados (Secretaría necesita ver costureras)
router.get('/costureras', listarCostureras);

// Middleware: solo Admin
const soloAdmin = (req, res, next) => {
    if (req.usuario?.rol !== 'Admin') {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }
    next();
};

router.use(soloAdmin);

router.get('/', listarUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;
