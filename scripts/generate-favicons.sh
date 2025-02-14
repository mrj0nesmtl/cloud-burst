#!/bin/bash

# Clean up old files
rm -f public/favicon*.png public/android-chrome*.png public/apple-touch-icon.png public/favicon.ico public/icon.svg

# Ensure the public directory exists
mkdir -p public

# Use cloud-lightning.svg as source
SOURCE_FILE="public/cloud-lightning.svg"

# Convert SVG to various PNG sizes with transparency
convert "${SOURCE_FILE}" -background none -gravity center -resize 16x16 public/favicon-16x16.png
convert "${SOURCE_FILE}" -background none -gravity center -resize 32x32 public/favicon-32x32.png
convert "${SOURCE_FILE}" -background none -gravity center -resize 180x180 public/apple-touch-icon.png
convert "${SOURCE_FILE}" -background none -gravity center -resize 192x192 public/android-chrome-192x192.png
convert "${SOURCE_FILE}" -background none -gravity center -resize 512x512 public/android-chrome-512x512.png

# Create favicon.ico (multi-size)
convert "${SOURCE_FILE}" -background none -gravity center -resize 16x16 favicon-16.png
convert "${SOURCE_FILE}" -background none -gravity center -resize 32x32 favicon-32.png
convert favicon-16.png favicon-32.png public/favicon.ico
rm favicon-16.png favicon-32.png

# Create web manifest
cat > public/site.webmanifest << EOF
{
  "name": "Cloud Capture",
  "short_name": "Cloud Capture",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#2563EB",
  "background_color": "#ffffff",
  "display": "standalone"
}
EOF 