#!/bin/bash

# Independent Testing Script for Semantest Teams
# Carlos (Integration Specialist) - Enabling independent testing

echo "🧪 Semantest Independent Testing System"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests for specific component
run_component_tests() {
    local component=$1
    local owner=$2
    local test_pattern=$3
    
    echo -e "${YELLOW}Testing $component (Owner: $owner)${NC}"
    echo "----------------------------------------"
    
    npm test -- $test_pattern --coverage --coverageDirectory=coverage/$component
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $component tests passed!${NC}"
    else
        echo -e "${RED}🔴 $component tests failed (expected in RED phase)${NC}"
    fi
    echo ""
}

# Main menu
show_menu() {
    echo "Select component to test:"
    echo "1) Wences - Browser (Idle/Busy Detection)"
    echo "2) Elena - CLI (Command Processing)"
    echo "3) Fran - Server (WebSocket/API)"
    echo "4) Carlos - Integration (Monitoring)"
    echo "5) Ana - Performance (Metrics)"
    echo "6) ALL - Run all tests"
    echo "7) Watch Mode - Auto-run on changes"
    echo "0) Exit"
    echo ""
    read -p "Enter choice [0-7]: " choice
}

# Execute based on choice
while true; do
    show_menu
    
    case $choice in
        1)
            echo "🌐 Wences - Testing Browser Components"
            run_component_tests "browser" "Wences" "src/browser/__tests__"
            ;;
        2)
            echo "💻 Elena - Testing CLI Components"
            run_component_tests "cli" "Elena" "src/cli/__tests__"
            ;;
        3)
            echo "🖥️ Fran - Testing Server Components"
            run_component_tests "server" "Fran" "src/server/__tests__"
            ;;
        4)
            echo "🔄 Carlos - Testing Integration"
            run_component_tests "integration" "Carlos" "src/integration/__tests__"
            ;;
        5)
            echo "📊 Ana - Testing Performance Monitoring"
            run_component_tests "monitoring" "Ana" "src/monitoring/__tests__"
            ;;
        6)
            echo "🎯 Running ALL Tests"
            npm test -- --coverage
            ;;
        7)
            echo "👀 Starting Watch Mode"
            npm test -- --watch
            break
            ;;
        0)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done