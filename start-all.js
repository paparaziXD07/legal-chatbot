const { spawn } = require('child_process');
const path = require('path');

console.log('============================================================');
console.log('🚀 Starting Legel-Chatbot Backend & React Frontend');
console.log('============================================================\n');

// 0. Python FastAPI Server on Port 8000 (if installed)
const fs = require('fs');
const pythonExe = path.join(__dirname, 'src', 'backend_python', '.venv', 'Scripts', 'python.exe');
let fastapi = null;
if (fs.existsSync(pythonExe)) {
  console.log('⚡ Starting Python FastAPI Backend on Port 8000...');
  fastapi = spawn(pythonExe, [
    '-m', 'uvicorn', 'main:app',
    '--app-dir', path.join('src', 'backend_python'),
    '--host', '0.0.0.0',
    '--port', '8000'
  ], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '8000', PYTHONIOENCODING: 'utf-8' }
  });
  fastapi.on('error', (err) => {
    console.warn('⚠️ FastAPI process error:', err.message);
  });
}

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
  if (fastapi) fastapi.kill('SIGINT');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  if (fastapi) fastapi.kill('SIGTERM');
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit();
});
