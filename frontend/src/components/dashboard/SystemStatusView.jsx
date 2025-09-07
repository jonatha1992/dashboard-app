import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  CloudSync as CloudSyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { analysisService } from '../../services/analysisService';
import ExcelUpload from './ExcelUpload';

const SystemStatusView = () => {
  const [dwStatus, setDwStatus] = useState(null);
  const [etlStatus, setEtlStatus] = useState(null);
  const [provinciasDisponibles, setProvinciasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [etlRunning, setEtlRunning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [etlResult, setEtlResult] = useState(null);

  useEffect(() => {
    loadAllStatus();
    const interval = setInterval(() => {
      loadAllStatus();
    }, etlRunning ? 10000 : 60000);
    
    return () => clearInterval(interval);
  }, [etlRunning]);

  const loadAllStatus = async () => {
    setLoading(true);
    try {
      const [dwData, etlData, provinciaData] = await Promise.all([
        analysisService.getDWStatus(),
        analysisService.getETLStatus(),
        analysisService.getProvinciasDisponibles()
      ]);
      
      setDwStatus(dwData);
      setEtlStatus(etlData);
      setProvinciasDisponibles(provinciaData || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando estado del sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const runETL = async () => {
    setEtlRunning(true);
    setEtlResult(null);
    try {
      const result = await analysisService.runETL();
      setEtlResult(result);
      setTimeout(() => {
        loadAllStatus();
      }, 3000);
    } catch (error) {
      console.error('Error ejecutando ETL:', error);
      setEtlResult({
        status: 'error',
        message: 'Error ejecutando ETL: ' + error.message
      });
    } finally {
      setEtlRunning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
      case 'healthy':
      case 'success':
        return 'success';
      case 'empty':
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
      case 'healthy':
      case 'success':
        return <CheckCircleIcon />;
      case 'empty':
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Nunca';
    return new Date(dateTime).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num || 0);
  };

  const calculateTotalRecords = () => {
    if (!dwStatus?.tablas) return 0;
    return Object.values(dwStatus.tablas).reduce((total, count) => total + (count || 0), 0);
  };

  const getSystemHealth = () => {
    if (!dwStatus) return { status: 'unknown', message: 'Cargando...' };
    
    const factCount = dwStatus.tablas?.fact_procedimientos || 0;
    const dimTiempoCount = dwStatus.tablas?.dim_tiempo || 0;
    const dimGeografiaCount = dwStatus.tablas?.dim_geografia || 0;
    
    if (factCount === 0) {
      return { status: 'error', message: 'Sistema vacío - ejecutar ETL' };
    }
    
    if (factCount > 0 && dimTiempoCount > 0 && dimGeografiaCount > 0) {
      return { status: 'healthy', message: 'Sistema operativo' };
    }
    
    return { status: 'warning', message: 'Sistema parcialmente configurado' };
  };

  const systemHealth = getSystemHealth();

  return (
    <div className="system-status p-6 bg-white rounded-lg shadow-md my-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <SpeedIcon className="mr-2 text-blue-600" />
            Estado del Sistema
          </h2>
          <p className="text-sm text-gray-500">Data Warehouse y Procesamiento ETL</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip title="Actualizar estado">
            <IconButton 
              onClick={loadAllStatus} 
              disabled={loading || etlRunning}
              className="hover:bg-blue-50"
            >
              <RefreshIcon className={loading ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
          
          <Chip
            icon={getStatusIcon(systemHealth.status)}
            label={systemHealth.message}
            color={getStatusColor(systemHealth.status)}
            variant="outlined"
            className="hidden md:flex"
          />
          
          <Button
            variant="contained"
            color="primary"
            startIcon={etlRunning ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={runETL}
            disabled={etlRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {etlRunning ? 'Ejecutando ETL...' : 'Ejecutar ETL'}
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* ETL Status */}
      {etlRunning && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>ETL en ejecución</strong> - Procesando datos dimensionales. Esto puede tomar varios minutos.
          </Typography>
          <LinearProgress sx={{ mt: 1 }} />
        </Alert>
      )}

      {/* ETL Result */}
      {etlResult && (
        <Alert 
          severity={etlResult.status === 'success' ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setEtlResult(null)}
        >
          <Typography variant="body2">
            <strong>{etlResult.status === 'success' ? 'ETL Exitoso' : 'ETL Falló'}</strong>
            <br />
            {etlResult.message}
            {etlResult.details && (
              <Box component="div" sx={{ mt: 1, fontSize: '0.875rem' }}>
                • Registros de tiempo: {formatNumber(etlResult.details.tiempo_records)}
                <br />
                • Registros de geografía: {formatNumber(etlResult.details.geografia_records)}
                <br />
                • Hechos creados: {formatNumber(etlResult.details.facts_created)}
                <br />
                • Agregaciones provinciales: {formatNumber(etlResult.details.provincial_aggs)}
                <br />
                • Agregaciones departamentales: {formatNumber(etlResult.details.departmental_aggs)}
              </Box>
            )}
          </Typography>
        </Alert>
      )}

      {/* System Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {formatNumber(calculateTotalRecords())}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registros Totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {formatNumber(dwStatus?.tablas?.fact_procedimientos || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hechos Procesados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <StorageIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {provinciasDisponibles.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Provincias Activas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CloudSyncIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" color="info.main">
                {formatDateTime(etlStatus?.ultima_carga)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Última Carga
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Tables Information */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <StorageIcon /> Estado de Tablas del Data Warehouse
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Tabla</strong></TableCell>
                  <TableCell align="right"><strong>Registros</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Dimensión Tiempo</TableCell>
                  <TableCell align="right">{formatNumber(dwStatus?.tablas?.dim_tiempo || 0)}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={dwStatus?.tablas?.dim_tiempo > 0 ? 'OK' : 'Vacía'} 
                      color={dwStatus?.tablas?.dim_tiempo > 0 ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Dimensión Geografía</TableCell>
                  <TableCell align="right">{formatNumber(dwStatus?.tablas?.dim_geografia || 0)}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={dwStatus?.tablas?.dim_geografia > 0 ? 'OK' : 'Vacía'} 
                      color={dwStatus?.tablas?.dim_geografia > 0 ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tabla de Hechos</TableCell>
                  <TableCell align="right">{formatNumber(dwStatus?.tablas?.fact_procedimientos || 0)}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={dwStatus?.tablas?.fact_procedimientos > 0 ? 'OK' : 'Vacía'} 
                      color={dwStatus?.tablas?.fact_procedimientos > 0 ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Agregaciones Provinciales</TableCell>
                  <TableCell align="right">{formatNumber(dwStatus?.tablas?.agg_mensual_provincia || 0)}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={dwStatus?.tablas?.agg_mensual_provincia > 0 ? 'OK' : 'Vacía'} 
                      color={dwStatus?.tablas?.agg_mensual_provincia > 0 ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Agregaciones Departamentales</TableCell>
                  <TableCell align="right">{formatNumber(dwStatus?.tablas?.agg_mensual_departamento || 0)}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={dwStatus?.tablas?.agg_mensual_departamento > 0 ? 'OK' : 'Vacía'} 
                      color={dwStatus?.tablas?.agg_mensual_departamento > 0 ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Excel Upload Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cargar Datos desde Excel
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <ExcelUpload onUploadSuccess={loadAllStatus} />
        </CardContent>
      </Card>

      {/* Last Update */}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Última actualización: {lastUpdate ? formatDateTime(lastUpdate) : 'Nunca'}
        </Typography>
      </Box>
    </div>
  );
};

export default SystemStatusView;
