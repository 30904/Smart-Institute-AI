import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const ROLE_OPTIONS = [
  "super_admin",
  "institution_admin",
  "admission_officer",
  "faculty",
  "exam_controller",
  "accountant",
  "student"
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  role: "institution_admin"
};

function UserForm({ initialValue, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name || "",
        email: initialValue.email || "",
        phone: initialValue.phone || "",
        role: initialValue.role || "institution_admin"
      });
      return;
    }
    setForm(INITIAL_FORM);
  }, [initialValue]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: form.role
    });
  }

  return (
    <form className="ui-form-grid" onSubmit={handleSubmit}>
      <label>
        Full Name
        <input required name="name" value={form.name} onChange={handleChange} placeholder="Enter name" />
      </label>
      <label>
        Email
        <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@domain.com" />
      </label>
      <label>
        Phone
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" />
      </label>
      <label>
        Role
        <select name="role" value={form.role} onChange={handleChange}>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>

      <div className="ui-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initialValue ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}

UserForm.propTypes = {
  initialValue: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    role: PropTypes.string
  }),
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

UserForm.defaultProps = {
  initialValue: null,
  submitting: false
};

export default UserForm;
