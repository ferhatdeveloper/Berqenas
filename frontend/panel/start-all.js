const { spawn } = require('child_process');

function run(cmd, args, cwd) {
  const proc = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });
  proc.on('close', code => {
    if (code !== 0) console.error(`${cmd} exited with code ${code}`);
  });
}

// Go backend
run('go', ['run', 'main.go'], './backend/go');

// Node.js backend
run('npm', ['install'], './backend/node');
run('node', ['app.js'], './backend/node');

// Frontend
run('npm', ['install'], '.');
run('npm', ['run', 'dev'], '.'); 