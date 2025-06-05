# 📝 Understanding the Config File

Your `promptfooconfig.yaml` has three main sections:

## 1. Providers
```yaml
providers:
  - openai:gpt-4
  - anthropic:claude-3-opus
```
These are the LLMs you're comparing.

## 2. Prompts
```yaml
prompts:
  - |
    You are a helpful assistant.
    User: {{question}}
```
Your prompt template with variables in `{{brackets}}`.

## 3. Tests
```yaml
tests:
  - vars:
      question: "What's the weather?"
    assert:
      - type: contains
        value: "weather"
```
Test cases with expected outputs.

## 🎯 Your Task
The config file has been created with a customer service scenario. Take a moment to read through it and understand each section.

**Tip:** You can modify the prompt or add your own test cases!