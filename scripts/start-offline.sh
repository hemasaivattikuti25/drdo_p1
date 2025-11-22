#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Offline Deployment Setup...${NC}"

# Directory check
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}Error: Must be run from the project root directory.${NC}"
    exit 1
fi

# Build Frontend
echo -e "${YELLOW}Checking frontend build...${NC}"
if [ ! -d "frontend/build" ]; then
    echo -e "${YELLOW}Frontend build not found. Building now...${NC}"
    cd frontend
    npm install
    npm run build
    cd ..
else
    echo -e "${GREEN}Frontend build found.${NC}"
    read -p "Do you want to rebuild the frontend? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Rebuilding frontend...${NC}"
        cd frontend
        npm install
        npm run build
        cd ..
    fi
fi

# Copy Build to Backend
echo -e "${YELLOW}Copying build artifacts to backend...${NC}"
rm -rf backend/build
cp -r frontend/build backend/build
echo -e "${GREEN}Build artifacts copied.${NC}"

# Start Backend
echo -e "${GREEN}Starting Backend in Production Mode...${NC}"
cd backend
npm start
