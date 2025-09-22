import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

// A small component for displaying status badges
const StatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
  const statusClasses = {
    Pending: "bg-yellow-500/20 text-yellow-300",
    Approved: "bg-green-500/20 text-green-300",
    Rejected: "bg-red-500/20 text-red-300",
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for user's appointments
  useEffect(() => {
    if (!currentUser) return;

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
        appointmentsRef, 
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userAppointments = [];
      querySnapshot.forEach((doc) => {
        userAppointments.push({ id: doc.id, ...doc.data() });
      });
      setAppointments(userAppointments);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-gray-100">MEDI-GEM</h1>
        <div className="flex items-center gap-4">
            <p className="text-gray-400 hidden sm:block">Welcome, {currentUser?.email}</p>
            <button onClick={handleLogout} className="px-4 py-2 font-semibold text-black bg-gray-200 rounded-md hover:bg-white transition-colors">
                Logout
            </button>
        </div>
      </header>
      
      <main>
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link to="/book-appointment" className="p-6 rounded-lg transition-all duration-300
                      bg-gray-400/10 backdrop-blur-lg border border-gray-100/20
                      hover:border-gray-100/40 hover:bg-gray-400/20">
              <h3 className="text-2xl font-semibold text-gray-100">Book an Appointment</h3>
              <p className="mt-2 text-gray-400">Fill out a simple form to request your next visit.</p>
            </Link>
            <Link to="/chat" className="p-6 rounded-lg transition-all duration-300 cursor-pointer
                  bg-gray-400/10 backdrop-blur-lg border border-gray-100/20
                  hover:border-gray-100/40 hover:bg-gray-400/20">
                <h3 className="text-2xl font-semibold text-gray-100">Chat with AI Doctor</h3>
                <p className="mt-2 text-gray-400">Get quick answers to your medical questions from our AI.</p>
            </Link>
            <Link to="/profile" className="p-6 rounded-lg transition-all duration-300 cursor-pointer
                      bg-gray-400/10 backdrop-blur-lg border border-gray-100/20
                      hover:border-gray-100/40 hover:bg-gray-400/20 md:col-span-2">
                <h3 className="text-2xl font-semibold text-gray-100">My Medical Profile</h3>
                <p className="mt-2 text-gray-400">Update your personal information and view your medical history.</p>
            </Link>
          </div>

          {/* My Appointments Section */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">My Appointments</h2>
            <div className="p-6 rounded-lg bg-gray-400/10 backdrop-blur-lg border border-gray-100/20">
              {loading && <p>Loading appointments...</p>}
              {!loading && appointments.length === 0 && (
                <p className="text-gray-400">You have no appointments scheduled.</p>
              )}
              {!loading && appointments.length > 0 && (
                <ul className="space-y-4">
                  {appointments.map(app => (
                    <li key={app.id} className="p-4 rounded-md flex justify-between items-center bg-black/20">
                      <div>
                        <p className="font-semibold text-gray-200">Reason: {app.reason}</p>
                        <p className="text-sm text-gray-400">Date: {new Date(app.preferredDate).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
      </main>
    </div>
  );
}