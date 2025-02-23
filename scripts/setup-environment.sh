#!/bin/bash

# Environment Setup Script
# Version: 0.1.14
# Usage: ./setup-environment.sh [local|replit]

ENV_TYPE=$1

if [ "$ENV_TYPE" = "local" ]; then
    echo "🔧 Setting up local development environment..."
    
    # Local development configuration
    cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=your_local_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
EOL

    # Local development commands
    echo "✨ Local environment setup complete!"
    echo "📝 Next steps:"
    echo "1. Update .env.local with your Supabase credentials"
    echo "2. Run: npm install"
    echo "3. Start dev server: npm run dev"

elif [ "$ENV_TYPE" = "replit" ]; then
    echo "🚀 Setting up Replit production environment..."
    
    # Create .replit configuration
    cat > .replit << EOL
run = "npm run start"
hidden = [".build", ".config", ".next", "node_modules"]

[env]
NODE_ENV = "production"
NEXT_TELEMETRY_DISABLED = "1"

[nix]
channel = "stable-22_11"

[packager]
language = "nodejs"

[packager.features]
packageSearch = true
guessImports = true

[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx}"

[languages.javascript.languageServer]
start = "typescript-language-server --stdio"

[deployment]
build = ["sh", "-c", "npm run build"]
run = ["sh", "-c", "npm run start"]
deploymentTarget = "cloudrun"
EOL

    # Create replit.nix with updated dependencies
    cat > replit.nix << EOL
{ pkgs }: {
    deps = [
        pkgs.nodejs-20_x
        pkgs.nodePackages.typescript-language-server
        pkgs.yarn
        pkgs.replitPackages.jest
        pkgs.python3
        pkgs.gcc
        pkgs.git
    ];
}
EOL

    echo "✨ Replit configuration complete!"
    echo "📝 Next steps:"
    echo "1. Add the following secrets in Replit:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - NEXT_PUBLIC_SITE_URL (https://cloudburst-beta.replit.app)"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "2. Run: npm install"
    echo "3. Run: npm run build"
fi 