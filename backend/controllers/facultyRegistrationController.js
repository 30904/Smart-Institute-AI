const Faculty = require("../models/Faculty");
const User = require("../models/User");

// ─── GET ALL ──────────────────────────────────────────────────────────────────
exports.getAllFaculty = async (req, res) => {
  try {
    const { department_id, designation_id, type_id, is_active, search } = req.query;

    let query = {};
    if (department_id) query.department_id = department_id;
    if (designation_id) query.designation_id = designation_id;
    if (type_id) query.type_id = type_id;
    if (is_active !== undefined) query.is_active = is_active === "true";

    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
        { employee_code: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const faculty = await Faculty.find(query)
      .populate("department_id", "name code")
      .populate("designation_id", "name")
      .populate("type_id", "name code")
      .populate("qualifications.qualification_id", "name degree")
      .populate("subjects", "name code credits")
      .populate("user_id", "email role")
      .sort({ first_name: 1, last_name: 1 });

    res.status(200).json({ success: true, count: faculty.length, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate("department_id", "name code")
      .populate("designation_id", "name")
      .populate("type_id", "name code")
      .populate("qualifications.qualification_id", "name degree")
      .populate("subjects", "name code credits")
      .populate("user_id", "email role");

    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
exports.registerFaculty = async (req, res) => {
  try {
    const { email, employee_code, user_id } = req.body;

    // Check for duplicate email or employee_code
    const existing = await Faculty.findOne({
      $or: [{ email }, { employee_code }]
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email or Employee Code already exists" });
    }

    // Validate user link if provided
    if (user_id) {
      const user = await User.findById(user_id);
      if (!user) return res.status(404).json({ success: false, message: "Linked User not found" });

      const alreadyLinked = await Faculty.findOne({ user_id });
      if (alreadyLinked) {
        return res.status(400).json({ success: false, message: "This User is already linked to another faculty record" });
      }
    }

    const faculty = await Faculty.create(req.body);

    if (faculty.user_id) {
      await User.findByIdAndUpdate(faculty.user_id, { linked_faculty_id: faculty._id });
    }

    res.status(201).json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to register faculty", error: error.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateFaculty = async (req, res) => {
  try {
    const { email, employee_code } = req.body;

    // Duplicate check for unique fields
    if (email || employee_code) {
      const dupe = await Faculty.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(email ? [{ email }] : []),
          ...(employee_code ? [{ employee_code }] : [])
        ]
      });
      if (dupe) {
        return res.status(400).json({ success: false, message: "Email or Employee Code already in use" });
      }
    }

    const existing = await Faculty.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Faculty not found" });

    const oldUserId = String(existing.user_id || "");
    const newUserId = String(req.body.user_id || "");

    const updated = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Handle user link changes
    if (oldUserId !== newUserId) {
      if (oldUserId) await User.findByIdAndUpdate(oldUserId, { linked_faculty_id: null });
      if (newUserId) await User.findByIdAndUpdate(newUserId, { linked_faculty_id: updated._id });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update faculty", error: error.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ success: false, message: "Faculty not found" });

    if (faculty.user_id) {
      await User.findByIdAndUpdate(faculty.user_id, { linked_faculty_id: null });
    }

    await faculty.deleteOne();
    res.status(200).json({ success: true, message: "Faculty removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete faculty", error: error.message });
  }
};
