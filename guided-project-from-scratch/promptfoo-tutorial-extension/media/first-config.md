# 📝 Creating Your First Language Learning Evaluation

Let's create a Promptfoo configuration to test our language learning AI models!

## 🎯 Understanding the Config Structure

A Promptfoo config has three main parts:

### 1. **Providers** - The AI models you're testing
```yaml
providers:
  - openai:gpt-4o-mini      # For grading accuracy
  - google:gemini-pro       # For feedback quality
  - openai:gpt-3.5-turbo    # Cost-effective baseline
```

### 2. **Prompts** - The instructions for your AI
```yaml
prompts:
  - |
    Grade this {{language}} answer on a scale of 1-10.
    Student's answer: {{answer}}
    Correct answer: {{correct_answer}}
    
    Return JSON with 'mark' and 'mistakes' array.
```

### 3. **Tests** - Real scenarios with expected outcomes
```yaml
tests:
  - vars:
      language: "French"
      answer: "Je suis un étudiant"
      correct_answer: "Je suis étudiant"
    assert:
      - type: javascript
        value: output.mark >= 8 && output.mark <= 10
```

## 🌍 Language Learning Example

Here's a complete config for testing language grading:

```yaml
# Language Learning AI Evaluation
description: "Test AI models for grading language exercises"

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
  # Perfect answer
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
  
  # Minor mistake
  - vars:
      language: "Spanish"
      question: "How do you say 'Good morning'?"
      student_answer: "Buenas días"
      expected_answer: "Buenos días"
    assert:
      - type: javascript
        value: |
          const result = JSON.parse(output);
          result.mark >= 7 && result.mark <= 9
      - type: contains
        value: "gender"
```

## 💡 Testing Feedback Quality

Now let's add a test for feedback generation:

```yaml
prompts:
  - |
    Based on this grading, provide encouraging feedback:
    
    Language: {{language}}
    Grade: {{grade}}/10
    Mistakes: {{mistakes}}
    
    Give constructive feedback in 2-3 sentences.

tests:
  - vars:
      language: "French"
      grade: 7
      mistakes: '["verb conjugation", "accent marks"]'
    assert:
      - type: llm-rubric
        value: "Feedback is encouraging and mentions specific areas for improvement"
      - type: contains-any
        value: ["conjugation", "verb", "accent"]
      - type: javascript
        value: output.length > 50 && output.length < 300
```

## 🎯 Task: Create Your Config

1. Click the button below to create a config file
2. It will include tests for both grading and feedback
3. Run the evaluation to see results!

This config will help you:
- ✅ Test grading accuracy across models
- ✅ Ensure feedback is helpful and constructive
- ✅ Compare response times and costs
- ✅ Find the best model for your language learning app