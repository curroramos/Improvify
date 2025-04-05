import { supabase } from '../lib/supabase';
import { OpenAI } from 'openai';

const client = new OpenAI({
	baseURL: 'https://router.huggingface.co/novita',
	apiKey: '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'
});

const validateChallenges = (challenges: any[]) => {
  if (!Array.isArray(challenges) || challenges.length !== 3) {
    throw new Error('Invalid challenges format: must contain exactly 3 challenges.');
  }

  challenges.forEach((challenge, index) => {
    if (
      typeof challenge.title !== 'string' ||
      typeof challenge.description !== 'string' ||
      typeof challenge.points !== 'number'
    ) {
      throw new Error(`Invalid challenge at index ${index}: missing or incorrect types.`);
    }
  });
};

export const generateChallenges = async (
  reflection: string,
  useMock = false
): Promise<string> => {
  const PROMPT = `
You are a JSON API. Always return only a valid JSON object, with no preamble, no markdown, no explanations. Do not include \`\`\`json or any other formatting.
Based on the following reflection, generate 3 measurable challenges for tomorrow. Each challenge must include a title, description, and numeric point value between 10 and 50.
ONLY respond with a **raw JSON object** in the following format (no extra text):

{
  "challenges": [
    {
      "title": string,
      "description": string,
      "points": number (10-50)
    },
    ...
  ]
}

Reflection: ${reflection}
`;

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
    console.log('[AIService] Using mock challenge response');
    try {
      validateChallenges(mockResponse.challenges);
      return JSON.stringify(mockResponse);
    } catch (err) {
      console.error('[AIService] Mock validation failed:', err);
      throw err;
    }
  }

  console.log('[AIService] Sending prompt to LLM...');

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek/deepseek-v3-0324',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that only returns valid JSON with no extra text.'
        },
        {
          role: 'user',
          content: PROMPT
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
      top_p: 0.9
    });

    const aiContent = response.choices?.[0]?.message?.content?.trim();

    if (!aiContent) {
      console.error('[AIService] No content received from LLM');
      throw new Error('No content received from LLM.');
    }

    console.log('[AIService] Raw LLM response:', aiContent);

    let parsed;
    try {
      parsed = JSON.parse(aiContent);
    } catch (err) {
      console.error('[AIService] JSON parse failed:', err);
      throw new Error('LLM returned invalid JSON.');
    }

    try {
      validateChallenges(parsed.challenges);
    } catch (err) {
      console.error('[AIService] Challenge validation failed:', err);
      throw err;
    }

    console.log('[AIService] Challenges validated successfully');
    return JSON.stringify(parsed);
  } catch (error) {
    console.error('[AIService] LLM call or validation failed:', error);
    throw new Error('AI generated invalid challenge format or request failed');
  }
};
