import PropTypes from "prop-types";
import { useEffect, useState } from "react";

function getInitialForm(config, initialValue) {
  return config.fields.reduce((form, field) => {
    let value = initialValue?.[field.name];
    if (value === undefined || value === null) value = field.defaultValue ?? (field.type === "checkbox" ? false : "");
    if (field.type === "date" && value) value = String(value).slice(0, 10);
    if (field.type === "json" && typeof value !== "string") value = JSON.stringify(value || {}, null, 2);
    if (field.type === "multiselect" && !Array.isArray(value)) value = [];
    form[field.name] = value;
    return form;
  }, {});
}

function buildPayload(config, form) {
  return config.fields.reduce((payload, field) => {
    const value = form[field.name];
    if (field.type === "json") {
      payload[field.name] = JSON.parse(value || "{}");
    } else if (field.type === "number") {
      payload[field.name] = value === "" && field.nullable ? null : Number(value);
    } else if (field.nullable && value === "") {
      payload[field.name] = null;
    } else {
      payload[field.name] = value;
    }
    return payload;
  }, {});
}

function AdmissionMasterForm({ config, initialValue, optionSets, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => getInitialForm(config, initialValue));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(config, initialValue));
    setError("");
  }, [config, initialValue]);

  function handleChange(event) {
    const { name, value, type, checked, selectedOptions } = event.target;
    const nextValue = type === "checkbox" ? checked : type === "select-multiple" ? Array.from(selectedOptions, (option) => option.value) : value;
    setForm((previous) => ({ ...previous, [name]: nextValue }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    try {
      setError("");
      onSubmit(buildPayload(config, form));
    } catch {
      setError("JSON fields must contain valid JSON.");
    }
  }

  return (
    <form className="ui-form-grid" onSubmit={handleSubmit}>
      {error ? <p className="ui-error-text">{error}</p> : null}
      {config.fields.map((field) => {
        const options = field.options || optionSets[field.source] || [];

        if (field.type === "checkbox") {
          return (
            <label key={field.name} className="ui-checkbox">
              <input type="checkbox" name={field.name} checked={Boolean(form[field.name])} onChange={handleChange} />
              {field.label}
            </label>
          );
        }

        if (field.type === "select" || field.type === "multiselect") {
          return (
            <label key={field.name}>
              {field.label}
              <select
                required={field.required}
                multiple={field.type === "multiselect"}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
              >
                {field.type !== "multiselect" ? <option value="">Select {field.label.toLowerCase()}</option> : null}
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        if (field.type === "json") {
          return (
            <label key={field.name}>
              {field.label}
              <textarea required={field.required} name={field.name} value={form[field.name]} onChange={handleChange} rows={5} />
            </label>
          );
        }

        return (
          <label key={field.name}>
            {field.label}
            <input
              required={field.required}
              type={field.type}
              name={field.name}
              value={form[field.name]}
              min={field.min}
              max={field.max}
              step={field.step}
              placeholder={field.placeholder}
              onChange={handleChange}
            />
          </label>
        );
      })}

      <div className="ui-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initialValue ? `Update ${config.title}` : `Create ${config.title}`}
        </button>
      </div>
    </form>
  );
}

AdmissionMasterForm.propTypes = {
  config: PropTypes.object.isRequired,
  initialValue: PropTypes.object,
  optionSets: PropTypes.object.isRequired,
  submitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default AdmissionMasterForm;
