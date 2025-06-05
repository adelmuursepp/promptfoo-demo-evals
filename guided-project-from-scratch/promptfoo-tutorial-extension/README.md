# Promptfoo Tutorial Extension

An interactive VS Code extension that teaches you how to evaluate and compare LLMs using Promptfoo CLI.

## Features

- 🚀 **Interactive Walkthrough**: Step-by-step guide built into VS Code
- 📝 **Auto-generated Configs**: Creates example configurations automatically
- 🖱️ **One-click Commands**: Run Promptfoo commands directly from the tutorial
- 📊 **Built-in Visualizations**: See cost analysis and results without leaving VS Code
- 🔄 **CI/CD Templates**: Ready-to-use GitHub Actions for continuous LLM testing

## Installation

1. Install the extension in VS Code
2. Open Command Palette (`Cmd/Ctrl + Shift + P`)
3. Run "Welcome: Open Walkthrough"
4. Select "Promptfoo: LLM Evaluation Basics"

## Usage in GitHub Codespaces

This extension is perfect for GitHub Codespaces:

1. Add to `.devcontainer/devcontainer.json`:
```json
{
  "customizations": {
    "vscode": {
      "extensions": ["promptfoo-tutorial"]
    }
  },
  "postCreateCommand": "npm install -g promptfoo"
}
```

2. The walkthrough will automatically appear when users open the Codespace!

## Tutorial Structure

1. **Welcome & Setup** - Install Promptfoo CLI
2. **First Config** - Create a basic evaluation 
3. **Run Evaluation** - Compare GPT-4 vs Claude
4. **Add Assertions** - Automatic quality checks
5. **View Results** - Interactive dashboards
6. **Multiple Scenarios** - Comprehensive testing
7. **Cost Analysis** - Optimize for budget
8. **CI Integration** - Automated testing
9. **Congratulations** - Next steps

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension
vsce package
```

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.