import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboard } from '../../contexts/DashboardContext';

const PATH_LABELS = {
    detenidos: 'Detenidos',
    afectados: 'Afectados',
    controlados: 'Controlados',
    procedimientos: 'Procedimientos',
    incautaciones: 'Incautaciones',
    trata: 'Trata / Traffico',
    abatidos: 'Abatidos',
    fallecidos: 'Fallecidos',
    otros: 'Otros Delitos'
};

const DashboardLayout = ({ children, showBackButton = true }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setActiveCategory } = useDashboard();

    const breadcrumbs = useMemo(() => {
        const segments = location.pathname.split('/').filter(Boolean);
        const crumbs = [{ label: 'Dashboard Principal', path: '/dashboard/main', icon: true }];

        if (segments.length > 2) {
            const current = segments[2];
            crumbs.push({
                label: PATH_LABELS[current] || current,
                path: location.pathname
            });
        }

        return crumbs;
    }, [location.pathname]);

    const currentCategory = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard Principal';

    useEffect(() => {
        if (typeof setActiveCategory === 'function') {
            setActiveCategory(currentCategory);
        }
        console.info('[DashboardLayout] Vista activa', {
            ruta: location.pathname,
            categoria: currentCategory
        });
    }, [currentCategory, location.pathname, setActiveCategory]);

    const handleBackToMain = () => {
        navigate('/dashboard/main');
    };

    return (
        <div className="min-h-screen bg-background-primary">
            <header className="bg-background-secondary shadow-lg border-b border-dark-600 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-white">
                                Sistema de Analisis Operativo
                                {currentCategory !== 'Dashboard Principal' && (
                                    <span className="ml-2 text-sm font-normal text-gray-300">
                                        / {currentCategory}
                                    </span>
                                )}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {showBackButton && location.pathname !== '/dashboard/main' && (
                                <button
                                    onClick={handleBackToMain}
                                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-background-hover rounded-lg transition-colors duration-200"
                                >
                                    <span className="mr-2">&lt;-</span>
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

            {breadcrumbs.length > 1 && (
                <div className="bg-background-secondary border-b border-dark-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center space-x-2 text-sm">
                            {breadcrumbs.map((crumb, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <React.Fragment key={crumb.path}>
                                        {index > 0 && <span className="text-gray-500">/</span>}
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
