import fs from 'fs';
import { execSync } from 'child_process';

const content = fs.readFileSync('client/admin.html', 'utf8');
const scriptMatches = content.match(/<script[\s\S]*?<\/script>/gi);
if (!scriptMatches) {
  console.log('No script tags found');
  process.exit(1);
}

const code = scriptMatches[0].replace(/<\/?script[^>]*>/gi, '');
fs.writeFileSync('scratch/temp_script.js', code);

try {
  execSync('node --check scratch/temp_script.js', { stdio: 'inherit' });
  console.log('✅ SCRIPT SYNTAX IS 100% VALID!');
} catch (e) {
  console.error('❌ SYNTAX ERROR DETECTED');
} finally {
  if (fs.existsSync('scratch/temp_script.js')) {
    fs.unlinkSync('scratch/temp_script.js');
  }
}
