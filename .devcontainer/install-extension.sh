#!/bin/bash

# Install vsce globally for packaging extensions
npm install -g @vscode/vsce

# Build and install the VS Code extension
echo "Building VS Code extension..."
cd guided-project-from-scratch/promptfoo-tutorial-extension

# Install dependencies and build
npm install && npm run compile

# Package and install the extension
vsce package --no-git-tag-version
code --install-extension promptfoo-language-learning-1.0.0.vsix

# Go back to root and install promptfoo
cd ../.. 

echo "✅ Extension for the guide for using Promptfoo evals installed! Use Ctrl+Shift+P and search 'Language Learning' to start."