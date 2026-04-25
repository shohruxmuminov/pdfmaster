const fs = require('fs');
let content = fs.readFileSync('src/components/GeminiContext.tsx', 'utf8');
content = content.replace(/\\\`/g, '`');
fs.writeFileSync('src/components/GeminiContext.tsx', content);
