import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentPage from './pages/AppointmentPage';
import AdminPage from './pages/AdminPage'; // 1. Import AdminPage
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // 2. Import AdminRoute
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Routes>
        {/* User Routes */}
        <Route path="/" element={ <ProtectedRoute> <DashboardPage /> </ProtectedRoute> } />
        <Route path="/book-appointment" element={ <ProtectedRoute> <AppointmentPage /> </ProtectedRoute> } />
        <Route path="/chat" element={ <ProtectedRoute> <ChatPage /> </ProtectedRoute> } />
        
        {/* Admin Route */}
        <Route path="/admin" element={ <AdminRoute> <AdminPage /> </AdminRoute> } /> {/* 3. Add the Admin Route */}

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  )
}

export default App