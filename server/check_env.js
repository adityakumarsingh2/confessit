require('dotenv').config();
const fs = require('fs');
const log = `CALLBACK_URL: ${process.env.CALLBACK_URL}\nPORT: ${process.env.PORT}\nCLIENT_ORIGIN: ${process.env.CLIENT_ORIGIN}`;
fs.writeFileSync('diag.log', log);
console.log('Diagnostic info written to diag.log');
