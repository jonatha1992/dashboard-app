import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    useTheme
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

const ClassificationCard = ({ 
    title, 
    description, 
    totalCases, 
    trend, 
    icon: Icon, 
    color = 'primary', 
    onDoubleClick
}) => {
    const theme = useTheme();

    const handleDoubleClick = () => {
        if (onDoubleClick) {
            onDoubleClick();
        }
    };

    return (
        <Card 
            elevation={2}
            onDoubleClick={handleDoubleClick}
            sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: `linear-gradient(135deg, ${theme.palette[color].light}15, ${theme.palette[color].main}25)`,
                border: `1px solid ${theme.palette[color].light}`,
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                    background: `linear-gradient(135deg, ${theme.palette[color].light}25, ${theme.palette[color].main}35)`,
                }
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'text.primary' }}>
                            {title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                            {description}
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
                        <Icon sx={{ fontSize: 18 }} />
                    </Box>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette[color].main, lineHeight: 1 }}>
                        {totalCases.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Total de casos
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {trend >= 0 ? (
                            <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 14 }} />
                        ) : (
                            <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5, fontSize: 14 }} />
                        )}
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: trend >= 0 ? 'success.main' : 'error.main',
                                fontWeight: 'medium',
                                fontSize: '0.7rem'
                            }}
                        >
                            {Math.abs(trend).toFixed(1)}%
                        </Typography>
                    </Box>
                    
                    <Chip
                        label="Ver"
                        size="small"
                        sx={{
                            backgroundColor: `${theme.palette[color].main}20`,
                            color: theme.palette[color].main,
                            fontWeight: 'medium',
                            fontSize: '0.65rem',
                            height: 18
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default ClassificationCard;
