import { z } from 'zod';

export const applicantSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  middleName: z.string().trim().max(100).nullish().transform((v) => v || undefined),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().trim().min(1, 'Date of birth is required'),
  sex: z.preprocess(
    (v) => (typeof v === 'string' ? v.toUpperCase().trim() : v),
    z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).catch('OTHER')
  ),
  civilStatus: z.string().trim().nullish().transform((v) => v || undefined),
  
  email: z.string().trim().toLowerCase().email('Valid email address is required'),
  mobileNumber: z.string().trim().min(5, 'Valid contact number is required').max(30),
  addressStreet: z.string().trim().min(1, 'Street address is required'),
  addressCity: z.string().trim().min(1, 'City/Municipality is required'),
  addressProvince: z.string().trim().min(1, 'Province/State is required'),
  addressPostalCode: z.string().trim().nullish().transform((v) => v || undefined),

  emergencyContactName: z.string().trim().min(1, 'Emergency contact person is required'),
  emergencyContactRelationship: z.string().trim().min(1, 'Relationship is required'),
  emergencyContactPhone: z.string().trim().min(5, 'Emergency contact phone is required'),
});

export type ApplicantInput = z.infer<typeof applicantSchema>;

export interface Applicant extends ApplicantInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
