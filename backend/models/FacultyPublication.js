const mongoose = require("mongoose");

const facultyPublicationSchema = new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    publication_type: {
      type: String,
      enum: ["journal", "conference", "book", "book_chapter", "patent"],
      required: true
    },
    journal_or_venue: {
      type: String,
      trim: true,
      default: ""
    },
    year: {
      type: Number,
      required: true
    },
    authors: {
      type: String,
      trim: true,
      default: ""
    },
    doi_or_url: {
      type: String,
      trim: true,
      default: ""
    },
    is_indexed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FacultyPublication", facultyPublicationSchema);
