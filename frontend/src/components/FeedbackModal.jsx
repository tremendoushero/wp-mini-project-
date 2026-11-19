// frontend/src/components/FeedbackModal.jsx
// Purpose: Modal dialog allowing users to submit ERP feedback or academic queries.

import React, { useState } from 'react';

function FeedbackModal({ isOpen, onClose, onSubmitFeedback }) {
  const [feedbackType, setFeedbackType] = useState('Academic Query');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comments.trim()) return;

    onSubmitFeedback({ feedbackType, comments });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComments('');
      onClose();
    }, 1500);
  };

  return (
    <div className="erp-modal-overlay" onClick={onClose}>
      <div className="erp-modal-dialog feedback-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#1E293B', fontWeight: 700 }}>
              💬 Lloyd ERP Feedback
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Send queries or feedback to the LIET Academic Administration
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94A3B8' }}
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h4 style={{ color: '#10B981', fontSize: '1.1rem', marginBottom: '0.35rem' }}>
              Feedback Submitted Successfully!
            </h4>
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
              Thank you. Your feedback has been registered with the Academic Office.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
              >
                <option value="Academic Query">Academic Query / Syllabus</option>
                <option value="Attendance Discrepancy">Attendance Discrepancy</option>
                <option value="Examination Schedule">Examination Schedule</option>
                <option value="Portal Feature Suggestion">Portal Feature Suggestion</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Remarks <span className="req">*</span></label>
              <textarea
                className="feedback-textarea"
                placeholder="Type your feedback or grievance here..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!comments.trim()}>
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default FeedbackModal;
