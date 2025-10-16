import React from 'react';

const LoadingSpinner = ({ label = 'Cargando informacion operativa...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center text-gray-200">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
            <span className="text-sm font-medium tracking-wide uppercase">{label}</span>
        </div>
    );
};

export default LoadingSpinner;
