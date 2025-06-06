#!/bin/bash

# Install the pre-built VS Code extension
echo "Installing Language Learning AI tutorial extension..."
cd guided-project-from-scratch/promptfoo-tutorial-extension

# Install the existing VSIX file
code --install-extension promptfoo-tutorial-1.0.0.vsix

# Go back to root
cd ../..

echo "✅ Extension installed! Use Ctrl+Shift+P and search 'walkthrough' to start."
echo "Or run: code --command 'workbench.action.openWalkthrough' to see all walkthroughs."