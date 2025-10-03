import React, { useState } from 'react';

const ThemePanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [primary, setPrimary] = useState('#2563eb');

  React.useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primary);
  }, [primary]);

  if (!open) return null;

  return (
    <div className="modal-backdrop flex items-center justify-center">
      <div className="bg-card p-6 rounded shadow-lg w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Theme options</h3>
          <button onClick={onClose} className="px-2 py-1">Close</button>
        </div>
        <div className="space-y-3">
          <label className="text-sm">Primary color</label>
          <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
        </div>
      </div>
    </div>
  );
};

export default ThemePanel;
