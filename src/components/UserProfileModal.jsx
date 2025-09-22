// src/components/UserProfileModal.jsx

export default function UserProfileModal({ user, onClose }) {
  if (!user) return null;

  return (
    // Modal Backdrop
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      {/* Modal Content */}
      <div 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        className="w-full max-w-2xl p-6 rounded-lg shadow-lg bg-gray-800/80 border border-gray-100/20"
      >
        <div className="flex justify-between items-center border-b border-gray-100/20 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-100">Patient Medical Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        <div className="space-y-4 text-gray-300">
          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          <p><strong>Full Name:</strong> {user.name || 'N/A'}</p>
          <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
          <p><strong>Blood Group:</strong> {user.bloodGroup || 'N/A'}</p>
          <p><strong>Known Allergies:</strong> {user.allergies || 'N/A'}</p>
          <div>
            <p><strong>Past Illnesses / Conditions:</strong></p>
            <p className="p-2 bg-black/20 rounded mt-1 whitespace-pre-wrap">{user.pastIllnesses || 'N/A'}</p>
          </div>
          <div>
            <p><strong>Uploaded Reports:</strong></p>
            <div className="p-2 bg-black/20 rounded mt-1">
              {user.reports && user.reports.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {user.reports.map((report, index) => <li key={index}>{report}</li>)}
                </ul>
              ) : (
                <p>No reports uploaded.</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 py-2 px-4 font-semibold text-black bg-gray-200 rounded-md hover:bg-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}