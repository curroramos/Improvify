// services/deepseek.ts
import { supabase } from '../lib/supabase';

const validateChallenges = (challenges: any[]) => {
  if (!Array.isArray(challenges) || challenges.length !== 3) {
    throw new Error('Invalid challenges format');
  }

  challenges.forEach(challenge => {
    if (!challenge.title || !challenge.description || typeof challenge.points !== 'number') {
      throw new Error('Invalid challenge structure');
    }
  });
};

export const generateChallenges = async (reflection: string): Promise<string> => {
  const PROMPT = `
  Analyze this daily reflection and generate 3 measurable challenges for tomorrow.
  Use this JSON format: 
  {
    "challenges": [
      {
        "title": string,
        "description": string,
        "points": number (between 10-50)
      }
    ]
  }
  
  Reflection: ${reflection}
  `;

  try {
    // Replace with actual DeepSeek API call
    const mockResponse = {
      challenges: [
        {
          title: "Morning Exercise",
          description: "Do 20 minutes of cardio exercise before breakfast",
          points: 30
        },
        {
          title: "Learning Time",
          description: "Spend 45 minutes studying a new skill",
          points: 40
        },
        {
          title: "Social Connection",
          description: "Call a family member or friend",
          points: 25
        }
      ]
    };

    validateChallenges(mockResponse.challenges);
    return JSON.stringify(mockResponse);
  } catch (error) {
    console.error('Validation failed:', error);
    throw new Error('AI generated invalid challenge format');
  }
};
