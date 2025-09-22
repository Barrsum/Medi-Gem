// src/pages/AppointmentPage.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function AppointmentPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    preferredDate: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!formData.name || !formData.preferredDate || !formData.reason) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'Pending', // Default status
        createdAt: serverTimestamp(),
      });
      setSuccess('Appointment requested successfully! You will be redirected shortly.');
      setTimeout(() => navigate('/'), 2000); // Redirect back to dashboard
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <div className="w-full max-w-2xl p-8 space-y-6 rounded-lg shadow-lg
                      bg-gray-400/10 backdrop-blur-lg border border-gray-100/20">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-100">Book an Appointment</h2>
            <Link to="/" className="text-sm text-gray-300 hover:underline">← Back to Dashboard</Link>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Full Name</label>
            <input type="text" name="name" onChange={handleChange} className="input-style" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Phone Number (Optional)</label>
            <input type="tel" name="phone" onChange={handleChange} className="input-style" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Preferred Date</label>
            <input type="date" name="preferredDate" onChange={handleChange} className="input-style" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Reason for Visit</label>
            <textarea name="reason" rows="4" onChange={handleChange} className="input-style" required></textarea>
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}

          <style>{`.input-style { width: 100%; padding: 8px 12px; margin-top: 4px; color: white; background-color: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; transition: border-color 0.2s, box-shadow 0.2s; } .input-style:focus { outline: none; border-color: rgba(255,255,255,0.5); box-shadow: 0 0 0 2px rgba(255,255,255,0.1); }`}</style>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 font-semibold text-black bg-gray-200 rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Request Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}