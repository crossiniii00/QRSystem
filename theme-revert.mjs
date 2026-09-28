import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  '#020617': '#FAF8F5',
  '#f8fafc': '#261F18',
  '#1e293b': '#D8CEBE',
  '#0f172a': '#EBE3D5',
  '#6366f1': '#2E2016',
  '#8b5cf6': '#D97706',
  '#94a3b8': '#7A6A59',
  '#4f46e5': '#422F22',
  '#a855f7': '#F59E0B',
  '#334155': '#B8A183',
  '#64748b': '#8A7968',
  'text-white': 'text-[#000000]',
};

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const [oldVal, newVal] of Object.entries(replacements)) {
        const regex = new RegExp(oldVal, 'gi');
        content = content.replace(regex, newVal);
      }

      // Special case for global css
      if (fullPath.endsWith('globals.css') || fullPath.endsWith('index.css')) {
        content = content.replace(/border-radius: 0.75rem !important; transition: all 0.3s ease;/g, 'border-radius: 0px !important;');
        content = content.replace(/outline: 2px solid #D97706; box-shadow: 0 0 10px #D97706;/g, 'outline: 2px solid #F59E0B;');
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Reverted ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Theme revert complete!');
