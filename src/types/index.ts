export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'superadmin' | 'admin' | 'client';
  avatar?: string;
  clubId?: string; // For admin users
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  images: string[];
  amenities: string[];
  adminId: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
}

export interface Court {
  id: string;
  clubId: string;
  name: string;
  sport: 'football' | 'paddle';
  type: 'synthetic' | 'natural' | 'indoor' | 'outdoor';
  isRoofed: boolean;
  hasLighting: boolean;
  images: string[];
  pricePerHour: number;
  maxPlayers: number;
  description: string;
  amenities: string[];
  isActive: boolean;
}

export interface Booking {
  id: string;
  courtId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: 'cash' | 'card' | 'mercadopago';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  participants: Participant[];
  notes?: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  hasPaid: boolean;
  shareAmount: number;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  courtId: string;
  clubId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Tournament {
  id: string;
  clubId: string;
  name: string;
  sport: 'football' | 'paddle';
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  currentTeams: number;
  entryFee: number;
  prizes: string[];
  description: string;
  rules: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: string;
}

export interface SearchFilters {
  sport?: 'football' | 'paddle';
  location?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  courtType?: string[];
  maxPrice?: number;
  hasLighting?: boolean;
  isRoofed?: boolean;
  amenities?: string[];
}