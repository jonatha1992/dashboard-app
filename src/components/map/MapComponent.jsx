// Componente de mapa optimizado para mostrar las ubicaciones
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useMemo, memo } from 'react';
import L from 'leaflet';

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
    
    // Distancia mínima entre puntos para considerar clustering (en grados)
    // A menor zoom, mayor distancia para agrupar más puntos
    const clusterDistance = Math.max(0.1, 2 / Math.pow(2, zoom - 3));
    
    const clusters = [];
    const processed = new Set();
    
    points.forEach((point, index) => {
        if (processed.has(index)) return;
        
        const lat = point.latitud_decimal ?? point["Latitud Decimal"] ?? point.LATITUD;
        const lng = point.longitud_decimal ?? point["Longitud Decimal"] ?? point.LONGITUD;
        
        if (!lat || !lng) return;
        
        const cluster = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            points: [point],
            id: `cluster-${index}`
        };
        
        // Buscar puntos cercanos para agrupar
        points.forEach((otherPoint, otherIndex) => {
            if (processed.has(otherIndex) || index === otherIndex) return;
            
            const otherLat = otherPoint.latitud_decimal ?? otherPoint["Latitud Decimal"] ?? otherPoint.LATITUD;
            const otherLng = otherPoint.longitud_decimal ?? otherPoint["Longitud Decimal"] ?? otherPoint.LONGITUD;
            
            if (!otherLat || !otherLng) return;
            
            const distance = Math.sqrt(
                Math.pow(parseFloat(lat) - parseFloat(otherLat), 2) + 
                Math.pow(parseFloat(lng) - parseFloat(otherLng), 2)
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

// Componente memorizado para los marcadores
const MapMarkers = memo(({ clusters }) => {
    return (
        <>
            {clusters.map((cluster) => {
                if (cluster.points.length === 1) {
                    // Marcador individual
                    const point = cluster.points[0];
                    return (
                        <Marker
                            key={cluster.id}
                            position={[cluster.lat, cluster.lng]}
                        >
                            <Popup>
                                <div className="max-w-xs">
                                    <h3 className="font-bold text-sm mb-2">{point.DESCRIPCION || 'Sin descripción'}</h3>
                                    <div className="text-xs space-y-1">
                                        <p><span className="font-medium">Tipo:</span> {point.TIPO_INTERVENCION || 'No especificado'}</p>
                                        <p><span className="font-medium">Fecha:</span> {point.FECHA || 'No especificada'}</p>
                                        <p><span className="font-medium">Hora:</span> {point.HORA || 'No especificada'}</p>
                                        <p><span className="font-medium">Provincia:</span> {point.PROVINCIA || 'No especificada'}</p>
                                    </div>
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
                                    <h3 className="font-bold text-sm mb-2">
                                        {cluster.points.length} eventos en esta área
                                    </h3>
                                    <div className="max-h-32 overflow-y-auto space-y-2">
                                        {cluster.points.slice(0, 5).map((point, idx) => (
                                            <div key={idx} className="text-xs border-b border-gray-200 pb-1">
                                                <p className="font-medium">{point.DESCRIPCION || 'Sin descripción'}</p>
                                                <p className="text-gray-600">{point.TIPO_INTERVENCION || 'No especificado'} - {point.FECHA || 'Sin fecha'}</p>
                                            </div>
                                        ))}
                                        {cluster.points.length > 5 && (
                                            <p className="text-xs text-gray-500 italic">
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

const MapComponent = memo(({ data }) => {
    const [mapCenter, setMapCenter] = useState([-34.6037, -58.3816]); // Buenos Aires por defecto
    const [mapZoom, setMapZoom] = useState(5);
    const [map, setMap] = useState(null);

    // Filtrar y validar datos una sola vez
    const validData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        return data.filter(point => {
            const lat = point.latitud_decimal ?? point["Latitud Decimal"] ?? point.LATITUD;
            const lng = point.longitud_decimal ?? point["Longitud Decimal"] ?? point.LONGITUD;
            return lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
        });
    }, [data]);

    // Crear clusters optimizados
    const clusters = useMemo(() => {
        return clusterPoints(validData, mapZoom);
    }, [validData, mapZoom]);

    // Centrar el mapa cuando hay nuevos datos
    useEffect(() => {
        if (validData.length > 0 && map) {
            const firstPoint = validData[0];
            const lat = firstPoint.latitud_decimal ?? firstPoint["Latitud Decimal"] ?? firstPoint.LATITUD;
            const lng = firstPoint.longitud_decimal ?? firstPoint["Longitud Decimal"] ?? firstPoint.LONGITUD;
            setMapCenter([parseFloat(lat), parseFloat(lng)]);
            map.setView([parseFloat(lat), parseFloat(lng)], mapZoom);
        }
    }, [validData, map, mapZoom]);

    // Manejar cambios de zoom para re-clustering
    const handleZoomEnd = () => {
        if (map) {
            setMapZoom(map.getZoom());
        }
    };

    return (
        <div className="w-full h-full">
            <style jsx>{`
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
            `}</style>
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ width: '100%', height: '100%', minHeight: '500px' }}
                whenCreated={setMap}
                onZoomEnd={handleZoomEnd}
                maxZoom={18}
                minZoom={3}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapMarkers clusters={clusters} />
            </MapContainer>
        </div>
    );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;
