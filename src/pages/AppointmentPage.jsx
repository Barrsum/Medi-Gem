// src/pages/AppointmentPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

export default function AppointmentPage() {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            const q = query(collection(db, "users"), where("role", "==", "doctor"));
            const querySnapshot = await getDocs(q);
            const doctorsList = querySnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(doc => doc.displayName); // Only include doctors who have set up their profile

            setDoctors(doctorsList);
            if (doctorsList.length === 1) {
                setSelectedDoctor(doctorsList[0].id);
            }
        };
        fetchDoctors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !reason || !selectedDoctor) {
            setError('Please select a doctor, date, and provide a reason.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        const doctorDetails = doctors.find(doc => doc.id === selectedDoctor);

        try {
            await addDoc(collection(db, 'appointments'), {
                userId: currentUser.uid,
                userName: userProfile.name || currentUser.email,
                userEmail: currentUser.email,
                reason,
                preferredDate: selectedDate,
                doctorId: selectedDoctor,
                doctorName: doctorDetails.displayName,
                status: 'Pending',
                createdAt: serverTimestamp(),
            });
            navigate('/');
        } catch (err) {
            setError('Failed to book appointment. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const pickerStyles = `
      .rdp { --rdp-cell-size: 40px; --rdp-caption-font-size: 18px; margin: 1em 0; color: #e0e0e0; } .rdp-caption_label { color: #f0f0f0; } .rdp-head_cell { color: #a0a0a0; } .rdp-day { color: #c0c0c0; } .rdp-day_today { color: #81e6d9; font-weight: bold; } .rdp-day_selected, .rdp-day_selected:hover { background-color: #38b2ac; color: #1a202c; } .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #2d3748; }
    `;

    return (
        <div className="flex items-center justify-center min-h-screen bg-black p-4">
            <style>{pickerStyles}</style>
            <div className="w-full max-w-2xl p-8 space-y-6 rounded-lg shadow-lg bg-gray-400/10 backdrop-blur-lg border border-gray-100/20">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-100">Request an Appointment</h2>
                    <Link to="/" className="text-sm text-gray-300 hover:underline">← Back</Link>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {doctors.length > 1 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Choose a Doctor</label>
                            <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="input-style" required>
                                <option value="" disabled>Select a doctor</option>
                                {doctors.map(doc => (<option key={doc.id} value={doc.id}>{doc.displayName} - {doc.specialty}</option>))}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select a Date</label>
                        <DayPicker mode="single" selected={selectedDate} onSelect={setSelectedDate} fromDate={new Date()} className="bg-black/20 rounded-md p-4" />
                         <p className="mt-2 text-gray-400">Selected: {selectedDate ? format(selectedDate, 'PPP') : 'No date selected'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Reason for Visit</label>
                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" className="input-style" required></textarea>
                    </div>
                    
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <button type="submit" disabled={isSubmitting || doctors.length === 0} className="w-full py-3 px-4 font-semibold text-black bg-gray-200 rounded-md hover:bg-white disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Submitting...' : 'Request Appointment'}
                    </button>
                    {doctors.length === 0 && <p className="text-center text-yellow-400 text-sm mt-2">No doctors are available for booking right now.</p>}
                </form>
                 <style>{`.input-style { width: 100%; padding: 8px 12px; margin-top: 4px; color: white; background-color: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; }`}</style>
            </div>
        </div>
    );
}