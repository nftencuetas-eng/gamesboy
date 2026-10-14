import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const BACKUP_FILE = path.resolve(projectRoot, 'data/backups/marketplace_storage_local_backup_1792009355220.json');
const TARGET_FILE = path.resolve(projectRoot, 'data/marketplace_storage.json');

console.log('========================================================');
console.log('🔄 GamesBoy.net — Script de Recuperación y Rollback');
console.log('========================================================');

if (!fs.existsSync(BACKUP_FILE)) {
  console.error('❌ Error crítico: No se encontró el archivo de respaldo verificado en:', BACKUP_FILE);
  process.exit(1);
}

try {
  // Validate JSON integrity before copying
  const content = fs.readFileSync(BACKUP_FILE, 'utf8');
  const parsed = JSON.parse(content);
  console.log(`📦 Archivo de respaldo validado. Colecciones detectadas: ${Object.keys(parsed).length}`);

  // Create an emergency pre-rollback snapshot of current file if it exists
  if (fs.existsSync(TARGET_FILE)) {
    const emergencyFile = path.resolve(projectRoot, `data/backups/emergency_before_rollback_${Date.now()}.json`);
    fs.copyFileSync(TARGET_FILE, emergencyFile);
    console.log(`🛡️ Snapshot de seguridad previo creado en: ${emergencyFile}`);
  }

  // Restore the canonical verified backup
  fs.writeFileSync(TARGET_FILE, content, 'utf8');
  console.log(`✅ ¡Rollback exitoso! data/marketplace_storage.json restaurado a la versión verificada de ${Math.round(content.length / 1024)} KB.`);
  console.log('========================================================');
  process.exit(0);
} catch (err) {
  console.error('❌ Error durante la restauración:', err.message);
  process.exit(1);
}
