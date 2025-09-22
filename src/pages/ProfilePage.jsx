// src/pages/ProfilePage.jsx (Corrected)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { currentUser, userProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: '', phone: '', bloodGroup: '', allergies: '', pastIllnesses: '',
    });
    // The reports state is now derived directly and only from the userProfile prop
    const [reports, setReports] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                phone: userProfile.phone || '',
                bloodGroup: userProfile.bloodGroup || '',
                allergies: userProfile.allergies || '',
                pastIllnesses: userProfile.pastIllnesses || '',
            });
            // This is now the ONLY place the reports state is set
            setReports(userProfile.reports || []);
        }
    }, [userProfile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setMessage(`Uploading ${file.name}...`);
        
        setTimeout(async () => {
            const userDocRef = doc(db, 'users', currentUser.uid);
            try {
                // Update Firestore - this will trigger the real-time listener in AuthContext
                await updateDoc(userDocRef, {
                    reports: arrayUnion(file.name)
                });
                
                // **** THE FIX: THE LINE BELOW HAS BEEN REMOVED ****
                // setReports(prev => [...prev, file.name]); // <-- This was causing the duplicate

                setMessage(`'${file.name}' uploaded successfully!`);
            } catch (error) {
                setMessage('File upload failed.');
                console.error(error);
            } finally {
                setIsUploading(false);
                setTimeout(() => setMessage(''), 3000);
            }
        }, 2000);
    };

    // ... The rest of the JSX return statement is exactly the same
    return (
        <div className="flex items-center justify-center min-h-screen bg-black p-4">
            <div className="w-full max-w-3xl p-8 space-y-6 rounded-lg shadow-lg bg-gray-400/10 backdrop-blur-lg border border-gray-100/20">
                {/* ... all the form and upload JSX is unchanged ... */}
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-100">My Medical Profile</h2>
                    <Link to="/" className="text-sm text-gray-300 hover:underline">← Back to Dashboard</Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-style" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-style" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300">Blood Group</label>
                            <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-style" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Known Allergies</label>
                            <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="input-style" />
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-300">Past Illnesses / Conditions</label>
                         <textarea name="pastIllnesses" value={formData.pastIllnesses} rows="3" onChange={handleChange} className="input-style"></textarea>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 font-semibold text-black bg-gray-200 rounded-md hover:bg-white disabled:bg-gray-500">
                        {isSubmitting ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>

                <div className="border-t border-gray-100/20 pt-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-200">My Reports</h3>
                    <div className="p-4 bg-black/20 rounded-md">
                        {reports.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                                {reports.map((name, i) => <li key={i}>{name}</li>)}
                            </ul>
                        ) : <p className="text-gray-400">No reports uploaded yet.</p>}
                    </div>
                    <label className={`w-full text-center block py-2 px-4 font-semibold text-black bg-blue-300 rounded-md hover:bg-blue-200 ${isUploading ? 'cursor-not-allowed bg-gray-500' : 'cursor-pointer'}`}>
                        {isUploading ? 'Uploading...' : 'Add New Report'}
                        <input type="file" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                    </label>
                </div>

                {message && <p className="text-center text-green-400 pt-4">{message}</p>}
                <style>{`.input-style { width: 100%; padding: 8px 12px; margin-top: 4px; color: white; background-color: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; }`}</style>
            </div>
        </div>
    );
}