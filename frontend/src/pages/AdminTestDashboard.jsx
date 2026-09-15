import { useState } from 'react';
import api from '../api/axios';
import './AdminDashboard.css'; // Reutilizamos estilos principales

const AdminTestDashboard = () => {
    const [activeTab, setActiveTab] = useState('jest'); // 'jest' o 'api'

    // --- ESTADO PARA RESULTADOS DE JEST ---
    const [jestLoading, setJestLoading] = useState(false);
    const [jestResults, setJestResults] = useState(null);
    const [jestError, setJestError] = useState(null);

    // --- ESTADO PARA API TESTER ---
    const [apiMethod, setApiMethod] = useState('GET');
    const [apiUrl, setApiUrl] = useState('/api/auth/roles');
    const [apiBody, setApiBody] = useState('{}');
    const [apiLoading, setApiLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [apiStatus, setApiStatus] = useState(null);

    // Ejecuta las pruebas automatizadas en el backend
    const runJestTests = async () => {
        setJestLoading(true);
        setJestError(null);
        setJestResults(null);
        try {
            const { data } = await api.post('/tests/run');
            if (data.success && data.results) {
                setJestResults(data.results);
            } else {
                setJestError("Hubo un problema parseando los resultados o ejecutando las pruebas.");
                console.error(data);
            }
        } catch (error) {
            setJestError("Error de conexión al servidor al solicitar ejecución de pruebas.");
            console.error(error);
        } finally {
            setJestLoading(false);
        }
    };

    // Envía una petición custom (API Tester)
    const runApiTest = async (e) => {
        e.preventDefault();
        setApiLoading(true);
        setApiResponse(null);
        setApiStatus(null);

        try {
            let bodyParams = undefined;
            if (apiMethod !== 'GET' && apiMethod !== 'DELETE') {
                try {
                    bodyParams = JSON.parse(apiBody);
                } catch (e) {
                    setApiStatus('ERROR');
                    setApiResponse({ error: 'El Body JSON proporcionado es inválido.' });
                    setApiLoading(false);
                    return;
                }
            }

            const response = await api({
                method: apiMethod,
                url: apiUrl,
                data: bodyParams
            });

            setApiStatus(response.status);
            setApiResponse(response.data);
        } catch (error) {
            setApiStatus(error.response?.status || 'ERROR');
            setApiResponse(error.response?.data || { error: error.message });
        } finally {
            setApiLoading(false);
        }
    };

    return (
        <section className="dashboard-content">
            <header className="content-header">
                <h1 className="page-title">⚙️ Pruebas y Diagnóstico</h1>
                <p className="page-subtitle">Verifica la salud del sistema y prueba rutas manualmente.</p>
            </header>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('jest')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        border: 'none',
                        borderRadius: '8px',
                        background: activeTab === 'jest' ? 'var(--color-azul-oscuro)' : '#e2e8f0',
                        color: activeTab === 'jest' ? '#fff' : '#64748b',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: '0.3s'
                    }}
                >
                    🧪 Pruebas Unitarias (Jest)
                </button>
                <button
                    onClick={() => setActiveTab('api')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        border: 'none',
                        borderRadius: '8px',
                        background: activeTab === 'api' ? 'var(--color-azul-oscuro)' : '#e2e8f0',
                        color: activeTab === 'api' ? '#fff' : '#64748b',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: '0.3s'
                    }}
                >
                    🔌 API Tester (Mini Postman)
                </button>
            </div>

            {/* CONTENIDO JEST */}
            {activeTab === 'jest' && (
                <div className="card glass-effect" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ color: 'var(--color-texto-principal)', marginBottom: '0.5rem' }}>Validación Automática del Sistema</h2>
                            <p style={{ color: 'var(--color-texto-secundario)' }}>Ejecuta el paquete de pruebas programadas en el servidor backend.</p>
                        </div>
                        <button
                            className="btn-primary"
                            onClick={runJestTests}
                            disabled={jestLoading}
                            style={{ padding: '0.8rem 1.5rem' }}
                        >
                            {jestLoading ? '⏳ Corriendo Tests...' : '▶ Ejecutar Pruebas'}
                        </button>
                    </div>

                    {jestError && (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>
                            {jestError}
                        </div>
                    )}

                    {jestResults && (
                        <div>
                            {/* Resumen */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ flex: 1, padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', textAlign: 'center' }}>
                                    <h3 style={{ color: '#166534', margin: '0 0 0.5rem', fontSize: '2rem' }}>{jestResults.numPassedTests}</h3>
                                    <span style={{ color: '#15803d', fontWeight: 'bold' }}>Pasadas</span>
                                </div>
                                <div style={{ flex: 1, padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', textAlign: 'center' }}>
                                    <h3 style={{ color: '#991b1b', margin: '0 0 0.5rem', fontSize: '2rem' }}>{jestResults.numFailedTests}</h3>
                                    <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>Fallidas</span>
                                </div>
                                <div style={{ flex: 1, padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
                                    <h3 style={{ color: '#334155', margin: '0 0 0.5rem', fontSize: '2rem' }}>{jestResults.numTotalTests}</h3>
                                    <span style={{ color: '#475569', fontWeight: 'bold' }}>Total Tests</span>
                                </div>
                            </div>

                            {/* Detalle por Suite */}
                            <h3 style={{ color: 'var(--color-texto-principal)', marginBottom: '1rem' }}>Detalle de Archivos de Prueba</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {jestResults.testResults?.map((suite, idx) => (
                                    <div key={idx} style={{
                                        padding: '1.5rem',
                                        border: '1px solid var(--color-borde)',
                                        borderRadius: '12px',
                                        background: suite.status === 'passed' ? '#f8fafc' : '#fef2f2',
                                        borderLeft: `6px solid ${suite.status === 'passed' ? '#22c55e' : '#ef4444'}`
                                    }}>
                                        <h4 style={{ margin: '0 0 1rem', color: 'var(--color-texto-principal)', wordBreak: 'break-all' }}>
                                            📄 {suite.name.split('backend\\\\')[1] || suite.name.split('backend/')[1] || suite.name}
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {suite.assertionResults.map((test, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                                                    {test.status === 'passed' ? '✅' : '❌'}
                                                    <span style={{ color: test.status === 'passed' ? 'var(--color-texto-secundario)' : '#991b1b' }}>
                                                        {test.ancestorTitles.join(' › ')} › {test.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CONTENIDO API TESTER */}
            {activeTab === 'api' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Panel Petición */}
                    <div className="card glass-effect" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h2 style={{ color: 'var(--color-texto-principal)', margin: 0 }}>Parámetros de Ruta</h2>

                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-texto-secundario)', width: '100%', fontWeight: 600 }}>Rutas Rápidas de Prueba:</span>
                            <button type="button" onClick={() => { setApiMethod('GET'); setApiUrl('/api/pedidos'); }} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-borde)', background: '#f8fafc', cursor: 'pointer' }}>📦 /api/pedidos</button>
                            <button type="button" onClick={() => { setApiMethod('GET'); setApiUrl('/api/pedidos/catalogos'); }} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-borde)', background: '#f8fafc', cursor: 'pointer' }}>🏷️ /api/pedidos/catalogos</button>
                            <button type="button" onClick={() => { setApiMethod('GET'); setApiUrl('/api/pagos/catalogos'); }} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-borde)', background: '#f8fafc', cursor: 'pointer' }}>💳 /api/pagos/catalogos</button>
                            <button type="button" onClick={() => { setApiMethod('GET'); setApiUrl('/api/citas/pendientes'); }} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-borde)', background: '#f8fafc', cursor: 'pointer' }}>📅 /api/citas/pendientes</button>
                            <button type="button" onClick={() => { setApiMethod('GET'); setApiUrl('/api/almacen/catalogos'); }} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-borde)', background: '#f8fafc', cursor: 'pointer' }}>🧵 /api/almacen/catalogos</button>
                            <button type="button" onClick={() => { setApiMethod('GET'); setApiUrl('/api/kardex'); }} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-borde)', background: '#f8fafc', cursor: 'pointer' }}>📊 /api/kardex</button>
                            <button type="button" onClick={() => { setApiMethod('GET'); setApiUrl('/api/kardex/catalogos'); }} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-borde)', background: '#f8fafc', cursor: 'pointer' }}>📑 /api/kardex/catalogos</button>
                            <button type="button" onClick={() => { setApiMethod('GET'); setApiUrl('/api/notas-venta'); }} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-borde)', background: '#f8fafc', cursor: 'pointer' }}>🧾 /api/notas-venta</button>
                        </div>

                        <div>
                            <label className="modal-label">Método HTTP</label>
                            <select
                                className="modal-input"
                                value={apiMethod}
                                onChange={(e) => setApiMethod(e.target.value)}
                            >
                                <option value="GET">GET (Consultar)</option>
                                <option value="POST">POST (Crear)</option>
                                <option value="PUT">PUT (Actualizar)</option>
                                <option value="DELETE">DELETE (Borrar)</option>
                            </select>
                        </div>

                        <div>
                            <label className="modal-label">URL del Endpoint (relativo a /api)</label>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="/api/usuarios"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                            />
                        </div>

                        {(apiMethod === 'POST' || apiMethod === 'PUT') && (
                            <div>
                                <label className="modal-label">Cuerpo (JSON Body)</label>
                                <textarea
                                    className="modal-input"
                                    rows={8}
                                    style={{ fontFamily: 'monospace', resize: 'vertical' }}
                                    value={apiBody}
                                    onChange={(e) => setApiBody(e.target.value)}
                                ></textarea>
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            style={{ padding: '1rem', fontSize: '1rem', marginTop: 'auto' }}
                            onClick={runApiTest}
                            disabled={apiLoading}
                        >
                            {apiLoading ? 'Enviando...' : '🚀 Enviar Petición'}
                        </button>
                    </div>

                    {/* Panel Respuesta */}
                    <div className="card glass-effect" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', background: '#0f172a', color: '#e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ color: '#fff', margin: 0 }}>Respuesta</h2>
                            {apiStatus && (
                                <span style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    background: apiStatus >= 200 && apiStatus < 300 ? '#166534' : '#991b1b',
                                    color: '#fff'
                                }}>
                                    Status: {apiStatus}
                                </span>
                            )}
                        </div>

                        <div style={{ flex: 1, background: '#1e293b', borderRadius: '8px', padding: '1rem', overflow: 'auto' }}>
                            {apiResponse ? (
                                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                                    {JSON.stringify(apiResponse, null, 2)}
                                </pre>
                            ) : (
                                <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>La respuesta de la API aparecerá aquí.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminTestDashboard;
