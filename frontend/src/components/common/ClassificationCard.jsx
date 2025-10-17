import React from 'react';

const ClassificationCard = ({ 
    title, 
    totalCases, 
    trend, 
    icon, 
    color = 'blue', 
    onClick
}) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const getColorClasses = (color) => {
        const colorMap = {
            blue: {
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/30',
                text: 'text-blue-400',
                icon: 'bg-blue-500',
                hover: 'hover:bg-blue-500/20'
            },
            red: {
                bg: 'bg-red-500/10',
                border: 'border-red-500/30',
                text: 'text-red-400',
                icon: 'bg-red-500',
                hover: 'hover:bg-red-500/20'
            },
            yellow: {
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/30',
                text: 'text-yellow-400',
                icon: 'bg-yellow-500',
                hover: 'hover:bg-yellow-500/20'
            },
            green: {
                bg: 'bg-green-500/10',
                border: 'border-green-500/30',
                text: 'text-green-400',
                icon: 'bg-green-500',
                hover: 'hover:bg-green-500/20'
            },
            cyan: {
                bg: 'bg-cyan-500/10',
                border: 'border-cyan-500/30',
                text: 'text-cyan-400',
                icon: 'bg-cyan-500',
                hover: 'hover:bg-cyan-500/20'
            },
            purple: {
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/30',
                text: 'text-purple-400',
                icon: 'bg-purple-500',
                hover: 'hover:bg-purple-500/20'
            }
        };
        return colorMap[color] || colorMap.blue;
    };

    const colors = getColorClasses(color);

    return (
        <div 
            onClick={handleClick}
            className={`
                h-full cursor-pointer transition-all duration-300 ease-in-out
                ${colors.bg} ${colors.border} ${colors.hover}
                border border-white/5 rounded-xl p-2 shadow-card hover:shadow-card-hover
                hover:-translate-y-0.5 transform
            `}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-0.5 tracking-wide">
                        {title}
                    </h3>
                </div>
                <div className={`
                    px-1.5 py-1 rounded-lg ${colors.icon} text-white ml-2 text-xs
                `}>
                    {icon}
                </div>
            </div>

            <div className="mb-2">
                <div className={`text-lg font-semibold ${colors.text} leading-snug`}>
                    {totalCases.toLocaleString()}
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Total de casos
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {trend >= 0 ? (
                        <span className="text-green-400 mr-1 text-xs">↗</span>
                    ) : (
                        <span className="text-red-400 mr-1 text-xs">↘</span>
                    )}
                    <span className={`
                        text-[11px] font-medium
                        ${trend >= 0 ? 'text-green-400' : 'text-red-400'}
                    `}>
                        {Math.abs(trend).toFixed(1)}%
                    </span>
                </div>
                
                <div className={`
                    px-2 py-0.5 rounded text-[11px] font-medium
                    ${colors.bg} ${colors.text}
                `}>
                    Ver
                </div>
            </div>
        </div>
    );
};

export default ClassificationCard;










