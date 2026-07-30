const TimetableSlot = require("../models/TimetableSlot");
const User = require("../models/User");

// @desc    Get all timetable slots (optionally filtered by program, semester, section)
// @route   GET /api/academic/timetable/slots
// @access  Private
const getSlots = async (req, res) => {
  try {
    const { program, semester, section } = req.query;
    
    const filter = { is_active: true };
    if (program) filter.program = program;
    if (semester) filter.semester = semester;
    if (section) filter.section = section;

    const slots = await TimetableSlot.find(filter).populate("faculty_id", "name email");

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    console.error("Error fetching timetable slots:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Create a new timetable slot
// @route   POST /api/academic/timetable/slots
// @access  Private
const createSlot = async (req, res) => {
  try {
    const { program, semester, section, day, period, subject, room, faculty_id } = req.body;

    // Check if slot already exists for this program/semester/section at the same time
    const existingSlot = await TimetableSlot.findOne({
      program,
      semester,
      section,
      day,
      period
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: "A slot already exists for this section at the specified day and period."
      });
    }

    const newSlot = await TimetableSlot.create({
      program,
      semester,
      section,
      day,
      period,
      subject,
      room,
      faculty_id: faculty_id || null
    });

    res.status(201).json({
      success: true,
      data: newSlot
    });
  } catch (error) {
    console.error("Error creating timetable slot:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Assign faculty to a specific timetable slot
// @route   PUT /api/academic/timetable/slots/:id/assign-faculty
// @access  Private
const assignFacultyToSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_id } = req.body;

    const slot = await TimetableSlot.findById(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: "Timetable slot not found" });
    }

    // If unassigning faculty
    if (!faculty_id) {
      slot.faculty_id = null;
      await slot.save();
      return res.status(200).json({ success: true, data: slot });
    }

    // Validate if faculty exists
    const faculty = await User.findById(faculty_id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    // Check if this faculty is already assigned to another slot at the same day and period
    const conflict = await TimetableSlot.findOne({
      day: slot.day,
      period: slot.period,
      faculty_id,
      _id: { $ne: slot._id },
      is_active: true
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Faculty conflict: This faculty is already scheduled for another class at this time.",
        conflictDetails: conflict
      });
    }

    slot.faculty_id = faculty_id;
    await slot.save();

    res.status(200).json({
      success: true,
      message: "Faculty assigned successfully",
      data: slot
    });
  } catch (error) {
    console.error("Error assigning faculty to slot:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Check if a faculty is available or get list of available faculties for a slot
// @route   GET /api/academic/timetable/faculty-availability
// @access  Private
const getFacultyAvailability = async (req, res) => {
  try {
    const { faculty_id, day, period } = req.query;

    if (!day || !period) {
      return res.status(400).json({ success: false, message: "Please provide day and period to check availability." });
    }

    // If a specific faculty is provided, check if they have a conflict
    if (faculty_id) {
      const conflict = await TimetableSlot.findOne({
        faculty_id,
        day,
        period,
        is_active: true
      });

      return res.status(200).json({
        success: true,
        isAvailable: !conflict,
        conflictReason: conflict ? `Already assigned to ${conflict.program} - ${conflict.section} for ${conflict.subject}` : null
      });
    }

    // If no specific faculty is provided, you might want to return a list of all faculties
    // minus those who are busy at this day & period.
    // Assuming role 'faculty' or similar. We will just find busy faculties and return their IDs.
    const busySlots = await TimetableSlot.find({ day, period, is_active: true }).select('faculty_id');
    const busyFacultyIds = busySlots.map(s => s.faculty_id).filter(id => id);

    // Get all users who are not in busyFacultyIds
    // This is a simplified version. Ideally you'd filter by role.
    const availableFaculties = await User.find({
      _id: { $nin: busyFacultyIds },
      is_active: true
      // role: 'faculty' // uncomment if role exists
    }).select('name email');

    res.status(200).json({
      success: true,
      availableCount: availableFaculties.length,
      busyCount: busyFacultyIds.length,
      availableFaculties
    });

  } catch (error) {
    console.error("Error checking faculty availability:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getSlots,
  createSlot,
  assignFacultyToSlot,
  getFacultyAvailability
};
