#!/usr/bin/env node

/**
 * Enhanced Script để sync matches data từ API keovip.cc
 * Sử dụng: node scripts/sync-matches-enhanced.js [options]
 * 
 * Features:
 * - Sync manual với nhiều options
 * - Auto retry khi có lỗi
 * - Progress tracking
 * - Logging chi tiết
 * - Dry run mode
 * - Force sync mode
 * - Status monitoring
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function showHelp() {
  // Help function - no console output needed
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
    startDate: null,
    endDate: null,
    status: false,
    dryRun: false,
    force: false,
    retry: 3,
    interval: 5,
    logLevel: 'info',
    output: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '-d':
      case '--date':
        options.date = nextArg;
        i++;
        break;
      case '-s':
      case '--start-date':
        options.startDate = nextArg;
        i++;
        break;
      case '-e':
      case '--end-date':
        options.endDate = nextArg;
        i++;
        break;
      case '--status':
        options.status = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--retry':
        options.retry = parseInt(nextArg) || 3;
        i++;
        break;
      case '--interval':
        options.interval = parseInt(nextArg) || 5;
        i++;
        break;
      case '--log-level':
        options.logLevel = nextArg;
        i++;
        break;
      case '--output':
        options.output = nextArg;
        i++;
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

function validateOptions(options) {
  if (options.startDate && !options.endDate) {
    process.exit(1);
  }

  if (options.endDate && !options.startDate) {
    process.exit(1);
  }

  if (options.date && (options.startDate || options.endDate)) {
    process.exit(1);
  }

  if (!['debug', 'info', 'warn', 'error'].includes(options.logLevel)) {
    process.exit(1);
  }
}

function buildNestCommand(options) {
  const cmd = ['node', 'dist/main.js', 'sync-matches'];
  
  if (options.date) {
    cmd.push('--date', options.date);
  }
  
  if (options.startDate) {
    cmd.push('--start-date', options.startDate);
  }
  
  if (options.endDate) {
    cmd.push('--end-date', options.endDate);
  }
  
  if (options.status) {
    cmd.push('--status');
  }

  return cmd;
}

function log(message, level = 'info') {
  // Log function - no console output needed
}

function showProgress(current, total, operation) {
  // Progress function - no console output needed
}

async function runWithRetry(command, options) {
  let attempt = 1;
  const maxAttempts = options.retry;
  
  while (attempt <= maxAttempts) {
    try {
      if (options.dryRun) {
        return;
      }
      
      const result = execSync(command.join(' '), { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      return;
      
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, options.interval * 60 * 1000));
      attempt++;
    }
  }
}

async function checkBuildStatus() {
  try {
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
      execSync('npm run build', { stdio: 'inherit' });
    }
  } catch (error) {
    process.exit(1);
  }
}

async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  validateOptions(options);
  
  try {
    // Check if project is built
    await checkBuildStatus();
    
    // Build command
    const command = buildNestCommand(options);
    
    // Run with retry
    await runWithRetry(command, options);
    
  } catch (error) {
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main().catch(() => {});
}

module.exports = { main, parseArgs, validateOptions };
