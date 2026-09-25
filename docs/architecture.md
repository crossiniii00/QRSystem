# Architecture Overview — QR-Based School Enrollment System

## 1. Executive Summary & Design Principles
The QR-based School Enrollment Web Application is architected as a **Modular Monolith** adhering to **Clean Architecture** and **Domain-Driven Design (DDD)** principles. It targets an initial volume of 1–100 applicants per cycle with zero-friction scalability to thousands of students.

### Architectural Rules
- **Layered Separation of Concerns**:
  - `Presentation`: React views, forms, wizards, dashboards, and API route controllers.
  - `Application / Use Cases`: Pure orchestration of business use cases, DTOs, and input validation.
  - `Domain`: Enterprise business rules, entity invariants, enums, domain errors, and finite state machines. Framework-agnostic and persistent-storage agnostic.
  - `Infrastructure`: Data persistence (repositories, Prisma/PostgreSQL), storage adapters (Cloudflare R2/S3 interface), notification adapters (Resend email service), audit log sinks.
- **Dependency Rule**: Dependencies point strictly inwards: `Infrastructure` and `Presentation` depend on `Application` and `Domain`. `Domain` has zero external dependencies.
- **Zero Business Logic in UI & Controllers**: React components never call database repositories directly; API controllers only validate requests, invoke use cases, and format HTTP responses.

---

## 2. High-Level System Architecture Diagram

```
+-----------------------------------------------------------------------------+
|                                CLIENT LAYER                                 |
|                                                                             |
|   [ Prospective Student (Mobile / Desktop) ]       [ School Admin / Staff ] |
|            | Scans QR code or magic link                     | Staff portal |
|            v                                                 v              |
|   +---------------------------------------+   +---------------------------+ |
|   |  Public Enrollment Wizard (Steps 1-6) |   |  Admin Review Dashboard   | |
|   |  - Personal Information               |   |  - Application Metrics    | |
|   |  - Contact & Address                  |   |  - Filterable Data Table  | |
|   |  - Academic & Program Selection       |   |  - Document Verification  | |
|   |  - Document Upload & Verification     |   |  - Status Transitioning   | |
|   |  - Application Review & Submission    |   |  - Audit Log Timeline     | |
|   |  - Status Tracker (Reference No/Token)|   |  - QR Campaign Manager    | |
|   +---------------------------------------+   +---------------------------+ |
+-----------------------------------------------------------------------------+
                                       |
                                       | REST API (JSON + Multipart)
                                       v
+-----------------------------------------------------------------------------+
|                            PRESENTATION LAYER                               |
|                                                                             |
|   [ Controllers & Route Handlers ]                                          |
|   - ApplicationsController        - DocumentsController                     |
|   - ProgramsController            - RequirementsController                  |
|   - AdminAuthController           - QRCampaignsController                   |
|   - AuditLogsController                                                     |
+-----------------------------------------------------------------------------+
                                       |
                                       | DTOs & Command/Query Objects
                                       v
+-----------------------------------------------------------------------------+
|                           APPLICATION LAYER                                 |
|                                                                             |
|   [ Use Cases ]                                                             |
|   - SubmitApplicationUseCase      - TransitionApplicationStatusUseCase      |
|   - UploadDocumentUseCase         - VerifyDocumentUseCase                   |
|   - ResolveQRCampaignUseCase      - AuthenticateAdminUseCase                |
|   - TrackApplicationStatusUseCase - GetApplicationDetailsUseCase            |
|   - GenerateReferenceNumberUseCase                                          |
|                                                                             |
|   [ Interfaces / Ports ]                                                    |
|   - IApplicationRepository        - IApplicantRepository                    |
|   - IDocumentRepository           - IProgramRepository                      |
|   - IStorageService               - IEmailNotificationService               |
|   - IAuditLogger                  - IAdminUserRepository                    |
+-----------------------------------------------------------------------------+
                   |                                       |
                   v                                       v
+------------------------------------+   +------------------------------------+
|            DOMAIN LAYER            |   |        INFRASTRUCTURE LAYER        |
|                                    |   |                                    |
| [ Domain Entities & Value Objects] |   | [ Repositories & Adapters ]        |
| - Application (Aggregate Root)     |   | - PrismaApplicationRepository      |
| - Applicant                        |   | - PrismaApplicantRepository        |
| - DocumentMetadata                 |   | - PrismaDocumentRepository         |
| - Requirement                      |   | - PrismaProgramRepository          |
| - AcademicProgram                  |   | - PrismaAuditLogRepository         |
| - QRCampaign                       |   | - S3CompatibleStorageService (R2)  |
|                                    |   | - ResendEmailNotificationService   |
| [ State Machine & Invariants ]     |   | - SessionTokenService              |
| - ApplicationStateMachine          |   |                                    |
| - ReferenceNumberGenerator         |   +------------------------------------+
| - DomainErrors                     |                     |
+------------------------------------+                     v
                                         +------------------------------------+
                                         |         EXTERNAL SERVICES          |
                                         | - PostgreSQL Database              |
                                         | - Cloudflare R2 Object Storage     |
                                         | - Resend Email API                 |
                                         +------------------------------------+
```
