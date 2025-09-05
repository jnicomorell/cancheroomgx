import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Star,
  MessageCircle,
  Edit,
  X,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { mockCourts, mockClubs } from '@/lib/mockData';
import { Booking } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import {
  listUserReservations,
  cancelReservation,
} from '@/lib/api/reservations';

const MyReservations: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) return;
      try {
        const data = await listUserReservations();
        setBookings(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data?.message || 'Error al cargar reservas');
        } else {
          setErrorMessage('Error al cargar reservas');
        }
      }
    };
    fetchReservations();
  }, [user]);

  useEffect(() => {
    if (location.state?.bookingSuccess) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [location.state]);

  const getBookingsByStatus = (status: string) => {
    return bookings.filter(booking => {
      if (status === 'upcoming') {
        return booking.status === 'confirmed' && new Date(`${booking.date}T${booking.startTime}`) > new Date();
      }
      if (status === 'past') {
        return booking.status === 'completed' || new Date(`${booking.date}T${booking.startTime}`) < new Date();
      }
      return booking.status === status;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelReservation(bookingId);
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'No se pudo cancelar la reserva');
      } else {
        setErrorMessage('No se pudo cancelar la reserva');
      }
    }
  };

  const handleReschedule = (bookingId: string) => {
    // Navigate to booking page with current booking data
    navigate(`/book/${bookings.find(b => b.id === bookingId)?.courtId}`, {
      state: { reschedule: true, bookingId }
    });
  };

  const renderBookingCard = (booking: Booking) => {
    const court = mockCourts.find(c => c.id === booking.courtId);
    const club = mockClubs.find(c => c.id === court?.clubId);
    
    if (!court || !club) return null;

    const bookingDate = new Date(`${booking.date}T${booking.startTime}`);
    const isUpcoming = bookingDate > new Date();
    const canCancel = booking.status === 'confirmed' && isUpcoming;

    return (
      <Card key={booking.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">{court.name}</h3>
              <p className="text-gray-600">{club.name}</p>
            </div>
            <Badge className={`${getStatusColor(booking.status)} text-white`}>
              {getStatusText(booking.status)}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(booking.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {booking.startTime} - {booking.endTime}
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {club.address}
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {booking.participants.length} participantes
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              ${booking.totalPrice} ({booking.paymentMethod === 'cash' ? 'Efectivo' : 
                booking.paymentMethod === 'card' ? 'Tarjeta' : 'MercadoPago'})
            </div>
          </div>

          {booking.participants.length > 1 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Participantes:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {booking.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between text-sm">
                    <span>{participant.name}</span>
                    <Badge variant={participant.hasPaid ? 'default' : 'secondary'} className="text-xs">
                      {participant.hasPaid ? 'Pagado' : `$${participant.shareAmount}`}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {booking.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {canCancel && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReschedule(booking.id)}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Reprogramar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelBooking(booking.id)}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </>
            )}
            
            {booking.status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/review/${booking.id}`)}
                className="flex items-center"
              >
                <Star className="h-4 w-4 mr-1" />
                Calificar
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/booking-details/${booking.id}`)}
              className="flex items-center"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Detalles
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p>Debes iniciar sesión para ver tus reservas</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {showSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Reserva confirmada exitosamente! Te hemos enviado los detalles por email.
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reservas</h1>
        <p className="text-gray-600">Gestiona tus reservas de canchas</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">
            Próximas ({getBookingsByStatus('upcoming').length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes ({getBookingsByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Pasadas ({getBookingsByStatus('past').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas ({getBookingsByStatus('cancelled').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {getBookingsByStatus('upcoming').length > 0 ? (
              getBookingsByStatus('upcoming').map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes reservas próximas
                  </h3>
                  <p className="text-gray-500 mb-4">
                    ¡Es hora de reservar tu próximo partido!
                  </p>
                  <Button onClick={() => navigate('/search')}>
                    Buscar Canchas
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {getBookingsByStatus('pending').length > 0 ? (
              getBookingsByStatus('pending').map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes reservas pendientes
                  </h3>
                  <p className="text-gray-500">
                    Todas tus reservas están confirmadas o completadas.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="space-y-4">
            {getBookingsByStatus('past').length > 0 ? (
              getBookingsByStatus('past').map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes reservas pasadas
                  </h3>
                  <p className="text-gray-500">
                    Aquí aparecerán tus partidos completados.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <div className="space-y-4">
            {getBookingsByStatus('cancelled').length > 0 ? (
              getBookingsByStatus('cancelled').map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes reservas canceladas
                  </h3>
                  <p className="text-gray-500">
                    ¡Excelente! No has cancelado ninguna reserva.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyReservations;