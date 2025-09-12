import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children, showBackButton = true }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBackToMain = () => {
        navigate('/dashboard/main');
    };

    const getBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [
            { label: 'Dashboard Principal', path: '/dashboard/main', icon: true }
        ];

        if (pathSegments.length > 2) {
            const currentPath = pathSegments[2];
            const pathLabels = {
                'detenidos': 'Detenidos',
                'afectados': 'Afectados',
                'controlados': 'Controlados',
                'procedimientos': 'Procedimientos',
                'incautaciones': 'Incautaciones',
                'trata': 'Trata/Tráfico',
                'abatidos': 'Abatidos',
                'fallecidos': 'Fallecidos',
                'otros': 'Otros Delitos'
            };

            breadcrumbs.push({
                label: pathLabels[currentPath] || currentPath,
                path: location.pathname
            });
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="min-h-screen bg-background-primary">
            {/* Header Navigation */}
            <header className="bg-background-secondary shadow-lg border-b border-dark-600 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-white">
                                Sistema de Análisis Operativo
                            </h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {showBackButton && location.pathname !== '/dashboard/main' && (
                                <button
                                    onClick={handleBackToMain}
                                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-background-hover rounded-lg transition-colors duration-200"
                                >
                                    <span className="mr-2">←</span>
                                    Volver al Principal
                                </button>
                            )}

                            <button
                                onClick={handleBackToMain}
                                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-background-hover rounded-lg transition-colors duration-200"
                            >
                                <span className="mr-2">🏠</span>
                                Inicio
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
                <div className="bg-background-secondary border-b border-dark-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center space-x-2 text-sm">
                            {breadcrumbs.map((crumb, index) => {
                                const isLast = index === breadcrumbs.length - 1;

                                return (
                                    <React.Fragment key={crumb.path}>
                                        {index > 0 && (
                                            <span className="text-gray-500">/</span>
                                        )}
                                        {isLast ? (
                                            <span className="flex items-center text-white font-medium">
                                                {crumb.icon && <span className="mr-1">🏠</span>}
                                                {crumb.label}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => navigate(crumb.path)}
                                                className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                                            >
                                                {crumb.icon && <span className="mr-1">🏠</span>}
                                                {crumb.label}
                                            </button>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
