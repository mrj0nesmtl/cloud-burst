import treeify from 'tree-cli';
import { promises as fs } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TreeConfig {
  path: string;
  output: string;
  ignore?: string[];
  maxDepth?: number;
}

const treeConfigs: TreeConfig[] = [
  {
    path: '.',
    output: 'docs/project-structure/FULL_TREE.md',
    ignore: [
      'node_modules',
      '.next',
      'dist',
      '.git',
      '*.log',
      'coverage'
    ],
    maxDepth: 4
  },
  {
    path: './src',
    output: 'docs/project-structure/SRC_TREE.md',
    maxDepth: 5
  },
  {
    path: './docs',
    output: 'docs/project-structure/DOCS_TREE.md',
    maxDepth: 3
  },
  {
    path: './.github',
    output: 'docs/project-structure/GITHUB_TREE.md',
    maxDepth: 3
  }
];

async function generateTree(config: TreeConfig): Promise<string> {
  const { path: treePath, ignore = [], maxDepth } = config;
  
  const options = {
    base: treePath,
    ignore: ignore,
    maxDepth: maxDepth || undefined,
    dirsFirst: true,
    exclude: [/node_modules/, /\.git/, /\.next/, /dist/],
  };

  try {
    const result = await treeify(options);
    // Convert the tree structure to a string representation
    return typeof result.data === 'string' 
      ? result.data 
      : JSON.stringify(result.data, null, 2);
  } catch (error) {
    console.error('Error generating tree:', error);
    throw error;
  }
}

async function writeTreeFile(tree: string, outputPath: string): Promise<void> {
  const content = `# Project Structure
Generated on: ${new Date().toISOString()}

\`\`\`
${tree}
\`\`\`
`;
  
  await fs.mkdir(dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, content, 'utf-8');
}

async function generateAllTrees(): Promise<void> {
  try {
    for (const config of treeConfigs) {
      console.log(`Generating tree for ${config.path}...`);
      const tree = await generateTree(config);
      await writeTreeFile(tree, config.output);
      console.log(`✅ Generated ${config.output}`);
    }
  } catch (error) {
    console.error('Error generating project structure:', error);
    process.exit(1);
  }
}

// Add script to package.json
async function updatePackageJson(): Promise<void> {
  const packageJsonPath = './package.json';
  const packageJson = JSON.parse(
    await fs.readFile(packageJsonPath, 'utf-8')
  );

  packageJson.scripts = {
    ...packageJson.scripts,
    'generate:structure': 'ts-node --esm scripts/generate-project-structure.ts'
  };

  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8'
  );
}

// Create index file for project structures
async function createStructureIndex(): Promise<void> {
  const indexContent = `# Project Structure Documentation

This directory contains automatically generated documentation of the project's directory structure.

## Available Structure Documents

- [Full Project Tree](./FULL_TREE.md) - Complete project structure
- [Source Code Tree](./SRC_TREE.md) - Structure of the \`src\` directory
- [Documentation Tree](./DOCS_TREE.md) - Structure of the \`docs\` directory
- [GitHub Configuration Tree](./GITHUB_TREE.md) - Structure of GitHub-related configurations

## Updating the Documentation

To update these structure documents, run:

\`\`\`bash
npm run generate:structure
\`\`\`

This will regenerate all structure documentation files with the current project state.

## Structure Generation Rules

- Full Tree: Max depth of 4 levels, excludes build artifacts and dependencies
- Source Tree: Max depth of 5 levels, focuses on application code
- Docs Tree: Max depth of 3 levels, shows documentation organization
- GitHub Tree: Max depth of 3 levels, shows GitHub-specific files

Last Updated: ${new Date().toISOString()}
`;

  await fs.writeFile(
    'docs/project-structure/README.md',
    indexContent,
    'utf-8'
  );
}

// Run everything
async function main(): Promise<void> {
  try {
    await updatePackageJson();
    await generateAllTrees();
    await createStructureIndex();
    console.log('✨ Project structure documentation updated successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();