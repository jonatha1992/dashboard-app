import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Alert,
    CardHeader
} from '@mui/material';

const ChartCard = ({ title, subtitle, children, alert = null }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
            title={title}
            subheader={subtitle}
            sx={{ pb: 0.5, pt: 1.5, px: 2 }}
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
            subheaderTypographyProps={{ variant: 'caption' }}
        />
        <CardContent sx={{ flexGrow: 1, pt: 0.5, px: 2, pb: 2 }}>
            {alert && (
                <Alert severity={alert.severity} sx={{ mb: 1, py: 0.5 }}>
                    <Typography variant="caption">{alert.message}</Typography>
                </Alert>
            )}
            <Box sx={{ height: 250, width: '100%' }}>
                {children}
            </Box>
        </CardContent>
    </Card>
);

export default ChartCard;
