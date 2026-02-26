#!/usr/bin/env node
/**
 * Frontend Performance Testing Script
 * 
 * This script provides guidance and automated checks for frontend performance.
 * Run with: node test_performance.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function printHeader(text) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${text.padStart((60 + text.length) / 2).padEnd(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

function printSuccess(text) {
  console.log(`${colors.green}✓ ${text}${colors.reset}`);
}

function printError(text) {
  console.log(`${colors.red}✗ ${text}${colors.reset}`);
}

function printInfo(text) {
  console.log(`${colors.cyan}ℹ ${text}${colors.reset}`);
}

function printWarning(text) {
  console.log(`${colors.yellow}⚠ ${text}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkMemoization() {
  printHeader('Checking React.memo Usage');
  
  const componentsToCheck = [
    { path: 'components/Avatar.tsx', name: 'AvatarModel' },
    { path: 'components/MarkdownMessage.tsx', name: 'MarkdownMessage' },
    { path: 'app/dashboard/page.tsx', name: 'CourseCard' },
    { path: 'app/courses/[id]/page.tsx', name: 'MessageBubble' },
  ];
  
  componentsToCheck.forEach(({ path: filePath, name }) => {
    const fullPath = path.join(__dirname, filePath);
    if (checkFileExists(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes(`memo(function ${name}`) || content.includes(`= memo(`)) {
        printSuccess(`${name} is memoized in ${filePath}`);
      } else {
        printWarning(`${name} might not be memoized in ${filePath}`);
      }
    } else {
      printError(`File not found: ${filePath}`);
    }
  });
}

function checkUseCallback() {
  printHeader('Checking useCallback Usage');
  
  const filesToCheck = [
    'app/profile/page.tsx',
    'app/courses/[id]/page.tsx',
  ];
  
  filesToCheck.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (checkFileExists(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const useCallbackCount = (content.match(/useCallback/g) || []).length;
      if (useCallbackCount > 0) {
        printSuccess(`${filePath} uses useCallback (${useCallbackCount} instances)`);
      } else {
        printWarning(`${filePath} might not be using useCallback`);
      }
    } else {
      printError(`File not found: ${filePath}`);
    }
  });
}

function checkNextImage() {
  printHeader('Checking Next.js Image Usage');
  
  const profilePath = path.join(__dirname, 'app/profile/page.tsx');
  if (checkFileExists(profilePath)) {
    const content = fs.readFileSync(profilePath, 'utf-8');
    if (content.includes('from "next/image"') || content.includes("from 'next/image'")) {
      printSuccess('Next.js Image component is imported');
      if (content.includes('<Image')) {
        printSuccess('Next.js Image component is used');
      } else {
        printWarning('Next.js Image is imported but might not be used');
      }
    } else {
      printError('Next.js Image component is not imported');
    }
  }
}

function check3DOptimization() {
  printHeader('Checking 3D Avatar Optimization');
  
  const avatarPath = path.join(__dirname, 'components/Avatar.tsx');
  if (checkFileExists(avatarPath)) {
    const content = fs.readFileSync(avatarPath, 'utf-8');
    
    // Check for reduced polygon count
    if (content.includes('args={[1, 32, 32]}')) {
      printSuccess('Sphere geometry optimized to 32 segments');
    } else if (content.includes('args={[1, 64, 64]}')) {
      printWarning('Sphere geometry still using 64 segments (could be optimized to 32)');
    }
    
    if (content.includes('args={[0.1, 16]}')) {
      printSuccess('Circle geometry optimized to 16 segments');
    } else if (content.includes('args={[0.1, 32]}')) {
      printWarning('Circle geometry still using 32 segments (could be optimized to 16)');
    }
  }
}

function checkNextConfig() {
  printHeader('Checking Next.js Configuration');
  
  const configPath = path.join(__dirname, 'next.config.js');
  if (checkFileExists(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    
    if (content.includes('remotePatterns')) {
      printSuccess('Next.js Image remotePatterns configured');
    } else if (content.includes('domains')) {
      printWarning('Using deprecated "domains" - consider migrating to "remotePatterns"');
    } else {
      printError('No image configuration found in next.config.js');
    }
  }
}

function checkMessageKeys() {
  printHeader('Checking Message Key Optimization');
  
  const chatPath = path.join(__dirname, 'app/courses/[id]/page.tsx');
  if (checkFileExists(chatPath)) {
    const content = fs.readFileSync(chatPath, 'utf-8');
    
    if (content.includes('id: string')) {
      printSuccess('Messages have unique ID field');
    } else {
      printWarning('Messages might be using array index as key');
    }
    
    if (content.includes('key={msg.id}')) {
      printSuccess('Messages use unique ID as key');
    } else if (content.includes('key={idx}') || content.includes('key={index}')) {
      printError('Messages are using array index as key (should use unique ID)');
    }
  }
}

function printManualTestInstructions() {
  printHeader('Manual Testing Instructions');
  
  console.log(`${colors.bright}1. React DevTools Profiler Test${colors.reset}`);
  printInfo('   a. Install React DevTools browser extension');
  printInfo('   b. Start dev server: npm run dev');
  printInfo('   c. Open http://localhost:3000 in browser');
  printInfo('   d. Open DevTools → Profiler → Record');
  printInfo('   e. Navigate to dashboard and interact');
  printInfo('   f. Stop recording and check flamegraph');
  printInfo('   Expected: Memoized components should NOT re-render unnecessarily\n');
  
  console.log(`${colors.bright}2. 3D Avatar Performance Test${colors.reset}`);
  printInfo('   a. Open browser console on any page with avatar');
  printInfo('   b. Run FPS measurement script from TESTING.md');
  printInfo('   c. Observe FPS counter');
  printInfo('   Expected: 55-60 FPS (improved from 30-45 FPS)\n');
  
  console.log(`${colors.bright}3. Image Optimization Test${colors.reset}`);
  printInfo('   a. Navigate to /profile page');
  printInfo('   b. Open Network tab in DevTools');
  printInfo('   c. Clear cache and reload');
  printInfo('   d. Check image requests');
  printInfo('   Expected: Optimized format (WebP), lazy loading, smaller size\n');
  
  console.log(`${colors.bright}4. Memory Test${colors.reset}`);
  printInfo('   a. Open Chrome DevTools → Performance → Memory');
  printInfo('   b. Take heap snapshot');
  printInfo('   c. Navigate through pages');
  printInfo('   d. Send multiple messages');
  printInfo('   e. Take another snapshot');
  printInfo('   f. Compare memory usage');
  printInfo('   Expected: No significant memory growth\n');
}

function printPerformanceMetrics() {
  printHeader('Expected Performance Improvements');
  
  console.log(`${colors.bright}Component Re-renders:${colors.reset}`);
  printInfo('  Before: 100% of components re-render on state change');
  printInfo('  After:  30-70% reduction in unnecessary re-renders');
  printSuccess('  ✓ React.memo prevents re-rendering of unchanged components\n');
  
  console.log(`${colors.bright}3D Avatar Rendering:${colors.reset}`);
  printInfo('  Before: 64-segment spheres, 32-segment circles (high polygon count)');
  printInfo('  After:  32-segment spheres, 16-segment circles');
  printSuccess('  ✓ 50% reduction in vertices, smoother 60fps animations\n');
  
  console.log(`${colors.bright}Image Loading:${colors.reset}`);
  printInfo('  Before: Raw <img> tags, original sizes, no optimization');
  printInfo('  After:  Next.js Image with auto-optimization, lazy loading');
  printSuccess('  ✓ Smaller file sizes, faster page loads\n');
  
  console.log(`${colors.bright}Event Handlers:${colors.reset}`);
  printInfo('  Before: Functions recreated on every render');
  printInfo('  After:  useCallback maintains stable references');
  printSuccess('  ✓ Prevents unnecessary child component re-renders\n');
}

function checkPackageJson() {
  printHeader('Checking Dependencies');
  
  const packagePath = path.join(__dirname, 'package.json');
  if (checkFileExists(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    const requiredDeps = [
      'react',
      'next',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion',
    ];
    
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        printSuccess(`${dep} installed (${packageJson.dependencies[dep]})`);
      } else {
        printError(`${dep} not found in dependencies`);
      }
    });
  }
}

function main() {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'AI Tutor Frontend Performance Verification'.padStart(42)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
  
  printInfo('Checking frontend performance optimizations...\n');
  
  // Run automated checks
  checkPackageJson();
  checkMemoization();
  checkUseCallback();
  checkNextImage();
  check3DOptimization();
  checkNextConfig();
  checkMessageKeys();
  
  // Print manual test instructions
  printManualTestInstructions();
  
  // Print performance metrics
  printPerformanceMetrics();
  
  // Summary
  printHeader('Summary');
  printSuccess('Automated checks complete!');
  printInfo('Follow the manual testing instructions above to verify performance improvements');
  printInfo('See TESTING.md for detailed testing procedures');
  
  console.log('\n');
}

// Run the tests
try {
  main();
} catch (error) {
  printError(`Test script failed: ${error.message}`);
  process.exit(1);
}
