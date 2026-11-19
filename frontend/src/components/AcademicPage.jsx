// frontend/src/components/AcademicPage.jsx
// Purpose: Full database-backed Academic Calendar & Events management.
// Connects to MongoDB Atlas via AcademicEvent APIs, with dynamic date status calculation (Upcoming, Ongoing, Completed)
// and support for adding, editing, and deleting academic milestones.

import React, { useState, useEffect, useCallback } from 'react';
import { fetchAcademicEventsAPI, createAcademicEventAPI, updateAcademicEventAPI, deleteAcademicEventAPI } from '../api';

const EMPTY_EVENT_FORM = {
  title: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  category: 'Academic',
  description: '',
};

function AcademicPage({ onShowAlert }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_EVENT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load events from MongoDB
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAcademicEventsAPI();
      setEvents(data);
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to fetch academic calendar.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowAlert]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Dynamic status computation from current date
  const computeStatus = (startDateStr, endDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);

    const end = endDateStr ? new Date(endDateStr) : new Date(startDateStr);
    end.setHours(23, 59, 59, 999);

    if (today > end) return 'Completed';
    if (today >= start && today <= end) return 'Ongoing';
    return 'Upcoming';
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData(EMPTY_EVENT_FORM);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      startDate: evt.startDate ? new Date(evt.startDate).toISOString().split('T')[0] : '',
      endDate: evt.endDate ? new Date(evt.endDate).toISOString().split('T')[0] : '',
      category: evt.category || 'Academic',
      description: evt.description || '',
    });
    setIsModalOpen(true);
  };

  // Submit Event Add / Edit
  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) {
      if (onShowAlert) onShowAlert('Event Title and Start Date are required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        category: formData.category,
        description: formData.description.trim(),
      };

      if (editingEvent) {
        await updateAcademicEventAPI(editingEvent._id, payload);
        if (onShowAlert) onShowAlert(`Event "${formData.title}" updated successfully!`, 'success');
      } else {
        await createAcademicEventAPI(payload);
        if (onShowAlert) onShowAlert(`Event "${formData.title}" scheduled in calendar!`, 'success');
      }

      setIsModalOpen(false);
      await loadEvents();
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to save event.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (evt) => {
    if (!window.confirm(`Are you sure you want to remove "${evt.title}" from the calendar?`)) {
      return;
    }

    try {
      await deleteAcademicEventAPI(evt._id);
      if (onShowAlert) onShowAlert(`Event "${evt.title}" removed from calendar.`, 'success');
      await loadEvents();
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to delete event.', 'error');
    }
  };

  // Filtered events
  const filteredEvents = categoryFilter === 'All'
    ? events
    : events.filter((e) => e.category === categoryFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Calendar Header Card */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div>
            <h3>🏛️ Academic Calendar & Term Milestones</h3>
            <p>Institutional calendar events stored in MongoDB Atlas</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Examination">Examination</option>
              <option value="Cultural">Cultural</option>
              <option value="Holiday">Holiday</option>
              <option value="Other">Other</option>
            </select>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAdd}
              style={{ whiteSpace: 'nowrap' }}
            >
              ➕ Add Calendar Event
            </button>
          </div>
        </div>

        <div className="erp-card-body">
          {isLoading ? (
            <div className="honest-empty-state">
              <div className="honest-empty-icon">⏳</div>
              <h4>Loading calendar from MongoDB...</h4>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="honest-empty-state">
              <div className="honest-empty-icon">📅</div>
              <h4>No Academic Events</h4>
              <p>No calendar entries found. Click "Add Calendar Event" to schedule an academic milestone.</p>
            </div>
          ) : (
            <div className="erp-table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Scheduled Date</th>
                    <th>Milestone Title & Description</th>
                    <th>Category</th>
                    <th>Current Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((evt) => {
                    const status = computeStatus(evt.startDate, evt.endDate);
                    const formattedDate = new Date(evt.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const formattedEndDate = evt.endDate
                      ? ` - ${new Date(evt.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : '';

                    return (
                      <tr key={evt._id}>
                        <td>
                          <span className="badge-roll">{formattedDate}{formattedEndDate}</span>
                        </td>
                        <td>
                          <strong style={{ color: '#1E293B' }}>{evt.title}</strong>
                          {evt.description && (
                            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                              {evt.description}
                            </p>
                          )}
                        </td>
                        <td>
                          <span className="badge-course">{evt.category}</span>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor:
                                status === 'Completed'
                                  ? '#E6FBF2'
                                  : status === 'Ongoing'
                                  ? '#EFF6FF'
                                  : '#FEF6E7',
                              color:
                                status === 'Completed'
                                  ? '#065F46'
                                  : status === 'Ongoing'
                                  ? '#1D4ED8'
                                  : '#92400E',
                            }}
                          >
                            {status === 'Completed' ? '✅ ' : status === 'Ongoing' ? '🔵 ' : '⏳ '}
                            {status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-edit"
                              onClick={() => handleOpenEdit(evt)}
                              title="Edit Event"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-delete"
                              onClick={() => handleDeleteEvent(evt)}
                              title="Delete Event"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 2. Important Academic Guidelines */}
      <div className="erp-card">
        <div className="erp-card-header">
          <h3>📌 Important Academic Guidelines</h3>
        </div>
        <div className="erp-card-body" style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6 }}>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Students must maintain a minimum of <strong>75% classroom attendance</strong> across all registered subjects to be eligible for end-semester examinations.</li>
            <li>Practical lab assessments and project viva submissions must be completed before the pre-university assessment period.</li>
            <li>Examination roll-sheets and admit cards are validated automatically through this central ERP portal.</li>
          </ul>
        </div>
      </div>

      {/* 3. Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="erp-modal-box" style={{ maxWidth: '520px', width: '92%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E293B' }}>
                {editingEvent ? '✏️ Edit Calendar Milestone' : '➕ Add Academic Calendar Event'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitEvent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Event Title <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mid-Term Examination (MST-I)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Start Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">End Date (Optional)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={isSubmitting}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description / Notes</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Provide additional details about the academic event..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingEvent ? 'Save Changes' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademicPage;
