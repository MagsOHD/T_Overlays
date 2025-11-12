#!/bin/bash

# Script pour ouvrir les overlays dans le navigateur

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🎮 T_Overlays - Visualisation"
echo "=============================="
echo ""
echo "Choisissez un overlay à visualiser :"
echo ""
echo "0. Page de navigation principale"
echo "1. Starting Soon (Countdown)"
echo "2. Be Right Back (BRB)"
echo "3. Stream Ended"
echo "4. Alertes"
echo "5. Chat Box"
echo ""
echo "Ou tapez 'all' pour ouvrir tous les overlays"
echo ""

read -p "Votre choix (0-5 ou 'all'): " choice

case $choice in
    0)
        xdg-open "$SCRIPT_DIR/index.html" 2>/dev/null || open "$SCRIPT_DIR/index.html" 2>/dev/null || start "$SCRIPT_DIR/index.html"
        echo "✅ Page principale ouverte"
        ;;
    1)
        xdg-open "$SCRIPT_DIR/overlays/starting-soon/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/starting-soon/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/starting-soon/index.html"
        echo "✅ Starting Soon ouvert"
        ;;
    2)
        xdg-open "$SCRIPT_DIR/overlays/brb/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/brb/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/brb/index.html"
        echo "✅ BRB ouvert"
        ;;
    3)
        xdg-open "$SCRIPT_DIR/overlays/ended/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/ended/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/ended/index.html"
        echo "✅ Stream Ended ouvert"
        ;;
    4)
        xdg-open "$SCRIPT_DIR/overlays/alerts/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/alerts/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/alerts/index.html"
        echo "✅ Alertes ouvert"
        echo ""
        echo "💡 Pour tester une alerte, ouvrez la console (F12) et tapez :"
        echo "   window.testAlert('follow')"
        echo "   window.testAlert('subscription')"
        echo "   window.testAlert('donation')"
        ;;
    5)
        xdg-open "$SCRIPT_DIR/overlays/chat-box/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/chat-box/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/chat-box/index.html"
        echo "✅ Chat Box ouvert"
        echo ""
        echo "💡 Pour tester le chat, ouvrez la console (F12) et tapez :"
        echo "   window.testChat()"
        ;;
    all)
        echo "🚀 Ouverture de tous les overlays..."
        xdg-open "$SCRIPT_DIR/index.html" 2>/dev/null || open "$SCRIPT_DIR/index.html" 2>/dev/null || start "$SCRIPT_DIR/index.html"
        sleep 1
        xdg-open "$SCRIPT_DIR/overlays/starting-soon/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/starting-soon/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/starting-soon/index.html"
        sleep 1
        xdg-open "$SCRIPT_DIR/overlays/brb/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/brb/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/brb/index.html"
        sleep 1
        xdg-open "$SCRIPT_DIR/overlays/ended/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/ended/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/ended/index.html"
        sleep 1
        xdg-open "$SCRIPT_DIR/overlays/alerts/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/alerts/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/alerts/index.html"
        sleep 1
        xdg-open "$SCRIPT_DIR/overlays/chat-box/index.html" 2>/dev/null || open "$SCRIPT_DIR/overlays/chat-box/index.html" 2>/dev/null || start "$SCRIPT_DIR/overlays/chat-box/index.html"
        echo "✅ Tous les overlays ouverts"
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "📖 Astuce : Utilisez F12 pour ouvrir la console et tester les fonctionnalités"
