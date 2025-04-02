import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enhanced directory list with specific focus on gallery and protected routes
const dirs = [
  '.',                                // full_tree
  './src',                            // src_tree
  './docs',                           // docs_tree
  './.github',                        // github_tree
  './.cursor',                        // cursor_tree
  './public',                         // public_tree
  './src/app',                        // app_router_tree
  './src/app/protected',              // protected_routes_tree
  './src/app/protected/gallery',      // protected_gallery_tree
  './src/app/protected/events',       // protected_events_tree
  './src/app/protected/dashboard',    // protected_dashboard_tree
  './src/app/auth',                   // auth_tree
  './src/app/events',                 // public_events_tree
  './src/app/scan',                   // qr_scan_page_tree
  './src/app/invitation',             // invitation_tree
  './src/app/api/invitation',         // invitation_api_tree
  './src/components',                 // components_tree
  './src/components/gallery',         // gallery_components_tree
  './src/components/events',          // event_components_tree
  './src/components/ui',              // ui_components_tree
  './src/components/auth',            // auth_components_tree
  './src/components/dashboard',       // dashboard_components_tree
  './src/components/invitation',      // invitation_components_tree
  './src/components/camera',          // camera_components_tree
  './src/lib',                        // lib_tree
  './src/lib/supabase',               // supabase_tree
  './src/lib/utils',                  // utils_tree
  './src/store',                      // store_tree
  './src/types',                      // types_tree
  './src/styles',                     // styles_tree
  './src/hooks',                      // hooks_tree
  './docs/development',               // development_docs_tree
  './docs/architecture',              // architecture_docs_tree
  './docs/planning'                   // planning_docs_tree
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

// Add file count and file type breakdown
async function generateTree(dir) {
  if (!existsSync(dir)) {
    console.warn(`⚠️ Directory ${dir} does not exist, skipping...`);
    return false;
  }

  try {
    // Basic tree
    const output = execSync(
      `tree ${dir} -I '${ignorePatterns}' --dirsfirst -a -F`,
      { maxBuffer: 5 * 1024 * 1024 }
    ).toString();
    
    // Get file type statistics
    const fileStats = {};
    includePatterns.forEach(pattern => {
      try {
        const fileType = pattern.replace('*', '').replace('.', '');
        const count = execSync(
          `find ${dir} -type f -name "${pattern}" | wc -l`,
          { maxBuffer: 1024 * 1024 }
        ).toString().trim();
        fileStats[fileType] = parseInt(count);
      } catch (e) {
        // Ignore errors for specific file types
        fileStats[pattern.replace('*', '').replace('.', '')] = 0;
      }
    });
    
    // Calculate component count for component directories
    let componentCount = 0;
    if (dir.includes('/components')) {
      try {
        componentCount = parseInt(
          execSync(
            `find ${dir} -type f -name "*.tsx" | grep -v "index.tsx" | wc -l`,
            { maxBuffer: 1024 * 1024 }
          ).toString().trim()
        );
      } catch (e) {
        componentCount = 0;
      }
    }
    
    // Calculate route count for app directories
    let routeCount = 0;
    if (dir.includes('/app')) {
      try {
        routeCount = parseInt(
          execSync(
            `find ${dir} -type f -name "page.tsx" | wc -l`,
            { maxBuffer: 1024 * 1024 }
          ).toString().trim()
        );
      } catch (e) {
        routeCount = 0;
      }
    }
    
    // Calculate QR/Scanning related files
    let qrScanCount = 0;
    if (dir.includes('/hooks') || dir.includes('/components/invitation') || dir.includes('/components/camera') || dir.includes('/app/scan') || dir.includes('/lib/utils')) {
      try {
        qrScanCount = parseInt(
          execSync(
            `find ${dir} -type f -name "*.ts*" | grep -E 'camera|qr|scan' | wc -l`,
            { maxBuffer: 1024 * 1024 }
          ).toString().trim()
        );
      } catch (e) {
        qrScanCount = 0;
      }
    }
    
    // Ensure lowercase filename (except for README)
    const filename = basename(dir)
      .toLowerCase()
      .replace(/\./g, '')
      || 'full';
    
    const outputDir = join(__dirname, '../docs/project-structure');
    mkdirSync(outputDir, { recursive: true });
    
    // Ensure tree filename is lowercase
    const treeName = filename === 'readme' ? 'README' : `${filename}_tree`;
    
    // Build enhanced content
    let content = `# ${filename} Directory Structure
Generated: ${new Date().toISOString()}

## Overview
${dir.includes('/components') ? `This directory contains ${componentCount} component(s).` : ''}
${dir.includes('/app') ? `This directory contains ${routeCount} route(s).` : ''}
${qrScanCount > 0 ? `This directory contains ${qrScanCount} QR/Camera scanning related file(s).` : ''}

## Directory Tree
\`\`\`
${output}
\`\`\`

## File Type Breakdown
${Object.entries(fileStats)
  .filter(([_, count]) => count > 0)
  .map(([type, count]) => `- ${type}: ${count} file(s)`)
  .join('\n')
}

## Ignored Patterns
${ignorePatterns.split('|').map(pattern => `- ${pattern}`).join('\n')}
`;

    // Add special sections based on directory type
    if (dir.includes('/gallery')) {
      content += `
## Gallery Components
This directory contains components related to the photo gallery system, including:
- Gallery grid layouts
- Photo card components 
- Gallery navigation
- Upload interfaces
- Photo viewing components
`;
    } else if (dir.includes('/protected')) {
      content += `
## Protected Routes
This directory contains authenticated routes that require user login, including:
- Dashboard views
- User management interfaces
- Event management for organizers
- Photo management interfaces
`;
    } else if (dir.includes('/events')) {
      content += `
## Event Components
This directory contains components related to event management, including:
- Event cards
- Event details views
- Event creation interfaces
- Attendee management
`;
    } else if (dir.includes('/camera') || dir.includes('/hooks') && qrScanCount > 0 || dir.includes('/scan') || (dir.includes('/invitation') && qrScanCount > 0)) {
      content += `
## QR Scanning Components
This directory contains components related to QR code scanning and camera functionality, including:
- Camera access hooks and utilities
- QR code scanner components
- Scanner overlay and visual feedback
- Permission handling
- QR code generation and validation utilities
- QR scanning page and navigation
`;
    }

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

// Enhanced index generation with grouped links
function generateIndex(successfulDirs) {
  // Group directories by type
  const groups = {
    'Core Project': ['full', 'src', 'docs', 'public', 'github', 'cursor'],
    'App Routes': successfulDirs
      .filter(dir => dir.includes('/app'))
      .map(dir => basename(dir).toLowerCase().replace(/\./g, '') || 'app'),
    'Protected Routes': successfulDirs
      .filter(dir => dir.includes('/protected'))
      .map(dir => {
        const parts = dir.split('/');
        return parts[parts.length-1].toLowerCase() || 'protected';
      }),
    'Components': successfulDirs
      .filter(dir => dir.includes('/components'))
      .map(dir => {
        const parts = dir.split('/');
        return parts[parts.length-1].toLowerCase() || 'components';
      }),
    'Utilities & Configuration': successfulDirs
      .filter(dir => dir.includes('/lib') || dir.includes('/store') || 
                    dir.includes('/types') || dir.includes('/hooks') || 
                    dir.includes('/styles'))
      .map(dir => {
        const parts = dir.split('/');
        return parts[parts.length-1].toLowerCase() || parts[parts.length-2].toLowerCase();
      }),
    'Documentation': successfulDirs
      .filter(dir => dir.includes('/docs/'))
      .map(dir => {
        const parts = dir.split('/');
        return parts[parts.length-1].toLowerCase() || 'documentation';
      }),
    'QR/Camera Features': successfulDirs
      .filter(dir => 
        dir.includes('/hooks') || 
        dir.includes('/scan') || 
        dir.includes('/camera') || 
        (dir.includes('/invitation') && !dir.includes('/api')) ||
        (dir.includes('/utils'))
      )
      .map(dir => {
        const parts = dir.split('/');
        return parts[parts.length-1].toLowerCase() || parts[parts.length-2].toLowerCase();
      })
  };

  // Create grouped content
  const content = `# Cloud Burst Project Structure Documentation

Generated on: ${new Date().toISOString()}

${Object.entries(groups).map(([groupName, items]) => `
## ${groupName}
${items.map(item => {
  // Normalize the path for linking
  const linkPath = item.includes('_') ? item : `${item}_tree`;
  return `- [${item}](${linkPath}.md)`;
}).join('\n')}
`).join('\n')}

## Important Project Paths
- \`src/app\`: Next.js 14 App Router pages and routes
- \`src/app/protected\`: Authenticated routes requiring login
- \`src/components/gallery\`: Gallery system components
- \`src/components/events\`: Event management components
- \`src/lib/supabase\`: Supabase integration and data access
- \`src/store\`: Zustand state management
- \`src/hooks\`: Custom React hooks
- \`src/hooks/useCamera.ts\`: Camera access hook
- \`src/hooks/useQrScanner.ts\`: QR code scanning hook
- \`src/lib/utils/qr-utils.ts\`: QR code utilities
- \`src/components/invitation/qr-scanner.tsx\`: QR scanner component
- \`src/app/scan\`: QR code scanning page

## File Type Coverage
${includePatterns.map(pattern => `- ${pattern}`).join('\n')}

## Generation Script
\`\`\`bash
npm run generate:structure
\`\`\`

## Navigation Tips
- Browse components by functional area (gallery, events, auth)
- Explore protected routes to understand user workflows
- Review utility libraries in the lib section
- Examine QR and camera features in the dedicated section
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
    console.log("🌳 Generating Cloud Burst project structure documentation...");
    
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
    console.log('✅ Generated index file with enhanced grouping');
    
    // Report any failures
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('\n⚠️ Failed to generate trees for:');
      failures.forEach(f => console.log(`- ${f.dir}`));
    } else {
      console.log('\n🎉 All directory trees successfully generated!');
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main(); 