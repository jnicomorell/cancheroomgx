import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react';
import { mockTournaments, mockClubs } from '@/lib/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const Tournaments: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState<'all' | 'paddle' | 'football'>('all');

  const filteredTournaments = mockTournaments.filter(tournament => 
    selectedSport === 'all' || tournament.sport === selectedSport
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Próximo';
      case 'active': return 'En Curso';
      case 'completed': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Torneos</h1>
        <p className="text-gray-600">Participa en torneos locales y eventos deportivos</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        <Button
          variant={selectedSport === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedSport('all')}
        >
          Todos
        </Button>
        <Button
          variant={selectedSport === 'paddle' ? 'default' : 'outline'}
          onClick={() => setSelectedSport('paddle')}
        >
          Padel
        </Button>
        <Button
          variant={selectedSport === 'football' ? 'default' : 'outline'}
          onClick={() => setSelectedSport('football')}
        >
          Fútbol
        </Button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => {
          const club = mockClubs.find(c => c.id === tournament.clubId);
          return (
            <Card key={tournament.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                    <Badge className={tournament.sport === 'paddle' ? 'bg-blue-500' : 'bg-green-500'}>
                      {tournament.sport === 'paddle' ? 'Padel' : 'Fútbol'}
                    </Badge>
                  </div>
                  <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                    {getStatusText(tournament.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {club?.name}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(tournament.startDate), "d 'de' MMMM", { locale: es })} - {format(new Date(tournament.endDate), "d 'de' MMMM", { locale: es })}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {tournament.currentTeams}/{tournament.maxTeams} equipos
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ${tournament.entryFee} inscripción
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Registro hasta: {format(new Date(tournament.registrationDeadline), "d 'de' MMMM", { locale: es })}
                </div>

                <div className="pt-3">
                  <p className="text-sm text-gray-700 mb-3">{tournament.description}</p>
                  
                  {tournament.prizes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Premios:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {tournament.prizes.map((prize, index) => (
                          <li key={index}>• {prize}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full"
                    disabled={tournament.status !== 'upcoming' || tournament.currentTeams >= tournament.maxTeams}
                  >
                    {tournament.status === 'upcoming' ? 
                      (tournament.currentTeams >= tournament.maxTeams ? 'Completo' : 'Inscribirse') :
                      'Ver Detalles'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay torneos disponibles</h3>
          <p className="text-gray-500">Pronto habrá nuevos torneos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default Tournaments;