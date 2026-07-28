import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const INITIAL_FORM = {
  name: "",
  code: "",
  head_user_id: "",
  is_active: true
};

function DepartmentForm({ initialValue, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!initialValue) {
      setForm(INITIAL_FORM);
      return;
    }
    setForm({
      name: initialValue.name || "",
      code: initialValue.code || "",
      head_user_id: initialValue.head_user_id || "",
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
      head_user_id: form.head_user_id.trim() || null,
      is_active: form.is_active
    });
  }

  return (
    <form className="ui-form-grid" onSubmit={handleSubmit}>
      <label>
        Name
        <input required name="name" value={form.name} onChange={handleChange} placeholder="Department name" />
      </label>
      <label>
        Code
        <input required name="code" value={form.code} onChange={handleChange} placeholder="DEPT-CODE" />
      </label>
      <label>
        Head User ID (optional)
        <input name="head_user_id" value={form.head_user_id} onChange={handleChange} placeholder="Mongo user id" />
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
          {submitting ? "Saving..." : initialValue ? "Update Department" : "Create Department"}
        </button>
      </div>
    </form>
  );
}

DepartmentForm.propTypes = {
  initialValue: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    code: PropTypes.string,
    head_user_id: PropTypes.string,
    is_active: PropTypes.bool
  }),
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

DepartmentForm.defaultProps = {
  initialValue: null,
  submitting: false
};

export default DepartmentForm;
