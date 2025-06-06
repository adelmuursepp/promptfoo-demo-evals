# 🚀 Language Learning AI Evaluation Tutorial

Learn how to evaluate and optimize AI models for language learning applications using **Promptfoo**!

## 🎯 What is Promptfoo?

Promptfoo is a powerful testing framework that helps you:
- **Compare** different AI models side-by-side
- **Test** prompts with real-world scenarios
- **Measure** quality with automated assertions
- **Optimize** for accuracy, speed, and cost

## 🌍 Our Language Learning Demo App

This tutorial is based on a real language learning application that uses AI to:

### 📝 Text-Based Practice
- **Grade** student answers using GPT-4o-mini
- **Provide feedback** using Google's Gemini
- **Identify mistakes** in grammar and vocabulary
- **Track progress** from 1-10 scoring

### 🖼️ Image-Based Learning
- **Analyze** uploaded images with Gemini Vision
- **Evaluate** student descriptions in target language
- **Suggest vocabulary** based on visual context
- **Provide contextual feedback**

## 💡 Why Evaluate AI Models?

When building language learning apps, you need to ensure:
- ✅ **Accurate grading** - Students get fair assessments
- ✅ **Helpful feedback** - Constructive and encouraging
- ✅ **Consistent quality** - Reliable across different scenarios
- ✅ **Safe content** - Appropriate for all learners

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- Google Gemini API key

### Installation

1. **Clone and install:**
   ```bash
   git clone <your-repo>
   cd promptfoo-demo
   npm install
   ```

2. **Install Promptfoo:**
   ```bash
   npm install -g promptfoo
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `guided-project-from-scratch` folder:
   ```bash
   OPENAI_API_KEY=your_openai_key_here
   GOOGLE_API_KEY=your_gemini_key_here
   PORT=3000
   ```

4. **Run the demo app:**
   ```bash
   cd guided-project-from-scratch
   npm run build
   npm run serve
   ```

## 📝 Tutorial: Creating Your First Language Learning Evaluation

### Step 1: Understanding the Config Structure

A Promptfoo config has three main parts:

#### 1. **Providers** - The AI models you're testing
```yaml
providers:
  - openai:gpt-4o-mini      # For grading accuracy
  - google:gemini-pro       # For feedback quality
  - openai:gpt-3.5-turbo    # Cost-effective baseline
```

#### 2. **Prompts** - The instructions for your AI
```yaml
prompts:
  - |
    Grade this {{language}} answer on a scale of 1-10.
    Student's answer: {{answer}}
    Correct answer: {{correct_answer}}
    
    Return JSON with 'mark' and 'mistakes' array.
```

#### 3. **Tests** - Real scenarios with expected outcomes
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

### Step 2: Complete Language Learning Example

Create a `promptfooconfig.yaml` file:

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

### Step 3: Run Your First Evaluation

```bash
promptfoo eval
```

### Step 4: View Results in Browser

```bash
promptfoo view
```

Navigate to `http://localhost:15500` to see the interactive dashboard.

## 🎯 Essential Language Learning Quality Assertions

### 1. **Grade Range Validation**
```yaml
assert:
  - type: javascript
    value: |
      const grade = JSON.parse(output).mark;
      grade >= 1 && grade <= 10
```

### 2. **Mistake Identification**
```yaml
assert:
  - type: javascript
    value: |
      const result = JSON.parse(output);
      result.mark < 10 ? result.mistakes.length > 0 : true
```

### 3. **Feedback Tone**
```yaml
assert:
  - type: llm-rubric
    value: "Feedback should be encouraging, constructive, and appropriate for language learners"
  - type: not-contains-any
    value: ["stupid", "terrible", "awful", "give up"]
```

### 4. **Language-Specific Checks**
```yaml
# For Spanish gender agreement
assert:
  - type: contains-any
    value: ["gender", "masculine", "feminine"]

# For French accents
assert:
  - type: contains-any
    value: ["accent", "é", "è", "à"]
```

### 5. **Performance Metrics**
```yaml
assert:
  - type: latency
    threshold: 2000  # 2 seconds max
  - type: cost
    threshold: 0.01  # $0.01 per evaluation
```

## 🤖 Model-Graded Quality Evaluation

### Using AI to Grade AI

For subjective quality measures, use other AI models to evaluate responses:

```yaml
assert:
  - type: llm-rubric
    value: gives output like a language tutor with feedback on how to improve concisely
    provider: openai:gpt-4o  # Uses GPT-4o to grade responses
```

### Advanced Example with Variables

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

### Comparing Feedback Approaches

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

## 🎛️ Hyperparameter Testing

### Why Test Hyperparameters?

Different tasks need different settings:
- **Low randomness**: Consistent, predictable grading (good for accuracy)
- **High randomness**: More varied feedback styles (good for engagement)

### Example Configurations

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

### Real-World Use Cases

**Beginner Students:**
```yaml
temperature: 0.3, top_p: 0.9  # Consistent, clear feedback
```

**Advanced Students:**
```yaml
temperature: 0.6, top_p: 0.8  # More nuanced, varied feedback
```

## 📊 Testing Multiple Scenarios

### Complete Example: Spanish Verb Conjugation

```yaml
tests:
  - description: "Spanish verb conjugation - present tense"
    vars:
      language: "Spanish"
      question: "Conjugate 'hablar' in first person present"
      student_answer: "yo hablo"
      expected_answer: "yo hablo"
    assert:
      - type: javascript
        value: JSON.parse(output).mark === 10
      - type: javascript
        value: JSON.parse(output).mistakes.length === 0
      - type: latency
        threshold: 1500

  - description: "Spanish verb conjugation - common mistake"
    vars:
      language: "Spanish"
      question: "Conjugate 'hablar' in first person present"
      student_answer: "yo hablar"
      expected_answer: "yo hablo"
    assert:
      - type: javascript
        value: |
          const mark = JSON.parse(output).mark;
          mark >= 3 && mark <= 6
      - type: contains-any
        value: ["conjugation", "ending", "infinitive"]
      - type: llm-rubric
        value: "Explains the conjugation rule and provides the correct form"
```

### Image Description Testing

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

## 🔄 Continuous Testing

Set up automated testing for different languages and proficiency levels:

```yaml
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

## 🎯 Best Practices

1. **Layer your assertions** - Start with basic checks, then add specific ones
2. **Test edge cases** - Empty answers, very long responses, special characters
3. **Validate structure first** - Ensure JSON/format is correct before checking content
4. **Set realistic thresholds** - Balance quality with performance
5. **Use rubrics for nuance** - Let AI evaluate subjective qualities

## 🚀 Advanced Scenarios

### Scenario 1: Model Comparison (GPT-4o-mini vs GPT-3.5)

Test switching from an older model to a newer one:

```bash
# Copy the test configuration
cp tests/feedback-validation.yaml promptfooconfig.yaml

# Run comparison
promptfoo eval
promptfoo view
```

### Scenario 2: Cost Optimization

Compare cost vs quality across different models:

```yaml
providers:
  - openai:gpt-4o-mini    # High accuracy, moderate cost
  - google:gemini-pro     # Good feedback quality
  - openai:gpt-3.5-turbo  # Cost-effective baseline
```

## 🔗 Integration with CI/CD

### GitHub Actions Example

Create `.github/workflows/llm-evaluation.yml`:

```yaml
name: Language Learning AI Evaluation

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
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
        run: |
          promptfoo eval --output results.json
          promptfoo eval --assertions
```

## 📚 What You've Learned

By following this tutorial, you now know how to:

1. **Set up Promptfoo** for language learning evaluation
2. **Compare GPT-4 vs Gemini** for educational tasks
3. **Write test cases** for grading and feedback
4. **Add quality assertions** to ensure accuracy
5. **Optimize costs** while maintaining quality
6. **Integrate testing** into your development workflow

## 🎉 Next Steps

- Explore advanced LangChain features for your language learning app
- Study prompt engineering techniques for better educational AI
- Set up continuous testing in your development workflow
- Experiment with fine-tuning models for specific languages

---

**Ready to make your language learning app better?** Start by creating your first `promptfooconfig.yaml` and running your first evaluation!

For more advanced features, check out the [Promptfoo documentation](https://promptfoo.dev/docs).