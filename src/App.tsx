import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Search from './pages/Search';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/admin/AdminDashboard';
import Tournaments from './pages/Tournaments';
import NotFound from './pages/NotFound';
import FieldsPage from './pages/FieldsPage';
import FieldDetails from './pages/FieldDetails';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/book/:courtId" element={<Booking />} />
              <Route path="/bookings" element={<MyBookings />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/fields" element={<FieldsPage />} />
              <Route path="/fields/:fieldId" element={<FieldDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;