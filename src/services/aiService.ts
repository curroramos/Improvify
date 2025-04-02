// services/aiService.ts
import { supabase } from '../lib/supabase';
import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: 'https://router.huggingface.co/sambanova', // or your custom route
  apiKey: 'YOUR_HF_TOKEN' // ensure you supply the correct token
});

const validateChallenges = (challenges: any[]) => {
  if (!Array.isArray(challenges) || challenges.length !== 3) {
    throw new Error('Invalid challenges format: must contain exactly 3 challenges.');
  }

  challenges.forEach((challenge) => {
    if (
      !challenge.title ||
      !challenge.description ||
      typeof challenge.points !== 'number'
    ) {
      throw new Error('Invalid challenge structure: missing title, description, or numeric points.');
    }
  });
};

export const generateChallenges = async (
  reflection: string,
  useMock: boolean = false // Option to control usage of the mock
): Promise<string> => {
  // The prompt that will be sent to the LLM
  const PROMPT = `
Analyze this daily reflection and generate 3 measurable challenges for tomorrow.
Use this JSON format: 
{
  "challenges": [
    {
      "title": string,
      "description": string,
      "points": number (10-50)
    }
  ]
}

Reflection: ${reflection}
  `;

  // Hardcoded mock response
  const mockResponse = {
    challenges: [
      {
        title: 'Morning Exercise',
        description: 'Do 20 minutes of cardio exercise before breakfast',
        points: 30
      },
      {
        title: 'Learning Time',
        description: 'Spend 45 minutes studying a new skill',
        points: 40
      },
      {
        title: 'Social Connection',
        description: 'Call a family member or friend',
        points: 25
      }
    ]
  };

  if (useMock) {
    // Return the mocked version if toggled on
    validateChallenges(mockResponse.challenges);
    return JSON.stringify(mockResponse);
  }

  try {
    // Make a call to the LLM model via streaming or a single completion
    // For a single completion (non-streaming), you could do:
    const response = await client.chat.completions.create({
      model: 'DeepSeek-V3-0324', // or whichever model you are using
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that always returns valid JSON. ' + 
                   'Do not include any additional text outside the JSON.'
        },
        {
          role: 'user',
          content: PROMPT
        }
      ],
      temperature: 0.5,
      max_tokens: 1000, // adjust as needed
      top_p: 0.9
    });

    const aiContent = response.choices?.[0].message?.content?.trim();
    if (!aiContent) {
      throw new Error('No content received from LLM.');
    }

    // The returned JSON must match our structure
    let parsed;
    try {
      parsed = JSON.parse(aiContent);
    } catch (err) {
      throw new Error('LLM returned invalid JSON.');
    }

    validateChallenges(parsed.challenges);

    return JSON.stringify(parsed);
  } catch (error) {
    console.error('Validation or LLM call failed:', error);
    throw new Error('AI generated invalid challenge format or request failed');
  }
};
