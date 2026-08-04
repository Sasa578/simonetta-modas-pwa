import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MedidasForm from './pages/MedidasForm';
import PedidoForm from './pages/PedidoForm';
import AdminDashboard from './pages/AdminDashboard';
import SecretariaDashboard from './pages/SecretariaDashboard';
import MobileDashboard from './pages/MobileDashboard';
import AdminLayout from './layouts/AdminLayout';
import SecretariaLayout from './layouts/SecretariaLayout';
import MobileLayout from './layouts/MobileLayout';

// Ruta protegida: redirige a /login si no hay sesión
const RutaProtegida = ({ children }) => {
    const { usuario, cargando } = useAuth();
    if (cargando) return <div className="pantalla-carga">Cargando...</div>;
    return usuario ? children : <Navigate to="/login" replace />;
};

// Redirige según rol al iniciar sesión
const RootRedirect = () => {
    const { usuario } = useAuth();
    if (!usuario) return <Navigate to="/login" replace />;
    const rol = usuario.rol;
    if (rol === 'Admin') return <Navigate to="/admin" replace />;
    if (rol === 'Secretaria') return <Navigate to="/secretaria" replace />;
    return <Navigate to="/mobile" replace />; // Costurera, Cliente
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Dashboard clásico (deprecado, redirige a raíz) */}
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />

                    {/* Admin */}
                    <Route path="/admin" element={<RutaProtegida><AdminLayout /></RutaProtegida>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="pedidos/nuevo" element={<PedidoForm />} />
                        <Route path="medidas/:id_cliente" element={<MedidasForm />} />
                    </Route>

                    {/* Secretaría */}
                    <Route path="/secretaria" element={<RutaProtegida><SecretariaLayout /></RutaProtegida>}>
                        <Route index element={<SecretariaDashboard />} />
                        <Route path="pedidos/nuevo" element={<PedidoForm />} />
                        <Route path="medidas/:id_cliente" element={<MedidasForm />} />
                    </Route>

                    {/* Móvil (Costurera / Cliente) */}
                    <Route path="/mobile" element={<RutaProtegida><MobileLayout /></RutaProtegida>}>
                        <Route index element={<MobileDashboard />} />
                        <Route path="pedidos/nuevo" element={<PedidoForm />} />
                        <Route path="medidas/:id_cliente" element={<MedidasForm />} />
                    </Route>

                    {/* Rutas standalone legacy */}
                    <Route path="/pedidos/nuevo" element={<RutaProtegida><PedidoForm /></RutaProtegida>} />
                    <Route path="/medidas/:id_cliente" element={<RutaProtegida><MedidasForm /></RutaProtegida>} />

                    {/* Raíz: redirige según rol */}
                    <Route path="/" element={<RutaProtegida><RootRedirect /></RutaProtegida>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
