export type PageTab = 
  | 'home'
  | 'academics'
  | 'admissions'
  | 'campus-life'
  | 'research'
  | 'faculty'
  | 'tools';

export type DegreeLevel = 'Undergraduate' | 'Graduate' | 'Doctorate' | 'Certificate';

export interface QuickFact {
  id: string;
  label: string;
  value: string;
  unit?: string;
  description: string;
  iconName: string;
  benchmark?: string;
}

export interface DegreeProgram {
  id: string;
  title: string;
  degree: string;
  level: DegreeLevel;
  school: string;
  department: string;
  credits: number;
  duration: string;
  tuitionPerYear: number;
  description: string;
  keyCourses: string[];
  careerOutcomes: string[];
  isStem: boolean;
  isHonorsAvailable: boolean;
}

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  school: string;
  department: string;
  education: string;
  researchInterests: string[];
  email: string;
  office: string;
  officeHours: string;
  publicationsCount: number;
  avatarUrl: string;
}

export type CampusBuildingCategory = 'Academic' | 'Library' | 'Residence' | 'Athletics' | 'Administrative' | 'Sacred';

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  category: CampusBuildingCategory;
  yearBuilt: number;
  description: string;
  hours: string;
  features: string[];
  location: string;
  imageUrl?: string;
  x?: number;
  y?: number;
  zone?: 'North Quadrangle' | 'Central Mall' | 'West Residential' | 'East Sanctuary' | 'South Innovation' | 'Waterfront & Athletics';
  architecturalStyle?: string;
  accessibilityNotes?: string;
}

export interface CampusPhotoSlide {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  location: string;
  description: string;
  seasonTag?: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  category: string;
  abstract: string;
  doi: string;
  citations: number;
}

export interface UniversityNews {
  id: string;
  title: string;
  category: 'Academics' | 'Research' | 'Campus Life' | 'Presidential' | 'Athletics';
  date: string;
  author: string;
  readTime: string;
  excerpt: string;
  fullText?: string;
  featured?: boolean;
  imageUrl?: string;
}

export interface ApplicationSubmission {
  applicationId: string;
  submittedAt: string;
  term: string;
  degreeLevel: DegreeLevel;
  programTitle: string;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    citizenship: string;
    highSchoolOrCollege: string;
    gpa: string;
    testScoreType?: string;
    testScore?: string;
    personalStatement: string;
    financialAidInterest: boolean;
  };
  status: 'Received' | 'Under Academic Review' | 'Committee Evaluation' | 'Admitted' | 'Conditional Offer';
  lastUpdated: string;
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  category: 'Administration' | 'Academic' | 'Research' | 'Campus Life' | 'Admissions';
  department: string;
  date: string;
  isoDate: string;
  urgency: 'urgent' | 'important' | 'standard';
  readTime: string;
  excerpt: string;
  fullContent: string[];
  imageUrl: string;
  author: {
    name: string;
    role: string;
    office: string;
  };
  tags: string[];
  bulletinNumber?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export type CalendarEventType = 'Registration' | 'Exams' | 'Recess' | 'Ceremonial' | 'Milestone';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  term: 'Fall 2026' | 'Spring 2027' | 'Summer 2027';
  type: CalendarEventType;
  dateDisplay: string;
  isoDate: string;
  endDateIso?: string;
  dayOfWeek: string;
  monthShort: string;
  dayNumber: string;
  description: string;
  audience: string;
  locationOrOffice: string;
  isUrgent?: boolean;
  isMajorDeadline?: boolean;
  actionUrl?: PageTab;
  actionLabel?: string;
}
