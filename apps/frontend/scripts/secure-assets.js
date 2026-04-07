import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');

console.log('🔐 DOMPET KITA - SECURE ASSETS AUDITOR');
console.log('=======================================');

let issues = 0;
let scanned = 0;

const INSECURE_PATTERNS = [
  // Direct S3/Storj public URLs
  { pattern: /https:\/\/gateway\.storjshare\.io\/[^\s"']*/, label: 'Public Storj URL (no expiry)' },
  // Hardcoded receipt or upload paths
  { pattern: /\/storage\/receipts\/[^\s"']+/, label: 'Direct storage path (not signed)' },
  // Supabase storage public bucket
  { pattern: /supabase\.co\/storage\/v1\/object\/public\//, label: 'Supabase public bucket URL' },
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(SRC_DIR, filePath);
  scanned++;

  INSECURE_PATTERNS.forEach(({ pattern, label }) => {
    const match = content.match(pattern);
    if (match) {
      console.warn(`⚠️  [INSECURE ASSET] ${label}`);
      console.warn(`   File: ${rel}`);
      console.warn(`   Found: ${match[0].substring(0, 80)}...`);
      console.log(`   👉 Fix: Use backend endpoint /api/storage/signed-url?key=... instead\n`);
      issues++;
    }
  });
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fPath = path.join(dir, file);
    if (fs.statSync(fPath).isDirectory()) {
      walkDir(fPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      scanFile(fPath);
    }
  });
}

walkDir(SRC_DIR);

console.log(`\n📊 Scanned ${scanned} files.`);
if (issues === 0) {
  console.log('✅ All assets are using secure (signed) URLs. Excellent!');
} else {
  console.error(`❌ Found ${issues} insecure asset reference(s). Please fix before deploying.`);
  process.exit(1);
}
