import { useEffect, useState } from "react";

import { fetchAcademicYears, fetchInstitutionProfile, updateInstitutionProfile } from "@/api/core";
import { PageHeader } from "@/components/ui";
import usePermission from "@/hooks/usePermission";

function InstitutionSettingsPage() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("settings", "view");
  const canEdit = hasPermission("settings", "edit");

  const [profile, setProfile] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [form, setForm] = useState({
    name: "",
    workspaceLabel: "",
    location: "",
    address: "",
    logo_url: "",
    default_academic_year_id: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, ayRes] = await Promise.all([fetchInstitutionProfile(), fetchAcademicYears()]);
        const profileData = profileRes?.data || {};
        setProfile(profileData);
        setAcademicYears(Array.isArray(ayRes?.data) ? ayRes.data : []);
        setForm({
          name: profileData.name || "",
          workspaceLabel: profileData.workspaceLabel || "",
          location: profileData.location || "",
          address: profileData.address || "",
          logo_url: profileData.logo_url || "",
          default_academic_year_id: profileData.default_academic_year_id || ""
        });
        setError("");
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load institution profile.");
      } finally {
        setLoading(false);
      }
    }

    if (canView) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [canView]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const response = await updateInstitutionProfile({
        name: form.name.trim(),
        workspaceLabel: form.workspaceLabel.trim(),
        location: form.location.trim(),
        address: form.address.trim(),
        logo_url: form.logo_url.trim(),
        default_academic_year_id: form.default_academic_year_id || null
      });
      setProfile(response?.data || null);
      setSuccess("Institution settings updated.");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to update institution profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!canView) {
    return (
      <main className="app-shell">
        <h3>Access denied</h3>
        <p>You do not have permission to view institution settings.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="app-shell">
        <p>Loading institution settings...</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <PageHeader
        title="Institution Settings"
        subtitle="Manage institution profile, location, address, logo, and default academic year."
      />
      {error ? <p className="ui-error-text">{error}</p> : null}
      {success ? <p className="ui-success-text">{success}</p> : null}
      <form className="ui-form-grid" onSubmit={handleSubmit}>
        <label>
          Institution Name
          <input required name="name" value={form.name} onChange={handleChange} disabled={!canEdit || saving} />
        </label>
        <label>
          Workspace Label
          <input required name="workspaceLabel" value={form.workspaceLabel} onChange={handleChange} disabled={!canEdit || saving} />
        </label>
        <label>
          Location
          <input required name="location" value={form.location} onChange={handleChange} disabled={!canEdit || saving} />
        </label>
        <label>
          Address
          <textarea name="address" value={form.address} onChange={handleChange} rows={3} disabled={!canEdit || saving} />
        </label>
        <label>
          Logo URL (stub)
          <input name="logo_url" value={form.logo_url} onChange={handleChange} disabled={!canEdit || saving} />
        </label>
        <label>
          Default Academic Year
          <select name="default_academic_year_id" value={form.default_academic_year_id} onChange={handleChange} disabled={!canEdit || saving}>
            <option value="">Select academic year</option>
            {academicYears.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        {canEdit ? (
          <div className="ui-form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        ) : null}
      </form>
      {profile?.financialYear ? <p className="ui-note">Current TopBar FY: {profile.financialYear}</p> : null}
    </main>
  );
}

export default InstitutionSettingsPage;
