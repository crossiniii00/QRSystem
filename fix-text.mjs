import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'src');

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace text-[#000000] with text-white
      if (content.includes('text-[#000000]')) {
        content = content.replace(/text-\[#000000\]/g, 'text-white');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed text color in ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Text color fixed!');
