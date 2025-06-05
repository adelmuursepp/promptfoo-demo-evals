# ✅ Adding Quality Assertions

Assertions automatically check if responses meet your requirements. Here are the most useful types:

## Basic Assertions

### Contains
```yaml
assert:
  - type: contains
    value: "return policy"
```
Checks if response includes specific text.

### Regex Match
```yaml
assert:
  - type: regex
    value: "\\b[A-Z0-9]{6}\\b"  # Order number format
```
For pattern matching.

## Advanced Assertions

### LLM as Judge
```yaml
assert:
  - type: llm-rubric
    value: "Response should be empathetic and professional"
```
Uses another LLM to grade the response!

### Length Checks
```yaml
assert:
  - type: javascript
    value: "output.length < 500"
```
Ensure concise responses.

## 🎯 Your Task
Add these assertions to your config:
1. Check for polite language (contains "please" or "thank you")
2. Ensure no hallucinations (llm-rubric)
3. Verify appropriate response length

Run the evaluation again to see which models pass!