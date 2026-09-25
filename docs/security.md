# Security Model & Threat Mitigation — QR School Enrollment System

## 1. Threat Matrix & Mitigations

| Threat Vector | Mitigation Strategy |
|---|---|
| **Predictable Reference ID Enumeration (IDOR)** | Public access uses high-entropy 256-bit cryptographically random tokens stored as SHA-256 hashes. Reference numbers like `ENR-2026-000101` alone cannot access private student PII without the corresponding access token or admin authentication. |
| **Malicious File Upload (Web Shells, Malware)** | Strict validation: allowed MIME list (`image/jpeg`, `image/png`, `application/pdf`), client extension check, server-side magic numbers/signatures inspection, 5MB file cap, randomized UUID storage keys in private S3/R2 storage with no direct public execution. Access through short-lived signed URLs only. |
| **Tampering with Application Status** | Enforced finite state machine in Domain layer. Neither client UI nor controller can bypass status rules. Staff cannot approve unless role permits. Transitions run in atomic database transactions. |
| **Brute Force on Admin Portal** | Rate limiting per IP and email. Passwords hashed using bcrypt/Argon2. Standardized generic failure responses ("Invalid credentials") to prevent user enumeration. |
| **Data Leakage & Sensitive Student PII** | Passwords and access tokens never logged in structured logger or audit logs. HTTPS required, HSTS, Secure/HttpOnly/SameSite cookies, CSRF protection headers. |
| **Mass QR Spam / Automated Bot Submissions** | Rate-limiting on `/api/applications` submission endpoints and optional Cloudflare Turnstile token verification. |

## 2. Role-Based Access Control (RBAC) Matrix

| Action / Capability | Student (with Token) | Staff | Admin |
|---|:---:|:---:|:---:|
| Create Draft Application | Yes | Yes | Yes |
| View Own Application Status | Yes | Yes | Yes |
| Upload / Replace Own Documents (Draft / Needs Revision) | Yes | - | - |
| Submit Application | Yes | - | - |
| View All Applications Dashboard | No | Yes | Yes |
| Mark Application `UNDER_REVIEW` | No | Yes | Yes |
| Request Revision (`NEEDS_REVISION`) | No | Yes | Yes |
| Verify / Reject Documents | No | Yes | Yes |
| Final Approval (`APPROVED`) | No | No | Yes |
| Rejection (`REJECTED`) | No | No | Yes |
| Final Enrollment (`ENROLLED`) | No | No | Yes |
| Manage QR Campaigns & Programs | No | No | Yes |
| View System Audit Logs | No | No | Yes |
