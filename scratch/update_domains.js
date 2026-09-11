import fs from 'fs';
import path from 'path';

const file = path.resolve('data/marketplace_storage.json');
if (fs.existsSync(file)) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replaceAll('gamesboy.gamesboy.net', 'gamesboy.net');
  text = text.replaceAll('.gamesboy.net', '.gamsplit.com');
  text = text.replaceAll('"customDomain": "gamesboy.gamsplit.com"', '"customDomain": "gamesboy.net"');
  fs.writeFileSync(file, text, 'utf8');
  console.log('✅ JSON storage domains updated successfully.');
} else {
  console.log('No local json storage found, skipping.');
}
