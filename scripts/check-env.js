#!/usr/bin/env node

console.log('=== Environment Check ===');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATA_DIRECTORY:', process.env.DATA_DIRECTORY);
console.log('PORT:', process.env.PORT);

// Check if required commands exist
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkCommand(command) {
  try {
    const { stdout } = await execAsync(`which ${command}`);
    console.log(`✅ ${command}: ${stdout.trim()}`);
    return true;
  } catch (error) {
    console.log(`❌ ${command}: not found`);
    return false;
  }
}

async function main() {
  await checkCommand('node');
  await checkCommand('npm');
  
  // Check if we can create directories
  try {
    const fs = await import('fs');
    const testDir = './test-permissions';
    fs.mkdirSync(testDir, { recursive: true });
    fs.rmSync(testDir, { recursive: true });
    console.log('✅ File system permissions: OK');
  } catch (error) {
    console.log('❌ File system permissions: Failed', error.message);
  }
  
  console.log('=== Check Complete ===');
}

main().catch(console.error);
