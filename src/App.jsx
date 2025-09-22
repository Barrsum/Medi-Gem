// src/App.jsx
import { Routes, Route } from 'react-router-dom';
// Page Imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';
import DoctorPage from './pages/DoctorPage';
import AppointmentPage from './pages/AppointmentPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
// Route Protection Imports
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DoctorRoute from './components/DoctorRoute';


function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Routes>
        {/* Role-based Home */}
        <Route path="/" element={ <ProtectedRoute> <HomePage /> </ProtectedRoute> } />
        
        {/* User Specific Routes */}
        <Route path="/book-appointment" element={ <ProtectedRoute> <AppointmentPage /> </ProtectedRoute> } />
        <Route path="/chat" element={ <ProtectedRoute> <ChatPage /> </ProtectedRoute> } />
        <Route path="/profile" element={ <ProtectedRoute> <ProfilePage /> </ProtectedRoute> } />

        {/* Admin Route */}
        <Route path="/admin" element={ <AdminRoute> <AdminPage /> </AdminRoute> } />
        
        {/* Doctor Route */}
        <Route path="/doctor" element={ <DoctorRoute> <DoctorPage /> </DoctorRoute> } />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  )
}

export default App;