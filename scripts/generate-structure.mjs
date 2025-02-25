import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enhanced directory list based on our project structure
const dirs = [
  '.',                    // full_tree
  './src',               // src_tree
  './docs',              // docs_tree
  './.github',           // github_tree
  './.cursor',           // cursor_tree
  './public',            // public_tree
  './src/app',           // app_router_tree
  './src/components',    // components_tree
  './src/lib',           // lib_tree
  './src/store',         // store_tree
  './src/types',         // types_tree
  './src/styles',        // styles_tree
  './src/hooks',         // hooks_tree
  './docs/development',  // development_docs_tree
  './docs/architecture', // architecture_docs_tree
  './docs/planning'      // planning_docs_tree
];

// Additional file patterns to include
const includePatterns = [
  '*.ts',
  '*.tsx',
  '*.js',
  '*.jsx',
  '*.json',
  '*.md',
  '*.mdx',
  '*.css',
  '*.scss',
  '*.yaml',
  '*.yml'
];

// Enhanced ignore patterns
const ignorePatterns = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'coverage',
  '.vercel',
  '.env*',
  '*.log'
].join('|');

async function generateTree(dir) {
  if (!existsSync(dir)) {
    console.warn(`⚠️ Directory ${dir} does not exist, skipping...`);
    return false;
  }

  try {
    const output = execSync(
      `tree ${dir} -I '${ignorePatterns}' --dirsfirst -a -F`,
      { maxBuffer: 5 * 1024 * 1024 }
    ).toString();
    
    // Ensure lowercase filename (except for README)
    const filename = basename(dir)
      .toLowerCase()
      .replace(/\./g, '')
      || 'full';
    
    const outputDir = join(__dirname, '../docs/project-structure');
    mkdirSync(outputDir, { recursive: true });
    
    // Ensure tree filename is lowercase
    const treeName = filename === 'readme' ? 'README' : `${filename}_tree`;
    
    const content = `# ${filename} Directory Structure
Generated: ${new Date().toISOString()}

\`\`\`
${output}
\`\`\`

## File Types
${includePatterns.map(pattern => `- ${pattern}`).join('\n')}

## Ignored Patterns
${ignorePatterns.split('|').map(pattern => `- ${pattern}`).join('\n')}
`;

    writeFileSync(
      join(outputDir, `${treeName}.md`),
      content,
      'utf8'
    );
    
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${dir}:`, error.message);
    return false;
  }
}

// Enhanced index generation
function generateIndex(successfulDirs) {
  const content = `# Project Structure Documentation

Generated on: ${new Date().toISOString()}

## Directory Trees
${successfulDirs.map(dir => {
  const name = basename(dir).toLowerCase().replace(/\./g, '') || 'full';
  // Ensure tree links are lowercase
  return `- [${name}](${name}_tree.md)`;
}).join('\n')}

## Important Paths
- \`src/app\`: Next.js 14 App Router pages
- \`src/components\`: React components (Atomic Design)
- \`src/lib\`: Utility functions and configurations
- \`src/store\`: Zustand store slices
- \`src/types\`: TypeScript type definitions
- \`src/hooks\`: Custom React hooks
- \`docs/development\`: Development documentation
- \`docs/architecture\`: Architecture documentation
- \`docs/planning\`: Project planning documents

## File Type Coverage
${includePatterns.map(pattern => `- ${pattern}`).join('\n')}

## Generation Script
\`\`\`bash
npm run generate:structure
\`\`\`
`;

  writeFileSync(
    join(__dirname, '../docs/project-structure/README.md'),
    content,
    'utf8'
  );
}

// Error handling wrapper
async function main() {
  try {
    const results = await Promise.all(
      dirs.map(async (dir) => {
        const success = await generateTree(dir);
        if (success) {
          console.log(`✅ Generated tree for ${dir}`);
        }
        return { dir, success };
      })
    );

    // Generate index only for successful directories
    const successfulDirs = results
      .filter(r => r.success)
      .map(r => r.dir);
    
    generateIndex(successfulDirs);
    console.log('✅ Generated index file');
    
    // Report any failures
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('\n⚠️ Failed to generate trees for:');
      failures.forEach(f => console.log(`- ${f.dir}`));
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main(); 