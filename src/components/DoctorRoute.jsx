// src/components/DoctorRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DoctorRoute({ children }) {
  const { userProfile, currentUser } = useAuth();

  if (!currentUser) {
    // If not logged in at all, go to login
    return <Navigate to="/login" />;
  }

  // The userProfile is still loading, don't render anything yet
  if (userProfile === null && currentUser) {
      return <div>Loading...</div>; // Or a proper spinner component
  }

  if (userProfile?.role !== 'doctor') {
    // If logged in but NOT a doctor, go to the main user dashboard
    return <Navigate to="/" />;
  }

  return children;
}