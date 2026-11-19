// frontend/src/components/AlertBanner.jsx
// Purpose: Reusable alert banner showing success or error feedback messages in ERP style.

import React from 'react';

function AlertBanner({ alert, onClose }) {
  if (!alert || !alert.message) return null;

  return (
    <div className={`erp-alert-box ${alert.type === 'error' ? 'error' : 'success'}`}>
      <span>
        {alert.type === 'error' ? '❌ ' : '✅ '}
        {alert.message}
      </span>
      <button
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          color: 'inherit',
          opacity: 0.7,
        }}
      >
        &times;
      </button>
    </div>
  );
}

export default AlertBanner;
