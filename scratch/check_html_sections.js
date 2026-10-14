import fs from 'fs';
const html = fs.readFileSync('client/admin.html', 'utf8');

const sectionRegex = /<section\s+id="(tab-[a-z0-9-]+)"[^>]*>/g;
let match;
const sectionStarts = [];
while ((match = sectionRegex.exec(html)) !== null) {
  sectionStarts.push({ id: match[1], index: match.index });
}

for (let i = 0; i < sectionStarts.length; i++) {
  const current = sectionStarts[i];
  const next = sectionStarts[i+1];
  const endIdx = next ? next.index : html.indexOf('</main>');
  const snippet = html.substring(current.index, endIdx);
  
  const openDivs = (snippet.match(/<div(\s|>)/g) || []).length;
  const closeDivs = (snippet.match(/<\/div>/g) || []).length;
  const openSections = (snippet.match(/<section(\s|>)/g) || []).length;
  const closeSections = (snippet.match(/<\/section>/g) || []).length;
  
  console.log(`${current.id.padEnd(25)}: sectOpen=${openSections} sectClose=${closeSections} divOpen=${openDivs.toString().padEnd(3)} divClose=${closeDivs.toString().padEnd(3)} ${openDivs !== closeDivs ? '*** MISMATCH ***' : 'OK'}`);
}
