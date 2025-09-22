// src/pages/DoctorProfilePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfilePage() {
    const { currentUser, userProfile } = useAuth();
    const [formData, setFormData] = useState({
        displayName: '', specialty: '', bio: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (userProfile) {
            setFormData({
                displayName: userProfile.displayName || '',
                specialty: userProfile.specialty || '',
                bio: userProfile.bio || '',
            });
        }
    }, [userProfile]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
            await updateDoc(userDocRef, formData);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update profile.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black p-4">
            <div className="w-full max-w-2xl p-8 space-y-6 rounded-lg shadow-lg bg-gray-400/10 backdrop-blur-lg border border-gray-100/20">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-100">My Doctor Profile</h2>
                    <Link to="/doctor" className="text-sm text-gray-300 hover:underline">← Back to Dashboard</Link>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Display Name (e.g., Dr. John Smith)</label>
                        <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} className="input-style" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Specialty (e.g., General Physician)</label>
                        <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className="input-style" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Short Bio</label>
                        <textarea name="bio" value={formData.bio} rows="3" onChange={handleChange} className="input-style"></textarea>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 font-semibold text-black bg-gray-200 rounded-md hover:bg-white disabled:bg-gray-500">
                        {isSubmitting ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
                {message && <p className="text-center text-green-400 pt-4">{message}</p>}
                <style>{`.input-style { width: 100%; padding: 8px 12px; margin-top: 4px; color: white; background-color: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; }`}</style>
            </div>
        </div>
    );
}