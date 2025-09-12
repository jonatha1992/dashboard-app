import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/auth/Login'
import Dashboard from './components/dashboard/Dashboard'
import AdminDashboard from './components/admin/AdminDashboard'
import ErrorBoundary from './components/common/ErrorBoundary'
import MainDashboard from './components/views/main/MainDashboard'
import DetenidosDashboard from './components/views/detenidos/DetenidosDashboard'
import AfectadosDashboard from './components/views/afectados/AfectadosDashboard'
import ControladosDashboard from './components/views/controlados/ControladosDashboard'
import ProcedimientosDashboard from './components/views/procedimientos/ProcedimientosDashboard'
import IncautacionesDashboard from './components/views/incautaciones/IncautacionesDashboard'
import AbatidosDashboard from './components/views/abatidos/AbatidosDashboard'
import TrataDashboard from './components/views/trata/TrataDashboard'

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-white mt-4">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/main" replace />} />
          <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/main"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <MainDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/detenidos"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DetenidosDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/afectados"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AfectadosDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/controlados"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <ControladosDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/procedimientos"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <ProcedimientosDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/incautaciones"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <IncautacionesDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/abatidos"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AbatidosDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/trata"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <TrataDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AdminDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App
