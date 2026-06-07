const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:/Users/chesh/OneDrive/Desktop/attendence project/frontend/src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Handle backticks: `http://localhost:8080/api/...` -> `${import.meta.env.VITE_API_URL}/api/...`
    content = content.replace(/`http:\/\/localhost:8080/g, '`${import.meta.env.VITE_API_URL}');
    
    // Handle single/double quotes: 'http://localhost:8080/api/...' -> import.meta.env.VITE_API_URL + '/api/...'
    content = content.replace(/['"]http:\/\/localhost:8080([^'"]*)['"]/g, "import.meta.env.VITE_API_URL + '$1'");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
