import api from '../api';
import { Booking } from '@/types';

export const upcoming = async (): Promise<Booking[]> => {
  const response = await api.get('/api/v1/user/reservations/upcoming');
  return response.data;
};

export const pending = async (): Promise<Booking[]> => {
  const response = await api.get('/api/v1/user/reservations/pending');
  return response.data;
};

export const history = async (): Promise<Booking[]> => {
  const response = await api.get('/api/v1/user/reservations/history');
  return response.data;
};

export const cancelled = async (): Promise<Booking[]> => {
  const response = await api.get('/api/v1/user/reservations/cancelled');
  return response.data;
};

export default {
  upcoming,
  pending,
  history,
  cancelled,
};
