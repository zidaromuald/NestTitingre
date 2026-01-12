# Guide de Déploiement Flutter Web sur Hostinger

## 📋 Vue d'ensemble

Ce guide explique comment déployer votre application Flutter Web sur Hostinger après avoir déployé votre backend NestJS.

---

## 🎯 Quelle méthode choisir?

### VPS Hostinger (Recommandé) ⭐

**Vous avez un VPS si:**
- Vous avez accès SSH à votre serveur
- Vous utilisez Nginx ou Apache directement
- Vous avez déjà déployé votre backend NestJS avec PM2
- Votre serveur est de type Ubuntu/Debian

**Avantages:**
- ✅ Meilleures performances
- ✅ Contrôle total du serveur
- ✅ Configuration Nginx optimisée
- ✅ SSL gratuit avec Let's Encrypt
- ✅ Déploiement automatisé avec rsync
- ✅ Logs détaillés

**Structure typique:**
```
VPS Hostinger
├── /var/www/monapp.com/          # Flutter Web (Frontend)
└── ~/apps/tata-api/               # NestJS API (Backend)
```

### Hébergement Partagé Hostinger

**Vous avez un hébergement partagé si:**
- Vous utilisez cPanel
- Pas d'accès SSH (ou limité)
- Vos fichiers sont dans `/public_html/`
- Interface web pour gérer les fichiers

**Avantages:**
- ✅ Simplicité d'utilisation
- ✅ Interface graphique (cPanel)
- ✅ Pas de gestion serveur
- ✅ Moins cher

**Limitations:**
- ⚠️ Moins de contrôle
- ⚠️ Performances limitées
- ⚠️ Configuration .htaccess (moins flexible que Nginx)

---

## 📊 Tableau Comparatif

| Fonctionnalité | VPS Hostinger | Hébergement Partagé |
|----------------|---------------|---------------------|
| Accès SSH | ✅ Oui | ❌ Non / Limité |
| Serveur Web | Nginx / Apache | Apache (.htaccess) |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Contrôle | Total | Limité |
| SSL Gratuit | ✅ Let's Encrypt | ✅ AutoSSL |
| Déploiement | rsync / Git | FTP / cPanel |
| Coût | Plus cher | Moins cher |
| Complexité | Moyenne | Faible |

**💡 Recommandation:** Si vous avez déjà un VPS pour votre backend NestJS, utilisez la **méthode VPS** pour votre frontend Flutter.

---

## 🎯 Étape 1: Configuration du Projet Flutter

### 1.1 Vérifier les prérequis

Dans votre projet Flutter, assurez-vous que:

```bash
# Vérifier que Flutter est installé
flutter --version

# Vérifier que le support web est activé
flutter config --enable-web
```

### 1.2 Configurer l'API Backend

Créez un fichier de configuration pour l'URL de l'API:

**lib/config/api_config.dart**
```dart
class ApiConfig {
  // URL de production (votre backend NestJS sur Hostinger)
  static const String productionApiUrl = 'https://votre-domaine.com/api';

  // URL de développement (local)
  static const String developmentApiUrl = 'http://localhost:3000/api';

  // Détection automatique de l'environnement
  static String get apiUrl {
    const bool isProduction = bool.fromEnvironment('dart.vm.product');
    return isProduction ? productionApiUrl : developmentApiUrl;
  }

  // Alternative: basé sur l'URL actuelle
  static String getApiUrlFromHost() {
    final currentHost = Uri.base.host;
    if (currentHost.contains('localhost') || currentHost.contains('127.0.0.1')) {
      return developmentApiUrl;
    }
    return productionApiUrl;
  }
}
```

### 1.3 Configurer CORS dans votre Backend NestJS

Dans votre fichier [src/main.ts](src/main.ts), vérifiez la configuration CORS:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://votre-domaine.com',
    'https://www.votre-domaine.com',
  ],
  credentials: true,
});
```

### 1.4 Modifier pubspec.yaml

Assurez-vous que votre `pubspec.yaml` contient:

```yaml
name: votre_app
description: Votre application Flutter

publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0  # ou dio pour les appels API
  # Vos autres dépendances...

flutter:
  uses-material-design: true

  # Assets (si vous en avez)
  assets:
    - assets/images/
    - assets/icons/
```

### 1.5 Configurer index.html

Modifiez `web/index.html` pour la production:

```html
<!DOCTYPE html>
<html>
<head>
  <base href="/">

  <meta charset="UTF-8">
  <meta content="IE=Edge" http-equiv="X-UA-Compatible">
  <meta name="description" content="Votre description">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Votre Application</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="favicon.png"/>

  <!-- PWA -->
  <link rel="manifest" href="manifest.json">

  <!-- iOS -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="Votre App">
  <link rel="apple-touch-icon" href="icons/Icon-192.png">
</head>
<body>
  <script src="flutter.js" defer></script>
  <script>
    window.addEventListener('load', function(ev) {
      _flutter.loader.loadEntrypoint({
        serviceWorker: {
          serviceWorkerVersion: serviceWorkerVersion,
        },
        onEntrypointLoaded: function(engineInitializer) {
          engineInitializer.initializeEngine().then(function(appRunner) {
            appRunner.runApp();
          });
        }
      });
    });
  </script>
</body>
</html>
```

---

## 🏗️ Étape 2: Build de Production

### 2.1 Nettoyer le projet

```bash
cd votre_projet_flutter
flutter clean
flutter pub get
```

### 2.2 Builder pour la production

```bash
# Build optimisé pour le web
flutter build web --release --web-renderer canvaskit

# Alternative avec auto renderer (recommandé)
flutter build web --release --web-renderer auto
```

Options de rendu:
- `canvaskit`: Meilleure qualité, fichiers plus lourds
- `html`: Plus léger, moins de fonctionnalités
- `auto`: Choix automatique selon le navigateur

### 2.3 Vérifier le build

Le résultat se trouve dans `build/web/` avec la structure:
```
build/web/
├── assets/
├── canvaskit/
├── favicon.png
├── flutter.js
├── flutter_service_worker.js
├── index.html
├── main.dart.js
├── manifest.json
└── version.json
```

---

## 🚀 Étape 3: Déploiement sur Hostinger

> **Note importante**: Ce guide couvre les deux types d'hébergement Hostinger:
> - **VPS Hostinger** (Recommandé) - Serveur dédié avec accès SSH et Nginx
> - **Hébergement Partagé** - cPanel avec accès limité

---

### 🎯 Option A: VPS Hostinger avec Nginx (RECOMMANDÉ)

Cette méthode est plus professionnelle et offre de meilleures performances.

#### 3.1 Structure du VPS

Votre VPS Hostinger aura cette structure:
```
VPS Hostinger
├── /var/www/monapp.com/          # Flutter Web (Frontend)
│   ├── index.html
│   ├── main.dart.js
│   ├── flutter.js
│   ├── assets/
│   └── canvaskit/
│
└── ~/apps/tata-api/               # NestJS API (Backend - déjà déployé)
    └── dist/
```

#### 3.2 Connexion au VPS

```bash
# Se connecter à votre VPS Hostinger
ssh zidar@votre-ip-vps

# Exemple avec votre configuration actuelle
ssh zidar@154.xxx.xxx.xxx
```

#### 3.3 Créer la structure de dossiers

```bash
# Créer le dossier pour le site web Flutter
sudo mkdir -p /var/www/monapp.com

# Donner les permissions à votre utilisateur
sudo chown -R $USER:$USER /var/www/monapp.com
sudo chmod -R 755 /var/www/monapp.com
```

#### 3.4 Uploader les fichiers Flutter

**Méthode 1: SCP (depuis votre machine locale)**

```bash
# Depuis votre machine locale (dans le dossier du projet Flutter)
cd /chemin/vers/votre/projet/flutter

# Compresser le build
cd build
tar -czf flutter-web-build.tar.gz web/

# Uploader vers le VPS
scp flutter-web-build.tar.gz zidar@votre-ip-vps:~/

# Retourner sur le VPS (SSH) et extraire
ssh zidar@votre-ip-vps
cd /var/www/monapp.com
tar -xzf ~/flutter-web-build.tar.gz --strip-components=1
rm ~/flutter-web-build.tar.gz

# Vérifier les fichiers
ls -la
# Vous devez voir: index.html, main.dart.js, flutter.js, assets/, etc.
```

**Méthode 2: rsync (plus efficace pour les mises à jour)**

```bash
# Depuis votre machine locale
rsync -avz --progress build/web/ zidar@votre-ip-vps:/var/www/monapp.com/

# Avec suppression des fichiers obsolètes
rsync -avz --delete --progress build/web/ zidar@votre-ip-vps:/var/www/monapp.com/
```

**Méthode 3: Git (recommandé pour versioning)**

```bash
# Sur le VPS
cd /var/www/monapp.com
git clone https://github.com/votre-username/votre-projet-flutter.git temp
cd temp

# Build sur le serveur (si Flutter est installé)
flutter build web --release

# Ou uploader le build depuis votre machine et faire:
# git pull
# copier le contenu de build/web/ vers /var/www/monapp.com/
```

#### 3.5 Vérifier les permissions

```bash
# S'assurer que Nginx peut lire les fichiers
sudo chown -R www-data:www-data /var/www/monapp.com
sudo find /var/www/monapp.com -type d -exec chmod 755 {} \;
sudo find /var/www/monapp.com -type f -exec chmod 644 {} \;
```

---

### 🔧 Option B: Hébergement Partagé Hostinger (cPanel)

Si vous n'avez pas de VPS mais un hébergement partagé avec cPanel.

#### 3.1 Via cPanel File Manager

1. **Connectez-vous à cPanel** de votre compte Hostinger

2. **Ouvrez File Manager**

3. **Naviguez vers le répertoire web**:
   - Pour le domaine principal: `/public_html/`
   - Pour un sous-domaine: `/public_html/sub-domain/`

4. **Créez un dossier pour votre app** (optionnel):
   ```
   /public_html/app/
   ```
   Ou déployez directement dans `/public_html/` si c'est votre site principal

5. **Uploadez tous les fichiers** du dossier `build/web/`:
   - Sélectionnez tous les fichiers
   - Cliquez sur "Upload"
   - Uploadez tous les fichiers et dossiers

6. **Vérifiez la structure** après upload:
   ```
   /public_html/
   ├── assets/
   ├── canvaskit/
   ├── favicon.png
   ├── flutter.js
   ├── index.html
   ├── main.dart.js
   └── ...
   ```

#### 3.2 Via FTP/SFTP

1. **Utilisez un client FTP** (FileZilla recommandé):
   - Host: `ftp.votre-domaine.com`
   - Username: Votre username cPanel
   - Password: Votre mot de passe cPanel
   - Port: 21 (FTP) ou 22 (SFTP)

2. **Naviguez vers** `/public_html/`

3. **Uploadez le contenu** de `build/web/` (pas le dossier web lui-même)

---

## ⚙️ Étape 4: Configuration du Serveur

### 🎯 Pour VPS Hostinger (Nginx) - RECOMMANDÉ

#### 4.1 Créer la configuration Nginx

```bash
# Se connecter au VPS
ssh zidar@votre-ip-vps

# Créer le fichier de configuration
sudo nano /etc/nginx/sites-available/monapp.com
```

Copiez cette configuration complète:

```nginx
# Configuration Nginx pour Flutter Web
server {
    listen 80;
    listen [::]:80;
    server_name monapp.com www.monapp.com;

    # Root du site Flutter
    root /var/www/monapp.com;
    index index.html;

    # Logs
    access_log /var/log/nginx/monapp-access.log;
    error_log /var/log/nginx/monapp-error.log;

    # Compression Gzip pour améliorer les performances
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/x-javascript
        text/xml
        application/xml
        application/xml+rss
        image/svg+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        application/wasm;

    # Cache pour les assets statiques (images, fonts, etc.)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Cache pour les fichiers canvaskit (Flutter renderer)
    location /canvaskit/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Cache pour les assets Flutter
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Flutter service worker - PAS de cache (doit toujours être à jour)
    location /flutter_service_worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        expires 0;
    }

    # Version.json - PAS de cache
    location /version.json {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Toutes les routes vers index.html (SPA routing pour Flutter)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Taille max d'upload (si votre app permet l'upload de fichiers)
    client_max_body_size 20M;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
}
```

#### 4.2 Activer le site

```bash
# Créer le lien symbolique pour activer le site
sudo ln -s /etc/nginx/sites-available/monapp.com /etc/nginx/sites-enabled/

# Tester la configuration Nginx (IMPORTANT!)
sudo nginx -t

# Si le test est OK, vous verrez:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Redémarrer Nginx pour appliquer les changements
sudo systemctl restart nginx

# Vérifier que Nginx est bien démarré
sudo systemctl status nginx
```

#### 4.3 Configuration SSL/HTTPS avec Let's Encrypt (GRATUIT)

```bash
# Installer Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat SSL (automatique avec Nginx)
sudo certbot --nginx -d monapp.com -d www.monapp.com

# Suivre les instructions:
# 1. Entrez votre email
# 2. Acceptez les conditions
# 3. Choisissez de rediriger HTTP vers HTTPS (option 2)

# Certbot va automatiquement modifier votre configuration Nginx
# pour ajouter le SSL et la redirection HTTPS

# Tester le renouvellement automatique
sudo certbot renew --dry-run

# Le renouvellement automatique est déjà configuré via cron
```

Après cette configuration, votre fichier Nginx sera automatiquement mis à jour avec:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name monapp.com www.monapp.com;

    ssl_certificate /etc/letsencrypt/live/monapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monapp.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ... reste de la configuration ...
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name monapp.com www.monapp.com;
    return 301 https://$server_name$request_uri;
}
```

---

### 🔧 Pour Hébergement Partagé (Apache avec .htaccess)

#### 4.1 Créer/Modifier .htaccess

Dans `/public_html/`, créez ou modifiez le fichier `.htaccess`:

```apache
# Configuration Flutter Web pour Hostinger

# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On

  # Redirection HTTPS (si vous avez un certificat SSL)
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Gestion du routing Flutter
  # Ne pas rediriger les fichiers existants
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rediriger toutes les requêtes vers index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Configuration MIME Types
<IfModule mod_mime.c>
  AddType application/javascript .js
  AddType application/json .json
  AddType image/svg+xml .svg
  AddType application/wasm .wasm
</IfModule>

# Compression GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On

  # Images
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"

  # CSS et JavaScript
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"

  # Fonts
  ExpiresByType font/woff2 "access plus 1 year"

  # HTML (pas de cache pour index.html)
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Désactiver le listing des répertoires
Options -Indexes
```

### 4.2 Configuration SSL (HTTPS)

1. **Dans cPanel, allez à "SSL/TLS Status"**

2. **Activez AutoSSL** (gratuit avec Let's Encrypt):
   - Cliquez sur "Run AutoSSL"
   - Cochez votre domaine
   - Attendez l'installation

3. **Forcer HTTPS** (déjà dans .htaccess ci-dessus)

### 4.3 Configuration du Domaine/Sous-domaine

**Pour un sous-domaine** (ex: app.votre-domaine.com):

1. Dans cPanel, allez à **"Domains"** ou **"Subdomains"**

2. Créez un sous-domaine:
   - Subdomain: `app`
   - Document Root: `/public_html/app`

3. Attendez la propagation DNS (peut prendre jusqu'à 24h)

---

## 🔧 Étape 5: Configuration Finale du Projet Flutter

### 5.1 Mettre à jour les URLs API

Dans votre code Flutter, utilisez la configuration créée:

```dart
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  static Future<dynamic> login(String email, String password) async {
    final url = Uri.parse('${ApiConfig.apiUrl}/auth/login');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    return jsonDecode(response.body);
  }
}
```

### 5.2 Gérer les variables d'environnement

Créez différents builds pour dev/prod:

**build_dev.sh**
```bash
#!/bin/bash
flutter build web --release --dart-define=API_URL=http://localhost:3000/api
```

**build_prod.sh**
```bash
#!/bin/bash
flutter build web --release --dart-define=API_URL=https://votre-domaine.com/api
```

Utilisation dans le code:
```dart
class ApiConfig {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:3000/api',
  );
}
```

---

## 📱 Étape 6: Configuration PWA (Progressive Web App)

### 6.1 Modifier manifest.json

Dans `web/manifest.json`:

```json
{
  "name": "Votre Application",
  "short_name": "VotreApp",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#2196F3",
  "description": "Description de votre application",
  "orientation": "portrait-primary",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "icons/Icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/Icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "icons/Icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/Icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 6.2 Générer les icônes

Utilisez un outil comme [PWA Icon Generator](https://www.pwabuilder.com/imageGenerator) pour créer toutes les icônes nécessaires.

---

## 🧪 Étape 7: Test et Vérification

### 7.1 Tester localement avant déploiement

```bash
# Servir le build localement
cd build/web
python -m http.server 8000

# Ou avec Node.js
npx serve -s build/web -p 8000
```

Ouvrez `http://localhost:8000` dans votre navigateur.

### 7.2 Checklist de vérification après déploiement

- [ ] L'application se charge correctement
- [ ] Les routes fonctionnent (navigation)
- [ ] Les appels API fonctionnent
- [ ] Les images/assets se chargent
- [ ] Le responsive fonctionne (mobile/desktop)
- [ ] HTTPS est actif
- [ ] PWA installable (icône dans la barre d'adresse)
- [ ] Service Worker fonctionne (mode offline)
- [ ] Performance acceptable (Lighthouse)

### 7.3 Outils de diagnostic

```bash
# Tester les performances
# Ouvrir Chrome DevTools > Lighthouse
# Générer un rapport

# Vérifier CORS
# Ouvrir la console du navigateur et vérifier les erreurs
```

---

## 🔄 Étape 8: Script de Déploiement Automatique

### 8.1 Script de déploiement pour VPS (Recommandé)

Créez `deploy_flutter_vps.sh`:

```bash
#!/bin/bash

# ============================================
# Script de Déploiement Flutter Web sur VPS
# ============================================

set -e  # Arrêter en cas d'erreur

# ====================
# CONFIGURATION
# ====================
PROJECT_DIR="$(pwd)"
BUILD_DIR="$PROJECT_DIR/build/web"

# Configuration VPS
VPS_USER="zidar"
VPS_HOST="votre-ip-vps"  # ou votre-domaine.com
VPS_PATH="/var/www/monapp.com"

# Configuration API
API_URL="https://votre-domaine.com/api"

# ====================
# COULEURS
# ====================
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ====================
# FONCTIONS
# ====================
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# ====================
# DÉPLOIEMENT
# ====================

echo "============================================"
echo "🚀 Déploiement Flutter Web sur VPS Hostinger"
echo "============================================"
echo ""

# 1. Nettoyage
print_step "1/6 Nettoyage du projet..."
flutter clean
print_success "Nettoyage terminé"
echo ""

# 2. Installation des dépendances
print_step "2/6 Installation des dépendances..."
flutter pub get
print_success "Dépendances installées"
echo ""

# 3. Build de production
print_step "3/6 Build de production..."
flutter build web \
  --release \
  --web-renderer auto \
  --dart-define=API_URL=$API_URL \
  --dart-define=dart.vm.product=true

if [ ! -d "$BUILD_DIR" ]; then
  print_error "Le build a échoué!"
  exit 1
fi

print_success "Build réussi"
echo ""

# 4. Vérification de la connexion SSH
print_step "4/6 Vérification de la connexion VPS..."
if ssh -o ConnectTimeout=5 $VPS_USER@$VPS_HOST "exit" 2>/dev/null; then
  print_success "Connexion au VPS établie"
else
  print_error "Impossible de se connecter au VPS"
  print_warning "Vérifiez: ssh $VPS_USER@$VPS_HOST"
  exit 1
fi
echo ""

# 5. Backup de l'ancienne version (optionnel)
print_step "5/6 Sauvegarde de l'ancienne version..."
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
ssh $VPS_USER@$VPS_HOST "
  if [ -d $VPS_PATH ] && [ -f $VPS_PATH/index.html ]; then
    sudo tar -czf /tmp/flutter-backup-$BACKUP_DATE.tar.gz -C $VPS_PATH .
    echo 'Backup créé: /tmp/flutter-backup-$BACKUP_DATE.tar.gz'
  fi
" || print_warning "Pas de version précédente à sauvegarder"
echo ""

# 6. Déploiement via rsync
print_step "6/6 Upload des fichiers vers le VPS..."
rsync -avz --delete --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  $BUILD_DIR/ $VPS_USER@$VPS_HOST:$VPS_PATH/

print_success "Fichiers uploadés"
echo ""

# 7. Configuration des permissions
print_step "Configuration des permissions..."
ssh $VPS_USER@$VPS_HOST "
  sudo chown -R www-data:www-data $VPS_PATH
  sudo find $VPS_PATH -type d -exec chmod 755 {} \;
  sudo find $VPS_PATH -type f -exec chmod 644 {} \;
"
print_success "Permissions configurées"
echo ""

# 8. Vérification finale
print_step "Vérification finale..."
ssh $VPS_USER@$VPS_HOST "
  if [ -f $VPS_PATH/index.html ]; then
    echo '✓ index.html présent'
  else
    echo '✗ index.html MANQUANT!'
    exit 1
  fi

  if [ -f $VPS_PATH/main.dart.js ]; then
    echo '✓ main.dart.js présent'
  else
    echo '✗ main.dart.js MANQUANT!'
    exit 1
  fi

  if [ -d $VPS_PATH/assets ]; then
    echo '✓ Dossier assets présent'
  else
    echo '✗ Dossier assets MANQUANT!'
    exit 1
  fi
"
echo ""

# 9. Statistiques
print_step "Statistiques du déploiement:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh $VPS_USER@$VPS_HOST "
  echo 'Taille totale: '
  du -sh $VPS_PATH
  echo ''
  echo 'Nombre de fichiers: '
  find $VPS_PATH -type f | wc -l
"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 10. Succès
echo "============================================"
print_success "DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
echo "============================================"
echo ""
echo "🌐 Votre application est disponible sur:"
echo "   https://votre-domaine.com"
echo ""
echo "📝 Commandes utiles:"
echo "   - Voir les logs Nginx: ssh $VPS_USER@$VPS_HOST 'sudo tail -f /var/log/nginx/monapp-access.log'"
echo "   - Tester Nginx: ssh $VPS_USER@$VPS_HOST 'sudo nginx -t'"
echo "   - Redémarrer Nginx: ssh $VPS_USER@$VPS_HOST 'sudo systemctl restart nginx'"
echo ""
```

Rendre le script exécutable:
```bash
chmod +x deploy_flutter_vps.sh
```

Utilisation:
```bash
./deploy_flutter_vps.sh
```

### 8.2 Script simplifié pour déploiement rapide

Pour les mises à jour fréquentes, créez `quick_deploy.sh`:

```bash
#!/bin/bash

# Configuration
VPS_USER="zidar"
VPS_HOST="votre-ip-vps"
VPS_PATH="/var/www/monapp.com"
API_URL="https://votre-domaine.com/api"

# Build et deploy
echo "🚀 Déploiement rapide..."

flutter build web --release --dart-define=API_URL=$API_URL

rsync -avz --delete build/web/ $VPS_USER@$VPS_HOST:$VPS_PATH/

ssh $VPS_USER@$VPS_HOST "sudo chown -R www-data:www-data $VPS_PATH"

echo "✅ Terminé! Visitez: https://votre-domaine.com"
```

### 8.3 Script pour hébergement partagé (FTP)

Si vous utilisez un hébergement partagé, créez `deploy_flutter_shared.sh`:

```bash
#!/bin/bash

# Variables
PROJECT_DIR="$(pwd)"
BUILD_DIR="$PROJECT_DIR/build/web"
FTP_HOST="ftp.votre-domaine.com"
FTP_USER="votre-username"
FTP_PASS="votre-password"
FTP_REMOTE_DIR="/public_html"

# Build
echo "🏗️ Build de production..."
flutter build web --release --web-renderer auto --dart-define=API_URL=https://votre-domaine.com/api

if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Erreur: Le build a échoué"
  exit 1
fi

# Upload via lftp (plus fiable que ftp classique)
echo "📤 Upload vers Hostinger..."
lftp -c "
set ftp:ssl-allow no;
open -u $FTP_USER,$FTP_PASS $FTP_HOST;
mirror --reverse --delete --verbose $BUILD_DIR $FTP_REMOTE_DIR;
bye;
"

echo "✅ Déploiement terminé!"
echo "🌐 Visitez: https://votre-domaine.com"
```

---

## 🐛 Dépannage

### Problème 1: Page blanche après déploiement

**Solutions:**
1. Vérifier les chemins dans `index.html` (base href)
2. Vérifier la console du navigateur pour les erreurs
3. S'assurer que tous les fichiers sont uploadés
4. Vérifier les permissions (755 pour dossiers, 644 pour fichiers)

### Problème 2: Erreurs CORS

**Solutions:**
1. Vérifier la configuration CORS dans [src/main.ts](src/main.ts)
2. Ajouter le domaine frontend dans la liste `origin`
3. Vérifier que `credentials: true` est défini

### Problème 3: Routes ne fonctionnent pas

**Solutions:**
1. Vérifier le fichier `.htaccess`
2. S'assurer que `mod_rewrite` est activé
3. Tester les routes manuellement

### Problème 4: Fichiers ne se chargent pas

**Solutions:**
1. Vérifier les permissions des fichiers
2. Vérifier les MIME types dans `.htaccess`
3. Vider le cache du navigateur

### Problème 5: Lenteur de chargement

**Solutions:**
1. Activer la compression GZIP
2. Optimiser les images
3. Utiliser `--web-renderer auto`
4. Activer le cache HTTP

---

## 📊 Optimisations

### 1. Réduire la taille du bundle

```bash
# Analyser la taille
flutter build web --analyze-size

# Build avec tree-shaking optimal
flutter build web --release --dart-define=dart.vm.product=true
```

### 2. Lazy Loading des routes

```dart
// Utiliser le routing paresseux
MaterialApp(
  onGenerateRoute: (settings) {
    return MaterialPageRoute(
      builder: (context) => FutureBuilder(
        future: _loadPage(settings.name),
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return snapshot.data!;
          }
          return CircularProgressIndicator();
        },
      ),
    );
  },
);
```

### 3. CDN pour assets lourds

Hébergez les images/vidéos lourdes sur un CDN et référencez-les par URL.

---

## 📝 Checklist Complète

### Avant le build:
- [ ] Configuration API avec URL de production
- [ ] CORS configuré dans le backend
- [ ] index.html optimisé
- [ ] manifest.json configuré
- [ ] Icônes PWA générées
- [ ] Variables d'environnement définies

### Build:
- [ ] `flutter clean` exécuté
- [ ] `flutter pub get` exécuté
- [ ] `flutter build web --release` réussi
- [ ] Vérification du dossier `build/web`

### Déploiement:
- [ ] Fichiers uploadés sur Hostinger
- [ ] `.htaccess` créé et configuré
- [ ] SSL/HTTPS activé
- [ ] Domaine/sous-domaine configuré

### Post-déploiement:
- [ ] Application accessible
- [ ] Routes fonctionnelles
- [ ] API calls fonctionnent
- [ ] PWA installable
- [ ] Performance testée
- [ ] Tests sur mobile/desktop

---

## 🔗 Ressources Utiles

- [Documentation Flutter Web](https://docs.flutter.dev/platform-integration/web)
- [Hostinger Documentation](https://support.hostinger.com/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Flutter Performance Best Practices](https://docs.flutter.dev/perf/best-practices)

---

## 📞 Support

En cas de problème:
1. Vérifier les logs du navigateur (Console)
2. Vérifier les logs du serveur Hostinger (cPanel > Error Log)
3. Tester localement avec `flutter run -d chrome`
4. Consulter la documentation Flutter/Hostinger

---

**Dernière mise à jour:** Janvier 2025
