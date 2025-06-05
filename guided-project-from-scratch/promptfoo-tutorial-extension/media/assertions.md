# 🎯 Language Learning Quality Assertions

Assertions are automated checks that ensure your AI models provide accurate, helpful, and safe responses for language learners.

## 📚 Essential Assertions for Language Learning

### 1. **Grade Range Validation**
Ensure grades are always between 1-10:
```yaml
assert:
  - type: javascript
    value: |
      const grade = JSON.parse(output).mark;
      grade >= 1 && grade <= 10
```

### 2. **Mistake Identification**
Check that mistakes are properly detected:
```yaml
assert:
  - type: javascript
    value: |
      const result = JSON.parse(output);
      // For incorrect answers, mistakes should be identified
      result.mark < 10 ? result.mistakes.length > 0 : true
```

### 3. **Feedback Tone**
Ensure feedback is encouraging and constructive:
```yaml
assert:
  - type: llm-rubric
    value: "Feedback should be encouraging, constructive, and appropriate for language learners"
  - type: not-contains-any
    value: ["stupid", "terrible", "awful", "give up"]
```

### 4. **Language-Specific Checks**
Test for proper language understanding:
```yaml
# For Spanish gender agreement
assert:
  - type: contains-any
    value: ["gender", "masculine", "feminine"]
    # When the mistake is about gender

# For French accents
assert:
  - type: contains-any
    value: ["accent", "é", "è", "à"]
    # When dealing with accent mistakes
```

## 🔍 Advanced Language Learning Assertions

### Content Safety
```yaml
assert:
  - type: moderation
    threshold: 0.8
  - type: not-contains-any
    value: ["inappropriate", "offensive", "profanity"]
```

### Response Length
```yaml
assert:
  # Feedback should be concise but helpful
  - type: javascript
    value: output.length > 50 && output.length < 500
```

### JSON Structure Validation
```yaml
assert:
  - type: is-json
  - type: javascript
    value: |
      const result = JSON.parse(output);
      result.hasOwnProperty('mark') && 
      result.hasOwnProperty('mistakes') &&
      Array.isArray(result.mistakes)
```

### Performance Metrics
```yaml
assert:
  # Response time for real-time feedback
  - type: latency
    threshold: 2000  # 2 seconds max
  
  # Cost efficiency
  - type: cost
    threshold: 0.01  # $0.01 per evaluation
```

## 🌟 Complete Example: Spanish Verb Conjugation

```yaml
tests:
  - description: "Spanish verb conjugation - present tense"
    vars:
      language: "Spanish"
      question: "Conjugate 'hablar' in first person present"
      student_answer: "yo hablo"
      expected_answer: "yo hablo"
    assert:
      # Correct grade
      - type: javascript
        value: JSON.parse(output).mark === 10
      
      # No mistakes for perfect answer
      - type: javascript
        value: JSON.parse(output).mistakes.length === 0
      
      # Appropriate response time
      - type: latency
        threshold: 1500

  - description: "Spanish verb conjugation - common mistake"
    vars:
      language: "Spanish"
      question: "Conjugate 'hablar' in first person present"
      student_answer: "yo hablar"
      expected_answer: "yo hablo"
    assert:
      # Lower grade for mistake
      - type: javascript
        value: |
          const mark = JSON.parse(output).mark;
          mark >= 3 && mark <= 6
      
      # Identifies conjugation error
      - type: contains-any
        value: ["conjugation", "ending", "infinitive"]
      
      # Helpful feedback
      - type: llm-rubric
        value: "Explains the conjugation rule and provides the correct form"
```

## 📊 Image Description Assertions

For image-based learning:
```yaml
assert:
  # Vocabulary suggestions present
  - type: javascript
    value: |
      const result = JSON.parse(output);
      result.vocabulary && result.vocabulary.length >= 3
  
  # Feedback relates to image content
  - type: llm-rubric
    value: "Feedback references specific objects or scenes from the image"
  
  # Grammar check performed
  - type: contains-any
    value: ["grammar", "syntax", "structure"]
```

## 🎯 Best Practices

1. **Layer your assertions** - Start with basic checks, then add specific ones
2. **Test edge cases** - Empty answers, very long responses, special characters
3. **Validate structure first** - Ensure JSON/format is correct before checking content
4. **Set realistic thresholds** - Balance quality with performance
5. **Use rubrics for nuance** - Let AI evaluate subjective qualities

These assertions will help ensure your language learning AI provides consistent, high-quality educational experiences!

## 🤖 Model-Graded Quality Evaluation

### What if I Wish to Measure Quality?

Measuring quality of the models is essential when planning whether to migrate to newer or different models. However, it can be subjective and depends on the use case of the model. The most common solution is to use another, generally intelligent LLM to grade the responses. This helps to evaluate RAG applications, detect hallucinations and check for factuality, among many other use cases.

For this, Promptfoo provides **model-graded evaluations**:

```yaml
assert:
  - type: llm-rubric
    value: gives output like a language tutor with feedback on how to improve concisely
    provider: openai:gpt-4o  # Uses GPT-4o to grade responses
```

This configuration directs GPT-4o to assess outputs based on criteria like conciseness and whether it answers like a language tutor. By default, Promptfoo uses OpenAI GPT-4 for grading, but you can specify other models:

```yaml
assert:
  - type: llm-rubric
    value: provides encouraging feedback appropriate for language learners
    provider: google:gemini-pro  # Uses Gemini to grade responses
```

### Advanced Example: Grading with Variables

In this example, the rubric is dynamic, incorporating variables such as `{{language}}` to check language-specific criteria:

```yaml
prompts:
  - |
    Grade this {{language}} answer and provide feedback.
    Student answer: {{student_answer}}
    Expected: {{expected_answer}}

defaultTest:
  assert:
    - type: llm-rubric
      value: "Accurately grades the {{language}} answer without being overly harsh or lenient."

tests:
  - vars:
      language: "Spanish"
      student_answer: "Hola como estas"
      expected_answer: "Hola, ¿cómo estás?"
  - vars:
      language: "French"
      student_answer: "Bonjour ca va"
      expected_answer: "Bonjour, ça va ?"
```

This configuration:
- Ensures accurate grading for different languages
- Checks that feedback is appropriately calibrated
- Validates language-specific understanding

### Advanced Example: Using select-best for Feedback Quality

The `select-best` assertion allows you to compare multiple feedback approaches and choose the best one:

```yaml
prompts:
  - "Provide brief feedback on this {{language}} answer: {{student_answer}}"
  - "Give detailed, encouraging feedback on this {{language}} answer: {{student_answer}}"

tests:
  - vars:
      language: "Spanish"
      student_answer: "Me llamo es Juan"
    assert:
      - type: select-best
        value: "Choose the feedback that is most helpful for a language learner"
```

This configuration:
- Compares brief vs detailed feedback approaches
- Selects the most pedagogically effective response
- Helps optimize feedback style for different scenarios

## 🎛️ Hyperparameter Testing for Language Learning

### Why Test Hyperparameters?

Hyperparameters like temperature, top-p sampling, and repetition penalties directly influence creativity, coherence, and precision in language learning contexts:

- **Low randomness**: Consistent, predictable grading (good for accuracy)
- **High randomness**: More varied feedback styles (good for engagement)

### Example 1: Temperature for Different Tasks

```yaml
providers:
  # For grading - need consistency
  - id: openai:gpt-4o-mini
    config:
      temperature: 0.2  # Predictable grading
      top_p: 0.9
  
  # For feedback - allow creativity
  - id: openai:gpt-4o-mini
    config:
      temperature: 0.7  # More creative feedback
      top_p: 0.8
```

**Low Temperature (0.2)**: Good for consistent language grading
**Higher Temperature (0.7)**: Better for varied, engaging feedback

### Example 2: Gemini for Image Analysis

```yaml
providers:
  - id: google:gemini-pro-vision
    config:
      temperature: 0.5  # Balanced for image description evaluation
      top_p: 0.9
      max_output_tokens: 300
```

### Real-World Use Case: Adaptive Feedback

**Beginner Students**:
```yaml
temperature: 0.3, top_p: 0.9  # Consistent, clear feedback
```

**Advanced Students**:
```yaml
temperature: 0.6, top_p: 0.8  # More nuanced, varied feedback
```

## 🔄 Continuous Testing for Language Learning

Set up automated testing to ensure your language learning AI maintains quality:

```yaml
# Test different languages and proficiency levels
tests:
  - description: "Beginner Spanish grading"
    vars:
      language: "Spanish" 
      level: "beginner"
    assert:
      - type: llm-rubric
        value: "Feedback is encouraging and explains basic grammar concepts clearly"
        provider: openai:gpt-4o
  
  - description: "Advanced French grading"
    vars:
      language: "French"
      level: "advanced" 
    assert:
      - type: llm-rubric
        value: "Feedback addresses subtle grammar and style issues appropriately"
        provider: google:gemini-pro
```

This approach helps you maintain consistent quality across different languages, proficiency levels, and learning scenarios.