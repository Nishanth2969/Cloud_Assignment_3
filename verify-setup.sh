#!/bin/bash

echo "=================================="
echo "Smart Photo Album - Setup Verification"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ISSUES=0

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo -e "${RED}✗ Not in project root directory${NC}"
    exit 1
fi

echo "Checking project structure..."
echo ""

# Check Lambda files
echo "Lambda Functions:"
if [ -f "lambda/index-photos/lambda_function.py" ]; then
    echo -e "  ${GREEN}✓${NC} index-photos Lambda found"
else
    echo -e "  ${RED}✗${NC} index-photos Lambda missing"
    ISSUES=$((ISSUES + 1))
fi

if [ -f "lambda/search-photos/lambda_function.py" ]; then
    echo -e "  ${GREEN}✓${NC} search-photos Lambda found"
else
    echo -e "  ${RED}✗${NC} search-photos Lambda missing"
    ISSUES=$((ISSUES + 1))
fi

# Check frontend files
echo ""
echo "Frontend Files:"
if [ -d "frontend-react" ]; then
    echo -e "  ${GREEN}✓${NC} React frontend directory found"
    
    if [ -f "frontend-react/package.json" ]; then
        echo -e "  ${GREEN}✓${NC} package.json found"
    else
        echo -e "  ${RED}✗${NC} package.json missing"
        ISSUES=$((ISSUES + 1))
    fi
    
    if [ -f "frontend-react/src/App.js" ]; then
        echo -e "  ${GREEN}✓${NC} App.js found"
    else
        echo -e "  ${RED}✗${NC} App.js missing"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "  ${RED}✗${NC} React frontend directory missing"
    ISSUES=$((ISSUES + 1))
fi

# Check test files
echo ""
echo "Test Files:"
TEST_FILES=(
    "frontend-react/src/App.test.js"
    "frontend-react/src/components/Header.test.js"
    "frontend-react/src/components/SearchSection.test.js"
    "frontend-react/src/components/UploadSection.test.js"
    "frontend-react/src/components/PhotoCard.test.js"
    "frontend-react/src/components/PhotoGallery.test.js"
    "frontend-react/src/components/Footer.test.js"
    "frontend-react/src/services/api.test.js"
)

TEST_COUNT=0
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        TEST_COUNT=$((TEST_COUNT + 1))
    fi
done

echo -e "  ${GREEN}✓${NC} Found $TEST_COUNT/8 test files"

if [ $TEST_COUNT -ne 8 ]; then
    echo -e "  ${YELLOW}⚠${NC} Some test files may be missing"
fi

# Check CloudFormation
echo ""
echo "CloudFormation:"
if [ -f "cloudformation/template.yaml" ]; then
    echo -e "  ${GREEN}✓${NC} CloudFormation template found"
else
    echo -e "  ${RED}✗${NC} CloudFormation template missing"
    ISSUES=$((ISSUES + 1))
fi

# Check documentation
echo ""
echo "Documentation:"
DOCS=(
    "README.md"
    "DEPLOYMENT_GUIDE.md"
    "PROJECT_SUMMARY.md"
    "QUICK_START.md"
    "frontend-react/README.md"
    "frontend-react/TESTING_GUIDE.md"
)

DOC_COUNT=0
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        DOC_COUNT=$((DOC_COUNT + 1))
    fi
done

echo -e "  ${GREEN}✓${NC} Found $DOC_COUNT/6 documentation files"

# Check Lex configuration
echo ""
echo "Lex Bot Configuration:"
if [ -f "lex-bot-config/utterances.txt" ]; then
    echo -e "  ${GREEN}✓${NC} Utterances file found"
else
    echo -e "  ${RED}✗${NC} Utterances file missing"
    ISSUES=$((ISSUES + 1))
fi

if [ -f "lex-bot-config/bot-setup-instructions.md" ]; then
    echo -e "  ${GREEN}✓${NC} Setup instructions found"
else
    echo -e "  ${RED}✗${NC} Setup instructions missing"
    ISSUES=$((ISSUES + 1))
fi

# Check if Node.js is installed
echo ""
echo "Environment Check:"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "  ${YELLOW}⚠${NC} Node.js not installed (required for frontend)"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "  ${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "  ${YELLOW}⚠${NC} npm not installed (required for frontend)"
fi

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "  ${GREEN}✓${NC} Python installed: $PYTHON_VERSION"
else
    echo -e "  ${YELLOW}⚠${NC} Python not installed (required for Lambda)"
fi

if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version)
    echo -e "  ${GREEN}✓${NC} AWS CLI installed: $AWS_VERSION"
else
    echo -e "  ${YELLOW}⚠${NC} AWS CLI not installed (required for deployment)"
fi

# Summary
echo ""
echo "=================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All core files present!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. cd frontend-react && npm install"
    echo "2. npm test (to run all tests)"
    echo "3. See QUICK_START.md for deployment"
else
    echo -e "${RED}✗ Found $ISSUES issues${NC}"
    echo "Please check missing files above"
fi
echo "=================================="

