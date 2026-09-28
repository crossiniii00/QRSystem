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
      let lines = fs.readFileSync(fullPath, 'utf8').split('\n');
      let changed = false;

      // Also replace any bg-[#EBE3D5] that appears on a line with className if we know it's an input/textarea/select
      // Actually, an easier way: find bg-[#EBE3D5] and replace with bg-white if it's an input element
      let inInput = false;
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // We will just replace bg-[#EBE3D5] with bg-white on lines that have className and are part of input/select/textarea
        // Or honestly, let's just replace all bg-[#EBE3D5] with bg-white inside className for these files:
        if (line.includes('className=') && line.includes('bg-[#EBE3D5]') && 
           (fullPath.includes('EnrollmentWizard.tsx') || 
            fullPath.includes('PaymentCheckoutModal.tsx') || 
            fullPath.includes('StatusTracker.tsx') ||
            fullPath.includes('AdminLogin.tsx') ||
            fullPath.includes('AdminBankingTab.tsx') ||
            fullPath.includes('QRCampaignManager.tsx') ||
            fullPath.includes('AdminPaymentsTab.tsx'))) {
            // These files contain forms. Let's just blindly change bg-[#EBE3D5] to bg-white.
            // But wait, the panels themselves might use bg-[#EBE3D5]. Let's replace ONLY if the line has 'border border-' or 'focus:outline'
            if (line.includes('border') && line.includes('focus:')) {
               lines[i] = line.replace(/bg-\[#EBE3D5\]/g, 'bg-white');
               changed = true;
            }
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
        console.log(`Fixed inputs in ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Input fields fixed!');
