import api from '../api';

interface CheckoutPayload {
  reservation_id: number | string;
}

interface CheckoutResponse {
  init_point: string;
}

export const checkout = async (
  payload: CheckoutPayload
): Promise<CheckoutResponse> => {
  const response = await api.post('/api/v1/payments/checkout', payload);
  return response.data;
};

export default { checkout };
