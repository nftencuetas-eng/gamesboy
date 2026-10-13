import fs from 'fs';

const files = ['client/purchases.html', 'client/index.html'];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('whatsapp-widget.js')) {
    c = c.replace('</body>', '  <script src="/js/whatsapp-widget.js?v=1.0"></script>\n</body>');
    fs.writeFileSync(f, c, 'utf8');
    console.log('✅ Linked whatsapp-widget.js in ' + f);
  }
});
