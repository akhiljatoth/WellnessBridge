import { Mood, Message } from "@shared/schema";

// Helper function to format mood data for analysis
function formatMoodDataForAnalysis(moods: Mood[]): string {
  return moods
    .map((mood) => {
      const date = new Date(mood.timestamp).toLocaleDateString();
      return `Date: ${date}, Score: ${mood.score}/10${mood.note ? `, Note: ${mood.note}` : ''}`;
    })
    .join('\n');
}

// Create a prompt for Gemini API
function createAnalysisPrompt(moods: Mood[]): string {
  const moodData = formatMoodDataForAnalysis(moods);
  return `You are an experienced mental health professional. Please analyze the following mood tracking data and provide professional insights and recommendations:

Mood History:
${moodData}

Please provide:
1. Pattern Analysis: Identify any patterns or trends in the mood data
2. Professional Insights: What might these patterns indicate about the person's mental well-being?
3. Recommendations: Suggest 2-3 specific, actionable steps they could take to maintain or improve their mental health
4. Areas of Concern: Note any concerning patterns that might need attention (if any)

Format your response in clear sections using markdown headings.`;
}

// Function to create chat prompt
function createChatPrompt(messages: Message[], newMessage: string): string {
  const context = messages
    .slice(-5) // Get last 5 messages for context
    .map(msg => `${msg.isBot ? 'Assistant' : 'User'}: ${msg.content}`)
    .join('\n');

  return `You are an empathetic mental health assistant. Your role is to provide supportive, understanding responses while maintaining appropriate boundaries. You cannot provide medical advice or diagnosis, but you can offer general wellness suggestions and emotional support.

Previous conversation:
${context}

User's message:
${newMessage}

Please provide a response that is:
1. Empathetic and understanding
2. Professional but warm
3. Focused on emotional support and well-being
4. Includes specific suggestions for coping or self-care when appropriate
5. Clear about your limitations (not a replacement for professional help)

Respond in a natural, conversational tone.`;
}

// Function to call Gemini API for chat
export async function generateChatResponse(messages: Message[], newMessage: string): Promise<string> {
  const apiKey = "AIzaSyD7eD7YQFVUL5OYOmLt6UHjwgDBYhy0RvE";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = createChatPrompt(messages, newMessage);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini API Response Format:', data);
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to generate chat response: ${(error as Error).message}`);
  }
}

// Function to analyze mood patterns
export async function analyzeMoodPatterns(moods: Mood[]): Promise<string> {
  const apiKey = "AIzaSyD7eD7YQFVUL5OYOmLt6UHjwgDBYhy0RvE";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = createAnalysisPrompt(moods);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini API Response Format:', data);
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to analyze mood patterns: ${(error as Error).message}`);
  }
}