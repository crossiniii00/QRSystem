import { SecurityUtils } from '../src/lib/security/token';

/**
 * Seed script for production PostgreSQL / Supabase deployments via Prisma.
 */
export async function seedDatabase() {
  console.log('Seeding initial academic database records...');

  const adminCreds = SecurityUtils.hashPassword('AdminPass2026!');
  const staffCreds = SecurityUtils.hashPassword('StaffPass2026!');

  console.log('Admin user credentials prepared:');
  console.log('Email: admin@augustine.edu | Hash generated with salt:', adminCreds.salt);

  console.log('Staff user credentials prepared:');
  console.log('Email: staff@augustine.edu | Hash generated with salt:', staffCreds.salt);

  console.log('Programs to seed: SHS-STEM, SHS-ABM, SHS-HUMSS, BSCS, BSBA-MKTG, BSN');
  console.log('Requirements to seed: BIRTH_CERTIFICATE, REPORT_CARD_FORM_138, GOOD_MORAL_CERT, ID_PHOTO_2X2');
  console.log('QR Campaigns to seed: 2026-enrollment, shs, college, campus-main');
  console.log('Seed preparation completed successfully.');
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
