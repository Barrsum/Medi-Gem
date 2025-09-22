import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    const statusClasses = {
        Pending: "bg-yellow-500/20 text-yellow-300",
        Approved: "bg-green-500/20 text-green-300",
        Rejected: "bg-red-500/20 text-red-300",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

export default function AdminPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const appointmentsRef = collection(db, 'appointments');
        const q = query(appointmentsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allAppointments = [];
            querySnapshot.forEach((doc) => {
                allAppointments.push({ id: doc.id, ...doc.data() });
            });
            setAppointments(allAppointments);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        const appointmentDocRef = doc(db, 'appointments', id);
        try {
            await updateDoc(appointmentDocRef, { status: newStatus });
        } catch (error) {
            console.error("Error updating status: ", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
                <Link to="/" className="text-sm text-gray-300 hover:underline">← Go to User Dashboard</Link>
            </header>

            <main>
                <h2 className="text-2xl font-semibold text-slate-100 mb-6">All Appointment Requests</h2>
                <div className="p-6 rounded-lg bg-gray-400/10 backdrop-blur-lg border border-gray-100/20">
                    {loading && <p>Loading appointments...</p>}
                    {!loading && appointments.length === 0 && (
                        <p className="text-gray-400">There are no pending appointments.</p>
                    )}
                    {!loading && appointments.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="border-b border-gray-100/20">
                                    <tr>
                                        <th className="py-3 px-4">Patient Name</th>
                                        <th className="py-3 px-4">Reason</th>
                                        <th className="py-3 px-4">Requested Date</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map(app => (
                                        <tr key={app.id} className="border-b border-gray-100/10">
                                            <td className="py-3 px-4">{app.name}</td>
                                            <td className="py-3 px-4 max-w-xs truncate">{app.reason}</td>
                                            <td className="py-3 px-4">{new Date(app.preferredDate).toLocaleDateString()}</td>
                                            <td className="py-3 px-4"><StatusBadge status={app.status} /></td>
                                            <td className="py-3 px-4">
                                                {app.status === 'Pending' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleUpdateStatus(app.id, 'Approved')} className="px-3 py-1 text-xs font-semibold text-black bg-green-400 rounded hover:bg-green-300">Approve</button>
                                                        <button onClick={() => handleUpdateStatus(app.id, 'Rejected')} className="px-3 py-1 text-xs font-semibold text-black bg-red-400 rounded hover:bg-red-300">Reject</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}