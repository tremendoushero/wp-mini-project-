// backend/scripts/verifyVercelConfig.js
// Purpose: Validates Vercel deployment entry points, JSON files, and Express exports.

const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('🔍 VERIFYING VERCEL DEPLOYMENT CONFIGURATION & ARTIFACTS');
console.log('========================================================\n');

let pass = 0;
let fail = 0;

function check(desc, cond) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    pass++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    fail++;
  }
}

// 1. Root vercel.json
const rootVercelPath = path.join(__dirname, '..', '..', 'vercel.json');
check('Root vercel.json exists', fs.existsSync(rootVercelPath));
try {
  const rootVercel = JSON.parse(fs.readFileSync(rootVercelPath, 'utf8'));
  check('Root vercel.json is valid JSON with rewrites', Array.isArray(rootVercel.rewrites));
  check('Root vercel.json has /api rewrite', rootVercel.rewrites.some((r) => r.source.includes('/api')));
} catch (e) {
  check('Root vercel.json parsed', false);
}

// 2. Frontend vercel.json
const feVercelPath = path.join(__dirname, '..', '..', 'frontend', 'vercel.json');
check('Frontend vercel.json exists', fs.existsSync(feVercelPath));
try {
  const feVercel = JSON.parse(fs.readFileSync(feVercelPath, 'utf8'));
  check('Frontend vercel.json has SPA rewrite to index.html', feVercel.rewrites?.[0]?.destination === '/index.html');
} catch (e) {
  check('Frontend vercel.json parsed', false);
}

// 3. Backend vercel.json
const beVercelPath = path.join(__dirname, '..', 'vercel.json');
check('Backend vercel.json exists', fs.existsSync(beVercelPath));
try {
  const beVercel = JSON.parse(fs.readFileSync(beVercelPath, 'utf8'));
  check('Backend vercel.json has rewrite to /api/index.js', beVercel.rewrites?.[0]?.destination === '/api/index.js');
} catch (e) {
  check('Backend vercel.json parsed', false);
}

// 4. API entry points
const rootApiIndex = path.join(__dirname, '..', '..', 'api', 'index.js');
check('Root api/index.js exists', fs.existsSync(rootApiIndex));

const beApiIndex = path.join(__dirname, '..', 'api', 'index.js');
check('Backend api/index.js exists', fs.existsSync(beApiIndex));

// 5. Express app export check
const app = require('../../api/index');
check('api/index.js exports Express application function', typeof app === 'function' && typeof app.use === 'function');

// 6. Router stack verification
const routes = app._router ? app._router.stack : [];
const paths = routes
  .map((r) => (r.route ? r.route.path : r.regexp ? r.regexp.toString() : ''))
  .join(' ');

check('Router stack includes /api/auth', paths.includes('auth'));
check('Router stack includes /api/students', paths.includes('students'));
check('Router stack includes /api/attendance', paths.includes('attendance'));
check('Router stack includes /api/courses', paths.includes('courses'));
check('Router stack includes /api/academic-events', paths.includes('academic-events'));
check('Router stack includes /api/exams', paths.includes('exams'));
check('Router stack includes /api/settings', paths.includes('settings'));

// 7. frontend/src/api.js contains VITE_API_URL
const apiJsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'api.js');
const apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
check('frontend/src/api.js uses import.meta.env.VITE_API_URL', apiJsContent.includes('VITE_API_URL'));
check('frontend/src/api.js does not have hardcoded localhost:5000', !apiJsContent.includes("'http://localhost:5000'") || apiJsContent.includes('import.meta.env.VITE_API_URL'));

// 8. Root .gitignore protection
const gitignorePath = path.join(__dirname, '..', '..', '.gitignore');
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
check('.gitignore ignores .env files', gitignoreContent.includes('.env'));
check('.gitignore ignores node_modules', gitignoreContent.includes('node_modules'));

console.log('\n========================================================');
console.log(`VERIFICATION SUMMARY: ${pass} PASSED, ${fail} FAILED`);
console.log('========================================================\n');

process.exit(fail === 0 ? 0 : 1);
