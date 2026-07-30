import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchApplicationDocuments,
  rejectApplicationDocument,
  uploadApplicationDocument,
  verifyApplicationDocument
} from "@/api/core";
import { DataTable, StatusBadge } from "@/components/ui";

function ApplicationDocumentsPanel({ applicationId, documentTypes, canCreate, canEdit }) {
  const [documents, setDocuments] = useState([]);
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const typeLabels = useMemo(
    () => new Map(documentTypes.map((type) => [type.id, type.name])),
    [documentTypes]
  );

  const loadDocuments = useCallback(async () => {
    const response = await fetchApplicationDocuments(applicationId);
    setDocuments(Array.isArray(response?.data) ? response.data : []);
  }, [applicationId]);

  useEffect(() => {
    async function load() {
      try {
        await loadDocuments();
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load application documents.");
      }
    }
    load();
  }, [loadDocuments]);

  const columns = [
    { key: "type", label: "Document" },
    { key: "file", label: "File" },
    { key: "status", label: "Verification" },
    { key: "ocr", label: "OCR" },
    { key: "remarks", label: "Remarks" },
    { key: "actions", label: "Actions" }
  ];

  const rows = documents.map((document) => ({
    id: document.id,
    type: typeLabels.get(String(document.document_type_id)) || document.document_type_id,
    file: document.original_name,
    status: (
      <StatusBadge
        label={document.verification_status}
        tone={document.verification_status === "verified" ? "success" : document.verification_status === "rejected" ? "danger" : "warning"}
      />
    ),
    ocr: document.ocr?.phase === "phase_2_stub" ? "Phase 2 stub" : "-",
    remarks: document.verification_remarks || "-",
    actions: canEdit && document.verification_status === "pending" ? (
      <div className="ui-inline-actions">
        <button
          type="button"
          className="btn-link"
          onClick={async () => {
            try {
              setBusy(true);
              await verifyApplicationDocument(applicationId, document.id);
              await loadDocuments();
            } catch (apiError) {
              setError(apiError?.response?.data?.message || "Failed to verify document.");
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          Verify
        </button>
        <button
          type="button"
          className="btn-link danger"
          onClick={async () => {
            const remarks = window.prompt("Enter rejection reason:");
            if (!remarks) return;
            try {
              setBusy(true);
              await rejectApplicationDocument(applicationId, document.id, remarks);
              await loadDocuments();
            } catch (apiError) {
              setError(apiError?.response?.data?.message || "Failed to reject document.");
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          Reject
        </button>
      </div>
    ) : "-"
  }));

  return (
    <section className="admission-workflow-card">
      <h3>Document Verification</h3>
      {error ? <p className="ui-error-text">{error}</p> : null}
      {canCreate ? (
        <form
          className="admission-upload-bar"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!file || !documentTypeId) return;
            try {
              setBusy(true);
              setError("");
              await uploadApplicationDocument(applicationId, documentTypeId, file);
              setFile(null);
              setDocumentTypeId("");
              event.currentTarget.reset();
              await loadDocuments();
            } catch (apiError) {
              setError(apiError?.response?.data?.message || "Failed to upload document.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <select required value={documentTypeId} onChange={(event) => setDocumentTypeId(event.target.value)}>
            <option value="">Select document type</option>
            {documentTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
          <input required type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <button type="submit" className="btn-primary" disabled={busy}>Upload</button>
        </form>
      ) : null}
      <DataTable columns={columns} rows={rows} emptyMessage="No documents uploaded." />
    </section>
  );
}

ApplicationDocumentsPanel.propTypes = {
  applicationId: PropTypes.string.isRequired,
  documentTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  canCreate: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired
};

export default ApplicationDocumentsPanel;
