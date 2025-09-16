# 🚀 Guide de déploiement - Pokédex Shiny

## Architecture
- **Frontend/Backend**: Next.js sur Vercel
- **Base de données**: PostgreSQL sur serveur Docker

## 📋 Pré-requis

### Serveur PostgreSQL
1. Votre Docker PostgreSQL doit être accessible depuis Internet
2. Port 5432 ouvert dans le firewall
3. PostgreSQL configuré pour accepter les connexions externes

### Configuration PostgreSQL Docker
```bash
# Dans votre docker-compose.yml ou commande docker run
-p 5432:5432
-e POSTGRES_HOST_AUTH_METHOD=scram-sha-256
```

## 🔧 Déploiement sur Vercel

### 1. Connexion GitHub
```bash
# Créer un repo GitHub et push votre code
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/votre-username/pokedex-shiny.git
git push -u origin main
```

### 2. Configuration Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. Connecter votre compte GitHub
3. Importer votre repository
4. Configurer les variables d'environnement :

### Variables d'environnement Vercel
```
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@votre_ip_serveur:5432/pokedex_shiny
NEXTAUTH_SECRET=générer_une_clé_secrète_très_longue
NEXTAUTH_URL=https://votre-app.vercel.app
NEXT_TELEMETRY_DISABLED=1
```

### 3. Configuration réseau serveur
```bash
# Sur votre serveur, autoriser les connexions depuis Vercel
# Dans postgresql.conf
listen_addresses = '*'

# Dans pg_hba.conf (remplacer par IP Vercel si possible)
host all all 0.0.0.0/0 scram-sha-256
```

## 🧪 Test de connexion
```bash
# Tester depuis votre machine locale
psql -h votre_ip_serveur -U postgres -d pokedex_shiny
```

## 📊 Monitoring
- Logs Vercel : Dashboard Vercel > Functions
- Logs PostgreSQL : `docker logs votre_container_postgres`

## 🔒 Sécurité recommandée
1. Utiliser un utilisateur PostgreSQL dédié (pas postgres)
2. Configurer un VPN ou IP whitelisting si possible
3. SSL/TLS pour PostgreSQL
4. Variables d'environnement sécurisées sur Vercel

## 🚨 Troubleshooting
- **Erreur de connexion DB** : Vérifier firewall et pg_hba.conf
- **Build failed** : Vérifier variables d'environnement Vercel
- **API timeout** : Augmenter maxDuration dans vercel.json