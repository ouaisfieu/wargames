#!/bin/bash

#═══════════════════════════════════════════════════════════════════════════════
#  🔧 INSTALLATION DES CLI DE DÉPLOIEMENT
#  Run: chmod +x install-deploy-tools.sh && ./install-deploy-tools.sh
#═══════════════════════════════════════════════════════════════════════════════

echo "🔧 Installation des outils de déploiement..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé!"
    echo "   Installe-le depuis: https://nodejs.org"
    echo "   Ou via brew: brew install node"
    exit 1
fi

echo "✓ Node.js $(node -v) détecté"
echo ""

# Install CLI tools
echo "📦 Installation des CLI..."
echo ""

echo "[1/5] Vercel..."
npm install -g vercel 2>/dev/null && echo "✓ Vercel installé" || echo "⚠ Vercel déjà installé ou erreur"

echo "[2/5] Netlify..."
npm install -g netlify-cli 2>/dev/null && echo "✓ Netlify installé" || echo "⚠ Netlify déjà installé ou erreur"

echo "[3/5] Surge..."
npm install -g surge 2>/dev/null && echo "✓ Surge installé" || echo "⚠ Surge déjà installé ou erreur"

echo "[4/5] Wrangler (Cloudflare)..."
npm install -g wrangler 2>/dev/null && echo "✓ Wrangler installé" || echo "⚠ Wrangler déjà installé ou erreur"

echo "[5/5] Firebase Tools..."
npm install -g firebase-tools 2>/dev/null && echo "✓ Firebase installé" || echo "⚠ Firebase déjà installé ou erreur"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Installation terminée!"
echo ""
echo "Prochaines étapes:"
echo "  1. vercel login"
echo "  2. netlify login"
echo "  3. surge login"
echo "  4. wrangler login"
echo ""
echo "Puis lance: ./deploy-all.sh"
echo "═══════════════════════════════════════════════════════════════"
