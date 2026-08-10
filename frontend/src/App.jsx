import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MedidasForm from './pages/MedidasForm';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminPedidos from './pages/AdminPedidos';
import AlmacenView from './pages/AlmacenView';
import ClientesView from './pages/ClientesView';
import SecretariaDashboard from './pages/SecretariaDashboard';
import MobileDashboard from './pages/MobileDashboard';
import MobilePerfil from './pages/MobilePerfil';
import ClienteDashboard from './pages/ClienteDashboard';
import AdminLayout from './layouts/AdminLayout';
import SecretariaLayout from './layouts/SecretariaLayout';
import MobileLayout from './layouts/MobileLayout';

const RutaProtegida = ({ children }) => {
    const { usuario, cargando } = useAuth();
    if (cargando) return <div className="pantalla-carga">Cargando...</div>;
    return usuario ? children : <Navigate to="/login" replace />;
};

const RootRedirect = () => {
    const { usuario } = useAuth();
    if (!usuario) return <Navigate to="/login" replace />;
    if (usuario.rol === 'Admin') return <Navigate to="/admin" replace />;
    if (usuario.rol === 'Secretaria') return <Navigate to="/secretaria" replace />;
    if (usuario.rol === 'Cliente') return <Navigate to="/cliente" replace />;
    return <Navigate to="/mobile" replace />;
};

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ADMIN */}
                <Route path="/admin" element={<RutaProtegida><AdminLayout /></RutaProtegida>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="usuarios" element={<AdminUsuarios />} />
                    <Route path="clientes" element={<ClientesView />} />
                    <Route path="almacen" element={<AlmacenView />} />
                    <Route path="pedidos" element={<AdminPedidos />} />
                </Route>

                {/* SECRETARÍA */}
                <Route path="/secretaria" element={<RutaProtegida><SecretariaLayout /></RutaProtegida>}>
                    <Route index element={<SecretariaDashboard />} />
                    <Route path="pedidos" element={<AdminPedidos />} />
                    <Route path="clientes" element={<ClientesView />} />
                    <Route path="almacen" element={<AlmacenView readOnly={true} />} />
                    <Route path="medidas/:id" element={<MedidasForm />} />
                </Route>

                {/* MÓVIL (Costurera) */}
                <Route path="/mobile" element={<RutaProtegida><MobileLayout /></RutaProtegida>}>
                    <Route index element={<MobileDashboard />} />
                    <Route path="perfil" element={<MobilePerfil />} />
                </Route>

                {/* CLIENTE */}
                <Route path="/cliente" element={<RutaProtegida><ClienteDashboard /></RutaProtegida>} />

                {/* Standalone */}
                <Route path="/medidas/:id_cliente" element={<RutaProtegida><MedidasForm /></RutaProtegida>} />

                <Route path="/" element={<RutaProtegida><RootRedirect /></RutaProtegida>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default App;
