import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  Settings,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import { mockBookings, mockCourts, mockClubs, mockUsers } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    occupancyRate: 0
  });

  useEffect(() => {
    // Calculate stats based on user role
    const bookings = user?.role === 'superadmin' ? 
      mockBookings : 
      mockBookings.filter(b => {
        const court = mockCourts.find(c => c.id === b.courtId);
        const club = mockClubs.find(c => c.id === court?.clubId);
        return club?.adminId === user?.id;
      });

    const revenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const users = user?.role === 'superadmin' ? mockUsers.length : bookings.length;
    
    setStats({
      totalBookings: bookings.length,
      totalRevenue: revenue,
      totalUsers: users,
      occupancyRate: 75 // Mock occupancy rate
    });
  }, [user]);

  const revenueData = [
    { month: 'Ene', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Abr', revenue: 22000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 }
  ];

  const sportData = [
    { name: 'Padel', value: 65, color: '#3B82F6' },
    { name: 'Fútbol', value: 35, color: '#10B981' }
  ];

  const userCourts = user?.role === 'superadmin' ? 
    mockCourts : 
    mockCourts.filter(court => {
      const club = mockClubs.find(c => c.id === court.clubId);
      return club?.adminId === user?.id;
    });

  if (!user || user.role === 'client') {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p>No tienes permisos para acceder al panel de administración</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de {user.role === 'superadmin' ? 'Super Administrador' : 'Administración'}
        </h1>
        <p className="text-gray-600">
          {user.role === 'superadmin' ? 
            'Gestiona toda la plataforma Cancheroo' : 
            'Gestiona tus clubes y canchas'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reservas Totales</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user.role === 'superadmin' ? 'Usuarios' : 'Clientes'}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +15% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ocupación</p>
                <p className="text-3xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +5% vs mes anterior
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="courts">Canchas</TabsTrigger>
          <TabsTrigger value="bookings">Reservas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Ingresos Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sports Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Deporte</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sportData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {sportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courts" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Gestión de Canchas</h2>
            <Button onClick={() => navigate('/admin/court/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cancha
            </Button>
          </div>

          <div className="grid gap-4">
            {userCourts.map((court) => {
              const club = mockClubs.find(c => c.id === court.clubId);
              return (
                <Card key={court.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{court.name}</h3>
                          <Badge className={court.sport === 'paddle' ? 'bg-blue-500' : 'bg-green-500'}>
                            {court.sport === 'paddle' ? 'Padel' : 'Fútbol'}
                          </Badge>
                          <Badge variant={court.isActive ? 'default' : 'secondary'}>
                            {court.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {club?.name}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            ${court.pricePerHour}/hora
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Máximo {court.maxPlayers} jugadores
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Reservas Recientes</h2>
          </div>

          <div className="space-y-4">
            {mockBookings.slice(0, 10).map((booking) => {
              const court = mockCourts.find(c => c.id === booking.courtId);
              const club = mockClubs.find(c => c.id === court?.clubId);
              const bookingUser = mockUsers.find(u => u.id === booking.userId);
              
              return (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{court?.name}</h3>
                        <p className="text-sm text-gray-600">{bookingUser?.name} - {bookingUser?.email}</p>
                        <p className="text-sm text-gray-500">
                          {booking.date} {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`${booking.status === 'confirmed' ? 'bg-green-500' : 
                          booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                          {booking.status === 'confirmed' ? 'Confirmada' :
                           booking.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                        </Badge>
                        <p className="text-sm font-medium mt-1">${booking.totalPrice}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Horario de Atención</label>
                  <p className="text-sm text-gray-600">08:00 - 23:00</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Política de Cancelación</label>
                  <p className="text-sm text-gray-600">24 horas antes sin costo</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Métodos de Pago</label>
                  <p className="text-sm text-gray-600">Efectivo, Tarjeta, MercadoPago</p>
                </div>
                <Button>Actualizar Configuración</Button>
              </CardContent>
            </Card>

            {user.role === 'superadmin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Administración de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total de usuarios: {mockUsers.length}</span>
                      <Button variant="outline">Ver Todos</Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Administradores: {mockUsers.filter(u => u.role === 'admin').length}</span>
                      <Button variant="outline">Gestionar</Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Clientes: {mockUsers.filter(u => u.role === 'client').length}</span>
                      <Button variant="outline">Ver Detalles</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;