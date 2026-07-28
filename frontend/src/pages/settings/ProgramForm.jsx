import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const TYPE_OPTIONS = ["trade", "diploma", "degree"];

const INITIAL_FORM = {
  name: "",
  code: "",
  department_id: "",
  duration: 1,
  program_type: "trade",
  intake_default: 0,
  description: "",
  is_active: true
};

function ProgramForm({ initialValue, departments, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!initialValue) {
      setForm((prev) => ({
        ...INITIAL_FORM,
        department_id: departments[0]?.id || prev.department_id || ""
      }));
      return;
    }

    setForm({
      name: initialValue.name || "",
      code: initialValue.code || "",
      department_id: initialValue.department_id || "",
      duration: Number(initialValue.duration || 1),
      program_type: initialValue.program_type || "trade",
      intake_default: Number(initialValue.intake_default || 0),
      description: initialValue.description || "",
      is_active: initialValue.is_active !== false
    });
  }, [departments, initialValue]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      code: form.code.trim(),
      department_id: form.department_id,
      duration: Number(form.duration),
      program_type: form.program_type,
      intake_default: Number(form.intake_default),
      description: form.description.trim(),
      is_active: form.is_active
    });
  }

  return (
    <form className="ui-form-grid" onSubmit={handleSubmit}>
      <label>
        Program/Course Name
        <input required name="name" value={form.name} onChange={handleChange} placeholder="Course name" />
      </label>
      <label>
        Code
        <input required name="code" value={form.code} onChange={handleChange} placeholder="COURSE-CODE" />
      </label>
      <label>
        Department
        <select required name="department_id" value={form.department_id} onChange={handleChange}>
          <option value="" disabled>
            Select department
          </option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Duration (years)
        <input required min="1" type="number" name="duration" value={form.duration} onChange={handleChange} />
      </label>
      <label>
        Program Type
        <select name="program_type" value={form.program_type} onChange={handleChange}>
          {TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Default Intake
        <input required min="0" type="number" name="intake_default" value={form.intake_default} onChange={handleChange} />
      </label>
      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Course summary for master card display" />
      </label>
      <label className="ui-checkbox">
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
        Active
      </label>
      <div className="ui-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initialValue ? "Update Program" : "Create Program"}
        </button>
      </div>
    </form>
  );
}

ProgramForm.propTypes = {
  initialValue: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    code: PropTypes.string,
    department_id: PropTypes.string,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    program_type: PropTypes.string,
    intake_default: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    description: PropTypes.string,
    is_active: PropTypes.bool
  }),
  departments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

ProgramForm.defaultProps = {
  initialValue: null,
  submitting: false
};

export default ProgramForm;
