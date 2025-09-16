const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Configuration du projet Pokédex avec MySQL...\n');

// Vérifier si .env existe
if (!fs.existsSync('.env')) {
  console.log('❌ Fichier .env manquant !');
  console.log('📝 Copiez .env.example vers .env et configurez votre base de données MySQL');
  process.exit(1);
}

try {
  console.log('📦 Installation des dépendances...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔧 Génération du client Prisma...');
  execSync('npm run db:generate', { stdio: 'inherit' });

  console.log('🗄️  Création des tables dans la base de données...');
  execSync('npm run db:push', { stdio: 'inherit' });

  console.log('✅ Configuration terminée !');
  console.log('🌟 Vous pouvez maintenant démarrer le projet avec : npm run dev');
  
} catch (error) {
  console.log('❌ Erreur lors de la configuration :', error.message);
  console.log('📖 Consultez DATABASE_SETUP.md pour plus de détails');
}