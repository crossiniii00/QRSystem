export const APP_CONFIG = {
  school: {
    name: 'St. Francis College',
    shortName: 'St. Francis',
    tagline: 'Excellence in Holistic Education & Leadership',
    academicYear: '2026-2027',
    term: '1st Semester',
    contactEmail: 'admissions@stfrancis.edu',
    contactPhone: '+1 (555) 019-2834',
    address: '180 Remsen Street, Academic Heights',
  },
  application: {
    referencePrefix: 'ENR-2026-',
    maxFileSizeMb: 5,
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
  },
  privacyPolicyNotice:
    'By submitting this application, you authorize St. Francis College to process and store your submitted personal, academic, and document records in accordance with institutional privacy standards and applicable educational data privacy regulations.',
} as const;
