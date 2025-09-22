// src/pages/DoctorPage.jsx
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, getDoc, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isToday } from 'date-fns';

import UserProfileModal from '../components/UserProfileModal';
import AppointmentActionModal from '../components/AppointmentActionModal';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    const statusClasses = {
        Pending: "bg-yellow-500/20 text-yellow-300",
        Approved: "bg-green-500/20 text-green-300",
        Rejected: "bg-red-500/20 text-red-300",
        'Reschedule Proposed': "bg-blue-500/20 text-blue-300",
        Cancelled: "bg-gray-500/20 text-gray-300",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.Cancelled}`}>{status}</span>;
};

export default function DoctorPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, today: 0 });
    
    // State for modals
    const [selectedUser, setSelectedUser] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionModalMode, setActionModalMode] = useState('approve');

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'appointments'),
            where('doctorId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allAppointments = [];
            let pendingCount = 0;
            let todayCount = 0;
            
            querySnapshot.forEach((doc) => {
                const appointmentData = doc.data();
                const appointment = { id: doc.id, ...appointmentData };
                allAppointments.push(appointment);

                if (appointment.status === 'Pending') pendingCount++;
                if (appointment.status === 'Approved' && appointmentData.preferredDate && isToday(appointmentData.preferredDate.toDate())) {
                    todayCount++;
                }
            });
            setAppointments(allAppointments);
            setStats({ pending: pendingCount, today: todayCount });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleUpdateStatus = async (id, newStatus) => {
        const appointmentDocRef = doc(db, 'appointments', id);
        try { await updateDoc(appointmentDocRef, { status: newStatus }); } 
        catch (error) { console.error("Error updating status: ", error); }
    };

    const openActionModal = (appointment, mode) => {
        setSelectedAppointment(appointment);
        setActionModalMode(mode);
        setIsActionModalOpen(true);
    };

    const handleConfirmAction = async (actionData) => {
        if (!selectedAppointment) return;
        const appointmentDocRef = doc(db, 'appointments', selectedAppointment.id);
        let updatePayload = {};

        if (actionModalMode === 'approve') {
            updatePayload = {
                status: 'Approved',
                assignedTime: actionData.assignedTime,
            };
        } else if (actionModalMode === 'reschedule') {
            updatePayload = {
                status: 'Reschedule Proposed',
                rescheduleDetails: actionData,
            };
        }
        
        try { await updateDoc(appointmentDocRef, updatePayload); } 
        catch (error) { console.error("Error confirming action:", error); } 
        finally { setIsActionModalOpen(false); setSelectedAppointment(null); }
    };
    
    const handleViewProfile = async (userId) => {
        if (!userId) return;
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
            setSelectedUser(userSnap.data());
            setIsProfileModalOpen(true);
        } else {
            console.error("No such user document!");
            alert("Could not find patient profile.");
        }
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedUser(null);
    };

    const handleLogout = async () => {
        try { await signOut(auth); navigate('/login'); } 
        catch (error) { console.error("Failed to log out", error); }
    };
    
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-gray-100">Doctor Dashboard</h1>
                <div className="flex items-center gap-4">
                    <Link to="/doctor/profile" className="text-sm text-gray-300 hover:underline">Edit Profile</Link>
                    <Link to="/" className="text-sm text-gray-300 hover:underline">← User View</Link>
                    <button onClick={handleLogout} className="px-4 py-2 font-semibold text-black bg-gray-200 rounded-md hover:bg-white transition-colors">Logout</button>
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"><div className="text-4xl font-bold text-yellow-300">{stats.pending}</div><div className="text-yellow-400">Pending Requests</div></div>
                <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg"><div className="text-4xl font-bold text-green-300">{stats.today}</div><div className="text-green-400">Appointments Today</div></div>
            </div>

            <main>
                <h2 className="text-2xl font-semibold text-slate-100 mb-6">All Appointments</h2>
                <div className="p-6 rounded-lg bg-gray-400/10 backdrop-blur-lg border border-gray-100/20">
                     {loading ? <p>Loading appointments...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="border-b border-gray-100/20">
                                    <tr>
                                        <th className="py-3 px-4">Patient</th>
                                        <th className="py-3 px-4">Requested Date</th>
                                        <th className="py-3 px-4">Assigned Time</th>
                                        <th className="py-3 px-4">Profile</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map(app => (
                                        <tr key={app.id} className="border-b border-gray-100/10">
                                            <td className="py-3 px-4">{app.userName}</td>
                                            <td className="py-3 px-4">{app.preferredDate ? new Date(app.preferredDate.toDate()).toLocaleDateString() : 'N/A'}</td>
                                            <td className="py-3 px-4">{app.assignedTime || 'Not Set'}</td>
                                            <td className="py-3 px-4"><button onClick={() => handleViewProfile(app.userId)} className="text-blue-300 hover:underline text-sm">View</button></td>
                                            <td className="py-3 px-4"><StatusBadge status={app.status} /></td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2 flex-wrap">
                                                    {app.status === 'Pending' && (
                                                        <>
                                                            <button onClick={() => openActionModal(app, 'approve')} className="btn-action bg-green-400">Approve</button>
                                                            <button onClick={() => openActionModal(app, 'reschedule')} className="btn-action bg-yellow-400">Reschedule</button>
                                                            <button onClick={() => handleUpdateStatus(app.id, 'Rejected')} className="btn-action bg-red-400">Reject</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                     <style>{`.btn-action { padding: 4px 8px; font-size: 12px; font-weight: 600; color: black; border-radius: 4px; transition: opacity 0.2s; } .btn-action:hover { opacity: 0.8; }`}</style>
                </div>
            </main>
            {isProfileModalOpen && <UserProfileModal user={selectedUser} onClose={handleCloseProfileModal} />}
            {isActionModalOpen && <AppointmentActionModal appointment={selectedAppointment} mode={actionModalMode} onClose={() => setIsActionModalOpen(false)} onConfirm={handleConfirmAction} />}
        </div>
    );
}