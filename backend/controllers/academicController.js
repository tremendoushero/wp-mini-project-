// backend/controllers/academicController.js
// Purpose: Manages configurable academic calendar events with dynamically computed statuses.

const AcademicEvent = require('../models/AcademicEvent');

// Helper to determine status dynamically based on today's date
const computeEventStatus = (startDate, endDate) => {
  const today = new Date().toISOString().split('T')[0];

  if (startDate > today) {
    return 'Upcoming';
  }

  const end = endDate || startDate;
  if (end < today) {
    return 'Completed';
  }

  return 'Ongoing';
};

// 1. GET ALL ACADEMIC EVENTS (GET /api/academic-events)
const getAcademicEvents = async (req, res) => {
  try {
    const events = await AcademicEvent.find({}).sort({ startDate: 1 });

    const formattedEvents = events.map((event) => ({
      ...event.toObject(),
      status: computeEventStatus(event.startDate, event.endDate),
    }));

    return res.status(200).json({
      success: true,
      count: formattedEvents.length,
      data: formattedEvents,
    });
  } catch (error) {
    console.error('Error fetching academic events:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving academic calendar.',
      error: error.message,
    });
  }
};

// 2. ADD ACADEMIC EVENT (POST /api/academic-events)
const addAcademicEvent = async (req, res) => {
  try {
    const { title, startDate, endDate, category, description } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event title and start date (YYYY-MM-DD).',
      });
    }

    const newEvent = await AcademicEvent.create({
      title: title.trim(),
      startDate: startDate.trim(),
      endDate: endDate ? endDate.trim() : '',
      category: category || 'Academic',
      description: description ? description.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Academic event added successfully!',
      data: {
        ...newEvent.toObject(),
        status: computeEventStatus(newEvent.startDate, newEvent.endDate),
      },
    });
  } catch (error) {
    console.error('Error adding academic event:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding academic event.',
      error: error.message,
    });
  }
};

// 3. UPDATE ACADEMIC EVENT (PUT /api/academic-events/:id)
const updateAcademicEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startDate, endDate, category, description } = req.body;

    const event = await AcademicEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Academic event not found.',
      });
    }

    if (title) event.title = title.trim();
    if (startDate) event.startDate = startDate.trim();
    if (endDate !== undefined) event.endDate = endDate ? endDate.trim() : '';
    if (category) event.category = category;
    if (description !== undefined) event.description = description.trim();

    const updated = await event.save();

    return res.status(200).json({
      success: true,
      message: 'Academic event updated successfully!',
      data: {
        ...updated.toObject(),
        status: computeEventStatus(updated.startDate, updated.endDate),
      },
    });
  } catch (error) {
    console.error('Error updating academic event:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating academic event.',
      error: error.message,
    });
  }
};

// 4. DELETE ACADEMIC EVENT (DELETE /api/academic-events/:id)
const deleteAcademicEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await AcademicEvent.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or already deleted.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Event "${event.title}" deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting academic event:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting event.',
      error: error.message,
    });
  }
};

module.exports = {
  getAcademicEvents,
  addAcademicEvent,
  updateAcademicEvent,
  deleteAcademicEvent,
};
