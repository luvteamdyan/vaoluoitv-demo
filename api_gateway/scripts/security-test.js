#!/usr/bin/env node

/**
 * Security Test Runner
 * Chạy các test bảo mật cho chat system
 */

const { execSync } = require('child_process');
const path = require('path');

// Test XSS protection
try {
  execSync('npm test -- --testPathPatterns=xss-test --verbose', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (error) {
  process.exit(1);
}

// Test rate limiting
try {
  // Add rate limiting tests here
} catch (error) {
  process.exit(1);
}

// Test sanitization
try {
  // Add sanitization tests here
} catch (error) {
  process.exit(1);
}

// Test audit logging
try {
  // Add audit logging tests here
} catch (error) {
  process.exit(1);
}
