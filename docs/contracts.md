# Smart Institute AI - Cross-Module Contracts

This document defines event/data contracts used across module boundaries so Arnav and Precious can build independently without merge or schema confusion.

## 1) `admission.enrolled`

### Producer
- Module: Admissions (coreRoutes / Arnav)

### Consumers
- Students (coreRoutes / Arnav)
- Academics (academicRoutes / Precious)
- Fees (coreRoutes / Arnav)

### Trigger
- Fired when admission is approved and initial fee confirmation is successful.

### Payload
```json
{
  "event": "admission.enrolled",
  "occurredAt": "2026-07-28T09:30:00.000Z",
  "data": {
    "applicationId": "string",
    "studentId": "string",
    "rollNo": "string",
    "programId": "string",
    "academicYearId": "string",
    "admissionCycleId": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "categoryId": "string"
  }
}
```

### Rules
- `studentId` and `rollNo` must be unique.
- Consumer modules must treat this as source-of-truth enrollment creation.

---

## 2) `fee.paid`

### Producer
- Module: Fees (coreRoutes / Arnav)

### Consumers
- Admissions (coreRoutes / Arnav)
- Students (coreRoutes / Arnav)
- Exams (academicRoutes / Precious) for dues checks
- Dashboard/Reports

### Trigger
- Fired after successful fee payment transaction and receipt generation.

### Payload
```json
{
  "event": "fee.paid",
  "occurredAt": "2026-07-28T09:35:00.000Z",
  "data": {
    "studentId": "string",
    "paymentId": "string",
    "receiptNo": "string",
    "invoiceNo": "string",
    "amountPaid": 0,
    "currency": "INR",
    "paymentMode": "cash|upi|card|bank|online",
    "feeTerm": "admission|semester|other",
    "isFullSettlement": false,
    "pendingAmount": 0
  }
}
```

### Rules
- `paymentId` and `receiptNo` must be idempotent identifiers.
- If `pendingAmount > 0`, dues still exist for hall-ticket gating.

---

## 3) `result.published`

### Producer
- Module: Exams (academicRoutes / Precious)

### Consumers
- Students (coreRoutes / Arnav) for profile/result visibility
- Academics (academicRoutes / Precious) for progression logic
- Dashboard/Reports

### Trigger
- Fired when final exam result is published for a student/semester.

### Payload
```json
{
  "event": "result.published",
  "occurredAt": "2026-07-28T10:15:00.000Z",
  "data": {
    "studentId": "string",
    "programId": "string",
    "semesterId": "string",
    "examSessionId": "string",
    "gpa": 0,
    "resultStatus": "pass|fail|backlog",
    "backlogSubjects": [
      {
        "subjectId": "string",
        "subjectCode": "string"
      }
    ],
    "publishedBy": "string"
  }
}
```

### Rules
- `resultStatus` drives promotion eligibility.
- Consumers should not infer fail/pass from marks directly if event status is present.

---

## 4) `student.promoted`

### Producer
- Module: Students (coreRoutes / Arnav) after promotion process

### Consumers
- Academics (academicRoutes / Precious)
- LMS (academicRoutes / Precious)
- Exams (academicRoutes / Precious)
- Dashboard/Reports

### Trigger
- Fired when student is promoted to next semester based on policy.

### Payload
```json
{
  "event": "student.promoted",
  "occurredAt": "2026-07-28T10:30:00.000Z",
  "data": {
    "studentId": "string",
    "programId": "string",
    "fromSemesterId": "string",
    "toSemesterId": "string",
    "promotionType": "regular|conditional|provisional",
    "effectiveDate": "2026-08-01"
  }
}
```

### Rules
- `toSemesterId` must be valid for student program.
- LMS and Academics should re-map registrations based on this event.

---

## 5) `student.alumni`

### Producer
- Module: Students (coreRoutes / Arnav)

### Consumers
- Fees (for closure checks)
- Dashboard/Reports
- Future Alumni services

### Trigger
- Fired when student lifecycle status changes from active to alumni.

### Payload
```json
{
  "event": "student.alumni",
  "occurredAt": "2026-07-28T10:45:00.000Z",
  "data": {
    "studentId": "string",
    "programId": "string",
    "graduationDate": "2026-05-31",
    "completionStatus": "graduated|completed_with_backlog",
    "remarks": "string"
  }
}
```

### Rules
- Alumni conversion should be blocked if mandatory finance/clearance policy is unmet (policy enforcement in Students/Fees flow).

---

## 6) Shared Platform Masters — REST list APIs

These endpoints are owned by **coreRoutes (Arnav)**. **Precious** should consume them for Faculty/Academics dropdowns, validations, and foreign-key references — do not duplicate `AcademicYear`, `Department`, or `Program` models in `academicRoutes`.

### Common response envelope

All successful responses use:

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

- List endpoints return `data` as an **array** of DTO objects.
- `GET /:id` endpoints return `data` as a **single** DTO object.
- Errors return `{ "success": false, "message": "...", "data": null }` with HTTP `4xx/5xx`.

### Authentication and permissions

- Base path: `/api`
- Header: `Authorization: Bearer <jwt>`
- Required permission for all documented GET routes: `settings.view`
- Owner files: `backend/routes/coreRoutes.js`, `backend/services/*Service.js`

> **Consumer note:** Faculty/Academics UI that needs these lists must either run under a role with `settings.view`, or call a future read-only proxy in `academicRoutes`. Do not change DTO field names without updating this contract first.

---

### 6.1) `GET /api/academic-years`

Returns all academic years, newest `start_date` first.

#### Response `data[]` item (AcademicYearDTO)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Mongo ObjectId as string |
| `name` | string | Display label, e.g. `Academic Year 2025-26` |
| `code` | string | Unique code, e.g. `AY-2025-26` |
| `start_date` | string (ISO 8601) | UTC date |
| `end_date` | string (ISO 8601) | UTC date |
| `is_current` | boolean | Only one record should be `true` |
| `is_active` | boolean | Inactive years remain in list; consumers may filter |
| `createdAt` | string (ISO 8601) | |
| `updatedAt` | string (ISO 8601) | |

#### Example

```json
{
  "success": true,
  "message": "Academic years fetched.",
  "data": [
    {
      "id": "6790abcd1234567890abcdef",
      "name": "Academic Year 2025-26",
      "code": "AY-2025-26",
      "start_date": "2025-04-01T00:00:00.000Z",
      "end_date": "2026-03-31T00:00:00.000Z",
      "is_current": true,
      "is_active": true,
      "createdAt": "2026-07-28T10:00:00.000Z",
      "updatedAt": "2026-07-28T10:00:00.000Z"
    }
  ]
}
```

#### Related routes

| Method | Path | Permission | Notes |
| --- | --- | --- | --- |
| GET | `/api/academic-years/:id` | `settings.view` | Same DTO shape as list item |
| PATCH | `/api/academic-years/:id/set-current` | `settings.edit` | Sets one current year; not required for read-only consumers |

#### Consumer rules

- Use `id` (not `_id`) when storing `academicYearId` in Academics/Faculty records.
- Prefer `is_current === true` for default session context; fall back to institution default if needed.
- Filter `is_active === true` in UI selects unless showing historical data.

---

### 6.2) `GET /api/departments`

Returns all departments, sorted by `name` ascending.

#### Response `data[]` item (DepartmentDTO)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Mongo ObjectId as string |
| `name` | string | Department name |
| `code` | string | Unique department code |
| `head_user_id` | string \| null | Optional linked user id |
| `is_active` | boolean | |
| `createdAt` | string (ISO 8601) | |
| `updatedAt` | string (ISO 8601) | |

#### Example

```json
{
  "success": true,
  "message": "Departments fetched.",
  "data": [
    {
      "id": "6790abcd1234567890abc001",
      "name": "Computer Science",
      "code": "CS",
      "head_user_id": null,
      "is_active": true,
      "createdAt": "2026-07-28T10:00:00.000Z",
      "updatedAt": "2026-07-28T10:00:00.000Z"
    }
  ]
}
```

#### Related routes

| Method | Path | Permission | Notes |
| --- | --- | --- | --- |
| GET | `/api/departments/:id` | `settings.view` | Same DTO shape as list item |

#### Consumer rules

- Use `id` when storing `departmentId` on faculty profiles, subject groupings, or filters.
- `head_user_id` may be null; do not assume a department head exists.
- Filter `is_active === true` for active pickers.

---

### 6.3) `GET /api/programs`

Returns all programs/courses, sorted by `name` ascending.

#### Response `data[]` item (ProgramDTO)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Mongo ObjectId as string |
| `name` | string | Program/course name |
| `code` | string | Unique program code |
| `department_id` | string | Required FK to `DepartmentDTO.id` |
| `duration` | number | Duration in years/semesters per institute policy (min `1`) |
| `program_type` | string | Enum: `trade` \| `diploma` \| `degree` |
| `intake_default` | number | Default intake capacity (`0` allowed) |
| `description` | string | May be empty string |
| `is_active` | boolean | |
| `createdAt` | string (ISO 8601) | |
| `updatedAt` | string (ISO 8601) | |

#### Example

```json
{
  "success": true,
  "message": "Programs fetched.",
  "data": [
    {
      "id": "6790abcd1234567890abc010",
      "name": "Diploma in Computer Engineering",
      "code": "DCE",
      "department_id": "6790abcd1234567890abc001",
      "duration": 3,
      "program_type": "diploma",
      "intake_default": 60,
      "description": "Trade/diploma course for computer engineering.",
      "is_active": true,
      "createdAt": "2026-07-28T10:00:00.000Z",
      "updatedAt": "2026-07-28T10:00:00.000Z"
    }
  ]
}
```

#### Related routes

| Method | Path | Permission | Notes |
| --- | --- | --- | --- |
| GET | `/api/programs/:id` | `settings.view` | Same DTO shape as list item |

#### Consumer rules

- Use `id` when storing `programId` on admissions, registration, faculty assignment, or exam session records.
- Always validate `department_id` against `GET /api/departments` when building dependent dropdowns.
- `program_type` is fixed enum — do not introduce new values from Academics without a contract update.
- Subjects and curriculum in Precious modules should reference `program_id` only; do not embed program name/code as source of truth.

---

### 6.4) Stability and change policy

- **Stable fields for consumers:** `id`, `code`, `name`, `department_id`, `program_type`, `is_active`, `is_current` (academic years).
- **Additive changes allowed:** new optional fields on DTOs (consumers must ignore unknown fields).
- **Breaking changes require:** agreement between Arnav and Precious before merge (e.g. renaming `department_id`, changing `program_type` enum).
- **Source of truth:** Mongo models in `backend/models/AcademicYear.js`, `Department.js`, `Program.js` — DTOs are defined by sanitize functions in corresponding services.

---

## Contract Governance

- Any breaking change must be discussed by both owners before implementation.
- Additive fields are allowed if backward compatible.
- Event name strings are immutable once consumed by another module.
- Shared master REST DTOs in section 6 are versioned by field stability rules above.
- Keep this file updated before coding dependent features.
