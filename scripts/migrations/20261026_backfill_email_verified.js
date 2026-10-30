/**
 * Migration: Backfill emailVerified field for existing student records
 *
 * Rules:
 * - Dry-run by default: displays the query filter and the count of affected documents.
 * - Explicit apply: only performs write operations when invoked with --apply flag.
 *
 * Usage:
 *   node scripts/migrations/20261026_backfill_email_verified.js         # Dry run
 *   node scripts/migrations/20261026_backfill_email_verified.js --apply # Apply migration
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Student } from '../../server/models/Student.js';

dotenv.config({ path: 'server/.env' });

const isApply = process.argv.includes('--apply');
const filter = { emailVerified: { $exists: false } };

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);

  const affectedCount = await Student.countDocuments(filter);

  console.log('--- Migration: Backfill emailVerified ---');
  console.log('Target Collection: students');
  console.log('Query Filter:', JSON.stringify(filter, null, 2));
  console.log(`Matching Documents: ${affectedCount}`);
  console.log(`Mode: ${isApply ? 'APPLY (Write)' : 'DRY-RUN (Read-only Preview)'}`);

  if (!isApply) {
    console.log('\n[Dry-run Complete]: No documents were modified. Run with --apply to commit changes.');
  } else {
    if (affectedCount === 0) {
      console.log('\n[Apply Complete]: Zero documents needed update.');
    } else {
      const result = await Student.updateMany(filter, { $set: { emailVerified: false } });
      console.log(`\n[Apply Complete]: Successfully updated ${result.modifiedCount} documents.`);
    }
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
