const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
  let originalContent = fs.readFileSync(file, 'utf8');
  let content = originalContent;
  
  // Replace arbitrary prefixes with var(--name)
  content = content.replace(/(?<![\w-])([a-zA-Z0-9:-]+)-\[var\((--[a-zA-Z0-9-]+)\)\]/g, '$1-($2)');

  // flex-shrink-0 -> shrink-0
  content = content.replace(/(?<![\w-])flex-shrink-0(?![\w-])/g, 'shrink-0');
  
  // flex-[2] -> flex-2
  content = content.replace(/(?<![\w-])flex-\[2\]/g, 'flex-2');
  
  // Negative arbitrary values e.g. -left-[21px] -> left-[-21px]
  content = content.replace(/(?<![\w-])-([a-z]+)-\[([^\]]+)\]/g, '$1-[-$2]');
  
  // z-[400] -> z-400
  content = content.replace(/(?<![\w-])z-\[400\]/g, 'z-400');
  
  // rounded-[var(--radius-sm)] -> rounded-sm
  content = content.replace(/(?<![\w-])rounded-\(--radius-sm\)/g, 'rounded-sm');
  content = content.replace(/(?<![\w-])rounded-\[var\(--radius-sm\)\]/g, 'rounded-sm'); 
  
  // border-[oklch...] fix
  content = content.replace(/border-\[oklch\(from_var\(--danger\)_l_c_h_\/_0\.2\)\]/g, 'border-[oklch(from_var(--danger)_l_c_h/0.2)]');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Fixed', file);
  }
});
console.log('Total files fixed:', changedFiles);
