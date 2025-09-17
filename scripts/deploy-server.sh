#!/bin/bash

# Script de déploiement pour serveur avec problèmes Prisma
echo "🚀 Starting server deployment process..."

# 1. Vérifier que Prisma est installé
echo "📦 Checking Prisma installation..."
if ! command -v prisma &> /dev/null; then
    echo "❌ Prisma CLI not found. Installing..."
    npm install -g prisma
fi

# 2. Nettoyer les anciens fichiers générés
echo "🧹 Cleaning old generated files..."
rm -rf node_modules/.prisma
rm -rf .next

# 3. Réinstaller les dépendances
echo "📥 Reinstalling dependencies..."
npm ci

# 4. Générer explicitement le client Prisma
echo "⚙️ Generating Prisma client..."
npx prisma generate

# 5. Vérifier que les fichiers sont bien générés
echo "🔍 Verifying Prisma client generation..."
if [ ! -d "node_modules/.prisma/client" ]; then
    echo "❌ Prisma client not properly generated!"
    exit 1
fi

echo "✅ Prisma client generated successfully!"

# 6. Build l'application
echo "🏗️ Building application..."
npm run build

# 7. Vérifier le build
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🎉 Deployment ready!"
else
    echo "❌ Build failed!"
    exit 1
fi