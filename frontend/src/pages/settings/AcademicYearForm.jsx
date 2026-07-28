import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const INITIAL_FORM = {
  name: "",
  code: "",
  start_date: "",
  end_date: "",
  is_active: true
};

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function AcademicYearForm({ initialValue, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!initialValue) {
      setForm(INITIAL_FORM);
      return;
    }
    setForm({
      name: initialValue.name || "",
      code: initialValue.code || "",
      start_date: toDateInput(initialValue.start_date),
      end_date: toDateInput(initialValue.end_date),
      is_active: initialValue.is_active !== false
    });
  }, [initialValue]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      code: form.code.trim(),
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: form.is_active
    });
  }

  return (
    <form className="ui-form-grid" onSubmit={handleSubmit}>
      <label>
        Name
        <input required name="name" value={form.name} onChange={handleChange} placeholder="Academic Year 2026-27" />
      </label>
      <label>
        Code
        <input required name="code" value={form.code} onChange={handleChange} placeholder="AY-2026-27" />
      </label>
      <label>
        Start Date
        <input required type="date" name="start_date" value={form.start_date} onChange={handleChange} />
      </label>
      <label>
        End Date
        <input required type="date" name="end_date" value={form.end_date} onChange={handleChange} />
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
          {submitting ? "Saving..." : initialValue ? "Update Academic Year" : "Create Academic Year"}
        </button>
      </div>
    </form>
  );
}

AcademicYearForm.propTypes = {
  initialValue: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    code: PropTypes.string,
    start_date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    end_date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    is_active: PropTypes.bool
  }),
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

AcademicYearForm.defaultProps = {
  initialValue: null,
  submitting: false
};

export default AcademicYearForm;
