import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAdmin, currentUser } = useAuth();

  if (!currentUser) {
    // If not logged in at all, go to login
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    // If logged in but NOT an admin, go to user dashboard
    return <Navigate to="/" />;
  }

  return children;
}