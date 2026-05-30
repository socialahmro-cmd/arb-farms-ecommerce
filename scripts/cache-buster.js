const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectRoot = path.join(__dirname, '..');

// Helper to recursively get all HTML files
function getHtmlFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === '.vercel') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getHtmlFiles(filePath, files);
    } else if (filePath.endsWith('.html')) {
      files.push(filePath);
    }
  }
  return files;
}

// Helper to compute MD5 hash of file content (8 chars)
function getFileHash(relPath) {
  const filePath = path.join(projectRoot, relPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARNING] File not found: ${filePath}`);
    return '';
  }
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

// Compute hashes for our assets
const cssHash = getFileHash('css/index.css');
const mainJsHash = getFileHash('js/main.js');
const fomoJsHash = getFileHash('js/fomo.js');
const dbJsHash = getFileHash('js/products-db.js');

console.log('--- COMPLETED FILE HASHING ---');
console.log(`css/index.css     -> ${cssHash}`);
console.log(`js/main.js        -> ${mainJsHash}`);
console.log(`js/fomo.js        -> ${fomoJsHash}`);
console.log(`js/products-db.js -> ${dbJsHash}`);
console.log('-------------------------------\n');

// Find all HTML files
const htmlFiles = getHtmlFiles(projectRoot);

// Regex patterns to capture the asset paths (handling potential relative directory prefixes)
const cssRegex = /(href=["'](?:\.\.\/)*css\/index\.css)(?:\?v=[a-f0-9]+)?(["'])/gi;
const mainJsRegex = /(src=["'](?:\.\.\/)*js\/main\.js)(?:\?v=[a-f0-9]+)?(["'])/gi;
const fomoJsRegex = /(src=["'](?:\.\.\/)*js\/fomo\.js)(?:\?v=[a-f0-9]+)?(["'])/gi;
const dbJsRegex = /(src=["'](?:\.\.\/)*js\/products-db\.js)(?:\?v=[a-f0-9]+)?(["'])/gi;

let updatedCount = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  if (cssHash) content = content.replace(cssRegex, `$1?v=${cssHash}$2`);
  if (mainJsHash) content = content.replace(mainJsRegex, `$1?v=${mainJsHash}$2`);
  if (fomoJsHash) content = content.replace(fomoJsRegex, `$1?v=${fomoJsHash}$2`);
  if (dbJsHash) content = content.replace(dbJsRegex, `$1?v=${dbJsHash}$2`);

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    const relativePath = path.relative(projectRoot, file);
    console.log(`[UPDATED] ${relativePath}`);
    updatedCount++;
  }
}

console.log(`\nSuccessfully cache-busted ${updatedCount} HTML files!`);

// Generate and write version.json to root folder
const versionData = { version: Date.now().toString() };
fs.writeFileSync(path.join(projectRoot, 'version.json'), JSON.stringify(versionData, null, 2), 'utf8');
console.log(`Generated version.json with version: ${versionData.version}`);

