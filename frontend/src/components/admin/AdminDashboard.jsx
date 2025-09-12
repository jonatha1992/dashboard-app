import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../contexts/DashboardContext';
import FilterPanel from '../dashboard/FilterPanel';
import FilteringStatsDashboard from '../dashboard/FilteringStatsDashboard';
import MapComponent from '../map/MapComponent';
import CategoryCharts from '../charts/CategoryCharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { loading, error, filteredCategorizedData } = useDashboard();
  const [activeSection, setActiveSection] = useState('analisis');
  const [activeCategory, setActiveCategory] = useState('controlados');

  useEffect(() => {
    document.body.classList.add('bg-gray-50');
    return () => {
      document.body.classList.remove('bg-gray-50');
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="mb-4 text-red-500">❌</div>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar fijo */}
      <nav className="fixed top-0 left-0 z-50 flex flex-col w-56 h-screen px-4 py-8 bg-white shadow-md">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800">Panel de Administración</h2>
          <p className="text-xs text-gray-500">Gestión y diagnóstico</p>
        </div>

        <button
          className={`text-left px-3 py-2 rounded-md mb-2 text-sm font-medium ${activeSection === 'analisis' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
          onClick={() => setActiveSection('analisis')}
        >
          📊 Análisis
        </button>

        <button
          className={`text-left px-3 py-2 rounded-md mb-2 text-sm font-medium ${activeSection === 'estado' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
          onClick={() => setActiveSection('estado')}
        >
          ⚙️ Estado del sistema
        </button>
        <button
          className={`text-left px-3 py-2 rounded-md mb-2 text-sm font-medium ${activeSection === 'filtrado' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
          onClick={() => setActiveSection('filtrado')}
        >
          🔍 Diagnóstico de filtros
        </button>
        <button
          className={`text-left px-3 py-2 rounded-md mb-2 text-sm font-medium ${activeSection === 'tablas' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
          onClick={() => setActiveSection('tablas')}
        >
          🗂️ Tablas filtradas
        </button>

        <div className="flex-1" />
        <div className="space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            ← Volver al dashboard
          </button>
          <button
            onClick={logout}
            className="w-full px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="flex-1 ml-56">
        <header className="fixed top-0 right-0 z-40 bg-white shadow-md" style={{ width: 'calc(100% - 14rem)' }}>
          <div className="px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-full">
                  <span className="text-xl text-white">🛡️</span>
                </div>
                <h1 className="text-xl font-bold text-gray-800">Administración</h1>
                <FilterPanel inline />
              </div>
              <div className="flex items-center space-x-2">
                {user?.username && (
                  <div className="flex items-center px-3 py-1.5 bg-gray-100 rounded-md">
                    <div className="flex items-center justify-center w-6 h-6 mr-2 bg-blue-600 rounded-full">
                      <span className="text-xs text-white">{user?.role === 'admin' ? '👑' : '👤'}</span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-700">{user?.username}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 mx-auto mt-16 max-w-7xl sm:px-6 lg:px-8 space-y-6">
          {activeSection === 'analisis' && (
            <div className="space-y-6">
              {/* Selector de categoría */}
              <div className="flex items-end justify-between">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="procedimientos">Procedimientos</option>
                    <option value="detenidos">Detenidos</option>
                    <option value="controlados">Controlados</option>
                    <option value="afectados">Afectados</option>
                    <option value="abatidos">Abatidos</option>
                    <option value="trata">Trata</option>
                    <option value="incautaciones">Incautaciones</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  Registros: {(filteredCategorizedData[activeCategory] || []).length.toLocaleString('es-AR')}
                </div>
              </div>

              {/* Grid: mapa reducido + gráficos compactos */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Mapa reducido */}
                <div className="lg:col-span-5">
                  <div className="p-4 bg-white rounded-lg shadow-md" style={{ height: '380px' }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">Mapa</h3>
                    </div>
                    <div style={{ height: 'calc(100% - 28px)' }}>
                      <MapComponent data={filteredCategorizedData[activeCategory] || []} />
                    </div>
                  </div>
                </div>

                {/* Gráficos compactos */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="p-4 bg-white rounded-lg shadow-md">
                    <div style={{ height: '180px' }}>
                      <CategoryCharts
                        data={filteredCategorizedData[activeCategory] || []}
                        categoryName={activeCategory}
                        title="Tendencia temporal"
                        icon="📈"
                        color="bg-blue-500"
                        showTable={false}
                        compactMode={true}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg shadow-md">
                    <div style={{ height: '220px' }}>
                      <CategoryCharts
                        data={filteredCategorizedData[activeCategory] || []}
                        categoryName={activeCategory}
                        title="Por provincia"
                        icon="🗺️"
                        color="bg-indigo-500"
                        showTable={false}
                        compactMode={true}
                        defaultView="province"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg shadow-md">
                    <div style={{ height: '220px' }}>
                      <CategoryCharts
                        data={filteredCategorizedData[activeCategory] || []}
                        categoryName={activeCategory}
                        title="Top unidades intervinientes"
                        icon="🏢"
                        color="bg-emerald-500"
                        showTable={false}
                        compactMode={true}
                        defaultView="unit"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'estado' && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4">Estado del Sistema</h3>
              <p className="text-gray-600">Información del estado del sistema no disponible.</p>
            </div>
          )}

          {activeSection === 'filtrado' && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <FilteringStatsDashboard />
            </div>
          )}

          {activeSection === 'tablas' && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4">Tablas Filtradas</h3>
              <p className="text-gray-600">Vista de tablas filtradas no disponible.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
