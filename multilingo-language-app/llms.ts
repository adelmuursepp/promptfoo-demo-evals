import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");


// Helper function to create prompt messages
function createGradingPrompt(language: string, answer: string): string {
  return `Grade the following answer in ${language} on a scale of 1 to 10.
Provide the grade as an integer under the key "mark" and list the mistakes under the key "mistakes".

Answer:
"${answer}"

Response format (JSON):
{
  "mark": integer,
  "mistakes": ["mistake1", "mistake2", ...]
}`;
}

function createFeedbackPrompt(language: string, mark: number, mistakes: string): string {
  return `Based on the following grading in ${language}, provide constructive feedback to the student in English so they can improve in learning the language. If the mark is 10 then just say the user did a great work. Do not use markdown.

Grading:
Mark: ${mark}
Mistakes: ${mistakes}`;
}

function createGuardrailsPrompt(language: string, feedback: string): string {
  return `Analyze the following feedback in ${language} for any inappropriate or offensive content. Respond with "Clean" if the content is appropriate or "Flagged" if it contains disallowed content.

Feedback:
"${feedback}"

Analysis:`;
}


/**
 * Type Definitions
 */
interface GradingResponse {
  mark: number;
  mistakes: string[];
}

interface ImageAnalysisResponse {
  imageAnalysis: string;
  mark: number;
  feedback: string;
  vocabulary: string;
}

/**
 * Type Guard to Check if an Error is an Instance of Error
 */
function isError(error: unknown): error is Error {
  return typeof error === "object" && error !== null && "message" in error;
}

/**
 * Grades the User's Answer
 * @param language - The language of the answer.
 * @param answer - The user's answer to grade.
 * @returns GradingResponse containing mark and mistakes.
 */
export async function gradeAnswer(language: string, answer: string): Promise<GradingResponse> {
  try {
    const prompt = createGradingPrompt(language, answer);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an experienced language tutor." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const gradingContent = response.choices[0]?.message?.content || "";
    console.log("Grading content received:", gradingContent);

    const grading: GradingResponse = JSON.parse(gradingContent);
    return grading;
  } catch (error) {
    if (isError(error)) {
      console.error("Error in gradeAnswer:", error.message);
      throw new Error(`Failed to grade answer: ${error.message}`);
    } else {
      console.error("Unknown error in gradeAnswer:", error);
      throw new Error("Failed to grade answer due to an unknown error.");
    }
  }
}

/**
 * Generates Feedback Based on Grading
 * @param language - The language for feedback.
 * @param grading - The grading response containing mark and mistakes.
 * @returns A feedback string for the user.
 */
export async function generateFeedback(language: string, grading: GradingResponse): Promise<string> {
  try {
    const { mark, mistakes } = grading;
    const mistakesString = JSON.stringify(mistakes);
    const prompt = createFeedbackPrompt(language, mark, mistakesString);

    // Use Gemini for feedback generation
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      { text: "You are a friendly language tutor.\n\n" + prompt }
    ]);

    const feedbackContent = result.response.text();
    console.log("Feedback content received:", feedbackContent);

    return feedbackContent;
  } catch (error) {
    if (isError(error)) {
      console.error("Error in generateFeedback:", error.message);
      throw new Error(`Failed to generate feedback: ${error.message}`);
    } else {
      console.error("Unknown error in generateFeedback:", error);
      throw new Error("Failed to generate feedback due to an unknown error.");
    }
  }
}

/**
 * Optional: Moderates Feedback Content
 * @param language - The language of the feedback.
 * @param feedback - The feedback generated for the user.
 * @returns Boolean indicating if feedback is clean (true) or contains inappropriate content (false).
 */
export async function moderateFeedback(language: string, feedback: string): Promise<boolean> {
  try {
    const prompt = createGuardrailsPrompt(language, feedback);

    // Call OpenAI API for moderation
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a content moderator." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const analysisContent = response.choices[0]?.message?.content || "";
    console.log("Analysis content received:", analysisContent);

    return analysisContent.toLowerCase().includes("clean");
  } catch (error) {
    if (isError(error)) {
      console.error("Error in moderateFeedback:", error.message);
      return true;
    } else {
      console.error("Unknown error in moderateFeedback:", error);
      return true;
    }
  }
}

/**
 * Analyzes an image and provides language learning feedback
 * @param language - The target language for learning
 * @param description - The user's description of the image
 * @param imageBase64 - The image in base64 format
 * @returns ImageAnalysisResponse containing analysis, grading, and vocabulary
 */
export async function analyzeImageForLanguageLearning(
  language: string, 
  description: string, 
  imageBase64: string
): Promise<ImageAnalysisResponse> {
  try {
    // Use Gemini's vision capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Remove the data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const prompt = `You are a friendly language tutor helping students learn ${language} through visual learning.

Analyze this image and do the following:
1. Describe what you see in the image in English (2-3 sentences)
2. Grade the student's description in ${language} on a scale of 1-10 based on accuracy, grammar, and vocabulary
3. Provide constructive feedback on their description
4. Suggest 5-7 useful vocabulary words in ${language} (with English translations) related to the image

Student's description in ${language}: "${description}"

Please respond in this JSON format:
{
  "imageAnalysis": "Description of what's in the image",
  "mark": number (1-10),
  "feedback": "Constructive feedback on the student's description",
  "vocabulary": "Suggested vocabulary words with translations"
}`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      }
    ]);

    const responseText = result.response.text();
    console.log("Image analysis response:", responseText);
    
    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse response as JSON");
    }
    
    const analysisResponse: ImageAnalysisResponse = JSON.parse(jsonMatch[0]);
    return analysisResponse;
  } catch (error) {
    if (isError(error)) {
      console.error("Error in analyzeImageForLanguageLearning:", error.message);
      throw new Error(`Failed to analyze image: ${error.message}`);
    } else {
      console.error("Unknown error in analyzeImageForLanguageLearning:", error);
      throw new Error("Failed to analyze image due to an unknown error.");
    }
  }
}
