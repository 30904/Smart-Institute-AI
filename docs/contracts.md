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

## Contract Governance

- Any breaking change must be discussed by both owners before implementation.
- Additive fields are allowed if backward compatible.
- Event name strings are immutable once consumed by another module.
- Keep this file updated before coding dependent features.
