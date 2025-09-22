// src/components/AppointmentActionModal.jsx
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function AppointmentActionModal({ appointment, mode, onClose, onConfirm }) {
  const [assignedTime, setAssignedTime] = useState('09:00');
  const [rescheduleDate, setRescheduleDate] = useState(new Date());
  const [rescheduleTime, setRescheduleTime] = useState('10:00');
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (mode === 'approve') {
      onConfirm({ assignedTime });
    } else if (mode === 'reschedule') {
      onConfirm({
        proposedDate: rescheduleDate,
        proposedTime: rescheduleTime,
        note,
      });
    }
  };

  const isApproveMode = mode === 'approve';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md p-6 rounded-lg shadow-lg bg-gray-800/80 border border-gray-100/20">
        <div className="flex justify-between items-center border-b border-gray-100/20 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-100">{isApproveMode ? 'Approve & Assign Time' : 'Propose New Time'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="space-y-4">
          {isApproveMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-300">Assign a Time for {new Date(appointment.preferredDate.toDate()).toLocaleDateString()}</label>
              <input type="time" value={assignedTime} onChange={(e) => setAssignedTime(e.target.value)} className="input-style mt-1" />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-gray-300 mb-2">Propose a New Date</label>
                <DayPicker mode="single" selected={rescheduleDate} onSelect={setRescheduleDate} fromDate={new Date()} className="bg-black/20 rounded-md p-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Propose a New Time</label>
                <input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="input-style mt-1"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Add a Note (Optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows="2" className="input-style mt-1"></textarea>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="w-full py-2 px-4 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
            <button onClick={handleConfirm} className="w-full py-2 px-4 font-semibold text-black bg-green-400 rounded-md hover:bg-green-300">Confirm</button>
          </div>
        </div>
        <style>{`.input-style { width: 100%; padding: 8px 12px; color: white; background-color: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; }`}</style>
      </div>
    </div>
  );
}