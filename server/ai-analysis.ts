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

type MessageAnalysis = {
  sentiment: number; // -1 to 1
  urgency: number; // 0 to 1
  topics: string[];
  suggestedResources: string[];
};

// Function to analyze message content
async function analyzeMessageContent(message: string): Promise<MessageAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = `Analyze the following message from a mental health perspective. Provide a JSON response with the following structure:
  {
    "sentiment": (number between -1 and 1),
    "urgency": (number between 0 and 1),
    "topics": [array of relevant mental health topics],
    "suggestedResources": [array of relevant resource suggestions]
  }

  Message: "${message}"`;

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
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.candidates[0].content.parts[0].text;

    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return {
      sentiment: Math.max(-1, Math.min(1, analysis.sentiment)),
      urgency: Math.max(0, Math.min(1, analysis.urgency)),
      topics: analysis.topics || [],
      suggestedResources: analysis.suggestedResources || []
    };
  } catch (error) {
    console.error('Error analyzing message:', error);
    return {
      sentiment: 0,
      urgency: 0,
      topics: [],
      suggestedResources: []
    };
  }
}

// Function to create chat prompt
function createChatPrompt(messages: Message[], newMessage: string, analysis: MessageAnalysis): string {
  const context = messages
    .slice(-5) // Get last 5 messages for context
    .map(msg => `${msg.isBot ? 'Assistant' : 'User'}: ${msg.content}`)
    .join('\n');

  const urgencyLevel = analysis.urgency > 0.7 ? 'high' :
                      analysis.urgency > 0.4 ? 'moderate' : 'low';

  return `You are an empathetic mental health assistant. Based on message analysis:
- Sentiment: ${analysis.sentiment > 0 ? 'Positive' : analysis.sentiment < 0 ? 'Negative' : 'Neutral'}
- Urgency Level: ${urgencyLevel}
- Topics: ${analysis.topics.join(', ')}

Previous conversation:
${context}

User's message:
${newMessage}

Provide a response that:
1. Shows empathy and understanding
2. Addresses identified topics
3. Offers relevant coping strategies
${urgencyLevel === 'high' ? '4. Strongly encourages seeking professional help and provides crisis resources' : ''}
${analysis.suggestedResources.length > 0 ? `5. Consider mentioning these resources: ${analysis.suggestedResources.join(', ')}` : ''}

Maintain a professional but warm tone.`;
}

// Function to call Gemini API for chat
export async function generateChatResponse(messages: Message[], newMessage: string): Promise<{ response: string; analysis: MessageAnalysis }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const analysis = await analyzeMessageContent(newMessage);
  const prompt = createChatPrompt(messages, newMessage, analysis);

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

    return {
      response: data.candidates[0].content.parts[0].text,
      analysis
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to generate chat response: ${(error as Error).message}`);
  }
}

// Function to analyze mood patterns
export async function analyzeMoodPatterns(moods: Mood[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
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