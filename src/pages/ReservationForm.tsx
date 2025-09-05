import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Star,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { mockCourts, mockClubs, getAvailableTimeSlots } from '@/lib/mockData';
import { Court, Club, Participant } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { createReservation } from '@/lib/api/reservations';

const ReservationForm: React.FC = () => {
  const { courtId } = useParams<{ courtId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [court, setCourt] = useState<Court | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mercadopago'>('card');
  const [splitPayment, setSplitPayment] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<Array<{time: string, available: boolean}>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (courtId) {
      const foundCourt = mockCourts.find(c => c.id === courtId);
      const foundClub = mockClubs.find(c => c.id === foundCourt?.clubId);
      setCourt(foundCourt || null);
      setClub(foundClub || null);
    }
  }, [courtId]);

  useEffect(() => {
    if (selectedDate && courtId) {
      const slots = getAvailableTimeSlots(format(selectedDate, 'yyyy-MM-dd'), courtId);
      setAvailableSlots(slots);
    }
  }, [selectedDate, courtId]);

  useEffect(() => {
    if (user && court) {
      // Initialize with the current user as first participant
      setParticipants([{
        id: '1',
        name: user.name,
        email: user.email,
        phone: user.phone,
        hasPaid: false,
        shareAmount: 0
      }]);
    }
  }, [user, court]);

  useEffect(() => {
    if (court && splitPayment) {
      const totalAmount = court.pricePerHour * duration;
      const shareAmount = participants.length > 0 ? totalAmount / participants.length : 0;
      setParticipants(prev => prev.map(p => ({ ...p, shareAmount })));
    }
  }, [court, duration, participants.length, splitPayment]);

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      hasPaid: false,
      shareAmount: 0
    };
    setParticipants([...participants, newParticipant]);
  };

  const updateParticipant = (id: string, field: keyof Participant, value: string | number | boolean) => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleBooking = async () => {
    if (!court || !selectedDate || !selectedTime || !user) return;
    
    setLoading(true);
    
    setErrorMessage(null);
    const start = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`);
    const endHour = parseInt(selectedTime.split(':')[0]) + duration;
    const end = new Date(
      `${format(selectedDate, 'yyyy-MM-dd')}T${String(endHour).padStart(2, '0')}:${selectedTime.split(':')[1]}:00`
    );

    try {
      await createReservation({
        field_id: Number(court.id),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        total_price: court.pricePerHour * duration,
      });
      navigate('/bookings', { state: { bookingSuccess: true } });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'Ocurrió un error al crear la reserva');
      } else {
        setErrorMessage('Ocurrió un error al crear la reserva');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!court || !club) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p>Cancha no encontrada</p>
          <Button onClick={() => navigate('/search')} className="mt-4">
            Volver a buscar
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = court.pricePerHour * duration;
  const today = new Date();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Court Info */}
        <div className="lg:col-span-1">
          <Card>
            <div className="aspect-video bg-gray-200">
              <img 
                src={court.images[0]} 
                alt={court.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h2 className="text-xl font-semibold">{court.name}</h2>
                  <p className="text-gray-600">{club.name}</p>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {club.address}
                </div>
                
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm">{club.rating} ({club.totalReviews} reseñas)</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={court.sport === 'paddle' ? 'bg-blue-500' : 'bg-green-500'}>
                    {court.sport === 'paddle' ? 'Padel' : 'Fútbol'}
                  </Badge>
                  {court.hasLighting && <Badge variant="secondary">Iluminación</Badge>}
                  {court.isRoofed && <Badge variant="secondary">Techada</Badge>}
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Precio por hora:</span>
                    <span className="font-semibold text-green-600">${court.pricePerHour}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">Máximo jugadores:</span>
                    <span className="font-medium">{court.maxPlayers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Reservar Cancha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div>
                <Label className="text-sm font-medium">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-2 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < today}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium">Horario</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className="text-xs"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration */}
              <div>
                <Label className="text-sm font-medium">Duración (horas)</Label>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="3">3 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Participants */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Participantes</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="splitPayment"
                      checked={splitPayment}
                      onChange={(e) => setSplitPayment(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="splitPayment" className="text-sm">Dividir costo</Label>
                  </div>
                </div>
                
                <div className="space-y-3 mt-2">
                  {participants.map((participant, index) => (
                    <Card key={participant.id} className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Nombre"
                          value={participant.name}
                          onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                          disabled={index === 0 && user?.name === participant.name}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={participant.email}
                          onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                          disabled={index === 0 && user?.email === participant.email}
                        />
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Teléfono"
                            value={participant.phone}
                            onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                            disabled={index === 0 && user?.phone === participant.phone}
                            className="flex-1"
                          />
                          {index > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {splitPayment && (
                        <div className="mt-2 text-sm text-gray-600">
                          Debe pagar: ${participant.shareAmount.toFixed(0)}
                        </div>
                      )}
                    </Card>
                  ))}
                  
                  {participants.length < court.maxPlayers && (
                    <Button
                      variant="outline"
                      onClick={addParticipant}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Participante
                    </Button>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="text-sm font-medium">Método de Pago</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentMethod('card')}
                    className="flex items-center justify-center"
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Tarjeta
                  </Button>
                  <Button
                    variant={paymentMethod === 'mercadopago' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentMethod('mercadopago')}
                    className="text-xs"
                  >
                    MercadoPago
                  </Button>
                  <Button
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentMethod('cash')}
                    className="flex items-center justify-center"
                  >
                    <Banknote className="h-4 w-4 mr-1" />
                    Efectivo
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-sm font-medium">Notas (opcional)</Label>
                <Textarea
                  placeholder="Comentarios adicionales sobre la reserva..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Booking Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Resumen de Reserva</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cancha:</span>
                      <span>{court.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fecha:</span>
                      <span>{selectedDate ? format(selectedDate, "PPP", { locale: es }) : 'No seleccionada'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horario:</span>
                      <span>{selectedTime ? `${selectedTime} - ${parseInt(selectedTime.split(':')[0]) + duration}:${selectedTime.split(':')[1]}` : 'No seleccionado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración:</span>
                      <span>{duration} hora{duration > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Participantes:</span>
                      <span>{participants.length}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-green-600">${totalPrice}</span>
                    </div>
                    {splitPayment && (
                      <div className="text-xs text-gray-600">
                        ${(totalPrice / participants.length).toFixed(0)} por persona
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/search')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || loading || participants.some(p => !p.name || !p.email)}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmar Reserva
                </Button>
              </div>

              {errorMessage && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {!selectedDate || !selectedTime ? (
                <Alert>
                  <AlertDescription>
                    Selecciona una fecha y horario para continuar con la reserva.
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;