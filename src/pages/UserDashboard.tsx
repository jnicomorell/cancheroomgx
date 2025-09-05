import React, { useEffect, useState } from 'react';
import userReservations from '@/lib/api/userReservations';
import { Booking } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const UserDashboard: React.FC = () => {
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [pending, setPending] = useState<Booking[]>([]);
  const [history, setHistory] = useState<Booking[]>([]);
  const [cancelled, setCancelled] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, p, h, c] = await Promise.all([
          userReservations.upcoming(),
          userReservations.pending(),
          userReservations.history(),
          userReservations.cancelled(),
        ]);
        setUpcoming(u);
        setPending(p);
        setHistory(h);
        setCancelled(c);
      } catch {
        setError('Error al cargar reservas');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Próximas ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="pending">Pendientes ({pending.length})</TabsTrigger>
          <TabsTrigger value="history">Historial ({history.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {upcoming.length === 0 && <p>No hay reservas próximas.</p>}
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          {pending.length === 0 && <p>No hay reservas pendientes.</p>}
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          {history.length === 0 && <p>No hay reservas en el historial.</p>}
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4">
          {cancelled.length === 0 && <p>No hay reservas canceladas.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;

