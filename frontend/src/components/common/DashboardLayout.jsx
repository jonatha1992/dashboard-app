import React from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    Home as HomeIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
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
            { label: 'Dashboard Principal', path: '/dashboard/main', icon: HomeIcon }
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
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="fixed" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Sistema de Análisis Operativo
                    </Typography>
                    
                    {showBackButton && location.pathname !== '/dashboard/main' && (
                        <Button
                            color="inherit"
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBackToMain}
                            sx={{ mr: 2 }}
                        >
                            Volver al Principal
                        </Button>
                    )}

                    <Button
                        color="inherit"
                        startIcon={<HomeIcon />}
                        onClick={handleBackToMain}
                    >
                        Inicio
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Spacer para compensar el AppBar fijo */}
            <Toolbar />

            {breadcrumbs.length > 1 && (
                <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                    <Container maxWidth="xl" sx={{ py: 1 }}>
                        <Breadcrumbs aria-label="breadcrumb">
                            {breadcrumbs.map((crumb, index) => {
                                const Icon = crumb.icon;
                                const isLast = index === breadcrumbs.length - 1;

                                return isLast ? (
                                    <Typography key={crumb.path} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                                        {Icon && <Icon sx={{ mr: 0.5, fontSize: 20 }} />}
                                        {crumb.label}
                                    </Typography>
                                ) : (
                                    <Link
                                        key={crumb.path}
                                        underline="hover"
                                        color="inherit"
                                        onClick={() => navigate(crumb.path)}
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {Icon && <Icon sx={{ mr: 0.5, fontSize: 20 }} />}
                                        {crumb.label}
                                    </Link>
                                );
                            })}
                        </Breadcrumbs>
                    </Container>
                </Box>
            )}

            <Container maxWidth="xl" sx={{ py: 0 }}>
                {children}
            </Container>
        </Box>
    );
};

export default DashboardLayout;
