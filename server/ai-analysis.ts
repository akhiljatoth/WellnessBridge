import { Mood } from "@shared/schema";

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

Format your response in clear sections.`;
}

// Function to call Gemini API
export async function analyzeMoodPatterns(moods: Mood[]) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = createAnalysisPrompt(moods);
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate mood analysis');
  }
}
