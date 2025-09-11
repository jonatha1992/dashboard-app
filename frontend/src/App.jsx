import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import { AuthProvider, useAuth } from './contexts/AuthContext' // Comentado para modo desarrollo
// import Login from './components/auth/Login' // Comentado para modo desarrollo
import Dashboard from './components/dashboard/Dashboard'
import AdminDashboard from './components/admin/AdminDashboard'
import ErrorBoundary from './components/common/ErrorBoundary'

// Componente para proteger rutas - COMENTADO PARA DESARROLLO
// const ProtectedRoute = ({ children }) => {
//   const { authenticated, loading } = useAuth();
//
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="text-gray-600 mt-2">Cargando...</p>
//         </div>
//       </div>
//     );
//   }
//
//   if (!authenticated) {
//     return <Navigate to="/login" replace />;
//   }
//
//   return children;
// };

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* <Route path="/login" element={<Login />} /> */} {/* Comentado para desarrollo */}
        <Route
          path="/dashboard"
          element={
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          } // Sin ProtectedRoute para desarrollo
        />
        <Route
          path="/admin"
          element={
            <ErrorBoundary>
              <AdminDashboard />
            </ErrorBoundary>
          } // Vista de administración separada
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
