// Componente principal del dashboard
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';


export default function Dashboard() {
    // Redirigir directamente al dashboard principal
    return <Navigate to="/dashboard/main" replace />;
}
