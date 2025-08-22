import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  LogOut, 
  Calendar, 
  Settings, 
  Trophy,
  MapPin,
  Search
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500';
      case 'admin': return 'bg-blue-500';
      case 'client': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Cancheroo</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/search" className="flex items-center space-x-1">
                    <Search className="h-4 w-4" />
                    <span>Buscar</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/bookings" className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Mis Reservas</span>
                  </Link>
                </Button>

                {user.role !== 'client' && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin" className="flex items-center space-x-1">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/bookings" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Mis Reservas</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/tournaments" className="flex items-center">
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Torneos</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;