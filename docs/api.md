# API Specification — QR School Enrollment System

## 1. Unified Response Formats

All API endpoints return a standardized envelope conforming to:

### Success Response (`200 OK`, `201 Created`):
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-24T17:26:00.000Z",
    "requestId": "req-12345"
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `409`, `422`, `500`):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot transition application from SUBMITTED directly to APPROVED.",
    "details": {
      "currentStatus": "SUBMITTED",
      "attemptedStatus": "APPROVED",
      "allowedStatuses": ["UNDER_REVIEW"]
    }
  },
  "meta": {
    "timestamp": "2026-09-24T17:26:00.000Z"
  }
}
```

---

## 2. Public Student Enrollment Endpoints

### Programs & Requirements
- `GET /api/programs`
  - Returns active academic programs with departments and levels.
- `GET /api/requirements?programId=:id`
  - Returns mandatory & optional document upload specifications for a program.
- `GET /api/campaigns/resolve?code=:campaignCode`
  - Resolves a QR campaign code, records scan metric, returns target program / metadata.

### Applications
- `POST /api/applications`
  - Body: Validated applicant personal info, contact info, academic selection, optional campaign code.
  - Returns: `applicationId`, `referenceNumber`, secure `accessToken`, status `DRAFT`.
- `GET /api/applications/status?reference=:ref&token=:token`
  - Secure status check without password. Returns current lifecycle state, uploaded documents, reviewer feedback notes.
- `POST /api/applications/:id/documents`
  - Multipart file upload or pre-signed upload metadata.
  - Validates MIME type (magic bytes + extension), size limit <= 5MB.
- `DELETE /api/applications/:id/documents/:docId`
  - Allows applicant to replace/remove documents while in `DRAFT` or `NEEDS_REVISION`.
- `POST /api/applications/:id/submit`
  - Validates that all required fields and mandatory documents are uploaded.
  - State machine transition: `DRAFT` / `NEEDS_REVISION` -> `SUBMITTED`.
  - Triggers email confirmation and audit log entry.

---

## 3. Administrative Review Endpoints (Authenticated & RBAC Protected)

### Admin Auth & Session
- `POST /api/admin/auth/login`
  - Body: `{ email, password }`
  - Returns JWT / HttpOnly secure cookie, user info and role (`ADMIN` or `STAFF`).
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/me`

### Dashboard Metrics & Applications
- `GET /api/admin/dashboard/stats`
  - Returns total counts: `totalApplications`, `pendingReview`, `needsRevision`, `approved`, `rejected`, `enrolled`.
- `GET /api/admin/applications`
  - Query params: `page`, `pageSize`, `search`, `status`, `programId`, `dateFrom`, `dateTo`.
  - Returns paginated list with reference number, applicant name, program, submission date, status.
- `GET /api/admin/applications/:id`
  - Detailed view: applicant profile, emergency contact, document list, signed download URLs, status timeline, audit history.
- `POST /api/admin/applications/:id/status-transition`
  - Body: `{ targetStatus, notes }`
  - Enforces role authorization (STAFF vs ADMIN) and state machine invariants.
- `POST /api/admin/applications/:id/documents/:docId/verify`
  - Body: `{ action: "VERIFY" | "REJECT", reason?: string }`
  - Updates document status, marks requirement checklist, creates audit log.
- `GET /api/admin/campaigns` & `POST /api/admin/campaigns`
  - Admin management for QR campaign codes, scan tracking, and printable QR generator.
