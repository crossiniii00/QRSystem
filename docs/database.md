# Database ERD & Schema Design — QR School Enrollment System

## 1. Schema Entities & Relationships (ERD)

```
 [ users ] (Admins / Staff)
    ├── id: UUID (PK)
    ├── email: VARCHAR(255) (UNIQUE, INDEXED)
    ├── password_hash: VARCHAR(255)
    ├── full_name: VARCHAR(150)
    ├── role: ENUM ('ADMIN', 'STAFF')
    ├── active: BOOLEAN
    └── created_at / updated_at: TIMESTAMP

 [ programs ]
    ├── id: UUID (PK)
    ├── code: VARCHAR(50) (UNIQUE, INDEXED) -- e.g. "STEM-11", "BSCS", "ABM-11"
    ├── name: VARCHAR(200)
    ├── description: TEXT
    ├── department: VARCHAR(100)
    ├── academic_level: ENUM ('K12_ELEM', 'K12_JHS', 'K12_SHS', 'UNDERGRADUATE', 'POSTGRADUATE')
    ├── is_active: BOOLEAN (INDEXED)
    └── created_at / updated_at: TIMESTAMP

 [ requirements ]
    ├── id: UUID (PK)
    ├── code: VARCHAR(50) (UNIQUE, INDEXED) -- e.g. "BIRTH_CERT", "FORM_138", "GOOD_MORAL", "ID_PHOTO_2X2"
    ├── title: VARCHAR(150)
    ├── description: TEXT
    ├── allowed_mime_types: TEXT[] -- e.g. ["application/pdf", "image/jpeg", "image/png"]
    ├── max_file_size_bytes: BIGINT -- e.g. 5242880 (5MB)
    ├── is_mandatory: BOOLEAN
    ├── created_at / updated_at: TIMESTAMP

 [ qr_campaigns ]
    ├── id: UUID (PK)
    ├── code: VARCHAR(80) (UNIQUE, INDEXED) -- e.g. "shs-enrollment-2026", "college-fair", "campus-main"
    ├── name: VARCHAR(150)
    ├── destination_path: VARCHAR(255)
    ├── default_program_id: UUID (FK -> programs.id, NULLABLE)
    ├── scan_count: INTEGER DEFAULT 0
    ├── is_active: BOOLEAN DEFAULT true (INDEXED)
    ├── expires_at: TIMESTAMP NULLABLE
    └── created_at / updated_at: TIMESTAMP

 [ applicants ]
    ├── id: UUID (PK)
    ├── email: VARCHAR(255) (INDEXED)
    ├── mobile_number: VARCHAR(50)
    ├── first_name: VARCHAR(100)
    ├── middle_name: VARCHAR(100) NULLABLE
    ├── last_name: VARCHAR(100)
    ├── date_of_birth: DATE
    ├── sex: ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')
    ├── civil_status: VARCHAR(50) NULLABLE
    ├── address_street: VARCHAR(255)
    ├── address_city: VARCHAR(100)
    ├── address_province: VARCHAR(100)
    ├── address_postal_code: VARCHAR(20) NULLABLE
    ├── emergency_contact_name: VARCHAR(150)
    ├── emergency_contact_relationship: VARCHAR(100)
    ├── emergency_contact_phone: VARCHAR(50)
    └── created_at / updated_at: TIMESTAMP

 [ applications ]
    ├── id: UUID (PK)
    ├── reference_number: VARCHAR(30) (UNIQUE, INDEXED) -- e.g. "ENR-2026-000101"
    ├── access_token_hash: VARCHAR(128) (INDEXED) -- Opaque secure token for applicant status retrieval
    ├── applicant_id: UUID (FK -> applicants.id, INDEXED)
    ├── program_id: UUID (FK -> programs.id, INDEXED)
    ├── qr_campaign_id: UUID (FK -> qr_campaigns.id, NULLABLE, INDEXED)
    ├── applicant_type: ENUM ('FRESHMAN', 'TRANSFEREE', 'RETURNEE', 'CROSS_ENROLLEE')
    ├── academic_year: VARCHAR(20) -- e.g. "2026-2027"
    ├── semester_term: VARCHAR(30) -- e.g. "1st Semester"
    ├── previous_school: VARCHAR(200) NULLABLE
    ├── previous_school_address: VARCHAR(200) NULLABLE
    ├── previous_gpa: VARCHAR(20) NULLABLE
    ├── status: ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'REJECTED', 'ENROLLED') (INDEXED)
    ├── revision_notes: TEXT NULLABLE
    ├── submitted_at: TIMESTAMP NULLABLE
    ├── reviewed_at: TIMESTAMP NULLABLE
    ├── reviewed_by_user_id: UUID (FK -> users.id, NULLABLE)
    └── created_at / updated_at: TIMESTAMP (INDEXED)

 [ application_requirements ]
    ├── id: UUID (PK)
    ├── application_id: UUID (FK -> applications.id, ON DELETE CASCADE, INDEXED)
    ├── requirement_id: UUID (FK -> requirements.id, INDEXED)
    ├── status: ENUM ('PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED')
    ├── rejection_reason: TEXT NULLABLE
    ├── verified_at: TIMESTAMP NULLABLE
    ├── verified_by_user_id: UUID (FK -> users.id, NULLABLE)
    └── UNIQUE (application_id, requirement_id)

 [ documents ]
    ├── id: UUID (PK)
    ├── application_id: UUID (FK -> applications.id, ON DELETE CASCADE, INDEXED)
    ├── requirement_id: UUID (FK -> requirements.id, INDEXED)
    ├── storage_key: VARCHAR(255) (UNIQUE) -- S3/R2 random object key
    ├── original_filename: VARCHAR(255)
    ├── mime_type: VARCHAR(100)
    ├── file_size_bytes: BIGINT
    ├── file_hash_sha256: VARCHAR(64)
    ├── verification_status: ENUM ('PENDING', 'VERIFIED', 'REJECTED') (INDEXED)
    ├── rejection_reason: TEXT NULLABLE
    ├── uploaded_at: TIMESTAMP DEFAULT NOW()
    ├── verified_at: TIMESTAMP NULLABLE
    └── verified_by_user_id: UUID (FK -> users.id, NULLABLE)

 [ notifications ]
    ├── id: UUID (PK)
    ├── application_id: UUID (FK -> applications.id, INDEXED)
    ├── recipient_email: VARCHAR(255)
    ├── notification_type: ENUM ('SUBMISSION_CONFIRMATION', 'REVISION_REQUESTED', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED')
    ├── subject: VARCHAR(255)
    ├── status: ENUM ('QUEUED', 'SENT', 'FAILED')
    ├── error_message: TEXT NULLABLE
    ├── sent_at: TIMESTAMP NULLABLE
    └── created_at: TIMESTAMP DEFAULT NOW()

 [ audit_logs ]
    ├── id: UUID (PK)
    ├── actor_type: ENUM ('SYSTEM', 'STUDENT', 'ADMIN', 'STAFF')
    ├── actor_id: VARCHAR(100) -- user_id or applicant_id or 'ANONYMOUS_STUDENT'
    ├── actor_email: VARCHAR(255) NULLABLE
    ├── action: VARCHAR(100) (INDEXED) -- e.g. "APPLICATION_SUBMITTED", "DOCUMENT_VERIFIED"
    ├── entity_type: VARCHAR(100) (INDEXED) -- e.g. "APPLICATION", "DOCUMENT"
    ├── entity_id: UUID (INDEXED)
    ├── metadata: JSONB NULLABLE
    ├── ip_address: VARCHAR(64) NULLABLE
    ├── user_agent: VARCHAR(255) NULLABLE
    └── created_at: TIMESTAMP DEFAULT NOW() (INDEXED)
```

## 2. Integrity & Concurrency Rules
1. **Reference Number Uniqueness**: Formatted `ENR-YYYY-NNNNNN` generated within a database transaction or atomic sequence counter to prevent race collisions.
2. **Access Token**: High-entropy cryptographically random token (256-bit) hashed using SHA-256 before storage in database, sent to student as magic link.
3. **Foreign Key Cascades**: Deleting an application cascades to `documents`, `application_requirements`, and `notifications`, but keeps `audit_logs` intact.
4. **Optimistic Locking / State Machine Validation**: Status transitions are checked against allowed transition matrix before atomic update.
