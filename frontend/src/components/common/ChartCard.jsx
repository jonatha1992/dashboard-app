import React from 'react';

const ChartCard = ({ title, subtitle, children, alert = null }) => (
    <div className="h-full flex flex-col bg-background-secondary border border-dark-600 rounded-lg shadow-card">
        <div className="px-4 py-3 border-b border-dark-600">
            <h3 className="text-lg font-semibold text-white mb-1">
                {title}
            </h3>
            {subtitle && (
                <p className="text-sm text-gray-400">
                    {subtitle}
                </p>
            )}
        </div>
        <div className="flex-grow p-4">
            {alert && (
                <div className={`
                    mb-3 p-2 rounded text-sm
                    ${alert.severity === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : ''}
                    ${alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : ''}
                    ${alert.severity === 'info' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : ''}
                    ${alert.severity === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : ''}
                `}>
                    {alert.message}
                </div>
            )}
            <div className="w-full" style={{ height: '300px' }}>
                {children}
            </div>
        </div>
    </div>
);

export default ChartCard;
