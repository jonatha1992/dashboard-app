// Componente de mapa optimizado para mostrar las ubicaciones
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useMemo, memo } from 'react';
import L from 'leaflet';
import { useDashboard } from '../../contexts/DashboardContext';
import { getCoordinatesFromItem } from '../../contexts/DashboardContext';
import { formatDateForDisplay } from '../../utils/dataUtils';

// Fallback function in case import fails
const fallbackFormatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-AR');
  } catch {
    return '-';
  }
};

// Fix para los íconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Icono para clusters
let ClusterIcon = L.divIcon({
    html: '<div class="cluster-icon"><span></span></div>',
    className: 'custom-cluster-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Función para agrupar puntos cercanos (clustering simple)
const clusterPoints = (points, zoom) => {
    if (!points || points.length === 0) return [];

    // Constantes para el cálculo de la distancia de clustering
    const MIN_CLUSTER_DISTANCE = 0.1; // Distancia mínima absoluta entre puntos (en grados)
    const BASE_CLUSTER_DISTANCE = 2; // Distancia base para el cálculo dinámico
    const ZOOM_OFFSET = 3; // Offset para ajustar el efecto del zoom en la distancia

    // Distancia mínima entre puntos para considerar clustering (en grados)
    // A menor zoom, mayor distancia para agrupar más puntos
    const clusterDistance = Math.max(
        MIN_CLUSTER_DISTANCE,
        BASE_CLUSTER_DISTANCE / Math.pow(2, zoom - ZOOM_OFFSET)
    );

    const clusters = [];
    const processed = new Set();

    points.forEach((point, index) => {
        if (processed.has(index)) return;

        // Usar función centralizada para obtener coordenadas
        const coords = getCoordinatesFromItem(point);

        if (!coords || coords.lat === null || coords.lng === null) return;
        
        const { lat, lng } = coords;

        const cluster = {
            lat: lat,  // Ya viene como número válido de getCoordinatesFromItem
            lng: lng,  // Ya viene como número válido de getCoordinatesFromItem
            points: [point],
            id: `cluster-${index}`
        };

        // Buscar puntos cercanos para agrupar
        points.forEach((otherPoint, otherIndex) => {
            if (processed.has(otherIndex) || index === otherIndex) return;

            // Usar función centralizada para obtener coordenadas del otro punto
            const otherCoords = getCoordinatesFromItem(otherPoint);
            if (!otherCoords) return;
            
            const { lat: otherLat, lng: otherLng } = otherCoords;

            if (otherLat === null || otherLng === null) return;

            const distance = Math.sqrt(
                Math.pow(lat - otherLat, 2) +
                Math.pow(lng - otherLng, 2)
            );

            if (distance < clusterDistance) {
                cluster.points.push(otherPoint);
                processed.add(otherIndex);
            }
        });

        processed.add(index);
        clusters.push(cluster);
    });

    return clusters;
};

// Función para detectar el tipo de dato y generar contenido específico del popup
const getSpecificPopupContent = (point) => {
    // Detectar tipo de datos
    if (point.INCAUTACIONES || point.TIPO || point.CANTIDAD) {
        // Datos de incautaciones
        return (
            <div className="space-y-1 text-xs">
                <p><span className="font-medium">Incautación:</span> {point.INCAUTACIONES || 'No especificada'}</p>
                <p><span className="font-medium">Tipo:</span> {point.TIPO || 'No especificado'}</p>
                <p><span className="font-medium">Cantidad:</span> {point.CANTIDAD || 'No especificada'} {point.MEDIDAS || ''}</p>
                {point.OBSERVACIONES_INCAUTACION && (
                    <p><span className="font-medium">Observaciones:</span> {point.OBSERVACIONES_INCAUTACION}</p>
                )}
            </div>
        );
    } else if (point.EDAD !== undefined || point.SEXO || point.DELITO_IMPUTADO) {
        // Datos de detenidos
        return (
            <div className="space-y-1 text-xs">
                <p><span className="font-medium">Edad:</span> {point.EDAD || 'No especificada'}</p>
                <p><span className="font-medium">Sexo:</span> {point.SEXO || 'No especificado'}</p>
                <p><span className="font-medium">Nacionalidad:</span> {point.NACIONALIDAD || 'No especificada'}</p>
                <p><span className="font-medium">Situación:</span> {point.SITUACION_PROCESAL || 'No especificada'}</p>
                {point.DELITO_IMPUTADO && (
                    <p><span className="font-medium">Delito:</span> {point.DELITO_IMPUTADO}</p>
                )}
            </div>
        );
    } else if (point.vehiculos_controlados !== undefined || point.personas_controladas !== undefined) {
        // Datos de controlados
        return (
            <div className="space-y-1 text-xs">
                <p><span className="font-medium">Vehículos:</span> {point.vehiculos_controlados || 0}</p>
                <p><span className="font-medium">Personas:</span> {point.personas_controladas || 0}</p>
                {point.cant_averiguaciones_secuestro !== null && (
                    <p><span className="font-medium">Averiguaciones:</span> {point.cant_averiguaciones_secuestro || 0}</p>
                )}
                {point.cant_solicitudes_antecedentes !== null && (
                    <p><span className="font-medium">Antecedentes:</span> {point.cant_solicitudes_antecedentes || 0}</p>
                )}
            </div>
        );
    } else if (point.CANT_EFECTIVOS !== undefined || point.cant_efectivos !== undefined) {
        // Datos de personal afectado
        return (
            <div className="space-y-1 text-xs">
                <p><span className="font-medium">Efectivos:</span> {point.CANT_EFECTIVOS || point.cant_efectivos || 0}</p>
                {(point.CANT_AUTOS_CAMIONETAS || point.cant_autos_camionetas) && (
                    <p><span className="font-medium">Vehículos:</span> {point.CANT_AUTOS_CAMIONETAS || point.cant_autos_camionetas || 0}</p>
                )}
                {point.CANT_MOTOS && (
                    <p><span className="font-medium">Motocicletas:</span> {point.CANT_MOTOS || 0}</p>
                )}
                {point.CANT_SCANNERS && (
                    <p><span className="font-medium">Scanners:</span> {point.CANT_SCANNERS || 0}</p>
                )}
            </div>
        );
    }
    
    // Contenido general por defecto
    return (
        <div className="space-y-1 text-xs">
            <p><span className="font-medium">Tipo:</span> {(point.TIPO_INTERVENCION || point.TIPO || point.CATEGORIA || 'No especificado')}</p>
        </div>
    );
};

// Componente memorizado para los marcadores
const MapMarkers = memo(({ clusters }) => {
    return (
        <>
            {clusters.map((cluster) => {
                if (cluster.points.length === 1) {
                    // Marcador individual
                    const point = cluster.points[0];
                    const dateFunction = typeof formatDateForDisplay === 'function' ? formatDateForDisplay : fallbackFormatDate;
                    const formattedDate = dateFunction(point.FECHA_ISO || point.FECHA);
                    return (
                        <Marker
                            key={cluster.id}
                            position={[cluster.lat, cluster.lng]}
                        >
                            <Popup>
                                <div className="max-w-sm">
                                    <h3 className="mb-2 text-sm font-bold">{(point.DESCRIPCION || point.DESCRIPCION_HECHO || point.DETALLE || point.OBSERVACION || point.OBSERVACIONES || 'Sin descripción')}</h3>
                                    <div className="mb-2 space-y-1 text-xs">
                                        <p><span className="font-medium">Fecha:</span> {formattedDate}{point.HORA ? ` ${point.HORA}` : ''}</p>
                                        <p><span className="font-medium">Provincia:</span> {point.PROVINCIA || 'No especificada'}</p>
                                        <p><span className="font-medium">ID Operativo:</span> {point.ID_OPERATIVO || 'No especificado'}</p>
                                    </div>
                                    {getSpecificPopupContent(point)}
                                </div>
                            </Popup>
                        </Marker>
                    );
                } else {
                    // Cluster de múltiples puntos
                    return (
                        <Marker
                            key={cluster.id}
                            position={[cluster.lat, cluster.lng]}
                            icon={L.divIcon({
                                html: `<div class="cluster-marker">
                                    <div class="cluster-count">${cluster.points.length}</div>
                                </div>`,
                                className: 'custom-cluster-icon',
                                iconSize: [40, 40],
                                iconAnchor: [20, 20],
                            })}
                        >
                            <Popup maxWidth={300}>
                                <div className="max-w-sm">
                                    <h3 className="mb-2 text-sm font-bold">
                                        {cluster.points.length} eventos en esta área
                                    </h3>
                                    <div className="space-y-2 overflow-y-auto max-h-32">
                                        {cluster.points.slice(0, 5).map((point, idx) => {
                                            const dateFunction = typeof formatDateForDisplay === 'function' ? formatDateForDisplay : fallbackFormatDate;
                                            const formattedDate = dateFunction(point.FECHA_ISO || point.FECHA);
                                            
                                            // Obtener información específica resumida
                                            let specificInfo = '';
                                            if (point.INCAUTACIONES || point.TIPO || point.CANTIDAD) {
                                                specificInfo = `${point.TIPO || 'Incautación'}: ${point.CANTIDAD || '?'} ${point.MEDIDAS || ''}`;
                                            } else if (point.EDAD !== undefined || point.SEXO || point.DELITO_IMPUTADO) {
                                                specificInfo = `${point.SEXO || '?'}, ${point.EDAD || '?'} años - ${point.DELITO_IMPUTADO || 'Sin delito'}`;
                                            } else if (point.vehiculos_controlados !== undefined || point.personas_controladas !== undefined) {
                                                specificInfo = `${point.vehiculos_controlados || 0} veh, ${point.personas_controladas || 0} pers`;
                                            } else if (point.CANT_EFECTIVOS !== undefined || point.cant_efectivos !== undefined) {
                                                specificInfo = `${point.CANT_EFECTIVOS || point.cant_efectivos || 0} efectivos`;
                                            } else {
                                                specificInfo = point.TIPO_INTERVENCION || point.TIPO || point.CATEGORIA || 'No especificado';
                                            }
                                            
                                            return (
                                                <div key={idx} className="pb-1 text-xs border-b border-gray-200">
                                                    <p className="font-medium">{point.ID_OPERATIVO || 'Sin ID'}</p>
                                                    <p className="text-gray-600">{specificInfo}</p>
                                                    <p className="text-gray-500">{formattedDate}</p>
                                                </div>
                                            );
                                        })}
                                        {cluster.points.length > 5 && (
                                            <p className="text-xs italic text-gray-500">
                                                +{cluster.points.length - 5} eventos más...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                }
            })}
        </>
    );
});

MapMarkers.displayName = 'MapMarkers';

const MapComponent = ({ data }) => {
    const [mapCenter, setMapCenter] = useState([-34.6037, -58.3816]); // Buenos Aires por defecto
    const [mapZoom, setMapZoom] = useState(5);
    const [map, setMap] = useState(null);

    // Debug: Log cuando cambien los datos para verificar re-renderización
    useEffect(() => {
        console.log('🔄 MapComponent: useEffect activado por cambio de datos', {
            dataLength: data?.length || 0,
            timestamp: new Date().toISOString()
        });
    }, [data]);

    // Filtrar y validar datos una sola vez - agregar logging de referencia para debug
    const validData = useMemo(() => {
        if (!data || data.length === 0) {
            console.log('🗺️ MapComponent: No hay datos para mostrar', { dataRef: data });
            return [];
        }

        console.log(`🗺️ MapComponent: Procesando ${data.length} puntos de datos`, { 
            dataRef: data?.slice(0, 2),
            provinciasUnicas: [...new Set(data.map(item => item.PROVINCIA))].filter(Boolean)
        });

        const valid = data.filter(point => {
            // Usar función centralizada para obtener y validar coordenadas
            const coords = getCoordinatesFromItem(point);
            
            const isValid = coords && coords.lat !== null && coords.lng !== null;
            
            // El logging ya se maneja en getCoordinatesFromItem, pero podemos agregar logging específico del mapa
            if (!isValid && Math.random() < 0.01) { // Log 1% para debugging específico del mapa
                console.log('🗺️ MapComponent - Punto excluido por coordenadas inválidas:', {
                    id: point.ID_OPERATIVO || 'Sin ID',
                    point: point
                });
            }
            
            return isValid;
        });

        console.log(`🗺️ MapComponent: ${valid.length}/${data.length} puntos con coordenadas válidas`);
        
        if (valid.length === 0) {
            console.warn('⚠️ MapComponent: No hay puntos con coordenadas válidas para mostrar');
        }

        return valid;
    }, [data]);

    // Crear clusters optimizados - forzar recálculo cuando cambien los datos
    const clusters = useMemo(() => {
        const clustered = clusterPoints(validData, mapZoom);
        console.log(`🗺️ Clustering: ${validData.length} puntos → ${clustered.length} clusters (zoom: ${mapZoom})`);
        
        // Log estadísticas de clustering
        const singlePoints = clustered.filter(c => c.points.length === 1).length;
        const multiPoints = clustered.filter(c => c.points.length > 1).length;
        if (clustered.length > 0) {
            console.log(`📊 Clusters: ${singlePoints} individuales, ${multiPoints} agrupados`);
        }
        
        // Debug adicional: mostrar provincias en los clusters
        const provinciasClusters = [...new Set(clustered.flatMap(c => c.points.map(p => p.PROVINCIA)).filter(Boolean))];
        console.log(`🗺️ Provincias en clusters:`, provinciasClusters);
        
        return clustered;
    }, [validData, mapZoom]);

    // Crear una key única basada en los datos para forzar re-renderización de marcadores
    const markersKey = useMemo(() => {
        if (!data || data.length === 0) return 'empty';
        const provincias = [...new Set(data.map(item => item.PROVINCIA))].filter(Boolean).sort().join(',');
        return `markers-${data.length}-${provincias}`;
    }, [data]);

    // Centrar el mapa cuando hay nuevos datos
    useEffect(() => {
        if (validData.length > 0 && map) {
            const firstPoint = validData[0];
            // Usar función centralizada para obtener coordenadas
            const coords = getCoordinatesFromItem(firstPoint);
            
            if (coords && coords.lat !== null && coords.lng !== null) {
                const { lat, lng } = coords;
                const newCenter = [lat, lng];
                console.log(`🗺️ Centrando mapa en:`, newCenter);
                setMapCenter(newCenter);
                map.setView(newCenter, mapZoom);
            }
        }
    }, [validData, map, mapZoom]);

    // Manejar cambios de zoom para re-clustering
    const handleZoomEnd = () => {
        if (map) {
            setMapZoom(map.getZoom());
        }
    };

    // Invalidar tamaño del mapa al montar y al redimensionar para evitar espacio en blanco
    useEffect(() => {
        if (!map) return;
        const invalidate = () => {
            try {
                map.invalidateSize();
            } catch {
                // invalidation puede fallar si el mapa aún no está listo
                console.debug('Leaflet invalidateSize skipped');
            }
        };
        const t = setTimeout(invalidate, 0);
        window.addEventListener('resize', invalidate);
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', invalidate);
        };
    }, [map]);

    // Si no hay datos geográficos válidos, mostrar un mensaje
    if (validData.length === 0) {
        return (
            <div className="relative z-10 w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center p-8">
                    <div className="text-4xl mb-4 text-gray-400">🗺️</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Sin datos geográficos
                    </h3>
                    <p className="text-sm text-gray-500">
                        {data.length === 0 
                            ? 'No hay datos disponibles para mostrar en el mapa'
                            : `${data.length} registro${data.length > 1 ? 's' : ''} sin coordenadas válidas`
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative z-10 w-full h-full" style={{
            /* Controlar z-index de Leaflet para que no se superponga al header */
        }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .cluster-marker {
                    background: #ff6b6b;
                    border-radius: 50%;
                    border: 3px solid #fff;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .cluster-count {
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                }
                .custom-cluster-icon {
                    background: transparent !important;
                    border: none !important;
                }
                /* Controlar z-index de Leaflet para que no se superponga al header */
                .leaflet-container {
                    z-index: 10 !important;
                }
                .leaflet-control-container {
                    z-index: 15 !important;
                }
                .leaflet-popup {
                    z-index: 30 !important;
                }
                .leaflet-tooltip {
                    z-index: 30 !important;
                }
                `
            }} />
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ width: '100%', height: '100%' }}
                whenCreated={setMap}
                onZoomEnd={handleZoomEnd}
                maxZoom={18}
                minZoom={3}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MapMarkers 
                    key={markersKey}
                    clusters={clusters} 
                />
            </MapContainer>
        </div>
    );
};

MapComponent.displayName = 'MapComponent';

export default MapComponent;
