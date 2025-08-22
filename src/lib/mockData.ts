import { User, Club, Court, Booking, Review, Tournament } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@cancheroo.com',
    name: 'Super Admin',
    phone: '+54 11 1234-5678',
    role: 'superadmin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'club@padelpro.com',
    name: 'Carlos Rodriguez',
    phone: '+54 11 2345-6789',
    role: 'admin',
    clubId: '1',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    email: 'juan@email.com',
    name: 'Juan Pérez',
    phone: '+54 11 3456-7890',
    role: 'client',
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Padel Pro Buenos Aires',
    description: 'El mejor complejo de padel de la zona norte',
    address: 'Av. Santa Fe 1234, Palermo',
    city: 'Buenos Aires',
    coordinates: { lat: -34.5875, lng: -58.4024 },
    phone: '+54 11 4567-8901',
    email: 'info@padelpro.com',
    images: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
    amenities: ['estacionamiento', 'vestuarios', 'cafeteria', 'wifi'],
    adminId: '2',
    rating: 4.5,
    totalReviews: 128,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Futbol 5 Central',
    description: 'Canchas de futbol 5 con césped sintético de primera calidad',
    address: 'Calle Corrientes 5678, San Telmo',
    city: 'Buenos Aires',
    coordinates: { lat: -34.6118, lng: -58.3960 },
    phone: '+54 11 5678-9012',
    email: 'info@futbol5central.com',
    images: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
    amenities: ['estacionamiento', 'vestuarios', 'parrilla', 'seguridad'],
    adminId: '2',
    rating: 4.2,
    totalReviews: 89,
    createdAt: '2024-01-15T00:00:00Z'
  }
];

export const mockCourts: Court[] = [
  {
    id: '1',
    clubId: '1',
    name: 'Cancha Padel 1',
    sport: 'paddle',
    type: 'outdoor',
    isRoofed: false,
    hasLighting: true,
    images: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
    pricePerHour: 8000,
    maxPlayers: 4,
    description: 'Cancha de padel al aire libre con iluminación LED',
    amenities: ['iluminacion', 'pelotas-incluidas'],
    isActive: true
  },
  {
    id: '2',
    clubId: '1',
    name: 'Cancha Padel 2 (Techada)',
    sport: 'paddle',
    type: 'indoor',
    isRoofed: true,
    hasLighting: true,
    images: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
    pricePerHour: 10000,
    maxPlayers: 4,
    description: 'Cancha de padel techada, ideal para días de lluvia',
    amenities: ['iluminacion', 'pelotas-incluidas', 'techada'],
    isActive: true
  },
  {
    id: '3',
    clubId: '2',
    name: 'Cancha Futbol 5 - A',
    sport: 'football',
    type: 'synthetic',
    isRoofed: false,
    hasLighting: true,
    images: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
    pricePerHour: 12000,
    maxPlayers: 10,
    description: 'Cancha de futbol 5 con césped sintético de última generación',
    amenities: ['iluminacion', 'vestuarios', 'duchas'],
    isActive: true
  }
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    courtId: '1',
    userId: '3',
    date: '2024-12-25',
    startTime: '18:00',
    endTime: '19:00',
    totalPrice: 8000,
    status: 'confirmed',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    participants: [
      { id: '1', name: 'Juan Pérez', email: 'juan@email.com', phone: '+54 11 3456-7890', hasPaid: true, shareAmount: 2000 },
      { id: '2', name: 'María García', email: 'maria@email.com', phone: '+54 11 4567-8901', hasPaid: true, shareAmount: 2000 },
      { id: '3', name: 'Carlos López', email: 'carlos@email.com', phone: '+54 11 5678-9012', hasPaid: true, shareAmount: 2000 },
      { id: '4', name: 'Ana Martín', email: 'ana@email.com', phone: '+54 11 6789-0123', hasPaid: true, shareAmount: 2000 }
    ],
    notes: 'Traer pelotas propias',
    createdAt: '2024-12-20T10:00:00Z'
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    bookingId: '1',
    userId: '3',
    courtId: '1',
    clubId: '1',
    rating: 5,
    comment: 'Excelente cancha, muy bien mantenida y buena iluminación',
    createdAt: '2024-12-21T15:30:00Z'
  }
];

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    clubId: '1',
    name: 'Torneo de Padel Verano 2024',
    sport: 'paddle',
    startDate: '2024-12-28',
    endDate: '2024-12-30',
    registrationDeadline: '2024-12-25',
    maxTeams: 16,
    currentTeams: 8,
    entryFee: 15000,
    prizes: ['Trofeo y $100.000', 'Medalla y $50.000', 'Medalla y $25.000'],
    description: 'Torneo de padel amateur para todas las categorías',
    rules: 'Formato eliminación directa, partidos a 2 sets ganados',
    status: 'upcoming'
  }
];

export const getAvailableTimeSlots = (date: string, courtId: string) => {
  const slots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];
  
  // Mock some occupied slots
  const occupiedSlots = ['10:00', '15:00', '18:00', '20:00'];
  
  return slots.map(slot => ({
    time: slot,
    available: !occupiedSlots.includes(slot)
  }));
};

export const getWeatherData = () => ({
  temperature: 24,
  condition: 'Parcialmente nublado',
  humidity: 65,
  windSpeed: 12,
  precipitation: 20,
  icon: '⛅'
});