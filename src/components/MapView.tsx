import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin,
  Star,
  DollarSign,
  Clock,
  Users,
  Calendar,
  TrendingUp,
  Navigation
} from 'lucide-react';
import { mockCourts, mockClubs, getAvailableTimeSlots } from '@/lib/mockData';
import { Court, Club } from '@/types';
import { useNavigate } from 'react-router-dom';

interface MapViewProps {
  courts: Court[];
  selectedDate?: Date;
  onCourtSelect?: (court: Court) => void;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  court: Court;
  club: Club;
  availableSlots: number;
  popularity: 'high' | 'medium' | 'low';
  priceRange: 'low' | 'medium' | 'high';
}

const MapView: React.FC<MapViewProps> = ({ courts, selectedDate, onCourtSelect }) => {
  const navigate = useNavigate();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Mock coordinates for Buenos Aires area
  const generateCoordinates = (index: number) => {
    const baseLatBA = -34.6118;
    const baseLngBA = -58.3960;
    const variance = 0.1;
    
    return {
      lat: baseLatBA + (Math.random() - 0.5) * variance,
      lng: baseLngBA + (Math.random() - 0.5) * variance
    };
  };

  const getPopularity = (courtId: string): 'high' | 'medium' | 'low' => {
    // Mock popularity based on court ID hash
    const hash = courtId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    if (hash % 3 === 0) return 'high';
    if (hash % 3 === 1) return 'medium';
    return 'low';
  };

  const getPriceRange = (price: number): 'low' | 'medium' | 'high' => {
    if (price < 3000) return 'low';
    if (price < 5000) return 'medium';
    return 'high';
  };

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPopularityText = (popularity: string) => {
    switch (popularity) {
      case 'high': return 'Alta demanda';
      case 'medium': return 'Demanda media';
      case 'low': return 'Baja demanda';
      default: return 'N/A';
    }
  };

  useEffect(() => {
    const markers: MapMarker[] = courts.map((court, index) => {
      const club = mockClubs.find(c => c.id === court.clubId)!;
      const coords = generateCoordinates(index);
      const availableSlots = selectedDate ? 
        getAvailableTimeSlots(selectedDate.toISOString().split('T')[0], court.id)
          .filter(slot => slot.available).length : 8;

      return {
        id: court.id,
        lat: coords.lat,
        lng: coords.lng,
        court,
        club,
        availableSlots,
        popularity: getPopularity(court.id),
        priceRange: getPriceRange(court.pricePerHour)
      };
    });

    setMapMarkers(markers);
  }, [courts, selectedDate]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to Buenos Aires if location access denied
          setUserLocation({
            lat: -34.6118,
            lng: -58.3960
          });
        }
      );
    }
  }, []);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="h-full flex">
      {/* Map Container */}
      <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="text-blue-200">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 space-y-2">
          <Button size="sm" variant="outline" className="bg-white">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 z-10">
          <Card className="p-3">
            <div className="space-y-2 text-xs">
              <div className="font-medium">Demanda:</div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Alta</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Media</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Baja</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Map Markers */}
        <div className="absolute inset-0">
          {mapMarkers.map((marker) => {
            const distance = userLocation ? 
              calculateDistance(userLocation.lat, userLocation.lng, marker.lat, marker.lng) : 0;
            
            // Convert lat/lng to pixel positions (mock calculation)
            const x = ((marker.lng + 58.5) / 0.2) * 100;
            const y = ((marker.lat + 34.7) / 0.2) * 100;

            return (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(95, y))}%`
                }}
                onClick={() => setSelectedMarker(marker)}
              >
                <div className="relative">
                  {/* Marker */}
                  <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${getPopularityColor(marker.popularity)} 
                    ${selectedMarker?.id === marker.id ? 'scale-125' : 'hover:scale-110'} transition-transform`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        ${Math.floor(marker.court.pricePerHour / 1000)}k
                      </span>
                    </div>
                  </div>
                  
                  {/* Distance Badge */}
                  {userLocation && (
                    <div className="absolute -top-2 -right-2 bg-white rounded-full px-1 py-0.5 text-xs font-medium shadow-sm">
                      {distance.toFixed(1)}km
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Location */}
        {userLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
            style={{
              left: '50%',
              top: '50%'
            }}
          >
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Court Details Panel */}
      <div className="w-80 p-4 bg-gray-50">
        {selectedMarker ? (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Court Image */}
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={selectedMarker.court.images[0]} 
                    alt={selectedMarker.court.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Court Info */}
                <div>
                  <h3 className="font-semibold text-lg">{selectedMarker.court.name}</h3>
                  <p className="text-gray-600">{selectedMarker.club.name}</p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={selectedMarker.court.sport === 'paddle' ? 'bg-blue-500' : 'bg-green-500'}>
                    {selectedMarker.court.sport === 'paddle' ? 'Padel' : 'Fútbol'}
                  </Badge>
                  <Badge className={getPopularityColor(selectedMarker.popularity)}>
                    {getPopularityText(selectedMarker.popularity)}
                  </Badge>
                  {selectedMarker.court.hasLighting && (
                    <Badge variant="secondary">Iluminación</Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Precio por hora
                    </div>
                    <span className="font-semibold text-green-600">
                      ${selectedMarker.court.pricePerHour}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Disponibilidad hoy
                    </div>
                    <span className="font-medium">
                      {selectedMarker.availableSlots} horarios
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Máximo jugadores
                    </div>
                    <span className="font-medium">
                      {selectedMarker.court.maxPlayers}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2" />
                      Calificación
                    </div>
                    <span className="font-medium">
                      {selectedMarker.club.rating} ⭐
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Frecuencia de uso
                    </div>
                    <span className="font-medium">
                      {selectedMarker.popularity === 'high' ? '85%' : 
                       selectedMarker.popularity === 'medium' ? '60%' : '35%'}
                    </span>
                  </div>

                  {userLocation && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        Distancia
                      </div>
                      <span className="font-medium">
                        {calculateDistance(
                          userLocation.lat, 
                          userLocation.lng, 
                          selectedMarker.lat, 
                          selectedMarker.lng
                        ).toFixed(1)} km
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/book/${selectedMarker.court.id}`)}
                  >
                    Reservar Ahora
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onCourtSelect?.(selectedMarker.court)}
                  >
                    Ver Detalles
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium">Estadísticas de la semana:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Reservas:</span>
                      <span className="font-medium ml-1">
                        {selectedMarker.popularity === 'high' ? '42' : 
                         selectedMarker.popularity === 'medium' ? '28' : '15'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ocupación:</span>
                      <span className="font-medium ml-1">
                        {selectedMarker.popularity === 'high' ? '85%' : 
                         selectedMarker.popularity === 'medium' ? '60%' : '35%'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Horario pico:</span>
                      <span className="font-medium ml-1">18-22h</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Promedio:</span>
                      <span className="font-medium ml-1">2.5h</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium mb-2">Selecciona una cancha</h3>
            <p className="text-sm">
              Haz clic en un marcador del mapa para ver los detalles, precios y disponibilidad de la cancha.
            </p>
            <div className="mt-4 text-xs space-y-1">
              <p>• Los colores indican la demanda</p>
              <p>• Los números muestran el precio por hora</p>
              <p>• La distancia se calcula desde tu ubicación</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;