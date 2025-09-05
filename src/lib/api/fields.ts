import api from '../api';
import { Field } from '@/types';

interface FieldFilters {
  sport?: string;
  price?: number;
  date?: string;
}

export const listFields = async (filters: FieldFilters = {}): Promise<Field[]> => {
  const response = await api.get('/api/v1/fields', {
    params: filters,
  });
  return response.data.data ?? response.data;
};

export const getField = async (id: string | number): Promise<Field> => {
  const response = await api.get(`/api/v1/fields/${id}`);
  return response.data;
};

export default { listFields, getField };
