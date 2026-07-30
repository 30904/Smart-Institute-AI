import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  address: "",
  qualification: "",
  institution_name: "",
  board_or_university: "",
  passing_year: "",
  marks_percent: "",
  cycle_id: "",
  category_id: "",
  program_preferences: [],
  guardian_name: "",
  guardian_relationship: "",
  guardian_phone: "",
  guardian_email: "",
  merit_score: ""
};

function buildInitialForm(initialValue) {
  if (!initialValue) return EMPTY_FORM;
  const guardian = initialValue.guardians?.[0] || {};
  return {
    full_name: initialValue.personal?.full_name || "",
    email: initialValue.personal?.email || "",
    phone: initialValue.personal?.phone || "",
    date_of_birth: initialValue.personal?.date_of_birth?.slice(0, 10) || "",
    gender: initialValue.personal?.gender || "",
    address: initialValue.personal?.address?.text || "",
    qualification: initialValue.academic?.qualification || "",
    institution_name: initialValue.academic?.institution_name || "",
    board_or_university: initialValue.academic?.board_or_university || "",
    passing_year: initialValue.academic?.passing_year || "",
    marks_percent: initialValue.academic?.marks_percent ?? "",
    cycle_id: initialValue.cycle_id || "",
    category_id: initialValue.category_id || "",
    program_preferences: initialValue.program_preferences?.map(String) || [],
    guardian_name: guardian.name || "",
    guardian_relationship: guardian.relationship || "",
    guardian_phone: guardian.phone || "",
    guardian_email: guardian.email || "",
    merit_score: initialValue.merit_score ?? ""
  };
}

function ApplicationForm({ initialValue, optionSets, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => buildInitialForm(initialValue));

  useEffect(() => {
    setForm(buildInitialForm(initialValue));
  }, [initialValue]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const guardian =
      form.guardian_name.trim() && form.guardian_relationship.trim()
        ? [
            {
              name: form.guardian_name.trim(),
              relationship: form.guardian_relationship.trim(),
              phone: form.guardian_phone.trim(),
              email: form.guardian_email.trim()
            }
          ]
        : [];

    onSubmit({
      personal: {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        date_of_birth: form.date_of_birth || null,
        gender: form.gender.trim(),
        address: { text: form.address.trim() }
      },
      academic: {
        qualification: form.qualification.trim(),
        institution_name: form.institution_name.trim(),
        board_or_university: form.board_or_university.trim(),
        passing_year: form.passing_year ? Number(form.passing_year) : null,
        marks_percent: Number(form.marks_percent),
        details_json: initialValue?.academic?.details_json || {}
      },
      guardians: guardian,
      cycle_id: form.cycle_id,
      category_id: form.category_id,
      program_preferences: form.program_preferences.filter(Boolean),
      merit_score: form.merit_score === "" ? null : Number(form.merit_score)
    });
  }

  return (
    <form className="ui-form-grid" onSubmit={handleSubmit}>
      <h4>Personal Details</h4>
      <label>Full Name<input required name="full_name" value={form.full_name} onChange={handleChange} /></label>
      <label>Email<input required type="email" name="email" value={form.email} onChange={handleChange} /></label>
      <label>Phone<input required name="phone" value={form.phone} onChange={handleChange} /></label>
      <label>Date of Birth<input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} /></label>
      <label>Gender<input name="gender" value={form.gender} onChange={handleChange} /></label>
      <label>Address<textarea name="address" value={form.address} onChange={handleChange} /></label>

      <h4>Academic Details</h4>
      <label>Qualification<input required name="qualification" value={form.qualification} onChange={handleChange} /></label>
      <label>Institution<input name="institution_name" value={form.institution_name} onChange={handleChange} /></label>
      <label>Board / University<input name="board_or_university" value={form.board_or_university} onChange={handleChange} /></label>
      <label>Passing Year<input type="number" min="1900" name="passing_year" value={form.passing_year} onChange={handleChange} /></label>
      <label>Marks (%)<input required type="number" min="0" max="100" step="0.01" name="marks_percent" value={form.marks_percent} onChange={handleChange} /></label>
      <label>Merit Score<input type="number" min="0" step="0.01" name="merit_score" value={form.merit_score} onChange={handleChange} /></label>

      <h4>Admission Selection</h4>
      <label>
        Admission Cycle
        <select required name="cycle_id" value={form.cycle_id} onChange={handleChange}>
          <option value="">Select cycle</option>
          {optionSets.cycles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label>
        Category
        <select required name="category_id" value={form.category_id} onChange={handleChange}>
          <option value="">Select category</option>
          {optionSets.categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <div className="admission-preference-list">
        <span>Program Preferences (highest priority first)</span>
        {(form.program_preferences.length ? form.program_preferences : [""]).map((programId, index) => (
          <div key={`${index}-${programId}`} className="ui-inline-actions">
            <select
              required={index === 0}
              value={programId}
              onChange={(event) => {
                const next = form.program_preferences.length ? [...form.program_preferences] : [""];
                next[index] = event.target.value;
                setForm((previous) => ({ ...previous, program_preferences: next }));
              }}
            >
              <option value="">Select preference {index + 1}</option>
              {optionSets.programs.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={form.program_preferences.some((value, itemIndex) => itemIndex !== index && value === option.value)}
                >
                  {option.label}
                </option>
              ))}
            </select>
            {index > 0 ? (
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  const next = [...form.program_preferences];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  setForm((previous) => ({ ...previous, program_preferences: next }));
                }}
              >
                Move Up
              </button>
            ) : null}
            {form.program_preferences.length > 1 ? (
              <button
                type="button"
                className="btn-link danger"
                onClick={() => setForm((previous) => ({
                  ...previous,
                  program_preferences: previous.program_preferences.filter((_, itemIndex) => itemIndex !== index)
                }))}
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
        {form.program_preferences.length < optionSets.programs.length ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setForm((previous) => ({
              ...previous,
              program_preferences: previous.program_preferences.length ? [...previous.program_preferences, ""] : ["", ""]
            }))}
          >
            Add Preference
          </button>
        ) : null}
      </div>

      <h4>Guardian (optional)</h4>
      <label>Name<input name="guardian_name" value={form.guardian_name} onChange={handleChange} /></label>
      <label>Relationship<input name="guardian_relationship" value={form.guardian_relationship} onChange={handleChange} /></label>
      <label>Phone<input name="guardian_phone" value={form.guardian_phone} onChange={handleChange} /></label>
      <label>Email<input type="email" name="guardian_email" value={form.guardian_email} onChange={handleChange} /></label>

      <div className="ui-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initialValue ? "Update Application" : "Register Application"}
        </button>
      </div>
    </form>
  );
}

ApplicationForm.propTypes = {
  initialValue: PropTypes.object,
  optionSets: PropTypes.shape({
    cycles: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    programs: PropTypes.array.isRequired
  }).isRequired,
  submitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ApplicationForm;
