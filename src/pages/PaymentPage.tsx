import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { checkout } from '@/lib/api/payments';

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      try {
        const { init_point } = await checkout({ reservation_id: id });
        window.location.href = init_point;
      } catch (error) {
        console.error('Error initiating checkout', error);
      }
    };
    init();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-6 text-center">
      <p>Redirigiendo a la plataforma de pagos...</p>
    </div>
  );
};

export default PaymentPage;
