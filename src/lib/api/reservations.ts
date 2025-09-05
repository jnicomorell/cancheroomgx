import api from '../api';
import { Booking } from '@/types';

interface ReservationPayload {
  field_id: number;
  start_time: string;
  end_time: string;
  total_price: number;
  recurring_rule?: string;
}

export const createReservation = async (
  payload: ReservationPayload
): Promise<Booking> => {
  const response = await api.post('/api/v1/reservations', payload);
  return response.data;
};

export const cancelReservation = async (
  id: string | number
): Promise<void> => {
  await api.delete(`/api/v1/reservations/${id}`);
};

export const listUserReservations = async (): Promise<Booking[]> => {
  const response = await api.get('/api/v1/reservations');
  return response.data.data ?? response.data;
};

export default { createReservation, cancelReservation, listUserReservations };
