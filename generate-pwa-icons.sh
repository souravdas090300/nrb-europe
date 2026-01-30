#!/bin/bash
# PWA Icon Generator Script
# This script generates all required PWA icons from a single source image

# Requirements:
# - ImageMagick installed (brew install imagemagick on macOS)
# - Source image: public/icon-source.png (should be 1024x1024 minimum)

echo "🎨 Generating PWA icons..."

# Create icons directory if it doesn't exist
mkdir -p public

# Icon sizes for PWA
declare -a sizes=("72" "96" "128" "144" "152" "192" "384" "512")

for size in "${sizes[@]}"
do
  echo "Generating ${size}x${size} icon..."
  convert public/icon-source.png -resize ${size}x${size} public/icon-${size}x${size}.png
done

# Generate badge icon (smaller, for notifications)
echo "Generating badge icon..."
convert public/icon-source.png -resize 72x72 public/badge-72x72.png

# Generate Apple Touch Icon
echo "Generating Apple Touch Icon..."
convert public/icon-source.png -resize 180x180 public/apple-touch-icon.png

# Generate Favicon
echo "Generating favicon..."
convert public/icon-source.png -resize 32x32 public/favicon.ico

echo "✅ All PWA icons generated successfully!"
echo ""
echo "📝 Manual Steps:"
echo "1. Place your 1024x1024 source image at: public/icon-source.png"
echo "2. Run: chmod +x generate-pwa-icons.sh"
echo "3. Run: ./generate-pwa-icons.sh"
echo "4. Optionally create screenshots:"
echo "   - public/screenshot-wide.png (1280x720)"
echo "   - public/screenshot-narrow.png (750x1334)"
