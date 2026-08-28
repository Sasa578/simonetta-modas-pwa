const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const reportPath = path.join(__dirname, '../tests/jest-report.json');

// GET /api/pruebas/reporte — Consulta el reporte de pruebas Jest
const obtenerReporte = (req, res) => {
    try {
        if (!fs.existsSync(reportPath)) {
            return res.json({
                success: true,
                mensaje: 'No se ha ejecutado ninguna prueba todavía.',
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                testResults: []
            });
        }
        const rawData = fs.readFileSync(reportPath, 'utf8');
        const jsonReport = JSON.parse(rawData);
        return res.json(jsonReport);
    } catch (error) {
        console.error('Error al leer reporte de pruebas:', error);
        return res.status(500).json({ error: 'Error al obtener el reporte de pruebas.' });
    }
};

// POST /api/pruebas/ejecutar — Ejecuta las pruebas Jest en tiempo real
const ejecutarPruebas = (req, res) => {
    const backendDir = path.join(__dirname, '..');
    const command = 'npx jest --json --outputFile=tests/jest-report.json --runInBand --forceExit';

    exec(command, { cwd: backendDir }, (error, stdout, stderr) => {
        try {
            if (fs.existsSync(reportPath)) {
                const rawData = fs.readFileSync(reportPath, 'utf8');
                const jsonReport = JSON.parse(rawData);
                return res.json(jsonReport);
            }
            return res.status(500).json({ error: 'No se pudo generar el reporte de pruebas.' });
        } catch (err) {
            console.error('Error al procesar salida de Jest:', err);
            return res.status(500).json({ error: 'Error al procesar el reporte de pruebas.' });
        }
    });
};

// POST /api/pruebas/ejecutar-peticion — Proxy para Mini Postman Interactivo
const ejecutarPeticionPostman = async (req, res) => {
    const { method = 'GET', url = '/api/auth/roles', headers = {}, body } = req.body;
    const startTime = Date.now();

    try {
        const fullUrl = url.startsWith('http') ? url : \http://127.0.0.1:3000\\;
        
        const fetchOptions = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
            fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const apiRes = await fetch(fullUrl, fetchOptions);
        const endTime = Date.now();
        const durationMs = endTime - startTime;

        let resData;
        const contentType = apiRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            resData = await apiRes.json();
        } else {
            resData = await apiRes.text();
        }

        const resHeaders = {};
        apiRes.headers.forEach((val, key) => {
            resHeaders[key] = val;
        });

        return res.json({
            status: apiRes.status,
            statusText: apiRes.statusText,
            durationMs,
            headers: resHeaders,
            data: resData
        });
    } catch (error) {
        const endTime = Date.now();
        return res.json({
            status: 500,
            statusText: 'Internal Error / Connection Failed',
            durationMs: endTime - startTime,
            headers: {},
            data: { error: error.message || 'Error al conectar con la URL especificada.' }
        });
    }
};

module.exports = {
    obtenerReporte,
    ejecutarPruebas,
    ejecutarPeticionPostman
};
