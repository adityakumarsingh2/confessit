const { spawn } = require('child_process');
const fs = require('fs');

const logFile = fs.createWriteStream('server_output.log', { flags: 'a' });

const server = spawn('node', ['server.js'], {
    stdio: ['inherit', 'pipe', 'pipe']
});

server.stdout.pipe(logFile);
server.stderr.pipe(logFile);

server.stdout.on('data', (data) => {
    process.stdout.write(data);
});

server.stderr.on('data', (data) => {
    process.stderr.write(data);
});

console.log('Server wrapper started. Logs are being written to server_output.log');
