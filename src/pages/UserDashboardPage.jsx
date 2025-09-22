// src/pages/UserDashboardPage.jsx (Complete & Upgraded)
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteField } from 'firebase/firestore';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 text-sm font-medium rounded-full text-center";
  const statusClasses = {
    Pending: "bg-yellow-500/20 text-yellow-300", Approved: "bg-green-500/20 text-green-300", Rejected: "bg-red-500/20 text-red-300",
    'Reschedule Proposed': "bg-blue-500/20 text-blue-300", Cancelled: "bg-gray-500/20 text-gray-300",
  };
  return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.Cancelled}`}>{status}</span>;
};

export default function UserDashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'appointments'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userAppointments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(userAppointments);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => { /* ... (same as before) ... */ };

  // New Handler Functions for User Actions
  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment request?")) {
      const appointmentDocRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentDocRef, { status: 'Cancelled' });
    }
  };

  const handleAcceptReschedule = async (appointment) => {
    const appointmentDocRef = doc(db, 'appointments', appointment.id);
    await updateDoc(appointmentDocRef, {
      status: 'Approved',
      preferredDate: appointment.rescheduleDetails.proposedDate,
      assignedTime: appointment.rescheduleDetails.proposedTime,
      rescheduleDetails: deleteField() // Clean up the document
    });
  };

  const handleRejectReschedule = async (appointmentId) => {
    if (window.confirm("Are you sure you want to reject this new time? This will cancel the appointment.")) {
      const appointmentDocRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentDocRef, {
        status: 'Cancelled',
        rescheduleDetails: deleteField()
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-gray-100">MEDI-GEM</h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-400 hidden sm:block">Welcome, {currentUser?.email}</p>
          <button onClick={handleLogout} className="px-4 py-2 font-semibold text-black bg-gray-200 rounded-md hover:bg-white transition-colors">Logout</button>
        </div>
      </header>
      
      <main>
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link to="/book-appointment" className="feature-card"><h3 className="text-2xl font-semibold">Book an Appointment</h3><p className="mt-2 text-gray-400">Request your next visit.</p></Link>
            <Link to="/chat" className="feature-card"><h3 className="text-2xl font-semibold">Chat with AI Doctor</h3><p className="mt-2 text-gray-400">Get quick answers to your questions.</p></Link>
            <Link to="/profile" className="feature-card md:col-span-2"><h3 className="text-2xl font-semibold">My Medical Profile</h3><p className="mt-2 text-gray-400">Update your information.</p></Link>
        </div>

        {/* My Appointments Section */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-6">My Appointments</h2>
          <div className="space-y-4">
            {loading && <p>Loading appointments...</p>}
            {!loading && appointments.length === 0 && (
              <div className="p-6 rounded-lg bg-gray-400/10 text-center text-gray-400">You have no appointments scheduled.</div>
            )}
            {!loading && appointments.map(app => (
              <div key={app.id} className="p-4 rounded-lg bg-gray-400/10 border border-gray-100/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-200"> {app.doctorName}</p>
                  <p className="text-sm text-gray-400">Reason: {app.reason}</p>
                  {app.status === 'Approved' && (
                    <p className="text-sm font-bold text-green-300 mt-1">
                      Confirmed for {format(app.preferredDate.toDate(), 'PPP')} at {app.assignedTime}
                    </p>
                  )}
                </div>
                
                {app.status === 'Reschedule Proposed' && app.rescheduleDetails && (
                  <div className="p-3 bg-blue-900/30 rounded-md border border-blue-500/50 flex-1">
                    <p className="font-semibold text-blue-200">New Time Proposed:</p>
                    <p className="text-sm text-blue-300">
                      Date: {format(app.rescheduleDetails.proposedDate.toDate(), 'PPP')}
                      <br/>
                      Time: {app.rescheduleDetails.proposedTime}
                    </p>
                    {app.rescheduleDetails.note && <p className="text-xs text-gray-300 mt-1 italic">Note: "{app.rescheduleDetails.note}"</p>}
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => handleAcceptReschedule(app)} className="btn-user-action bg-green-500">Accept</button>
                        <button onClick={() => handleRejectReschedule(app.id)} className="btn-user-action bg-red-500">Reject</button>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col items-stretch md:items-end gap-2">
                  <StatusBadge status={app.status} />
                  {app.status === 'Pending' && (
                    <button onClick={() => handleCancelAppointment(app.id)} className="btn-user-action bg-red-600/70">Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <style>{`.feature-card { padding: 1.5rem; border-radius: 0.5rem; transition: all 0.3s; background-color: rgba(100, 116, 139, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); } .feature-card:hover { border-color: rgba(255, 255, 255, 0.25); background-color: rgba(100, 116, 139, 0.2); } .btn-user-action { padding: 4px 10px; font-size: 12px; font-weight: 600; color: white; border-radius: 4px; transition: opacity 0.2s; } .btn-user-action:hover { opacity: 0.8; }`}</style>
    </div>
  );
}