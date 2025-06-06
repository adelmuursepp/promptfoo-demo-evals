document.addEventListener('DOMContentLoaded', () => {
  const imageUpload = document.getElementById('imageUpload');
  const imagePreview = document.getElementById('imagePreview');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const targetLanguage = document.getElementById('targetLanguage');
  const userDescription = document.getElementById('userDescription');
  const responseDiv = document.getElementById('imageResponse');
  
  let uploadedImage = null;

  // Handle image upload and preview
  imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        uploadedImage = e.target.result;
        imagePreview.innerHTML = `<img src="${uploadedImage}" alt="Uploaded image">`;
      };
      
      reader.readAsDataURL(file);
    }
  });

  // Handle analyze button click
  analyzeBtn.addEventListener('click', async () => {
    const language = targetLanguage.value;
    const description = userDescription.value.trim();
    
    if (!language) {
      alert('Please select a target language.');
      return;
    }
    
    if (!uploadedImage) {
      alert('Please upload an image.');
      return;
    }
    
    if (!description) {
      alert('Please describe the image in your target language.');
      return;
    }

    // Show loading state
    responseDiv.innerHTML = '<p>Analyzing image and checking your description...</p>';
    
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          language, 
          description,
          image: uploadedImage 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Display the response
      let vocabularyHtml = data.vocabulary;
      
      // Handle vocabulary if it's an array of objects
      if (Array.isArray(data.vocabulary)) {
        vocabularyHtml = '<ul>';
        data.vocabulary.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            // Handle object format like {word: "casa", translation: "house"}
            const word = item.word || item.term || Object.keys(item)[0];
            const translation = item.translation || item.meaning || Object.values(item)[0];
            vocabularyHtml += `<li><strong>${word}</strong> - ${translation}</li>`;
          } else {
            vocabularyHtml += `<li>${item}</li>`;
          }
        });
        vocabularyHtml += '</ul>';
      } else if (typeof data.vocabulary === 'string') {
        // If it's already a string, use it as is
        vocabularyHtml = data.vocabulary;
      }
      
      responseDiv.innerHTML = `
        <h3>Learning Feedback:</h3>
        <div class="feedback-section">
          <h4>Image Analysis:</h4>
          <p>${data.imageAnalysis}</p>
        </div>
        <div class="feedback-section">
          <h4>Your Description Feedback:</h4>
          <p><strong>Grade:</strong> ${data.mark}/10</p>
          <p>${data.feedback}</p>
        </div>
        <div class="feedback-section">
          <h4>Vocabulary Suggestions:</h4>
          ${vocabularyHtml}
        </div>
      `;
    } catch (error) {
      console.error('Error:', error);
      responseDiv.innerHTML = '<p style="color: red;">An error occurred. Please try again.</p>';
    }
  });
});