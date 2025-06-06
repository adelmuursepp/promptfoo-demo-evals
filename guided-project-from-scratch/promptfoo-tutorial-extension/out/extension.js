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
        const configContent = `# Language Learning AI Evaluation
# This config tests AI models for language learning applications

providers:
  - openai:gpt-4o-mini
  - google:gemini-pro
  - openai:gpt-3.5-turbo

prompts:
  - |
    You are a language teacher grading a student's answer.
    
    Language: {{language}}
    Question: {{question}}
    Student's answer: {{student_answer}}
    Expected answer: {{expected_answer}}
    
    Grade from 1-10 and identify specific mistakes.
    Return JSON: {"mark": number, "mistakes": [string]}

tests:
  - vars:
      language: "Spanish"
      question: "How do you say 'Good morning'?"
      student_answer: "Buenos días"
      expected_answer: "Buenos días"
    assert:
      - type: javascript
        value: JSON.parse(output).mark === 10
      - type: javascript
        value: JSON.parse(output).mistakes.length === 0
      - type: latency
        threshold: 2000
  
  - vars:
      language: "French"
      question: "Translate 'I am a student'"
      student_answer: "Je suis un étudiant"
      expected_answer: "Je suis étudiant"
    assert:
      - type: javascript
        value: |
          const result = JSON.parse(output);
          result.mark >= 8 && result.mark <= 9
      - type: contains-any
        value: ["article", "un"]
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
  # Perfect grammar - different language
  - vars:
      language: "German"
      question: "Say 'The book is on the table'"
      student_answer: "Das Buch ist auf dem Tisch"
      expected_answer: "Das Buch ist auf dem Tisch"
    assert:
      - type: javascript
        value: JSON.parse(output).mark === 10
      - type: javascript
        value: JSON.parse(output).mistakes.length === 0
  
  # Common verb conjugation mistake
  - vars:
      language: "Spanish"
      question: "Conjugate 'hablar' (to speak) - I speak"
      student_answer: "Yo hablar"
      expected_answer: "Yo hablo"
    assert:
      - type: javascript
        value: |
          const mark = JSON.parse(output).mark;
          mark >= 3 && mark <= 6
      - type: contains-any
        value: ["conjugation", "ending", "infinitive"]
  
  # Vocabulary mistake
  - vars:
      language: "French"
      question: "Say 'I like cats'"
      student_answer: "J'aime les chiens"
      expected_answer: "J'aime les chats"
    assert:
      - type: javascript
        value: |
          const mark = JSON.parse(output).mark;
          mark >= 2 && mark <= 5
      - type: contains-any
        value: ["vocabulary", "word", "chiens", "dogs"]
  
  # Complex sentence with multiple errors
  - vars:
      language: "Spanish"
      question: "Say 'The red cars are very fast'"
      student_answer: "El coche rojo son muy rapido"
      expected_answer: "Los coches rojos son muy rápidos"
    assert:
      - type: javascript
        value: |
          const result = JSON.parse(output);
          result.mark >= 4 && result.mark <= 7 &&
          result.mistakes.length >= 2
      - type: contains-any
        value: ["plural", "agreement", "accent"]
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
        const actionContent = `name: Language Learning AI Evaluation

on:
  pull_request:
    paths:
      - 'prompts/**'
      - 'promptfooconfig.yaml'
      - 'src/llms.ts'
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
      
      - name: Run Language Learning Evaluation
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          GOOGLE_API_KEY: \${{ secrets.GOOGLE_API_KEY }}
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
            
            let comment = '## 🎓 Language Learning AI Evaluation Results\\n\\n';
            comment += '| Model | Pass Rate | Avg Latency | Grading Accuracy |\\n';
            comment += '|-------|-----------|-------------|------------------|\\n';
            
            // Add result summary
            for (const provider of results.providers) {
              comment += \`| \${provider.name} | \${provider.passRate}% | \${provider.avgLatency}ms | \${provider.accuracy || 'N/A'} |\\n\`;
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
        vscode.window.showInformationMessage('Created GitHub Action for Language Learning AI evaluation!');
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
                    <td>GPT-4o-mini</td>
                    <td>9.1/10</td>
                    <td>1.2s</td>
                    <td>$0.00015</td>
                    <td>$0.08</td>
                    <td>94%</td>
                </tr>
                <tr>
                    <td>Gemini Pro</td>
                    <td>8.8/10</td>
                    <td>1.5s</td>
                    <td>$0.00025</td>
                    <td>$0.12</td>
                    <td>91%</td>
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
            <li><strong>Best Grading Accuracy:</strong> GPT-4o-mini - Excellent for precise language assessment</li>
            <li><strong>Best Feedback Quality:</strong> Gemini Pro - Provides comprehensive, encouraging feedback</li>
            <li><strong>Best Speed:</strong> GPT-3.5 Turbo - Use for quick practice sessions</li>
        </ul>
    </div>
</body>
</html>`;
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map