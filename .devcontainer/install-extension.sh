#!/bin/bash

# Install dependencies for the main project
echo "Installing main project dependencies..."
npm install

# Build and install the VS Code extension
echo "Building and installing VS Code extension..."
cd guided-project-from-scratch/promptfoo-tutorial-extension

# Install extension dependencies
npm install

# Compile TypeScript
npm run compile

# Package the extension
npx vsce package --no-git-tag-version

# Install the extension globally in the codespace
echo "Installing extension in VS Code..."
code --install-extension promptfoo-language-learning-1.0.0.vsix

# Go back to root
cd ../..

# Install promptfoo globally
echo "Installing Promptfoo..."
npm install -g promptfoo

echo "Setup complete! Your language learning AI tutorial extension is ready to use."
echo "Open VS Code Command Palette (Ctrl+Shift+P) and search for 'Language Learning' to get started."