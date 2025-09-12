import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Info as InfoIcon
} from '@mui/icons-material';

const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'primary', 
    trend = null,
    progress = null,
    tooltip = null
}) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette[color].light}15, ${theme.palette[color].main}25)`,
                border: `1px solid ${theme.palette[color].light}`,
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows[2],
                }
            }}
        >
            <CardContent sx={{ p: 1.5, pb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
                            {title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {subtitle}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette[color].main }}>
                            {value}
                        </Typography>
                    </Box>
                    
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 1.5,
                            backgroundColor: theme.palette[color].main,
                            color: 'white',
                            ml: 1
                        }}
                    >
                        <Icon sx={{ fontSize: 20 }} />
                    </Box>
                </Box>

                {/* Trend indicator */}
                {trend !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        {trend >= 0 ? (
                            <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 14 }} />
                        ) : (
                            <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5, fontSize: 14 }} />
                        )}
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: trend >= 0 ? 'success.main' : 'error.main',
                                fontWeight: 'medium'
                            }}
                        >
                            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                        </Typography>
                    </Box>
                )}

                {/* Progress bar */}
                {progress !== undefined && (
                    <Box sx={{ mb: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                {progress}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: `${theme.palette[color].main}20`,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: theme.palette[color].main,
                                    borderRadius: 2,
                                }
                            }}
                        />
                    </Box>
                )}

                {/* Tooltip */}
                {tooltip && (
                    <Tooltip title={tooltip} placement="top">
                        <InfoIcon 
                            sx={{ 
                                position: 'absolute', 
                                top: 6, 
                                right: 6, 
                                fontSize: 14, 
                                color: 'text.secondary',
                                cursor: 'help'
                            }} 
                        />
                    </Tooltip>
                )}
            </CardContent>
        </Card>
    );
};

export default MetricCard;
