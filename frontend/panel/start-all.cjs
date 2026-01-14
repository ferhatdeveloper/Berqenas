const { spawn } = require('child_process');
const fs = require('fs');

function run(cmd, args, cwd, logFile) {
  const out = fs.openSync(logFile, 'a');
  const err = fs.openSync(logFile, 'a');
  const proc = spawn(cmd, args, { cwd, stdio: ['ignore', out, err], shell: true });
  proc.on('close', code => {
    if (code !== 0) fs.appendFileSync(logFile, `${cmd} exited with code ${code}\n`);
  });
}

// Go backend
run('go', ['run', 'main.go'], './backend/go', './go-backend.log');

// Node.js backend
run('npm', ['install'], './backend/node', './node-backend.log');
run('node', ['app.js'], './backend/node', './node-backend.log');

// Frontend
run('npm', ['install'], './src', './frontend.log');
run('npm', ['run', 'dev'], './src', './frontend.log');

console.log('Tüm servisler başlatıldı. Loglar: go-backend.log, node-backend.log, frontend.log'); 