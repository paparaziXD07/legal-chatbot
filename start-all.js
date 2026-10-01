const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('============================================================');
console.log('🚀 Starting Legel-Chatbot Backend & React Frontend');
console.log('============================================================\n');

// 1. Backend process (Express Server on Port 5000)
const backendScript = fs.existsSync(path.join(__dirname, 'src', 'backend', 'server.js'))
  ? path.join(__dirname, 'src', 'backend', 'server.js')
  : path.join(__dirname, 'backend', 'server.js');
const backendEnv = { ...process.env, PORT: '5000' };
const backend = spawn(process.execPath, [backendScript], {
  stdio: 'inherit',
  env: backendEnv
});

// 2. Frontend process (React App on Port 3000)
let reactScriptsPath;
try {
  reactScriptsPath = require.resolve('react-scripts/bin/react-scripts.js');
} catch (e) {
  reactScriptsPath = path.join(__dirname, 'node_modules', 'react-scripts', 'bin', 'react-scripts.js');
}
const frontendEnv = { ...process.env, PORT: '3000' };
const frontend = spawn(process.execPath, [reactScriptsPath, 'start'], {
  stdio: 'inherit',
  env: frontendEnv
});

backend.on('error', (err) => {
  console.error('❌ Backend process error:', err.message);
});

frontend.on('error', (err) => {
  console.error('❌ Frontend process error:', err.message);
});

// Handle termination signals
process.on('SIGINT', () => {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit();
});
