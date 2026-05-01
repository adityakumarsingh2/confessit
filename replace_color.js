const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                replaceInDir(fullPath);
            }
        } else {
            if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes('131, 58, 180')) {
                    content = content.replace(/131,\s*58,\s*180/g, '59, 130, 246');
                    fs.writeFileSync(fullPath, content);
                    console.log(`Updated ${fullPath}`);
                }
            }
        }
    }
}

replaceInDir(path.join(__dirname, 'client', 'src'));
