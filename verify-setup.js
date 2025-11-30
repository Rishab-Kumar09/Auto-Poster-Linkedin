#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all components are properly configured
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

console.log('\n🔍 Verifying Social Media Automation Setup...\n');

let issues = 0;
let warnings = 0;

// Check Node version
console.log('1️⃣  Checking Node.js version...');
const nodeVersion = process.version.split('.')[0].replace('v', '');
if (parseInt(nodeVersion) >= 18) {
  console.log(`   ✅ Node.js ${process.version} (OK)\n`);
} else {
  console.log(`   ❌ Node.js ${process.version} (Need 18+)\n`);
  issues++;
}

// Check package.json
console.log('2️⃣  Checking package.json...');
if (existsSync('package.json')) {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    console.log(`   ✅ Package: ${pkg.name} v${pkg.version}\n`);
  } catch (error) {
    console.log('   ❌ Invalid package.json\n');
    issues++;
  }
} else {
  console.log('   ❌ package.json not found\n');
  issues++;
}

// Check node_modules
console.log('3️⃣  Checking dependencies...');
if (existsSync('node_modules')) {
  console.log('   ✅ Backend dependencies installed\n');
} else {
  console.log('   ❌ Backend dependencies missing\n');
  console.log('   💡 Run: npm install\n');
  issues++;
}

// Check frontend
console.log('4️⃣  Checking frontend...');
if (existsSync('frontend/package.json')) {
  console.log('   ✅ Frontend package.json exists');
  if (existsSync('frontend/node_modules')) {
    console.log('   ✅ Frontend dependencies installed\n');
  } else {
    console.log('   ❌ Frontend dependencies missing');
    console.log('   💡 Run: cd frontend && npm install\n');
    issues++;
  }
} else {
  console.log('   ❌ Frontend not found\n');
  issues++;
}

// Check .env file
console.log('5️⃣  Checking configuration...');
if (existsSync('.env')) {
  console.log('   ✅ .env file exists');
  
  dotenv.config();
  
  // Check required keys
  const requiredKeys = {
    'GROQ_API_KEY': 'AI generation (FREE)',
    'NEWS_API_KEY': 'Content fetching (FREE)',
  };
  
  const optionalKeys = {
    'YOUTUBE_API_KEY': 'YouTube content (FREE)',
    'TWITTER_API_KEY': 'Twitter posting (FREE tier)',
    'LINKEDIN_CLIENT_ID': 'LinkedIn posting',
    'OPENAI_API_KEY': 'OpenAI (paid alternative)',
  };
  
  console.log('\n   Required Keys:');
  Object.entries(requiredKeys).forEach(([key, desc]) => {
    if (process.env[key]) {
      const preview = process.env[key].slice(0, 10);
      console.log(`   ✅ ${key}: ${preview}... (${desc})`);
    } else {
      console.log(`   ⚠️  ${key}: Missing (${desc})`);
      warnings++;
    }
  });
  
  console.log('\n   Optional Keys:');
  Object.entries(optionalKeys).forEach(([key, desc]) => {
    if (process.env[key]) {
      const preview = process.env[key].slice(0, 10);
      console.log(`   ✅ ${key}: ${preview}... (${desc})`);
    } else {
      console.log(`   ⚪ ${key}: Not set (${desc})`);
    }
  });
  
  console.log('');
  
} else {
  console.log('   ❌ .env file not found');
  console.log('   💡 Run: cp .env.example .env\n');
  issues++;
}

// Check backend files
console.log('6️⃣  Checking backend files...');
const backendFiles = [
  'backend/server.js',
  'backend/contentFetcher.js',
  'backend/aiGenerator.js',
  'backend/autoPost.js',
  'backend/scheduler.js',
  'backend/database.js',
  'backend/growthOptimizer.js'
];

let missingFiles = 0;
backendFiles.forEach(file => {
  if (!existsSync(file)) {
    console.log(`   ❌ Missing: ${file}`);
    missingFiles++;
  }
});

if (missingFiles === 0) {
  console.log(`   ✅ All ${backendFiles.length} backend files present\n`);
} else {
  console.log(`   ❌ ${missingFiles} files missing\n`);
  issues++;
}

// Check frontend files
console.log('7️⃣  Checking frontend files...');
const frontendFiles = [
  'frontend/src/App.jsx',
  'frontend/src/main.jsx',
  'frontend/src/index.css',
  'frontend/index.html',
  'frontend/vite.config.js'
];

missingFiles = 0;
frontendFiles.forEach(file => {
  if (!existsSync(file)) {
    console.log(`   ❌ Missing: ${file}`);
    missingFiles++;
  }
});

if (missingFiles === 0) {
  console.log(`   ✅ All ${frontendFiles.length} frontend files present\n`);
} else {
  console.log(`   ❌ ${missingFiles} files missing\n`);
  issues++;
}

// Check documentation
console.log('8️⃣  Checking documentation...');
const docs = [
  'START_HERE.md',
  'QUICKSTART.md',
  'GETTING_STARTED.md',
  'ENV_SETUP.md',
  'README.md'
];

missingFiles = 0;
docs.forEach(file => {
  if (!existsSync(file)) {
    console.log(`   ❌ Missing: ${file}`);
    missingFiles++;
  }
});

if (missingFiles === 0) {
  console.log(`   ✅ All ${docs.length} documentation files present\n`);
} else {
  console.log(`   ❌ ${missingFiles} files missing\n`);
  warnings++;
}

// Final report
console.log('═'.repeat(60));
console.log('\n📊 VERIFICATION REPORT\n');

if (issues === 0 && warnings === 0) {
  console.log('🎉 PERFECT! Everything is set up correctly!\n');
  console.log('Next steps:');
  console.log('1. Add your API keys to .env (see ENV_SETUP.md)');
  console.log('2. Run: npm run test-ai');
  console.log('3. Run: npm run dev (backend)');
  console.log('4. Run: cd frontend && npm run dev (frontend)');
  console.log('5. Open: http://localhost:3000\n');
} else if (issues === 0 && warnings > 0) {
  console.log(`⚠️  Setup is functional with ${warnings} warning(s)\n`);
  console.log('The system will work but some features may be limited.');
  console.log('Check warnings above for details.\n');
} else {
  console.log(`❌ Found ${issues} critical issue(s) and ${warnings} warning(s)\n`);
  console.log('Please fix the issues above before starting.\n');
  console.log('Quick fixes:');
  if (!existsSync('node_modules')) {
    console.log('  → npm install');
  }
  if (!existsSync('frontend/node_modules')) {
    console.log('  → cd frontend && npm install');
  }
  if (!existsSync('.env')) {
    console.log('  → cp .env.example .env');
    console.log('  → Edit .env and add your API keys');
  }
  console.log('');
}

console.log('📚 Documentation:');
console.log('  → START_HERE.md - Quick overview');
console.log('  → QUICKSTART.md - 5-minute setup');
console.log('  → GETTING_STARTED.md - Complete guide');
console.log('  → ENV_SETUP.md - API key setup\n');

process.exit(issues > 0 ? 1 : 0);

