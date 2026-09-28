import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference') || '';
    
    let status = 'SUBMITTED';
    let revisionNotes = null;
    let verificationStatus = 'PENDING';
    
    if (reference.includes('101')) {
      status = 'UNDER_REVIEW';
    } else if (reference.includes('102')) {
      status = 'NEEDS_REVISION';
      revisionNotes = 'Please upload a clearer image of your birth certificate.';
      verificationStatus = 'REJECTED';
    } else if (reference.includes('103')) {
      status = 'APPROVED';
      verificationStatus = 'VERIFIED';
    }

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: 'mock-app-id-999',
          referenceNumber: reference || 'REF-MOCK-0000',
          academicYear: '2026-2027',
          status,
          revisionNotes,
          rejectionReason: null
        },
        applicant: {
          firstName: 'Demo',
          lastName: 'Student',
          email: 'demo@example.com',
          mobileNumber: '+1 555 1234567'
        },
        program: {
          name: 'Bachelor of Science in Computer Science'
        },
        requirements: [
          {
            requirement: {
              id: 'req-birth-cert',
              title: 'Official PSA / Certified Birth Certificate',
              isMandatory: true,
              description: 'Clear scanned copy',
              allowedMimeTypes: ['image/jpeg', 'application/pdf']
            },
            uploadedDocument: {
              verificationStatus,
              rejectionReason: revisionNotes,
              originalFilename: 'birth_cert.jpg',
              signedUrl: '#'
            }
          }
        ]
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: "Failed to fetch status" },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
}
