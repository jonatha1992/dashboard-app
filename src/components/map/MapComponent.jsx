// Componente de mapa para mostrar las ubicaciones
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
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

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapComponent({ data }) {
    const [mapCenter, setMapCenter] = useState([-34.6037, -58.3816]); // Buenos Aires por defecto
    const [mapZoom] = useState(5);
    const [map, setMap] = useState(null);

    // Si hay datos, centrar el mapa en el primer punto
    useEffect(() => {
        if (data && data.length > 0 && map) {
            // Buscar el primer punto válido con latitud_decimal y longitud_decimal
            const firstPoint = data.find(
                p => (p.LATITUD || p.latitud_decimal || p["Latitud Decimal"]) && (p.LONGITUD || p.longitud_decimal || p["Longitud Decimal"]) 
            );
            if (firstPoint) {
                const lat = firstPoint.latitud_decimal ?? firstPoint["Latitud Decimal"] ?? firstPoint.LATITUD;
                const lng = firstPoint.longitud_decimal ?? firstPoint["Longitud Decimal"] ?? firstPoint.LONGITUD;
                setMapCenter([lat, lng]);
                map.setView([lat, lng], mapZoom);
            }
        }
    }, [data, map, mapZoom]);

    return (
        <div className="w-full h-full">            <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ width: '100%', height: '100%', minHeight: '500px' }}
            whenCreated={setMap}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {data && data.length > 0 && data.map((point, index) => {
                // Usar latitud_decimal y longitud_decimal si existen, si no, usar los otros campos
                const lat = point.latitud_decimal ?? point["Latitud Decimal"] ?? point.LATITUD;
                const lng = point.longitud_decimal ?? point["Longitud Decimal"] ?? point.LONGITUD;
                if (lat && lng) {
                    return (
                        <Marker
                            key={index}
                            position={[lat, lng]}
                        >
                            <Popup>
                                <div>
                                    <h3 className="font-bold">{point.DESCRIPCION || 'Sin descripción'}</h3>
                                    <p>Tipo: {point.TIPO_INTERVENCION || 'No especificado'}</p>
                                    <p>Fecha: {point.FECHA || 'No especificada'}</p>
                                    <p>Hora: {point.HORA || 'No especificada'}</p>
                                    <p>Provincia: {point.PROVINCIA || 'No especificada'}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                }
                return null;
            })}
        </MapContainer>
        </div>
    );
}
