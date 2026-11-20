// frontend/src/components/DeleteConfirmModal.jsx
// Purpose: Confirmation modal popup before permanently deleting a student record.

import React from 'react';

function DeleteConfirmModal({ student, onConfirm, onCancel, isDeleting }) {
  if (!student) return null;

  return (
    <div className="erp-modal-overlay" onClick={onCancel}>
      <div className="erp-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#FEECEB',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}
          >
            ⚠️
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#1E293B', fontWeight: 700 }}>
              Confirm Record Deletion
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Permanent removal from college database</p>
          </div>
        </div>

        <div style={{ padding: '0.5rem 0 1.25rem 0' }}>
          <p style={{ fontSize: '0.9rem', color: '#78716C', lineHeight: 1.5 }}>
            Are you sure you want to permanently delete{' '}
            <strong style={{ color: '#292524' }}>{student.name}</strong> (Roll No:{' '}
            <strong style={{ color: '#EA580C' }}>{student.rollNumber}</strong>)?
            <br />
            This record will be permanently deleted from MongoDB Atlas.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
