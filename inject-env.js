// Runs before ng build on Cloudflare — injects GEMINI_API_KEY into environment.prod.ts
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, 'src/environments/environment.prod.ts');
const key = process.env.GEMINI_API_KEY || '';

if (!key) {
  console.warn('[inject-env] GEMINI_API_KEY not set — fallback content will be used.');
} else {
  console.log('[inject-env] Injecting GEMINI_API_KEY into environment.prod.ts');
}

let content = fs.readFileSync(envFile, 'utf8');
content = content.replace('GEMINI_KEY_PLACEHOLDER', key);
fs.writeFileSync(envFile, content, 'utf8');
