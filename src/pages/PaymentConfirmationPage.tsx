import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getReservation } from '@/lib/api/reservations';
import { Booking } from '@/types';

const PaymentConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;
      try {
        const data = await getReservation(id);
        setReservation(data);
      } catch (error) {
        console.error('Error fetching reservation', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p>Verificando pago...</p>
      </div>
    );
  }

  if (!reservation || reservation.paymentStatus !== 'paid') {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p>Pago pendiente. Si ya realizaste el pago, espera unos momentos e intenta nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 text-center">
      <p>¡Pago confirmado! Tu reserva está activa.</p>
    </div>
  );
};

export default PaymentConfirmationPage;
