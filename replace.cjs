const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const cargoViewPath = path.join(__dirname, 'cargo_view.txt');
const replacementContent = fs.readFileSync(cargoViewPath, 'utf8');

const startMarker = "\n            {workflowSubTab === 'cargo' ? (";
const endMarker = "\n            ) : (";

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Start marker not found!');
  process.exit(1);
}

// Find the end marker after the start index
const endIndex = content.indexOf(endMarker, startIndex);
if (endIndex === -1) {
  console.error('End marker not found!');
  process.exit(1);
}

// Perform replacement
const finalContent = content.substring(0, startIndex + 1) + replacementContent.trim() + content.substring(endIndex);
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Successfully updated src/App.tsx using precise cargo_view.txt!');
