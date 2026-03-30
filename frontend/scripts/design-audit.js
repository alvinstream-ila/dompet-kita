import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERIC_COLORS = ['red-500', 'blue-500', 'green-500', 'yellow-500', 'gray-500'];
const SRC_DIR = path.join(__dirname, '../src');

console.log('🎨 DOMPET KITA - AI DESIGN AUDITOR');
console.log('===================================');

function auditFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
            auditFiles(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.css')) {
            const content = fs.readFileSync(filePath, 'utf8');
            GENERIC_COLORS.forEach(color => {
                if (content.includes(color)) {
                    console.warn(`⚠️  [GENERIC DESIGN] Found '${color}' in ${path.relative(SRC_DIR, filePath)}`);
                    console.log(`   👉 Recommendation: Upgrade to HSL Secondary or Glassmorphism.`);
                }
            });
        }
    });
}

auditFiles(SRC_DIR);
console.log('\n✅ Audit Complete.');
