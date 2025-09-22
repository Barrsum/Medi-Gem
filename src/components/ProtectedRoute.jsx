import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If there is no logged-in user, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If the user is logged in, render the component they were trying to access
  return children;
}