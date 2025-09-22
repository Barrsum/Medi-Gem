// src/pages/HomePage.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserDashboardPage from './UserDashboardPage';

export default function HomePage() {
  const { isAdmin, isDoctor } = useAuth();

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  if (isDoctor) {
    return <Navigate to="/doctor" replace />;
  }

  // Default to the user dashboard
  return <UserDashboardPage />;
}