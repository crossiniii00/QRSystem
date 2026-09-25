import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle, FileText, Loader2, QrCode, Shield, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { APP_CONFIG } from '../../config/app.config';
import { Program } from '../../modules/programs/domain/program.entity';
import { Requirement } from '../../modules/requirements/domain/requirement.entity';

interface UploadedFileItem {
  requirementId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  base64: string;
}

interface EnrollmentWizardProps {
  onSubmissionSuccess: (result: {
    referenceNumber: string;
    accessToken: string;
    applicationId: string;
    programName: string;
    studentName: string;
    studentEmail: string;
  }) => void;
  campaignCode?: string;
}

export const EnrollmentWizard: React.FC<EnrollmentWizardProps> = ({
  onSubmissionSuccess,
  campaignCode,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    sex: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY',
    civilStatus: 'Single',

    // Step 2: Contact
    email: '',
    mobileNumber: '',
    addressStreet: '',
    addressCity: '',
    addressProvince: '',
    addressPostalCode: '',

    // Step 3: Academic
    programId: '',
    applicantType: 'FRESHMAN' as 'FRESHMAN' | 'TRANSFEREE' | 'RETURNEE' | 'CROSS_ENROLLEE',
    academicYear: APP_CONFIG.school.academicYear,
    semesterTerm: APP_CONFIG.school.term,
    previousSchool: '',
    previousSchoolAddress: '',
    previousGpa: '',

    // Step 4: Emergency Contact
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',

    // Step 6: Consent
    privacyAccepted: false,
  });

  // Step 5: Document uploads
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, UploadedFileItem>>(new Map());

  // Fetch programs on mount
  useEffect(() => {
    async function loadPrograms() {
      setLoading(true);
      try {
        const res = await fetch('/api/programs');
        const json = await res.json();
        if (json.success) {
          setPrograms(json.data);
          if (json.data.length > 0 && !formData.programId) {
            setFormData((prev) => ({ ...prev, programId: json.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load programs', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  // Fetch requirements whenever program changes
  useEffect(() => {
    if (!formData.programId) return;
    async function loadReqs() {
      try {
        const res = await fetch(`/api/programs/${formData.programId}/requirements`);
        const json = await res.json();
        if (json.success) {
          setRequirements(json.data);
        }
      } catch (err) {
        console.error('Failed to load requirements', err);
      }
    }
    loadReqs();
  }, [formData.programId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errorMessage) setErrorMessage(null);
  };

  // Handle file selection
  const handleFileChange = async (requirement: Requirement, file: File) => {
    if (file.size > requirement.maxFileSizeBytes) {
      const maxMb = (requirement.maxFileSizeBytes / (1024 * 1024)).toFixed(1);
      setErrorMessage(`"${file.name}" exceeds maximum allowed size of ${maxMb}MB.`);
      return;
    }

    // Infer MIME type if missing or octet-stream
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') mimeType = 'application/pdf';
      else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      else if (ext === 'png') mimeType = 'image/png';
      else mimeType = 'application/pdf';
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setUploadedFiles((prev) => {
        const next = new Map(prev);
        next.set(requirement.id, {
          requirementId: requirement.id,
          filename: file.name,
          mimeType,
          sizeBytes: file.size,
          base64,
        });
        return next;
      });
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (requirementId: string) => {
    setUploadedFiles((prev) => {
      const next = new Map(prev);
      next.delete(requirementId);
      return next;
    });
  };

  // Validation per step
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);

    if (step === 1) {
      if (!formData.firstName.trim()) {
        setErrorMessage('Step 1: Please enter your first name.');
        return false;
      }
      if (!formData.lastName.trim()) {
        setErrorMessage('Step 1: Please enter your last name.');
        return false;
      }
      if (!formData.dateOfBirth.trim()) {
        setErrorMessage('Step 1: Please enter your date of birth.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Step 2: Please enter a valid email address.');
        return false;
      }
      if (!formData.mobileNumber.trim() || formData.mobileNumber.trim().length < 5) {
        setErrorMessage('Step 2: Please enter a valid mobile number (at least 5 digits).');
        return false;
      }
      if (!formData.addressStreet.trim() || !formData.addressCity.trim() || !formData.addressProvince.trim()) {
        setErrorMessage('Step 2: Please complete your residence address (Street, City, and Province).');
        return false;
      }
    } else if (step === 3) {
      if (!formData.programId) {
        setErrorMessage('Step 3: Please select your desired academic program.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.emergencyContactName.trim()) {
        setErrorMessage('Step 4: Emergency contact full name is required.');
        return false;
      }
      if (!formData.emergencyContactRelationship.trim()) {
        setErrorMessage('Step 4: Emergency contact relationship is required.');
        return false;
      }
      if (!formData.emergencyContactPhone.trim() || formData.emergencyContactPhone.trim().length < 5) {
        setErrorMessage('Step 4: Emergency contact phone number is required (at least 5 digits).');
        return false;
      }
    } else if (step === 5) {
      const mandatoryReqs = requirements.filter((r) => r.isMandatory);
      const missing = mandatoryReqs.filter((r) => !uploadedFiles.has(r.id));
      if (missing.length > 0) {
        setErrorMessage(
          `Step 5: Please upload all mandatory documents: ${missing.map((m) => m.title).join(', ')}`
        );
        return false;
      }
    } else if (step === 6) {
      if (!formData.privacyAccepted) {
        setErrorMessage('Step 6: You must review and accept the Institutional Data Privacy Notice to submit.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submission orchestration
  const handleSubmitApplication = async () => {
    // 1. Comprehensive verification of all 6 steps before network call
    for (let s = 1; s <= 6; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Create draft application
      const draftRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant: {
            firstName: formData.firstName.trim(),
            middleName: formData.middleName.trim() || undefined,
            lastName: formData.lastName.trim(),
            dateOfBirth: formData.dateOfBirth.trim(),
            sex: formData.sex,
            civilStatus: formData.civilStatus?.trim() || 'Single',
            email: formData.email.trim().toLowerCase(),
            mobileNumber: formData.mobileNumber.trim(),
            addressStreet: formData.addressStreet.trim(),
            addressCity: formData.addressCity.trim(),
            addressProvince: formData.addressProvince.trim(),
            addressPostalCode: formData.addressPostalCode.trim() || undefined,
            emergencyContactName: formData.emergencyContactName.trim(),
            emergencyContactRelationship: formData.emergencyContactRelationship.trim(),
            emergencyContactPhone: formData.emergencyContactPhone.trim(),
          },
          programId: formData.programId,
          applicantType: formData.applicantType,
          academicYear: formData.academicYear,
          semesterTerm: formData.semesterTerm,
          previousSchool: formData.previousSchool?.trim() || undefined,
          previousSchoolAddress: formData.previousSchoolAddress?.trim() || undefined,
          previousGpa: formData.previousGpa?.trim() || undefined,
          campaignCode: campaignCode || undefined,
        }),
      });

      const draftJson = await draftRes.json();
      if (!draftRes.ok || !draftJson.success) {
        // Route directly to relevant step if validation failed
        const issues = draftJson.error?.details?.issues;
        if (Array.isArray(issues) && issues.length > 0) {
          const firstPath = issues[0].path || '';
          if (firstPath.includes('emergencyContact')) {
            setCurrentStep(4);
          } else if (firstPath.includes('address') || firstPath.includes('email') || firstPath.includes('mobile')) {
            setCurrentStep(2);
          } else if (firstPath.includes('program') || firstPath.includes('applicantType')) {
            setCurrentStep(3);
          } else if (firstPath.includes('firstName') || firstPath.includes('lastName') || firstPath.includes('dateOfBirth') || firstPath.includes('sex')) {
            setCurrentStep(1);
          }
        }
        throw new Error(draftJson.error?.message || 'Failed to initialize draft application.');
      }

      const { applicationId, referenceNumber, accessToken } = draftJson.data;

      // 2. Upload each selected document
      for (const [reqId, fileItem] of uploadedFiles.entries()) {
        const docRes = await fetch(`/api/applications/${applicationId}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken,
            requirementId: reqId,
            filename: fileItem.filename,
            mimeType: fileItem.mimeType,
            fileData: fileItem.base64,
          }),
        });

        const docJson = await docRes.json();
        if (!docRes.ok || !docJson.success) {
          setCurrentStep(5);
          throw new Error(docJson.error?.message || `Failed to upload ${fileItem.filename}`);
        }
      }

      // 3. Finalize application submission
      const submitRes = await fetch(`/api/applications/${applicationId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
        }),
      });

      const submitJson = await submitRes.json();
      if (!submitRes.ok || !submitJson.success) {
        throw new Error(submitJson.error?.message || 'Failed to submit application.');
      }

      const selectedProgram = programs.find((p) => p.id === formData.programId);

      onSubmissionSuccess({
        referenceNumber,
        accessToken,
        applicationId,
        programName: selectedProgram ? selectedProgram.name : 'Selected Program',
        studentName: `${formData.firstName} ${formData.lastName}`,
        studentEmail: formData.email,
      });
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Personal Info' },
    { num: 2, title: 'Contact & Address' },
    { num: 3, title: 'Academic Program' },
    { num: 4, title: 'Emergency Contact' },
    { num: 5, title: 'Documents' },
    { num: 6, title: 'Review & Submit' },
  ];

  const selectedProgram = programs.find((p) => p.id === formData.programId);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Welcome */}
      <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] p-6 sm:p-8 mb-6 text-center shadow-xs">
        <div className="w-12 h-1 bg-[#D97706] mx-auto mb-4" />
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE] text-xs font-bold uppercase tracking-wider mb-2">
          <QrCode className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Academic Year {APP_CONFIG.school.academicYear} · Admissions Intake</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#261F18] tracking-tight uppercase mt-1">
          Student Enrollment Application
        </h1>
        <p className="text-[#665646] text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Complete the guided multi-stage admissions intake form to register your official student dossier at {APP_CONFIG.school.name}.
        </p>
      </div>

      {/* Microsoft-Style Step Progress Bar */}
      <div className="mb-6 bg-[#EBE3D5] border border-[#D8CEBE] p-3 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1">
          {stepsList.map((step) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;
            return (
              <div
                key={step.num}
                className={`p-2.5 border transition-all text-center flex flex-col items-center justify-center ${
                  isCurrent
                    ? 'border-2 border-[#D97706] bg-[#EBE3D5]'
                    : isCompleted
                    ? 'border-[#D8CEBE] bg-[#FAF6EE] text-[#4A3B2C]'
                    : 'border-[#EBE3D5] bg-[#EBE3D5] text-[#A89885]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`w-5 h-5 flex items-center justify-center text-[11px] font-mono font-black ${
                      isCurrent
                        ? 'bg-[#382B20] text-[#FBBF24]'
                        : isCompleted
                        ? 'bg-[#855D1E] text-white'
                        : 'bg-[#F5EFE6] text-[#A89885] border border-[#D8CEBE]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider truncate w-full ${
                    isCurrent ? 'text-[#855D1E]' : isCompleted ? 'text-[#382B20]' : 'text-[#A89885]'
                  }`}
                >
                  {step.title}
                </span>
                {isCurrent && <div className="h-0.5 w-full bg-[#D97706] mt-1.5" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border-l-4 border-[#DC2626] text-[#991B1B] flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wider">Validation Alert</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="bg-[#EBE3D5] border-2 border-[#D8CEBE] shadow-xs p-6 sm:p-8">
        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#EBE3D5] pb-3">
              <h2 className="text-base sm:text-lg font-black text-[#261F18] uppercase tracking-wide">
                Stage 1: Applicant Demographics
              </h2>
              <p className="text-xs text-[#7A6A59] mt-0.5">
                Official legal identifiers as recorded on your government civil registrar certificate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  First Name <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Alexander"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  placeholder="e.g. James (optional)"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Last Name <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Reyes"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Date of Birth <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Sex Assigned at Birth <span className="text-[#B45309]">*</span>
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Civil Status
                </label>
                <select
                  name="civilStatus"
                  value={formData.civilStatus}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Contact & Residence */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#EBE3D5] pb-3">
              <h2 className="text-base sm:text-lg font-black text-[#261F18] uppercase tracking-wide">
                Stage 2: Official Contact & Domicile
              </h2>
              <p className="text-xs text-[#7A6A59] mt-0.5">
                Primary channels for admissions notices, authentication codes, and status updates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Primary Email Address <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Mobile Contact Number <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 012-3456"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Street Address & House / Unit No. <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="text"
                  name="addressStreet"
                  value={formData.addressStreet}
                  onChange={handleInputChange}
                  placeholder="e.g. 142 Emerald Boulevard, Apt 4B"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                    City / Municipality <span className="text-[#B45309]">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressCity"
                    value={formData.addressCity}
                    onChange={handleInputChange}
                    placeholder="e.g. Highland Park"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                    Province / State <span className="text-[#B45309]">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressProvince"
                    value={formData.addressProvince}
                    onChange={handleInputChange}
                    placeholder="e.g. Metro State"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                    Postal / Zip Code
                  </label>
                  <input
                    type="text"
                    name="addressPostalCode"
                    value={formData.addressPostalCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 90042"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Academic Program */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#EBE3D5] pb-3">
              <h2 className="text-base sm:text-lg font-black text-[#261F18] uppercase tracking-wide">
                Stage 3: Academic Classification & Curriculum
              </h2>
              <p className="text-xs text-[#7A6A59] mt-0.5">
                Designate applicant classification and target academic degree or senior high strand.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Applicant Type <span className="text-[#B45309]">*</span>
                </label>
                <select
                  name="applicantType"
                  value={formData.applicantType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="FRESHMAN">New Incoming Freshman</option>
                  <option value="TRANSFEREE">Transferee from Other Institution</option>
                  <option value="RETURNEE">Returning Student</option>
                  <option value="CROSS_ENROLLEE">Cross-Enrollee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#E5D7BE] text-[#523F2D] text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Intake Term
                </label>
                <input
                  type="text"
                  name="semesterTerm"
                  value={formData.semesterTerm}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#E5D7BE] text-[#523F2D] text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-2">
                Target Academic Degree / Strand Curriculum <span className="text-[#B45309]">*</span>
              </label>
              {loading ? (
                <div className="p-8 text-center text-[#7A6A59] flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#D97706]" />
                  <span className="text-xs uppercase font-bold">Synchronizing academic catalog...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {programs.map((program) => {
                    const isSelected = formData.programId === program.id;
                    return (
                      <div
                        key={program.id}
                        onClick={() => setFormData((prev) => ({ ...prev, programId: program.id }))}
                        className={`p-4 border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#D97706] bg-[#EBE3D5] shadow-xs'
                            : 'border-[#D8CEBE] bg-[#EBE3D5] hover:border-[#B8A183] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-mono font-black uppercase tracking-wider px-2 py-0.5 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE]">
                            {program.code}
                          </span>
                          <span className="text-[11px] font-bold text-[#8A7968] uppercase">
                            {program.academicLevel === 'K12_SHS' ? 'Senior High' : 'Undergraduate'}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#261F18] text-sm mt-2">{program.name}</h4>
                        <p className="text-xs text-[#665646] mt-1 line-clamp-2 leading-relaxed">{program.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Previous School Info */}
            <div className="pt-4 border-t border-[#EBE3D5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A6A59] mb-3">
                Pre-Requisite Academic Background
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                    Previous Institution Attended
                  </label>
                  <input
                    type="text"
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={handleInputChange}
                    placeholder="e.g. North Valley Science High School"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                    Cumulative GPA / GWA
                  </label>
                  <input
                    type="text"
                    name="previousGpa"
                    value={formData.previousGpa}
                    onChange={handleInputChange}
                    placeholder="e.g. 92.5 or 3.8"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Emergency Contact */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#EBE3D5] pb-3">
              <h2 className="text-base sm:text-lg font-black text-[#261F18] uppercase tracking-wide">
                Stage 4: Primary Guardian & Emergency Contact
              </h2>
              <p className="text-xs text-[#7A6A59] mt-0.5">
                Designated family contact for medical urgencies and official institutional correspondences.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Full Name of Contact <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  placeholder="e.g. Maria Teresa Reyes"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Relationship <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange}
                  placeholder="e.g. Mother, Father, Guardian"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Emergency Telephone <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 987-6543"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8CEBE] text-sm text-[#261F18] placeholder-[#A89885] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Document Uploads */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-[#EBE3D5] pb-3">
              <h2 className="text-base sm:text-lg font-black text-[#261F18] uppercase tracking-wide">
                Stage 5: Credentials & Document Repository
              </h2>
              <p className="text-xs text-[#7A6A59] mt-0.5">
                Upload authenticated PDF scans or clean digital images. Maximum 5MB per requirement.
              </p>
            </div>

            <div className="space-y-3">
              {requirements.map((req) => {
                const uploaded = uploadedFiles.get(req.id);
                return (
                  <div
                    key={req.id}
                    className={`p-4 border-2 transition-all ${
                      uploaded
                        ? 'border-[#86EFAC] bg-[#F0FDF4]'
                        : req.isMandatory
                        ? 'border-[#D8CEBE] bg-[#EBE3D5]'
                        : 'border-[#EBE3D5] bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#261F18] text-sm">{req.title}</h4>
                          {req.isMandatory ? (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE] uppercase">
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5EFE6] text-[#7A6A59] border border-[#D8CEBE] uppercase">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#665646] mt-1 leading-relaxed">{req.description}</p>
                        <p className="text-[11px] font-mono text-[#8A7968] mt-1">
                          Allowed: PDF, JPG, PNG (Max {(req.maxFileSizeBytes / (1024 * 1024)).toFixed(0)}MB)
                        </p>
                      </div>

                      {uploaded ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#166534] bg-[#EBE3D5] px-3 py-1.5 border border-[#86EFAC]">
                            <CheckCircle className="w-4 h-4 text-[#15803D]" />
                            <span className="max-w-[140px] truncate">{uploaded.filename}</span>
                            <span className="text-[#8A7968] font-mono">({(uploaded.sizeBytes / 1024).toFixed(0)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(req.id)}
                            className="p-1.5 text-[#8A7968] hover:text-[#991B1B] hover:bg-[#FEE2E2] border border-transparent hover:border-[#FCA5A5] transition-colors"
                            title="Remove document"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-[#D8CEBE] hover:border-[#D97706] bg-[#EBE3D5] hover:bg-[#FAF6EE] text-xs font-bold text-[#382B20] uppercase tracking-wider transition-colors shrink-0">
                          <Upload className="w-4 h-4 text-[#D97706]" />
                          <span>Attach File</span>
                          <input
                            type="file"
                            accept={req.allowedMimeTypes.join(',')}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileChange(req, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-[#EBE3D5] pb-3">
              <h2 className="text-base sm:text-lg font-black text-[#261F18] uppercase tracking-wide">
                Stage 6: Final Audit & Official Submission
              </h2>
              <p className="text-xs text-[#7A6A59] mt-0.5">
                Verify application details prior to committing to the university registrar ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Card */}
              <div className="p-4 bg-[#FAF8F5] border border-[#D8CEBE] text-xs space-y-2">
                <h4 className="font-bold text-[#261F18] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E5D7BE] pb-2">
                  <FileText className="w-4 h-4 text-[#D97706]" />
                  <span>Applicant Demographics</span>
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#7A6A59]">Full Name:</span>
                  <span className="col-span-2 font-bold text-[#261F18]">
                    {formData.firstName} {formData.middleName} {formData.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#7A6A59]">Birth / Sex:</span>
                  <span className="col-span-2 font-semibold text-[#261F18]">
                    {formData.dateOfBirth} ({formData.sex})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#7A6A59]">Email:</span>
                  <span className="col-span-2 font-mono text-[#261F18]">{formData.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#7A6A59]">Phone:</span>
                  <span className="col-span-2 font-mono text-[#261F18]">{formData.mobileNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#7A6A59]">Residence:</span>
                  <span className="col-span-2 text-[#261F18]">
                    {formData.addressStreet}, {formData.addressCity}, {formData.addressProvince}{' '}
                    {formData.addressPostalCode}
                  </span>
                </div>
              </div>

              {/* Academic & Emergency Card */}
              <div className="p-4 bg-[#FAF8F5] border border-[#D8CEBE] text-xs space-y-2">
                <h4 className="font-bold text-[#261F18] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E5D7BE] pb-2">
                  <Shield className="w-4 h-4 text-[#D97706]" />
                  <span>Academic Choice & Guardian</span>
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#7A6A59]">Program:</span>
                  <span className="col-span-2 font-bold text-[#855D1E]">{selectedProgram?.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#7A6A59]">Classification:</span>
                  <span className="col-span-2 font-semibold text-[#261F18]">{formData.applicantType}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-[#7A6A59]">Term:</span>
                  <span className="col-span-2 font-semibold text-[#261F18]">
                    AY {formData.academicYear} ({formData.semesterTerm})
                  </span>
                </div>
                {formData.previousSchool && (
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-[#7A6A59]">Prior School:</span>
                    <span className="col-span-2 text-[#261F18]">
                      {formData.previousSchool} {formData.previousGpa && `(GPA: ${formData.previousGpa})`}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E5D7BE] grid grid-cols-3 gap-1">
                  <span className="text-[#7A6A59]">Emergency:</span>
                  <span className="col-span-2 font-bold text-[#261F18]">
                    {formData.emergencyContactName} ({formData.emergencyContactRelationship}) · {formData.emergencyContactPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div className="p-4 bg-[#EBE3D5] border border-[#D8CEBE]">
              <h4 className="font-bold text-[#261F18] text-xs uppercase tracking-wider mb-2">
                Attached Credentials ({uploadedFiles.size} Verified Files)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from(uploadedFiles.values()).map((file) => {
                  const req = requirements.find((r) => r.id === file.requirementId);
                  return (
                    <div
                      key={file.requirementId}
                      className="flex items-center gap-2 p-2 bg-[#FAF8F5] border border-[#D8CEBE] text-xs"
                    >
                      <CheckCircle className="w-4 h-4 text-[#15803D] shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-[#261F18] truncate">{req?.title || file.filename}</p>
                        <p className="text-[11px] font-mono text-[#7A6A59]">{file.filename}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Privacy Acceptance Checkbox */}
            <div className="p-4 bg-[#FAF4EA] border-2 border-[#E5D7BE]">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onChange={handleInputChange}
                  className="mt-0.5 w-4 h-4 accent-[#D97706] text-[#D97706] border-[#D8CEBE] focus:ring-0 cursor-pointer"
                />
                <div className="text-xs text-[#523F2D] leading-relaxed">
                  <span className="font-black text-[#261F18] uppercase">Institutional Privacy Declaration:</span>{' '}
                  I certify under oath that all demographic and academic information submitted is accurate and true.
                  I authorize St. Francis College to authenticate documents and maintain this admissions record in accordance with university policies.
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-6 border-t-2 border-[#EBE3D5] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EBE3D5] border border-[#D8CEBE] text-[#382B20] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF6EE] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Stage</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#382B20] text-[#FFFBEB] hover:bg-[#231A12] border border-[#F59E0B] text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={submitting || !formData.privacyAccepted}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D97706] text-white hover:bg-[#B45309] border border-[#FBBF24] text-xs font-black uppercase tracking-wider shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transmitting Dossier...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Commit Official Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
