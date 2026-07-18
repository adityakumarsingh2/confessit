const http = require('http');
const fs = require('fs');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/auth/google',
    method: 'GET'
};

const req = http.request(options, (res) => {
    const location = res.headers.location;
    fs.writeFileSync('redirect_check.log', `Location: ${location}\nCode: ${res.statusCode}`);
    console.log('Location:', location);
});

req.on('error', (e) => {
    fs.writeFileSync('redirect_check.log', `Error: ${e.message}`);
    console.error(`problem with request: ${e.message}`);
});

req.end();
