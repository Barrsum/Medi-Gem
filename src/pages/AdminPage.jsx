// src/pages/AdminPage.jsx
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import UserProfileModal from '../components/UserProfileModal';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const usersRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersRef, (querySnapshot) => {
            const allUsers = [];
            querySnapshot.forEach((doc) => allUsers.push({ id: doc.id, ...doc.data() }));
            setUsers(allUsers);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!newRole) return;
        const userDocRef = doc(db, 'users', userId);
        try { await updateDoc(userDocRef, { role: newRole }); alert('User role updated successfully!'); } 
        catch (error) { console.error("Error updating role: ", error); alert('Failed to update role.'); }
    };

    const handleViewProfile = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };
    
    const handleLogout = async () => {
        try { await signOut(auth); navigate('/login'); }
        catch (error) { console.error("Failed to log out", error); }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold text-gray-100">Admin Panel: User Management</h1>
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-sm text-gray-300 hover:underline">← User View</Link>
                    <button onClick={handleLogout} className="px-4 py-2 font-semibold text-black bg-gray-200 rounded-md hover:bg-white transition-colors">Logout</button>
                </div>
            </header>
            <main>
                <div className="p-6 rounded-lg bg-gray-400/10 backdrop-blur-lg border border-gray-100/20">
                    {loading ? <p>Loading users...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="border-b border-gray-100/20">
                                    <tr>
                                        <th className="py-3 px-4">User Email</th>
                                        <th className="py-3 px-4">Current Role</th>
                                        <th className="py-3 px-4">Change Role</th>
                                        <th className="py-3 px-4">Profile</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-gray-100/10">
                                            <td className="py-3 px-4">{user.email}</td>
                                            <td className="py-3 px-4 capitalize">{user.role}</td>
                                            <td className="py-3 px-4">
                                                <select
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    defaultValue={user.role}
                                                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="doctor">Doctor</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button onClick={() => handleViewProfile(user)} className="text-blue-300 hover:underline text-sm">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            {isModalOpen && <UserProfileModal user={selectedUser} onClose={handleCloseModal} />}
        </div>
    );
}