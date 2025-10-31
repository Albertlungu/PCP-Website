#!/bin/bash

# Start Admin Server Script for Mac
# Double-click this file to start the admin server

cd "$(dirname "$0")"

echo "🎵 Starting UOttawa Pre-College Admin Server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Download the LTS version and run the installer."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Show Node version
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION detected"
echo ""

# Start the server
node admin-server.js

# Keep terminal open on error
if [ $? -ne 0 ]; then
    echo ""
    read -p "Press Enter to exit..."
fi
