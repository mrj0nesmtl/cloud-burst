import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dirs = [
  '.',            // full_tree
  './src',        // src_tree
  './docs',       // docs_tree
  './.github',    // github_tree
  './.cursor',    // cursor_tree
  './public'      // public_tree
];

function generateTree(dir) {
  const output = execSync(`tree ${dir} -I 'node_modules|.git|.next|dist'`).toString();
  const filename = basename(dir).toLowerCase().replace(/\./g, '') || 'full';
  
  // Ensure directory exists
  mkdirSync('docs/project-structure', { recursive: true });
  
  writeFileSync(
    `docs/project-structure/${filename}_tree.md`,
    `# ${filename} Directory Structure\n\n\`\`\`\n${output}\n\`\`\``,
    'utf8'
  );
}

// Generate index file
function generateIndex() {
  const content = `# Project Structure Documentation

Generated on: ${new Date().toISOString()}

## Directory Trees
${dirs.map(dir => {
  const name = basename(dir).toLowerCase().replace(/\./g, '') || 'full';
  return `- [${name}](${name}_tree.md)`;
}).join('\n')}
`;

  writeFileSync('docs/project-structure/readme.md', content, 'utf8');
}

try {
  dirs.forEach(dir => {
    try {
      generateTree(dir);
      console.log(`✅ Generated tree for ${dir}`);
    } catch (error) {
      console.error(`❌ Error generating tree for ${dir}:`, error);
    }
  });
  
  generateIndex();
  console.log('✅ Generated index file');
} catch (error) {
  console.error('❌ Error:', error);
} 