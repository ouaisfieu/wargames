# ◈ PROTOCOLE USBA

> **Unité de Suivi des Biens Activés**  
> Un ARG (Alternate Reality Game) de participation citoyenne avec économie gamifiée

![Version](https://img.shields.io/badge/version-0.1.0--alpha-green)
![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-blue)
![Status](https://img.shields.io/badge/status-En%20développement-orange)

## 🎮 C'est quoi ?

Le Protocole USBA est un **jeu en réalité alternée** qui gamifie l'engagement citoyen. Chaque action — lire, explorer, découvrir, participer — génère des **Fragments (◈)**, une monnaie locale qui mesure et valorise votre contribution à la vie démocratique.

### Le concept ARG-dans-un-ARG

Vous avez découvert ce projet. C'était peut-être un accident. Peut-être pas. Le répertoire `/usba/` était officiellement "vide"... mais vous êtes ici. C'est le premier niveau du jeu.

## ⚡ Démarrage rapide

```bash
# Cloner le repo
git clone https://github.com/votre-user/protocole-usba.git
cd protocole-usba

# Ouvrir directement dans le navigateur
open index.html
# ou
python -m http.server 8000
# puis visiter http://localhost:8000
```

**C'est tout.** Pas de build, pas de dépendances, pas de configuration.

## 📦 Structure du projet

```
protocole-usba/
├── index.html              # Page d'accueil
├── assets/
│   ├── css/
│   │   └── main.css        # Styles complets
│   └── js/
│       └── engine.js       # Moteur de jeu
├── pages/
│   ├── missions.html       # Centre de missions
│   ├── archives.html       # Documents déclassifiés
│   ├── fragments.html      # Économie des Fragments
│   ├── about.html          # À propos du Protocole
│   └── rules.html          # Règles du jeu
├── data/
│   └── config.json         # Configuration personnalisable
├── README.md
└── LICENSE
```

## 🚀 Déploiement multi-plateforme

### GitHub Pages (Gratuit)

```bash
# 1. Créer un repo GitHub
# 2. Pousser le code
git push origin main

# 3. Activer GitHub Pages
# Settings > Pages > Source: main branch
```

Votre site sera disponible sur `https://votre-user.github.io/protocole-usba/`

### Netlify (Gratuit)

1. Connectez votre repo GitHub à [Netlify](https://netlify.com)
2. Cliquez "Deploy"
3. C'est fait.

Ou via CLI :
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

### Vercel (Gratuit)

```bash
npm install -g vercel
vercel --prod
```

### Cloudflare Pages (Gratuit)

1. Dashboard Cloudflare > Pages
2. Connecter GitHub
3. Sélectionner le repo
4. Build command: (laisser vide)
5. Deploy

### Self-hosted (VPS/Serveur)

```bash
# Nginx
sudo cp -r protocole-usba /var/www/
# Configurer le vhost Nginx pour pointer vers /var/www/protocole-usba

# Apache
sudo cp -r protocole-usba /var/www/html/
```

### Docker

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t protocole-usba .
docker run -p 8080:80 protocole-usba
```

## 🎯 Système de jeu

### Économie des Fragments (◈)

| Unité | Valeur | Signification |
|-------|--------|---------------|
| Fragment | 1 ◈ | Participation simple |
| Éclat | 10 ◈ | Contribution substantielle |
| Cristal | 100 ◈ | Impact communautaire |
| Nexus | 1000 ◈ | Changement systémique |

### Sources de revenus

| Action | Récompense |
|--------|------------|
| Visiter une page | +1 ◈ |
| Connexion quotidienne | +10 ◈ |
| 5 minutes sur le site | +5 ◈ |
| Compléter une mission | +10-500 ◈ |
| Trouver un secret | +25-200 ◈ |
| Monter de niveau | +50 ◈ |

### Niveaux d'Agent

| Niveau | Seuil | Privilèges |
|--------|-------|------------|
| Observateur | 0 ◈ | Accès basique |
| Sentinelle | 100 ◈ | Dossiers restreints |
| Analyste | 500 ◈ | Missions avancées |
| Architecte | 2000 ◈ | Proposer des missions |
| Oracle | 10000 ◈ | Accès total + Gouvernance |

## 🔧 Personnalisation

### Configuration (`data/config.json`)

```json
{
  "projectName": "PROTOCOLE USBA",
  "version": "0.1.0-alpha",
  "economy": {
    "fragmentSymbol": "◈",
    "rewards": {
      "pageView": 1,
      "dailyLogin": 10,
      "missionComplete": 50
    }
  },
  "levels": [
    { "name": "Observateur", "threshold": 0 },
    { "name": "Sentinelle", "threshold": 100 }
  ]
}
```

### Ajouter vos propres missions

Éditez `assets/js/engine.js`, section `Missions.list` :

```javascript
{
  id: 'M-CUSTOM-001',
  title: 'Votre Mission',
  description: 'Description de la mission',
  reward: 100,
  type: 'custom',
  condition: () => /* votre condition */
}
```

### Ajouter des secrets

```javascript
// Dans CONFIG.secrets
'VOTRE-CODE': { reward: 50, hint: 'Votre indice...' }
```

Puis dans le HTML :
```html
<div data-secret="VOTRE-CODE">Élément cliquable</div>
```

## 🔌 API JavaScript

Accessible via la console (F12) :

```javascript
// Statut de l'agent
USBA.status()

// Obtenir un indice
USBA.hint()

// Exporter les données
USBA.export()

// Importer des données
USBA.import('données_encodées')

// Débloquer un secret manuellement
USBA.unlock('CODE-SECRET')
```

## 🌐 Synchronisation temps réel (Optionnel)

Pour activer la synchro multi-joueurs :

1. Déployez un serveur WebSocket
2. Modifiez `CONFIG.apiEndpoint` dans `engine.js`
3. Le leaderboard et les événements seront partagés

Exemple avec Socket.io :
```javascript
// server.js
const io = require('socket.io')(3000);
io.on('connection', socket => {
  socket.on('join', data => { /* ... */ });
  socket.on('fragment_earned', data => { /* broadcast */ });
});
```

## 🔒 Secrets inclus

5 secrets sont cachés dans le site. Indices :

1. "Le premier fragment se cache dans le vide..."
2. "Konami savait."
3. "Les archives parlent à ceux qui écoutent."
4. "Le temps est une spirale."
5. "42."

## 📱 PWA Ready

Pour transformer en Progressive Web App, ajoutez :

```html
<!-- Dans <head> -->
<link rel="manifest" href="manifest.json">
```

```json
// manifest.json
{
  "name": "Protocole USBA",
  "short_name": "USBA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#00ff88"
}
```

## 🤝 Contribuer

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commitez (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

[Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

- ✅ Attribution requise
- ❌ Usage commercial interdit
- ✅ Partage sous conditions identiques

## 🔗 Liens

- [Site original Ouaisfi.eu](https://ouaisfi.eu)
- [Documentation Hugo FixIt](https://fixit.lruihao.cn/)
- [Bluesky @ouaisfi.eu](https://bsky.app/profile/ouaisfi.eu)

---

<p align="center">
  <strong>◈ PROTOCOLE USBA ◈</strong><br>
  <em>La faille est ouverte. Les Fragments vous attendent.</em>
</p>
