import fs from 'fs';

const html = fs.readFileSync('client/admin.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, i) => {
  if (l.includes('loadHeroBannersAdmin') || l.includes('saveHeroBannersAdmin') || l.includes('/api/banners/admin')) {
    console.log(`Line ${i + 1}: ${l.trim().slice(0, 120)}`);
  }
});
