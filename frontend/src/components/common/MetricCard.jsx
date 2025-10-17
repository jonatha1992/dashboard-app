import React from 'react';

const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'blue', 
    trend = null,
    progress = null,
    tooltip = null
}) => {
    const getColorClasses = (color) => {
        const colorMap = {
            blue: {
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/30',
                text: 'text-blue-400',
                icon: 'bg-blue-500',
                progress: 'bg-blue-500'
            },
            red: {
                bg: 'bg-red-500/10',
                border: 'border-red-500/30',
                text: 'text-red-400',
                icon: 'bg-red-500',
                progress: 'bg-red-500'
            },
            yellow: {
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/30',
                text: 'text-yellow-400',
                icon: 'bg-yellow-500',
                progress: 'bg-yellow-500'
            },
            green: {
                bg: 'bg-green-500/10',
                border: 'border-green-500/30',
                text: 'text-green-400',
                icon: 'bg-green-500',
                progress: 'bg-green-500'
            },
            cyan: {
                bg: 'bg-cyan-500/10',
                border: 'border-cyan-500/30',
                text: 'text-cyan-400',
                icon: 'bg-cyan-500',
                progress: 'bg-cyan-500'
            },
            purple: {
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/30',
                text: 'text-purple-400',
                icon: 'bg-purple-500',
                progress: 'bg-purple-500'
            }
        };
        return colorMap[color] || colorMap.blue;
    };

    const colors = getColorClasses(color);

    return (
        <div className={`
            h-full relative transition-all duration-300 ease-in-out
            ${colors.bg} ${colors.border} border rounded-xl p-3 shadow-card
            hover:-translate-y-0.5 hover:shadow-card-hover
        `}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h4 className="text-xs font-semibold text-white mb-0.5 tracking-wide uppercase">
                        {title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mb-1.5">
                        {subtitle}
                    </p>
                    <div className={`text-lg font-semibold ${colors.text}`}>
                        {value}
                    </div>
                </div>
                
                <div className={`
                    px-2 py-1.5 rounded-lg ${colors.icon} text-white ml-2 text-sm
                `}>
                    {icon}
                </div>
            </div>

            {/* Trend indicator */}
            {trend !== undefined && trend !== null && (
                <div className="flex items-center mb-1.5">
                    {trend >= 0 ? (
                        <span className="text-green-400 mr-1 text-xs">↗</span>
                    ) : (
                        <span className="text-red-400 mr-1 text-xs">↘</span>
                    )}
                    <span className={`
                        text-[11px] font-medium
                        ${trend >= 0 ? 'text-green-400' : 'text-red-400'}
                    `}>
                        {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                    </span>
                </div>
            )}

            {/* Progress bar */}
            {progress !== undefined && progress !== null && (
                <div className="mb-2">
                    <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">
                            {progress}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                            className={`h-1 rounded-full ${colors.progress}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Tooltip */}
            {tooltip && (
                <div 
                    className="absolute top-2 right-2 text-gray-400 cursor-help text-xs"
                    title={tooltip}
                >
                    ℹ️
                </div>
            )}
        </div>
    );
};

export default MetricCard;






