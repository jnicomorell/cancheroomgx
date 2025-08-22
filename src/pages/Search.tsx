import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search as SearchIcon, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star,
  Filter,
  Grid,
  List,
  Map,
  Calendar as CalendarIcon
} from 'lucide-react';
import { mockClubs, mockCourts, getWeatherData } from '@/lib/mockData';
import { Court, Club, SearchFilters, WeatherData } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import MapView from '@/components/MapView';

const Search: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [date, setDate] = useState<Date>();
  const navigate = useNavigate();

  useEffect(() => {
    setWeather(getWeatherData());
  }, []);

  const courtsWithClubs = mockCourts.map(court => ({
    ...court,
    club: mockClubs.find(club => club.id === court.clubId)!
  }));

  const filteredCourts = courtsWithClubs.filter(court => {
    if (filters.sport && court.sport !== filters.sport) return false;
    if (filters.maxPrice && court.pricePerHour > filters.maxPrice) return false;
    if (filters.hasLighting !== undefined && court.hasLighting !== filters.hasLighting) return false;
    if (filters.isRoofed !== undefined && court.isRoofed !== filters.isRoofed) return false;
    if (searchQuery && !court.club.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !court.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !court.club.city.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleBookCourt = (courtId: string) => {
    navigate(`/book/${courtId}`);
  };

  const getSportBadgeColor = (sport: string) => {
    return sport === 'paddle' ? 'bg-blue-500' : 'bg-green-500';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Weather Alert */}
      {weather && weather.precipitation > 50 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{weather.icon}</span>
            <div>
              <p className="font-medium text-amber-800">Alerta Climática</p>
              <p className="text-sm text-amber-700">
                Probabilidad de lluvia: {weather.precipitation}%. 
                Considera reservar canchas techadas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Header */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por club, cancha o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="rounded-l-none"
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sport Filter */}
                <div>
                  <Label className="text-sm font-medium">Deporte</Label>
                  <Select 
                    value={filters.sport || ''} 
                    onValueChange={(value) => setFilters({...filters, sport: value as 'football' | 'paddle'})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Todos los deportes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los deportes</SelectItem>
                      <SelectItem value="paddle">Padel</SelectItem>
                      <SelectItem value="football">Fútbol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div>
                  <Label className="text-sm font-medium">Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full mt-2 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium">
                    Precio máximo por hora: ${filters.maxPrice || 15000}
                  </Label>
                  <Slider
                    value={[filters.maxPrice || 15000]}
                    onValueChange={(value) => setFilters({...filters, maxPrice: value[0]})}
                    max={20000}
                    min={5000}
                    step={1000}
                    className="mt-2"
                  />
                </div>

                {/* Amenities */}
                <div>
                  <Label className="text-sm font-medium">Características</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lighting"
                        checked={filters.hasLighting || false}
                        onCheckedChange={(checked) => 
                          setFilters({...filters, hasLighting: checked as boolean})
                        }
                      />
                      <Label htmlFor="lighting" className="text-sm">Iluminación</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="roofed"
                        checked={filters.isRoofed || false}
                        onCheckedChange={(checked) => 
                          setFilters({...filters, isRoofed: checked as boolean})
                        }
                      />
                      <Label htmlFor="roofed" className="text-sm">Techada</Label>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({})}
                >
                  Limpiar Filtros
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredCourts.length} canchas encontradas
            </p>
            
            {weather && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{weather.icon}</span>
                <span>{weather.temperature}°C</span>
                <span>{weather.condition}</span>
              </div>
            )}
          </div>

          {viewMode === 'map' ? (
            <div className="h-[600px]">
              <MapView 
                courts={filteredCourts} 
                selectedDate={date}
                onCourtSelect={(court) => navigate(`/book/${court.id}`)}
              />
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredCourts.map((court) => (
              <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={court.images[0]} 
                    alt={court.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getSportBadgeColor(court.sport)} text-white`}>
                      {court.sport === 'paddle' ? 'Padel' : 'Fútbol'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center bg-white rounded-full px-2 py-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {court.club.rating}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{court.name}</h3>
                    <p className="text-sm text-gray-600">{court.club.name}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {court.club.address}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {court.hasLighting && <Badge variant="secondary" className="text-xs">Iluminación</Badge>}
                      {court.isRoofed && <Badge variant="secondary" className="text-xs">Techada</Badge>}
                      <Badge variant="secondary" className="text-xs">
                        {court.type === 'synthetic' ? 'Sintético' : 
                         court.type === 'natural' ? 'Natural' : 
                         court.type === 'indoor' ? 'Interior' : 'Exterior'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">${court.pricePerHour}/hora</span>
                      </div>
                      
                      <Button size="sm" onClick={() => handleBookCourt(court.id)}>
                        Reservar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

          {filteredCourts.length === 0 && viewMode !== 'map' && (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron canchas</h3>
              <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;