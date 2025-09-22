// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { userProfile, currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (userProfile === null && currentUser) {
      return <div>Loading...</div>;
  }

  if (userProfile?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
}