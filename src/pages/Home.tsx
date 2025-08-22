import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Calendar,
  MapPin,
  Star,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Trophy
} from 'lucide-react';
import { mockCourts, mockClubs, getWeatherData } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const weather = getWeatherData();

  const featuredCourts = mockCourts.slice(0, 3).map(court => ({
    ...court,
    club: mockClubs.find(club => club.id === court.clubId)!
  }));

  const features = [
    {
      icon: Search,
      title: 'Búsqueda Inteligente',
      description: 'Encuentra la cancha perfecta con filtros avanzados por ubicación, deporte y precio'
    },
    {
      icon: Calendar,
      title: 'Reserva Fácil',
      description: 'Sistema de reservas en tiempo real con confirmación instantánea'
    },
    {
      icon: Users,
      title: 'Gestión de Grupos',
      description: 'Invita amigos, divide costos y gestiona participantes desde la app'
    },
    {
      icon: Shield,
      title: 'Pagos Seguros',
      description: 'Múltiples métodos de pago: tarjeta, MercadoPago o efectivo'
    },
    {
      icon: Trophy,
      title: 'Torneos y Eventos',
      description: 'Participa en torneos locales y eventos deportivos'
    },
    {
      icon: TrendingUp,
      title: 'Estadísticas',
      description: 'Lleva control de tus partidos, gastos y rendimiento deportivo'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Reserva tu cancha
              <span className="block text-green-300">en segundos</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              La plataforma más completa para reservar canchas de padel y fútbol en Argentina
            </p>
            
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link to="/register">Comenzar Gratis</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link to="/search">Explorar Canchas</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link to="/search">Buscar Canchas</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link to="/bookings">Mis Reservas</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      {weather.precipitation > 50 && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center space-x-2 text-amber-800">
              <span className="text-lg">{weather.icon}</span>
              <span className="text-sm font-medium">
                Alerta climática: {weather.precipitation}% probabilidad de lluvia. 
                Considera reservar canchas techadas.
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Canchas Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
            <div className="text-gray-600">Reservas Completadas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.8★</div>
            <div className="text-gray-600">Calificación Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Reservas Online</div>
          </div>
        </div>

        {/* Featured Courts */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Canchas Destacadas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre las canchas mejor calificadas en tu zona
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCourts.map((court) => (
              <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={court.images[0]} 
                    alt={court.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={court.sport === 'paddle' ? 'bg-blue-500' : 'bg-green-500'}>
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
                  <h3 className="font-semibold text-lg mb-1">{court.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{court.club.name}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {court.club.address}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">${court.pricePerHour}/hora</span>
                    </div>
                    
                    <Button size="sm" onClick={() => navigate(`/book/${court.id}`)}>
                      Reservar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/search">Ver Todas las Canchas</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir Cancheroo?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tus reservas deportivas en un solo lugar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl text-white p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para jugar?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Únete a miles de jugadores que ya reservan con Cancheroo
          </p>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link to="/register">Crear Cuenta Gratis</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
            </div>
          ) : (
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/search">Explorar Canchas</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;