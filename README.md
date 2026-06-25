# 🔍 Sourcing.AI — Agent de Sourcing Fournisseurs

Application PWA de sourcing fournisseurs B2B avec IA intégrée (Claude Sonnet).  
Installable sur mobile & desktop, déployable sur Vercel en 5 minutes.

---

## ✨ Fonctionnalités

- **Recherche & filtrage** : par secteur, pays, score minimum, mot-clé
- **Score IA** : jauge de compatibilité par fournisseur
- **Chat IA** : analyse contextuelle, comparaisons, recommandations
- **Fiche complète** : métriques, certifications, coordonnées
- **Comparaison radar** : jusqu'à 4 fournisseurs en shortlist
- **Génération d'email** : premier contact personnalisé par l'IA
- **PWA** : installable sur iOS, Android, Windows, macOS

---

## 🚀 Déploiement sur Vercel (5 min)

### Étape 1 — Préparer le code

```bash
# Initialiser Git
git init
git add .
git commit -m "init: Sourcing.AI PWA"
```

### Étape 2 — Pousser sur GitHub

```bash
# Créer un repo sur github.com, puis :
git remote add origin https://github.com/VOTRE-USER/sourcing-ai.git
git push -u origin main
```

### Étape 3 — Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com) → **New Project**
2. Importez votre repo GitHub `sourcing-ai`
3. Dans **Environment Variables**, ajoutez :
   - **Name** : `ANTHROPIC_API_KEY`
   - **Value** : votre clé depuis [console.anthropic.com](https://console.anthropic.com)
4. Cliquez **Deploy** ✅

Votre app sera disponible sur `https://sourcing-ai-xxx.vercel.app`

---

## 💻 Développement local

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la clé API
cp .env.local.example .env.local
# Éditez .env.local et remplacez la valeur de ANTHROPIC_API_KEY

# 3. Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

---

## 📲 Installation PWA

### Sur iPhone / iPad
1. Ouvrez l'app dans **Safari**
2. Appuyez sur **Partager** (icône en bas)
3. Sélectionnez **Sur l'écran d'accueil**

### Sur Android
1. Ouvrez dans **Chrome**
2. Menu → **Ajouter à l'écran d'accueil**
3. Ou acceptez la bannière d'installation automatique

### Sur Desktop (Chrome / Edge)
1. Cliquez l'icône d'installation dans la barre d'adresse
2. Ou Menu → **Installer Sourcing.AI**

---

## 🏗️ Architecture

```
sourcing-ai/
├── src/
│   ├── app/
│   │   ├── layout.js          # HTML root + PWA meta tags
│   │   ├── page.js            # Application principale (desktop + mobile)
│   │   ├── globals.css        # Styles globaux
│   │   └── api/chat/route.js  # Route API sécurisée → Anthropic
│   ├── components/
│   │   ├── ScoreRing.js       # Jauge circulaire animée
│   │   ├── RadarChart.js      # Graphique radar comparaison
│   │   └── SupplierCard.js    # Carte fournisseur
│   └── lib/
│       └── data.js            # Base de données fournisseurs + constantes
├── public/
│   ├── manifest.json          # Configuration PWA
│   └── icons/                 # Icônes app (192x192, 512x512)
├── next.config.js             # Config Next.js + PWA
├── vercel.json                # Config déploiement Vercel
└── .env.local.example         # Template variables d'environnement
```

---

## 🔐 Sécurité

La clé API Anthropic n'est **jamais exposée au client**.  
Toutes les requêtes passent par `/api/chat` (Edge Function Vercel), qui injecte la clé côté serveur.

---

## 🛠️ Personnalisation

### Ajouter vos propres fournisseurs
Éditez `src/lib/data.js` → tableau `SUPPLIERS`.  
Chaque fournisseur doit avoir les champs : `id, name, sector, country, certifications, minOrder, leadTime, score, revenue, employees, founded, tags, status, contact, website, reliability, quality, pricing, flexibility`.

### Modifier le modèle IA
Dans `src/app/api/chat/route.js`, changez `model: "claude-sonnet-4-6"` par le modèle de votre choix.

---

## 📄 Licence

MIT — Libre d'utilisation et de modification.
