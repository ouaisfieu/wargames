#!/bin/bash

#═══════════════════════════════════════════════════════════════════════════════
#  🚀 SCRIPT DE DÉPLOIEMENT MULTI-PLATEFORME
#  Lead-Dexing by Claude (Anthropic)
#═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Config
PROJECT_NAME="lead-dexing"
SURGE_DOMAIN="lead-dexing.surge.sh"
TIMESTAMP=$(date +%Y-%m-%d_%H:%M:%S)

# Counters
DEPLOYED=0
FAILED=0
SKIPPED=0

#───────────────────────────────────────────────────────────────────────────────
# Functions
#───────────────────────────────────────────────────────────────────────────────

print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║   ██╗     ███████╗ █████╗ ██████╗       ██████╗ ███████╗██╗  ██╗  ║"
    echo "║   ██║     ██╔════╝██╔══██╗██╔══██╗      ██╔══██╗██╔════╝╚██╗██╔╝  ║"
    echo "║   ██║     █████╗  ███████║██║  ██║█████╗██║  ██║█████╗   ╚███╔╝   ║"
    echo "║   ██║     ██╔══╝  ██╔══██║██║  ██║╚════╝██║  ██║██╔══╝   ██╔██╗   ║"
    echo "║   ███████╗███████╗██║  ██║██████╔╝      ██████╔╝███████╗██╔╝ ██╗  ║"
    echo "║   ╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝       ╚═════╝ ╚══════╝╚═╝  ╚═╝  ║"
    echo "║                                                                   ║"
    echo "║   🚀 MULTI-PLATFORM DEPLOYMENT SCRIPT                            ║"
    echo "║   Created by Claude (Anthropic) × Human                          ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}[$1/$TOTAL] ${MAGENTA}$2${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((DEPLOYED++))
}

fail() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

skip() {
    echo -e "${YELLOW}⊘ $1${NC}"
    ((SKIPPED++))
}

check_command() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

#───────────────────────────────────────────────────────────────────────────────
# Deployment Functions
#───────────────────────────────────────────────────────────────────────────────

deploy_github() {
    print_step "1" "GitHub Pages"
    
    if check_command git; then
        echo "Committing changes..."
        git add -A
        git commit -m "Deploy: $TIMESTAMP" || echo "Nothing to commit"
        git push origin main || git push origin master
        success "GitHub Pages deployed"
        echo -e "   ${CYAN}→ https://ouaisfieu.github.io/maga-fake-news-deborsu-fraudeurs-polemique-leaks-scandale-confidentiel/${NC}"
    else
        fail "Git not installed"
    fi
}

deploy_vercel() {
    print_step "2" "Vercel"
    
    if check_command vercel; then
        echo "Deploying to Vercel..."
        vercel --prod --yes 2>/dev/null && success "Vercel deployed" || fail "Vercel deployment failed"
    else
        skip "Vercel CLI not installed (npm i -g vercel)"
    fi
}

deploy_netlify() {
    print_step "3" "Netlify"
    
    if check_command netlify; then
        echo "Deploying to Netlify..."
        netlify deploy --prod --dir=. 2>/dev/null && success "Netlify deployed" || fail "Netlify deployment failed"
    else
        skip "Netlify CLI not installed (npm i -g netlify-cli)"
    fi
}

deploy_surge() {
    print_step "4" "Surge.sh"
    
    if check_command surge; then
        echo "Deploying to Surge..."
        surge . $SURGE_DOMAIN 2>/dev/null && success "Surge deployed" || fail "Surge deployment failed"
        echo -e "   ${CYAN}→ https://$SURGE_DOMAIN${NC}"
    else
        skip "Surge CLI not installed (npm i -g surge)"
    fi
}

deploy_cloudflare() {
    print_step "5" "Cloudflare Pages"
    
    if check_command wrangler; then
        echo "Deploying to Cloudflare Pages..."
        wrangler pages deploy . --project-name=$PROJECT_NAME 2>/dev/null && success "Cloudflare deployed" || fail "Cloudflare deployment failed"
    else
        skip "Wrangler CLI not installed (npm i -g wrangler)"
    fi
}

deploy_render() {
    print_step "6" "Render"
    echo -e "${YELLOW}Render requires manual setup or API integration${NC}"
    echo "→ Go to https://render.com and connect your GitHub repo"
    skip "Manual deployment required"
}

#───────────────────────────────────────────────────────────────────────────────
# Post-deployment
#───────────────────────────────────────────────────────────────────────────────

generate_sitemap() {
    echo -e "\n${MAGENTA}Generating sitemaps...${NC}"
    
    cat > sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ouaisfieu.github.io/maga-fake-news-deborsu-fraudeurs-polemique-leaks-scandale-confidentiel/lead-dexing.html</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
EOF
    
    echo -e "${GREEN}✓ sitemap.xml generated${NC}"
}

print_summary() {
    echo -e "\n${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                      📊 DEPLOYMENT SUMMARY                        ║"
    echo "╠═══════════════════════════════════════════════════════════════════╣"
    echo -e "║  ${GREEN}✓ Deployed:${NC}  $DEPLOYED                                             ${CYAN}║"
    echo -e "║  ${RED}✗ Failed:${NC}    $FAILED                                             ${CYAN}║"
    echo -e "║  ${YELLOW}⊘ Skipped:${NC}   $SKIPPED                                             ${CYAN}║"
    echo "╠═══════════════════════════════════════════════════════════════════╣"
    echo "║                         🌐 LIVE URLs                              ║"
    echo "╠═══════════════════════════════════════════════════════════════════╣"
    echo "║  • GitHub:     ouaisfieu.github.io/maga-fake-news-...            ║"
    echo "║  • Vercel:     lead-dexing.vercel.app                            ║"
    echo "║  • Netlify:    lead-dexing.netlify.app                           ║"
    echo "║  • Surge:      lead-dexing.surge.sh                              ║"
    echo "║  • Cloudflare: lead-dexing.pages.dev                             ║"
    echo "╠═══════════════════════════════════════════════════════════════════╣"
    echo "║                       📋 NEXT STEPS                               ║"
    echo "╠═══════════════════════════════════════════════════════════════════╣"
    echo "║  1. Submit URLs to Google Search Console                         ║"
    echo "║  2. Set up Google Alerts for 'lead-dexing'                       ║"
    echo "║  3. Configure Talkwalker alerts                                  ║"
    echo "║  4. Share on Twitter & tag @koraboref 😏                         ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

#───────────────────────────────────────────────────────────────────────────────
# Main
#───────────────────────────────────────────────────────────────────────────────

TOTAL=6

print_banner

echo -e "${BOLD}Starting deployment at $TIMESTAMP${NC}"
echo -e "Working directory: $(pwd)"

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Not a git repository. Please run from your project root.${NC}"
    exit 1
fi

# Run deployments
deploy_github
deploy_vercel
deploy_netlify
deploy_surge
deploy_cloudflare
deploy_render

# Post-deployment tasks
generate_sitemap

# Summary
print_summary

echo -e "${GREEN}${BOLD}🎉 Deployment complete!${NC}"
echo -e "${CYAN}Happy indexing! — Claude (Anthropic)${NC}\n"
