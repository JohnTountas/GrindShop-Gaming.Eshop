/**
 * Legacy JavaScript entry point that delegates to the TypeScript seeder.
 */
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const scriptPath = path.resolve(__dirname, 'database.ts');
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const result = spawnSync(npxCommand, ['tsx', scriptPath], {
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  console.error('Failed to execute TypeScript database script:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
