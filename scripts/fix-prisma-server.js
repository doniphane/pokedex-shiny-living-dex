#!/usr/bin/env node

/**
 * Script pour résoudre les problèmes Prisma sur serveur de production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Prisma server deployment issues...');

// 1. Vérifier l'existence du schéma Prisma
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
    console.error('❌ Prisma schema not found at:', schemaPath);
    process.exit(1);
}

console.log('✅ Prisma schema found');

// 2. Générer le client Prisma avec options complètes
try {
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate --schema=./prisma/schema.prisma', {
        stdio: 'inherit',
        env: {
            ...process.env,
            PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true'
        }
    });
    console.log('✅ Prisma client generated successfully');
} catch (error) {
    console.error('❌ Failed to generate Prisma client:', error.message);
    process.exit(1);
}

// 3. Vérifier que les fichiers sont bien générés
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
    console.error('❌ Prisma client files not found after generation');
    process.exit(1);
}

console.log('✅ Prisma client files verified');

// 4. Créer un lien symbolique si nécessaire (pour certains serveurs)
const alternativePath = path.join(process.cwd(), 'node_modules', '@prisma', 'client', 'default.js');
if (!fs.existsSync(alternativePath)) {
    console.log('⚠️ Alternative Prisma path not found, this might cause issues on some servers');
}

console.log('🎉 Prisma configuration fixed for server deployment!');
console.log('💡 You can now run: npm run build');