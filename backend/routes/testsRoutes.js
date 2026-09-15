const express = require('express');
const { exec } = require('child_process');
const router = express.Router();
const path = require('path');

// POST /api/tests/run
router.post('/run', (req, res) => {
    // Para asegurar que corra desde la ruta correcta (backend)
    const backendPath = path.resolve(__dirname, '..');
    
    // Ejecuta los tests de Jest y pide formato JSON
    exec('npm test -- --json', { cwd: backendPath, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        try {
            // A veces jest mezcla logs de dotenv con el output JSON si se corre vía npm, 
            // así que intentamos extraer solo la parte JSON (desde la primera '{' hasta el final)
            const jsonStartIndex = stdout.indexOf('{');
            const jsonEndIndex = stdout.lastIndexOf('}');
            
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                const jsonString = stdout.substring(jsonStartIndex, jsonEndIndex + 1);
                const results = JSON.parse(jsonString);
                return res.json({ success: true, results });
            } else {
                // Si no encontramos un JSON válido, devolvemos el texto plano
                return res.json({ success: false, raw_output: stdout, error_output: stderr });
            }
        } catch (e) {
            console.error("Error parseando resultados de Jest:", e);
            return res.status(500).json({ error: 'Error parseando resultados de pruebas', details: e.message, raw: stdout });
        }
    });
});

module.exports = router;
