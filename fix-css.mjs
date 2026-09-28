import fs from 'fs';

let css = fs.readFileSync('src/app/globals.css', 'utf8');
const importRegex = /@import url\('https:\/\/fonts\.googleapis\.com[^']+'\);/g;
const imports = css.match(importRegex);
if (imports) {
  css = css.replace(importRegex, '');
  css = imports.join('\n') + '\n' + css;
  fs.writeFileSync('src/app/globals.css', css, 'utf8');
  console.log('Fixed CSS imports');
}
