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

        if (segments.length >= 2) {
            const current = segments[segments.length - 1];
            if (current !== 'main') {
                crumbs.push({
                    label: PATH_LABELS[current] || current,
                    path: location.pathname
                });
            }
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
                            <h1
                                onClick={handleBackToMain}
                                className="text-xl font-semibold text-white cursor-pointer select-none"
                            >
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
                                <svg
                                    className="w-4 h-4 mr-2 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path
                                        d="M3 10.5L12 3l9 7.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M5.25 9.75V21h5.25v-6h3v6H18.7V9.75"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                Inicio
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;





