import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  '#FAF8F5': '#020617', // Main background -> slate-950
  '#261F18': '#f8fafc', // Main text -> slate-50
  '#D8CEBE': '#1e293b', // Borders -> slate-800
  '#EBE3D5': '#0f172a', // Secondary bg -> slate-900
  '#2E2016': '#6366f1', // Primary brand / buttons -> indigo-500
  '#D97706': '#8b5cf6', // Accent -> violet-500
  '#7A6A59': '#94a3b8', // Muted text -> slate-400
  '#422F22': '#4f46e5', // Button hover -> indigo-600
  '#F59E0B': '#a855f7', // Selection -> purple-500
  '#B8A183': '#334155', // Hover border -> slate-700
  '#FFFDF7': '#0f172a', // Highlight bg -> slate-900
  '#8A7968': '#64748b', // Muted text 2 -> slate-500
  'bg-white': 'bg-[#0f172a]', // white bg to slate-900
  'bg-[#ffffff]': 'bg-[#0f172a]',
  'text-[#000000]': 'text-white'
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
        // Use a global regex with case-insensitivity for hex codes
        const regex = new RegExp(oldVal, 'gi');
        content = content.replace(regex, newVal);
      }

      // Special case: modify index.css to change the border-radius and add glassmorphism globals
      if (fullPath.endsWith('index.css')) {
        content = content.replace(/border-radius:\s*0px\s*!important;/g, 'border-radius: 0.75rem !important; transition: all 0.3s ease;');
        content = content.replace(/outline: 2px solid #[a-zA-Z0-9]+;/g, 'outline: 2px solid #8b5cf6; box-shadow: 0 0 10px #8b5cf6;');
        content = content.replace(/background:\s*#F2ECE1/gi, 'background: #0f172a');
        content = content.replace(/background:\s*#C4B5A0/gi, 'background: #334155');
        content = content.replace(/background:\s*#9E8B75/gi, 'background: #475569');
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Theme update complete!');
