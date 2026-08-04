import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MedidasForm from './pages/MedidasForm';
import PedidoForm from './pages/PedidoForm';

// Ruta protegida: redirige a /login si no hay sesión
const RutaProtegida = ({ children }) => {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return <div className="pantalla-carga">Cargando...</div>;
    }

    return usuario ? children : <Navigate to="/login" replace />;
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={
                            <RutaProtegida>
                                <Dashboard />
                            </RutaProtegida>
                        }
                    />
                    <Route
                        path="/medidas/:id_cliente"
                        element={
                            <RutaProtegida>
                                <MedidasForm />
                            </RutaProtegida>
                        }
                    />
                    <Route
                        path="/pedidos/nuevo"
                        element={
                            <RutaProtegida>
                                <PedidoForm />
                            </RutaProtegida>
                        }
                    />
                    {/* Redirigir raíz al dashboard (o login si no hay sesión) */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
