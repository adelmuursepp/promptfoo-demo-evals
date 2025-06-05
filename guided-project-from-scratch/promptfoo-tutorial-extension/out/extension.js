"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
function activate(context) {
    console.log('Promptfoo Tutorial Extension is now active!');
    // Command to create basic config
    let createConfig = vscode.commands.registerCommand('promptfoo.createBasicConfig', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('Please open a workspace folder first');
            return;
        }
        const configContent = `# Promptfoo Configuration
# This config compares different LLMs on a customer service task

providers:
  - openai:gpt-4
  - anthropic:claude-3-opus-20240229
  - openai:gpt-3.5-turbo

prompts:
  - |
    You are a helpful customer service agent for an online store.
    
    Customer inquiry: {{inquiry}}
    
    Please provide a helpful and polite response.

tests:
  - vars:
      inquiry: "I received a damaged product. What should I do?"
    assert:
      - type: contains
        value: "sorry"
      - type: contains  
        value: "return"
      - type: llm-rubric
        value: "Response should be empathetic and provide clear next steps"
  
  - vars:
      inquiry: "How long does shipping usually take?"
    assert:
      - type: contains
        value: "shipping"
      - type: llm-rubric
        value: "Response should provide specific timeframes"
`;
        const configPath = path.join(workspaceFolder.uri.fsPath, 'promptfooconfig.yaml');
        fs.writeFileSync(configPath, configContent);
        // Open the file
        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage('Created promptfooconfig.yaml!');
    });
    // Command to add test scenarios
    let addScenarios = vscode.commands.registerCommand('promptfoo.addTestScenarios', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || !activeEditor.document.fileName.includes('promptfooconfig')) {
            vscode.window.showErrorMessage('Please open promptfooconfig.yaml first');
            return;
        }
        const additionalTests = `
  # Angry customer scenario
  - vars:
      inquiry: "This is the THIRD TIME I'm contacting you! My order never arrived!"
    assert:
      - type: contains
        value: "apologize"
      - type: llm-rubric
        value: "Response should acknowledge frustration and escalate appropriately"
  
  # Technical question
  - vars:
      inquiry: "What API endpoints do you support for order tracking?"
    assert:
      - type: llm-rubric
        value: "Response should either provide technical details or redirect to appropriate resources"
  
  # Refund request
  - vars:
      inquiry: "I want a full refund. The product doesn't match the description."
    assert:
      - type: contains-any
        value: ["refund", "return", "money back"]
      - type: llm-rubric
        value: "Response should explain the refund process clearly"
`;
        const editor = vscode.window.activeTextEditor;
        const document = editor.document;
        const lastLine = document.lineCount - 1;
        const lastChar = document.lineAt(lastLine).text.length;
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(lastLine, lastChar), additionalTests);
        });
        vscode.window.showInformationMessage('Added additional test scenarios!');
    });
    // Command to show cost analysis
    let showCost = vscode.commands.registerCommand('promptfoo.showCostAnalysis', async () => {
        const panel = vscode.window.createWebviewPanel('promptfooCost', 'Promptfoo Cost Analysis', vscode.ViewColumn.Two, { enableScripts: true });
        panel.webview.html = getCostAnalysisHtml();
    });
    // Command to create GitHub Action
    let createAction = vscode.commands.registerCommand('promptfoo.createGitHubAction', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('Please open a workspace folder first');
            return;
        }
        const githubDir = path.join(workspaceFolder.uri.fsPath, '.github', 'workflows');
        if (!fs.existsSync(githubDir)) {
            fs.mkdirSync(githubDir, { recursive: true });
        }
        const actionContent = `name: LLM Evaluation

on:
  pull_request:
    paths:
      - 'prompts/**'
      - 'promptfooconfig.yaml'
  push:
    branches: [main]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Promptfoo
        run: npm install -g promptfoo
      
      - name: Run LLM Evaluation
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          promptfoo eval --output results.json
          promptfoo eval --assertions # Fail if assertions don't pass
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: llm-evaluation-results
          path: results.json
      
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('results.json', 'utf8'));
            
            let comment = '## 🤖 LLM Evaluation Results\\n\\n';
            comment += '| Model | Pass Rate | Avg Latency |\\n';
            comment += '|-------|-----------|-------------|\\n';
            
            // Add result summary
            for (const provider of results.providers) {
              comment += \`| \${provider.name} | \${provider.passRate}% | \${provider.avgLatency}ms |\\n\`;
            }
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
`;
        const actionPath = path.join(githubDir, 'llm-evaluation.yml');
        fs.writeFileSync(actionPath, actionContent);
        const doc = await vscode.workspace.openTextDocument(actionPath);
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage('Created GitHub Action for LLM evaluation!');
    });
    context.subscriptions.push(createConfig, addScenarios, showCost, createAction);
}
exports.activate = activate;
function getCostAnalysisHtml() {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: var(--vscode-font-family); 
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .chart-container { 
            margin: 20px 0; 
            padding: 20px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
        }
        h2 { color: var(--vscode-foreground); }
        .metric {
            display: inline-block;
            margin: 10px 20px;
            padding: 10px;
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 4px;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--vscode-terminal-ansiGreen);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        th { 
            background: var(--vscode-editor-selectionBackground);
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>📊 LLM Cost Analysis</h1>
    
    <div class="chart-container">
        <h2>Performance vs Cost Comparison</h2>
        
        <div>
            <div class="metric">
                <div>Total Tests Run</div>
                <div class="metric-value">24</div>
            </div>
            <div class="metric">
                <div>Total Cost</div>
                <div class="metric-value">$0.47</div>
            </div>
            <div class="metric">
                <div>Avg Response Time</div>
                <div class="metric-value">1.2s</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Model</th>
                    <th>Quality Score</th>
                    <th>Avg Latency</th>
                    <th>Cost/1K tokens</th>
                    <th>Total Cost</th>
                    <th>Pass Rate</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>GPT-4</td>
                    <td>9.2/10</td>
                    <td>2.1s</td>
                    <td>$0.03</td>
                    <td>$0.28</td>
                    <td>96%</td>
                </tr>
                <tr>
                    <td>Claude 3 Opus</td>
                    <td>9.0/10</td>
                    <td>1.8s</td>
                    <td>$0.015</td>
                    <td>$0.14</td>
                    <td>92%</td>
                </tr>
                <tr>
                    <td>GPT-3.5 Turbo</td>
                    <td>7.5/10</td>
                    <td>0.6s</td>
                    <td>$0.0005</td>
                    <td>$0.05</td>
                    <td>75%</td>
                </tr>
            </tbody>
        </table>

        <h3>💡 Recommendations</h3>
        <ul>
            <li><strong>Best Quality:</strong> GPT-4 - Use for customer-facing responses</li>
            <li><strong>Best Value:</strong> Claude 3 Opus - Good balance of quality and cost</li>
            <li><strong>Best Speed:</strong> GPT-3.5 Turbo - Use for internal tools or drafts</li>
        </ul>
    </div>
</body>
</html>`;
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map